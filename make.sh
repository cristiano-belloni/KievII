#!/bin/bash
rm -fr _site/
rm -fr tags/
mkdir tags
rake tags
