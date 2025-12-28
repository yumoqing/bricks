# TimePassed

**Widget Functionality**: Displays the elapsed time since the timer started, formatted as hours:minutes:seconds (HH:MM:SS), automatically updating once per second.  
**Type**: Regular widget  
**Parent Widget**: bricks.VBox  

## Initialization Parameters

- `opts`: Options object inherited from VBox, with no special parameters.  
  - Internally, the widget initializes the timer starting from zero seconds and formats the display using `bricks.formatTime`.

## Main Events

- No custom events are triggered.  
- Internally uses `schedule_once` to achieve periodic updates, but does not dispatch any events externally.

---

# Countdown

**Widget Functionality**: Implements a countdown timer that supports setting an initial duration (e.g., "01:00:00"). Once started, it decrements by one second each second and updates the display accordingly. When the countdown reaches zero, it triggers the `timeout` event.  
**Type**: Regular widget  
**Parent Widget**: bricks.VBox  

## Initialization Parameters

- `opts.limit_time`: String type, representing the total countdown duration in the format `"HH:MM:SS"`, `"MM:SS"`, or `"SS"`.  
  - Examples:  
    - `"30"` → 30 seconds  
    - `"01:30"` → 1 minute and 30 seconds  
    - `"01:00:00"` → 1 hour  
- `opts.text_rate`: Optional parameter used to set the text refresh rate (if supported by the underlying Text widget).

## Main Events

- `timeout`: When the countdown reaches zero, the widget calls `this.dispatch('timeout')` to dispatch this event, which can be used to notify external logic to perform follow-up actions.