# BEMPIE
## БЭМ пирог (БЭМ ПАЙ)

Scripts are created to simplify files creating in BEM hierarchy.
There are two commands in BEMPIE:
1. **crebemp** - to create BEM entity
2. **linbemp** - to make link from one BEM entity to another

To take info about params use:
```bash
node crebemp --help
node linbemp --help
```

Therefore you can easily create and manage BEM projects ;)

In current folder already executed commands to show you how scripts work.
**Expamle:**
```
user@pc:/bempie$ pwd
/bempie
user@pc:/bempie$ node crebemp blocks/source-block
user@pc:/bempie$ node crebemp blocks/target-block
user@pc:/bempie$ node linbemp blocks/source-block/ blocks/target-block/
user@pc:/bempie$ node crebemp blocks/source-block element
user@pc:/bempie$ node linbemp blocks/source-block/__element blocks/target-block/
user@pc:/bempie$ tree
.
├── blocks
│   ├── source-block
│   │   ├── __element
│   │   │   ├── source-block__element.js
│   │   │   ├── source-block__element.pug
│   │   │   └── source-block__element.sass
│   │   ├── source-block.js
│   │   ├── source-block.pug
│   │   └── source-block.sass
│   └── target-block
│       ├── target-block.js
│       ├── target-block.pug
│       └── target-block.sass
├── crebemp.js
├── linbemp.js
└── README.md

4 directories, 12 files
```

**File contents:**
_target-block.pug_
```pug
include ../source-block/__element/source-block__element.pug
include ../source-block/source-block.pug
mixin target-block()
    .target-block&attributes(attributes)

```

_target-block.sass_
```sass
@import ../source-block/__element/source-block__element
@import ../source-block/source-block
.target-block
    
```

_target-block.js_
```js
import './../source-block/__element/source-block__element';
import './../source-block/source-block';

```

This scripts can really increase develop speed.
To use scripts in any directory create system aliases:
- [Linux aliases](https://shapeshed.com/unix-alias/)
- [Windows aliases](https://superuser.com/questions/560519/how-to-set-an-alias-in-windows-command-line)

## А если по-русски?

Скрипты созданы чтобы упростить создание файлов в иерархии БЭМ.
В BEMPIE есть две команды:
1. **crebemp** - чтобы создать БЭМ сущность
2. **linbemp** - чтобы сделать ссылку из одной БЭМ сущности в другую

Чтобы получить информацию о получаемых параметрах используйте:
```bash
node crebemp --help
node linbemp --help
```

Это поможет Вам создвать и управлять БЭМ проектами ;)

В этом проекте я уже выполнил парочку команд, чтобы показать как работают скрипты.
**Примерыч:**
```
user@pc:/bempie$ pwd
/bempie
user@pc:/bempie$ node crebemp blocks/source-block
user@pc:/bempie$ node crebemp blocks/target-block
user@pc:/bempie$ node linbemp blocks/source-block/ blocks/target-block/
user@pc:/bempie$ node crebemp blocks/source-block element
user@pc:/bempie$ node linbemp blocks/source-block/__element blocks/target-block/
user@pc:/bempie$ tree
.
├── blocks
│   ├── source-block
│   │   ├── __element
│   │   │   ├── source-block__element.js
│   │   │   ├── source-block__element.pug
│   │   │   └── source-block__element.sass
│   │   ├── source-block.js
│   │   ├── source-block.pug
│   │   └── source-block.sass
│   └── target-block
│       ├── target-block.js
│       ├── target-block.pug
│       └── target-block.sass
├── crebemp.js
├── linbemp.js
└── README.md

4 directories, 12 files
```

**Содержимое файлов:**
_target-block.pug_
```pug
include ../source-block/__element/source-block__element.pug
include ../source-block/source-block.pug
mixin target-block()
    .target-block&attributes(attributes)

```

_target-block.sass_
```sass
@import ../source-block/__element/source-block__element
@import ../source-block/source-block
.target-block
    
```

_target-block.js_
```js
import './../source-block/__element/source-block__element';
import './../source-block/source-block';

```

Эти скрипты воистину могут сильно ускорить скорость разработки.
Чтобы использовать скрипты в любых директориях создайте для них системные алиасы:
- [Алиасы в Linux](https://linuxrussia.com/terminal-alias.html)
- [АЛиасы в Windows](https://antonshell.me/post/windows-doskey-aliases)