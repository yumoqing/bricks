# Bricks
A new web application development framework to make web application development more easier like play bricks

## Documentation
Documents in English, please read from [docs](docs/index.md)

## Development base on components

We built web development components which use a options objects as API.
third party can develops their component suply the standard of components API 
Most front-end development tools only help user to build the front-end UI, and use script to build the app's logic.
Bricks not only build the UI but also the front-end logic.

Bricks provide a new mathiciam to description the event fire, and event handler, Bricks use json data to descripts event and it handler, when event fire, according the json data, Bricks dynamicly constructs the event handler.



## Dependanance

[Marked](https://github.com/yumoqing/marked) is a tool for markdown text parser, extends from [MarkedJs marked](https://github.com/markedjs/marked), we extends audio and video link, user can directly use `!v[text](url)` pattern to show a video player, and `!a[text](url)` pattern to show a audio player
