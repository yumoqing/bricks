# Bricks 工厂模式技术文档

## 概述

`bricks.Factory` 是一个基于单例模式的工厂类，用于注册和获取组件（或“小部件”）对象。它提供了一个全局可访问的注册表，允许动态地注册命名的组件类或对象，并通过名称进行检索。

该实现是 `Bricks` 前端框架/库的一部分，旨在统一管理可复用的 UI 组件或其他功能模块。

---

## 代码结构

```javascript
var bricks = window.bricks || {};
class Factory_ {
    constructor() {
        this.widgets_kv = new Object();
        this.widgets_kv['_t_'] = 1;
    }

    register(name, widget) {
        this.widgets_kv[name] = widget;
    }

    get(name) {
        if (this.widgets_kv.hasOwnProperty(name)) {
            return this.widgets_kv[name];
        }
        return null;
    }
}
bricks.Factory = new Factory_();
```

---

## 核心类：`Factory_`

### 构造函数 `constructor()`

初始化一个空的对象 `widgets_kv`，用于存储注册的组件。

#### 初始化内容：
- `this.widgets_kv = new Object()`  
  创建一个普通对象作为键值对存储容器。
- `this.widgets_kv['_t_'] = 1`  
  预留字段，可能用于调试、版本标识或检测对象是否已被初始化（用途未明确，但不影响主流程）。

> ⚠️ 注意：使用 `new Object()` 而非 `{}` 仅为风格选择，功能一致。

---

### 方法说明

#### `register(name: string, widget: any): void`

将指定名称与组件（类、函数或对象）注册到工厂中。

##### 参数：
| 参数名   | 类型   | 描述 |
|---------|--------|------|
| `name`  | string | 注册的唯一名称（键），用于后续查找 |
| `widget`| any    | 要注册的组件，通常为类构造函数或配置对象 |

##### 行为：
- 直接赋值：`this.widgets_kv[name] = widget`
- 若名称已存在，则覆盖旧值

##### 示例：
```js
class MyWidget { /* ... */ }
bricks.Factory.register('my-widget', MyWidget);
```

---

#### `get(name: string): any | null`

根据名称从工厂中获取已注册的组件。

##### 参数：
| 参数名   | 类型   | 描述 |
|---------|--------|------|
| `name`  | string | 要查询的组件名称 |

##### 返回值：
- 如果存在该名称的组件，返回对应值；
- 否则返回 `null`

> 使用 `hasOwnProperty` 检查避免原型链污染风险。

##### 示例：
```js
const WidgetClass = bricks.Factory.get('my-widget');
if (WidgetClass) {
    const instance = new WidgetClass();
}
```

---

## 全局实例：`bricks.Factory`

通过以下语句暴露为全局单例：

```js
bricks.Factory = new Factory_();
```

确保在整个应用中只有一个 `Factory` 实例，所有模块共享同一注册表。

> 利用 `window.bricks || {}` 确保命名空间安全，防止覆盖已有变量。

---

## 设计模式

- **单例模式（Singleton Pattern）**  
  `Factory_` 类仅被实例化一次，全局共享状态。
  
- **工厂模式（Factory Pattern）**  
  提供统一接口来创建对象，解耦对象的使用与创建过程。

---

## 使用场景

适用于需要动态加载或按需获取组件的系统，例如：

- UI 组件库注册与调用
- 插件系统
- 模块化前端架构中的依赖查找

---

## 注意事项

1. **名称冲突**  
   `register` 不检查重名，后注册者会覆盖前者，请确保命名唯一性。

2. **安全性**  
   当前未对输入参数做类型校验，建议在生产环境中添加防御性编程措施。

3. **性能**  
   使用普通对象作为 map，在现代 JS 引擎中对于中等规模键集表现良好。若需大规模注册，可考虑改用 `Map`。

4. **扩展建议**
   - 可增加 `unregister(name)` 方法以支持注销组件
   - 可增加 `list()` 方法返回所有注册项列表用于调试

---

## 版本信息

- 创建时间：未知（根据代码推断为早期 JS 模块化方案）
- 兼容性：支持 ES6+ 环境，可在浏览器中直接运行

---

## 总结

`bricks.Factory` 是一个轻量级、高效的组件注册与获取机制，适用于构建模块化、可扩展的前端系统。其简洁的设计使其易于理解和集成，是 `Bricks` 框架基础设施的重要组成部分。