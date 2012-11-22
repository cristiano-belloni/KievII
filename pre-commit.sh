#!/bin/bash
git stash -q --keep-index
echo "pre-commit script generating a release dist"
grunt release
RESULT=$?
[ $RESULT -ne 0 ] && exit 1
echo "Adding the release files"
git add dist/
git status; echo -n Hit enter to continue...; read
git stash pop -q
exit 0
