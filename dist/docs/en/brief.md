# Introduction to the Bricks Framework  
## Table of Contents  
* Bricks Goals  
* Bricks Concepts  
* Bricks Development Methodology  
* Running Bricks  

## Bricks Goals  
* No or minimal frontend code  
* Lower the technical barrier for frontend development  
* Data-driven design  
* Packaging of commonly used components  
* Pure JSON-based development  

## Bricks Concepts  
* Components and component inheritance  
* Events and event handling  
* Component nesting and page assembly  

### Components and Component Inheritance  
Bricks uses the concept of "components" to describe web GUI display elements. Each component corresponds to a JavaScript class that maps to an HTML tag type. Every component can be instantiated and rendered on a page.  
Components are categorized into: basic components and container components. Components have built-in methods and can trigger events.

* **Basic Components**  

Basic components are atomic components that cannot contain child components.

* **Container Components**  

Container components can hold child components. Bricks builds complex web pages by adding child components to container components, and further adding grandchildren components within those children.

For a list of implemented components in Bricks, please refer to [Widget List](widgets.md).

### Component Extension  
If existing components do not meet system requirements, Bricks supports component extension. To extend a component, the following rules must be followed:  
* The new component's class must inherit from an existing component class  
* Implement required logic as needed  
* Use `this.dispatch` to trigger events from within the component when necessary  

Suppose you want to extend a component named `ExtContainer`:  
```javascript
bricks.ExtContainer = class extends bricks.VBox {
    constructor(opts){
        super(opts);
        /* Initialization code for the new component */
    }
    ......
    /* Other methods of the object; use this.dispatch('new_event', data) to trigger events where needed */
}
bricks.register('ExtContainer', bricks.ExtContainer); /* Register the new component */
```

Using the new component — example.ui:
```json
{
    "widgettype": "ExtContainer",
    "options": {
        ....
    },
    "subwidgets": [
        ...
    ],
    "binds": [
        {
            "wid": "self",
            "event": "new_event",
            "actiontype": "urlwidget",
            "target": "some_container",
            "options": {
                "url": "{{entire_url('./some_ui.ui')}}"
            }
        }
    ]
}
```

### Events and Event Handling  
Each component can emit events originating either from its underlying DOM element, or dispatched via `dispatch` calls inside the component’s JavaScript class methods (including inherited methods from ancestor classes).

Thus, Bricks component events come from two sources: native DOM events and custom events defined within component classes. Both types of events are handled in the same way.

### Component Representation  
On the server backend, components are represented in JSON format. Each `.ui` file defines one component. For container components, child components can be added via the `subwidgets` property within the UI file.

#### id attribute  
String attribute. Defines the component's ID so it can be retrieved using `getWidgetById`. If not specified, the system will automatically generate an ID.

#### options attribute  
Dictionary attribute. Options passed during component creation. Refer to the component documentation for acceptable options.

#### binds attribute  
Array attribute. Defines zero or more event responses. Each bind dictionary must conform to the [Event](event.md) specification.

#### Container Component Specific Attributes  
##### subwidgets  
Array attribute. Defines child components of a container component. Each array element describes one child component, adhering to the standard component data structure requirements.

## Application Development  
Applications are developed using `.ui` files in JSON format stored on the server backend. Each `.ui` file defines one component and supports both basic and container components.

For guidance on writing UI files, please see [UI File Format](descjson.md).

## Debugging  
UI files can be directly debugged. For example, if there is a `hello.ui` file under the `test` directory at the server root, it can be debugged in a browser using the URL: https://sername/test/hello.ui