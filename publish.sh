#!/bin/bash
. local.mk
rm git_info.log 2>/dev/null
git log -n 1 --pretty="%H">git_info.log
scp -r git_info.log audio/ demos/ graphic_elements/ dsp/ $remotehost:$remotedir
