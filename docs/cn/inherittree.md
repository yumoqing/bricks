# Bricks控件继承树

```
JsWidget
    |
    --- AudioPlayer
    |
    --- Image
    |        |
    |        --- Icon
    |
    ___ BlankIcon
    |
    ___ Layout
    |        |
    |        --- VBox
    |        |        |
    |        |        --- Accordion
    |        |        |
    |        |        --- DataGrid
    |        |        |
    |        |        --- Form
    |        |        |
    |        |        --- MarkdownViewer
    |        |        |
    |        |        --- Menu
    |        |        |
    |        |        --- Message
    |        |        |        |
    |        |        |        --- Error
    |        |        |
    |        |        --- Popup
    |        |        |
    |        |        --- ScrollPanel
    |        |        |
    |        |        --- TreeNode
    |        |        |
    |        |        --- Tree
    |        |        |        |
    |        |        |        --- EditableTree
    |        |        |
    |        |        --- VideoPlayer
    |        |
    |        --- HBox
    |        |        |
    |        |        --- MiniForm
    |        |
    |        --- MultipleStateImage
    |        |
    |        --- Toolbar
    |        |
    |        --- TabPanel
    |        |
    |        --- Modal
    |        |
    |        --- HFiller
    |        |
    |        --- VFiller
    |        |
    |        --- Button
    |        |
    |        --- UiType
    |        |        |
    |        |        --- UiStr
    |        |        |        |
    |        |        |        --- UiPassword
    |        |        |        |
    |        |        |        --- UiInt
    |        |        |        |        |
    |        |        |        |        --- UiFloat
    |        |        |        |
    |        |        |        --- UiTel
    |        |        |        |
    |        |        |        --- UiEmail
    |        |        |        |
    |        |        |        --- UiFile
    |        |        |        |
    |        |        |        --- UiDate
    |        |        |        |
    |        |        |        --- UiAudio
    |        |        |        |
    |        |        |        --- UiVideo
    |        |        |        
    |        |        --- UiCheck
    |        |        |
    |        |        --- UiCheckBox
    |        |        |
    |        |        --- UiText
    |        |        |
    |        |        --- UiCode
    |
    --- MdText
    |
    ___ Video
    |
    --- TextBase
            |
            --- Text
                    |
                    --- Title1, Title2, Title3, Title4, Title5, Title6
```

