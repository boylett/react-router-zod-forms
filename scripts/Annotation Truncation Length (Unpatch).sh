#!/bin/bash

FROM="var defaultMaximumTruncationLength = 1e6;"
TO="var defaultMaximumTruncationLength = 160;"

sed -i -e "s/$FROM/$TO/g" "node_modules/typescript/lib/typescript.js"

echo "Annotation Truncation Length unpatched successfully"
