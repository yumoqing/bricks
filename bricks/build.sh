SOURCES="utils.js i18n.js factory.js widget.js bricks.js image.js \
	jsoncall.js myoperator.js layout.js menu.js modal.js \
	markdown_viewer.js video.js audio.js toolbar.js tab.js \
	input.js registerfunction.js button.js accordion.js \
	tree.js multiple_state_image.js form.js message.js \
	paging.js scroll.js datagrid.js miniform.js terminal.js"
cat ${SOURCES} > ../dist/bricks.js
uglifyjs --compress --mangle -- ../dist/bricks.js > ../dist/bricks.min.js
cp -a css/* ../dist/css
cp -a imgs/* ../dist/imgs
cp -a ../examples ../dist
cp -a ../docs ../dist
cp -a ../dist/* ~/www/wwwroot/bricks
cd ../dist
cp -a * ~/www/wwwroot/bricks
# tar cf - . |gzip > /tmp/bricks.tgz
# scp /tmp/bricks.tgz center@kymoz.com:/tmp

