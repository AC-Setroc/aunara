#!/usr/bin/env bash
# Red→green negatives on a disposable copy of the E4 candidate. Each mutation is applied with sed on the worktree,
# built with the synthetic Supabase config, checked with neg-check.mjs (expect GUARD=RED), then reverted with git.
set -uo pipefail
S="${AUNARA_REVIEW_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"  # carpeta que contiene e4/, harness/ y builds/
E4="$S/e4"; H="$S/harness"; B="$S/builds"
export VITE_SUPABASE_URL="https://synthetic.supabase.invalid" VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_synthetic_000" AUNARA_BASE_PATH=/

build_to () { (cd "$E4" && npm run build >/dev/null 2>&1 && node scripts/check-pages-client.mjs >/dev/null 2>&1) ; rm -rf "$B/$1" && cp -r "$E4/dist/client" "$B/$1"; }
check () { (cd "$H" && timeout 120 node neg-check.mjs "$1" "$B/$2" 2>&1 | grep GUARD=); }
revert () { (cd "$E4" && git checkout -q -- "$@"); }
mutate () { # name file sed-expression check-mode
  local name="$1" file="$2" expr="$3" mode="$4"
  (cd "$E4" && sed -i "$expr" "$file" && git diff --quiet -- "$file" && echo "!! $name: la mutación no cambió $file")
  build_to "neg-$name"
  echo "$name → $(check "$mode" "neg-$name")   (esperado RED)"
  revert "$file"
}

echo "== positivo de control sobre el build normal =="
for m in guest-private float storage-get-only shells; do echo "normal/$m → $(check "$m" e4-root)   (esperado GREEN)"; done

echo; echo "== negativos =="
mutate guest-private src/App.tsx 's/\.\.\.(canUseTraining ? \[/...(true ? [/' guest-private
mutate float-overlap src/styles.css 's/^    position: relative;$/    position: fixed; bottom: 0; right: 16px;/' float
mutate e3-static-import src/main.tsx '1i import App from "./App"; (window as unknown as { __App?: unknown }).__App = App;' storage-get-only
mutate e3-classification src/main.tsx 's/readBlocked = true;/readBlocked = false;/' storage-get-only
mutate e3-duplicate-root src/main.tsx 's#^const root = createRoot(document.getElementById("root")!);#const root = createRoot(document.getElementById("root")!); const extra = document.createElement("div"); document.body.appendChild(extra); createRoot(extra).render(<main className="app-shell" />);#' shells

echo; echo "== restaurar build normal y confirmar verde =="
(cd "$E4" && git status --short | wc -l | xargs echo "archivos sucios en el worktree (esperado 0):")
build_to e4-root-restored
for m in storage-get-only shells; do echo "restored/$m → $(check "$m" e4-root-restored)   (esperado GREEN)"; done
diff <(cd "$B/e4-root" && find . -type f | sort) <(cd "$B/e4-root-restored" && find . -type f | sort) >/dev/null && echo "lista de archivos del artifact restaurado idéntica a e4-root" || echo "!! artifact restaurado difiere de e4-root"

echo; echo "== negativo unitario: targets compartidos en la creación del grupo =="
(cd "$E4" && sed -i 's/onAddStructure(structureType, exerciseIds, selectedDay, prescriptions);/onAddStructure(structureType, exerciseIds, selectedDay, prescriptions.map(() => prescriptions[0]));/' src/components/WorkoutPanel.tsx \
  && git diff --quiet -- src/components/WorkoutPanel.tsx && echo "!! mutación no aplicada"; \
  npx vitest run src/components/WorkoutPanel.test.tsx 2>&1 | grep -E 'Tests |×' | head -4 | sed 's/^/shared-targets (esperado rojo): /'; git checkout -q -- src/components/WorkoutPanel.tsx; echo "restaurado: $(git status --short | wc -l) sucios")
