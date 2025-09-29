SOURCES=" page_data_loader.js factory.js uitypesdef.js utils.js uitype.js \
	i18n.js widget.js layout.js bricks.js image.js html.js splitter.js \
	jsoncall.js myoperator.js scroll.js menu.js popup.js recorder.js \
	modal.js running.js llmout.js \
	markdown_viewer.js audio.js toolbar.js tab.js \
	input.js registerfunction.js button.js accordion.js dataviewer.js \
	tree.js multiple_state_image.js dynamiccolumn.js form.js message.js conform.js \
	paging.js datagrid.js iframe.js cols.js echartsext.js \
	floaticonbar.js miniform.js wterm.js dynamicaccordion.js \
	binstreaming.js streaming_audio.js vadtext.js rtc.js docxviewer.js \
	llm_dialog.js llm.js websocket.js datarow.js tabular.js continueaudio.js \
	line.js pie.js bar.js gobang.js period.js iconbarpage.js \
	keypress.js asr.js webspeech.js countdown.js progressbar.js \
	qaframe.js svg.js videoplayer.js "
echo ${SOURCES}
cat ${SOURCES} > ../dist/bricks.js
# uglifyjs --compress --mangle -- ../dist/bricks.js > ../dist/bricks.min.js
if [ ! -d ../dist/css ];then
	rm -rf ../dist/css
	mkdir ../dist/css
fi
if [ ! -d ../dist/3parties ];then
	rm -rf ../dist/3parties
	mkdir ../dist/3parties
fi
if [ ! -d ../dist/examples ];then
	rm -rf ../dist/examples
	mkdir ../dist/examples
fi
if [ ! -d ../dist/docs ];then
	rm -rf ../dist/docs
	mkdir ../dist/docs
fi
if [ ! -d ../dist/imgs ];then
	rm -rf ../dist/imgs
	mkdir ../dist/imgs
fi
cp -a css/* ../dist/css
cp -a imgs/* ../dist/imgs
cp -a ../examples/* ../dist/examples
cp -a ../3parties/* ../dist/3parties
cp -a ../docs/* ../dist/docs
cp *.tmpl ../dist
cp -a ../dist /tmp
cp -a ../dist/* /d/public/bricks
echo "Finished ..."
