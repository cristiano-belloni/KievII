#!/bin/sh
git checkout gh-pages
git rebase master
git checkout master
#http://get.inject.io/n/XxsZ6RE7
#After that every commit that you do on the master branch will immediately also be applied to the gh-pages branch. When pushing to Github simply use git push --all instead of git push origin master.
