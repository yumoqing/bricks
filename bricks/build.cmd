set SOURCES=utils.js i18n.js factory.js widget.js bricks.js image.js jsoncall.js myoperator.js layout.js menu.js modal.js markdown_viewer.js video.js audio.js toolbar.js tab.js input.js registerfunction.js button.js accordion.js tree.js multiple_state_image.js form.js message.js paging.js scroll.js datagrid.js miniform.js
del ..\dist\bricks.js
type %SOURCES% >..\dist\bricks.js
echo "TEST"
uglifyjs --compress --mangle -- ..\dist\bricks.js > ..\dist\bricks.min.js
echo copy ..\dist\*.* e:\gadget\wwwroot\bricks
copy ..\dist\*.* e:\gadget\wwwroot\bricks
echo copy css\*.* e:\gadget\wwwroot\bricks\css
copy css\*.* e:\gadget\wwwroot\bricks\css
copy imgs\*.* e:\gadget\wwwroot\bricks\imgs
echo copy imgs\*.* e:\gadget\wwwroot\bricks\imgs
copy ..\docs\*.* e:\gadget\wwwroot\docs
echo copy ..\docs\*.* e:\gadget\wwwroot\docs
copy ..\examples\*.* e:\gadget\wwwroot\examples
echo copy ..\examples\*.* e:\gadget\wwwroot\examples
