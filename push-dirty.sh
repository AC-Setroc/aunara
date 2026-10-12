{\rtf1\ansi\ansicpg1252\cocoartf2907
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 #!/usr/bin/env bash\
set -euo pipefail\
\
REPO="$HOME/AI Projects/Personal/aunara"\
BRANCH="wip/dirty-2026-10-12"\
cd "$REPO"\
\
echo "== Rama local y HEAD (no se modifican) =="\
git branch --show-current\
git log -1 --format='%h %s'\
\
# \'cdndice temporal: el \'edndice real de tu repo no se toca.\
export GIT_INDEX_FILE\
GIT_INDEX_FILE="$(mktemp)"\
trap 'rm -f "$GIT_INDEX_FILE"' EXIT\
\
git read-tree HEAD\
git add -A -- . \\\
  ':(exclude)AUNARA_SOT/reference' \\\
  ':(exclude)**/.env' ':(exclude)**/.env.*' ':(exclude,glob)**/*.local'\
\
echo\
echo "== Archivos que entrar\'edan al snapshot =="\
git diff --cached --stat HEAD | tail -n 40\
\
echo\
echo "== Binarios nuevos o modificados (revis\'e1 que no haya capturas ni datos personales) =="\
git diff --cached --numstat HEAD | awk '$1=="-" && $2=="-" \{print "   " $3\}' || true\
\
echo\
echo "== Posibles secretos o correos en el delta (deber\'eda salir vac\'edo) =="\
git diff --cached HEAD | grep -nE 'eyJ[A-Za-z0-9_-]\{20,\}|sb_(publishable|secret)_|service_role|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]\{2,\}' \\\
  | grep -vE 'noreply@|alejandro@ac-setroc\\.com' || echo "   (nada)"\
\
echo\
read -r -p "\'bfPushear este snapshot a origin/$BRANCH? (escrib\'ed SI en may\'fasculas) " ok\
[ "$ok" = "SI" ] || \{ echo "Cancelado. Nada se escribi\'f3."; exit 1; \}\
\
TREE="$(git write-tree)"\
COMMIT="$(git commit-tree "$TREE" -p HEAD \\\
  -m "wip: snapshot del working tree 2026-10-12\
\
Snapshot sin revisar del dirty local sobre $(git rev-parse --short HEAD).\
Excluye AUNARA_SOT/reference y entornos. No es entrega ni aprobaci\'f3n.\
\
[AUNARA/operator \'b7 snapshot manual]")"\
\
git push origin "$COMMIT:refs/heads/$BRANCH"\
\
echo\
echo "Listo. Commit $COMMIT en origin/$BRANCH. Tu rama local sigue en:"\
git log -1 --format='%h %s'\
git status --short | wc -l | xargs echo "Archivos dirty locales intactos:"}