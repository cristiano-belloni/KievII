#!/bin/bash
rm -fr _site/
rm -fr tags/
mkdir -p tags/css
cp css/style.css tags/css/style.css
rake tags
jekyll
