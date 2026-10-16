#!/bin/bash
E=$1; P=$2; S=<scratch>; U=<scratch>/u16; R=$U/results/$E; mkdir -p $R
export BROWSER=$E PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
cd $U/sdd/2026-10-13-sdd013-revision/harness
for b in root:/ aunara:/aunara/; do n=${b%%:*}; base=${b#*:}; BUILD_DIR=$S/builds/dev16-$n BASE=$base OUT=$R/sdd013-$n PORT=$((P+90)) node sdd013-checks.mjs > $R/sdd013-$n.log 2>&1; echo "sdd013-$n exit=$?" >> $R/summary.txt; tail -1 $R/sdd013-$n.log >> $R/summary.txt; P=$((P+2)); done
REGRESSIONS=1 ROOT_BUILD=$S/builds/dev16-root AUNARA_BUILD=$S/builds/dev16-aunara E2_ROOT_BUILD=$S/builds/e2-root E2_AUNARA_BUILD=$S/builds/e2-aunara OUT=$R/regressions REGRESSION_PORT_OFFSET=0 node sdd013-checks.mjs > $R/regressions.log 2>&1; echo "regressions exit=$?" >> $R/summary.txt
cd $U/sdd/2026-10-13-sdd012-revision/harness
for b in root:/ aunara:/aunara/; do n=${b%%:*}; base=${b#*:}; BUILD=dev16-$n BASE=$base PORT=$((P+300)) node sdd012-checks.mjs > $R/sdd012-$n.log 2>&1; echo "sdd012-$n exit=$?" >> $R/summary.txt; tail -1 $R/sdd012-$n.log >> $R/summary.txt; P=$((P+1)); done
echo "ENGINE_DONE $E" >> $R/summary.txt
