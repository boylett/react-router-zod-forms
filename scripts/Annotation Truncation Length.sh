#!/bin/bash

FROM="var defaultMaximumTruncationLength = 160;"
TO="var defaultMaximumTruncationLength = 1e6;"

sed -i -e "s/$FROM/$TO/g" "node_modules/typescript/lib/typescript.js"

echo "Annotation Truncation Length patched successfully"
