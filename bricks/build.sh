SOURCES="utils.js i18n.js factory.js widget.js bricks.js image.js \
	jsoncall.js myoperator.js layout.js menu.js modal.js \
	markdown_viewer.js video.js audio.js toolbar.js tab.js "
cat ${SOURCES} > ../dist/bricks.js
uglifyjs --compress --mangle -- ../dist/bricks.js > ../dist/bricks.min.js
cp -a examples/* ../dist/examples
cp -a docs/* ../dist/docs
cp -a css/* ../dist/css
cp -a imgs/* ../dist/imgs
