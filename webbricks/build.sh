SOURCES="i18n.js factory.js widget.js bricks.js image.js jsoncall.js myoperator.js layout.js menu.js"
cat ${SOURCES} > ../dist/bricks.js
uglifyjs --compress --mangle -- ../dist/bricks.js > ../dist/bricks.min.js
cp *.html ../dist
cp *.tmpl ../dist
