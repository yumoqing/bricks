SOURCES="utils.js i18n.js factory.js widget.js bricks.js image.js \
	jsoncall.js myoperator.js layout.js menu.js modal.js \
	markdown_viewer.js video.js audio.js toolbar.js tab.js \
	input.js registerfunction.js button.js accordion.js \
	tree.js multiple_state_image.js form.js message.js \
	paging.js scroll.js datagrid.js miniform.js "
cat ${SOURCES} > ../dist/bricks.js
uglifyjs --compress --mangle -- ../dist/bricks.js > ../dist/bricks.min.js
cp -a css/* ../dist/css
cp -a imgs/* ../dist/imgs
cp -a ../dist/* ~/www/wwwroot/bricks
cp -a ../docs ~/www/wwwroot/docs
cp -a ../examples/* ~/www/wwwroot/examples

