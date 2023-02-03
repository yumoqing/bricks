SOURCES="bricks.js image.js jsoncall.js"
cat ${SOURCES} > ../dist/bricks.js
uglifyjs --compress --mangle -- ${SOURCES} > ../dist/bricks.min.js
cp *.html ../dist
cp *.tmpl ../dist
