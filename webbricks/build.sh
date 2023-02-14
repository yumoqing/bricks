SOURCES="utils.js i18n.js factory.js widget.js bricks.js image.js jsoncall.js myoperator.js layout.js menu.js modal.js markdown_viewer.js"
cat ${SOURCES} > ../dist/bricks.js
uglifyjs --compress --mangle -- ../dist/bricks.js > ../dist/bricks.min.js
cp examples/*.html ../dist/examples
cp examples/*.tmpl ../dist/examples
cp examples/*.md ../dist/examples
