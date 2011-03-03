#!/bin/bash
. local.mk
rm git_info.log 2>/dev/null
echo `date` > git_info.log
echo '*****************************' >> git_info.log
git ls-files | while read file; do git log -n 1 --pretty="$file, commit: %h, date: %ad" -- $file >> git_info.log; done
scp -r git_info.log audio/ demos/ graphic_elements/ dsp/ $remotehost:$remotedir
