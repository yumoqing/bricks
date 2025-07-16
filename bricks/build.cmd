set SOURCES=utils.js i18n.js factory.js widget.js bricks.js image.js jsoncall.js myoperator.js layout.js menu.js modal.js markdown_viewer.js video.js audio.js toolbar.js tab.js input.js registerfunction.js button.js accordion.js tree.js multiple_state_image.js form.js message.js paging.js scroll.js datagrid.js miniform.js terminal.js
del ..\dist\bricks.js
echo %SOURCES%
type %SOURCES% > ..\dist\bricks.js
copy css\*.* ..\dist\css
copy imgs/*.* ..\dist\imgs
copy ..\examples\*.* ..\dist\examples
copy ..\docs\*.* ..\dist\docs
rem uglifyjs --compress --mangle %SOURCES% > ..\dist\bricks.min.js
