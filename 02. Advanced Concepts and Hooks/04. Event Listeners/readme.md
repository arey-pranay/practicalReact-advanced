# Event Capturing, Bubbling & Event Listeners

## What is Event Propagation?

When an event occurs on a nested element, the event travels through the element hierarchy.

For example:

```jsx
<div>
  <button>Click</button>
</div>
```

When the button is clicked, the event travels through the hierarchy in phases.

```text
        div
         │
         ▼
      button
```

There are two important propagation phases:

1. **Capturing** — outside → inside
2. **Bubbling** — inside → outside

---

# 1. Event Bubbling

**Bubbling** means the event starts at the element that was interacted with and then travels outward through its ancestors.

```text
div
 ↑
button
```

The button receives the event first, then its parent.

### Example

```jsx
<div onClick={() => console.log("outer")}>
  <button onClick={() => console.log("inner")}>
    Click me
  </button>
</div>
```

Clicking the button produces:

```text
inner
outer
```

The event bubbles:

```text
button → div
```

---

## Common Bubbling Events

Events commonly used with bubbling include:

```jsx
onClick
onChange
onInput
onKeyDown
onKeyUp
onMouseDown
onMouseUp
onMouseMove
```

### Note about `onFocus`

`focus` itself does **not bubble natively** in the DOM.

React's event system makes `onFocus` behave in a way that allows it to be used with parent elements, so you can observe focus changes through React's event handling.

For native DOM behavior, `focusin`/`focusout` are the bubbling counterparts.

---

# Bubbling Example

```jsx
function App() {
  return (
    <div onClick={() => console.log("Parent")}>
      <button onClick={() => console.log("Button")}>
        Click
      </button>
    </div>
  );
}
```

Clicking:

```text
Button
  ↓
Parent
```

Output:

```text
Button
Parent
```

---

# 2. Event Capturing

**Capturing** happens before the event reaches the target.

The event travels from the outside toward the element that was interacted with.

```text
div
 ↓
button
```

To use the capture phase in React, add:

```jsx
Capture
```

to the event handler.

For example:

```jsx
onClickCapture
```

instead of:

```jsx
onClick
```

---

# Capturing Example

```jsx
<div
  onClickCapture={() => console.log("Parent")}
>
  <button
    onClick={() => console.log("Button")}
  >
    Click
  </button>
</div>
```

Clicking the button produces:

```text
Parent
Button
```

The event travels:

```text
Parent
   ↓
Button
```

---

# Capturing + Bubbling Together

You can have both phases at the same time:

```jsx
<div
  onClickCapture={() => console.log("Parent Capture")}
  onClick={() => console.log("Parent Bubble")}
>
  <button
    onClickCapture={() => console.log("Button Capture")}
    onClick={() => console.log("Button Bubble")}
  >
    Click
  </button>
</div>
```

The order is:

```text
1. Parent Capture
       ↓
2. Button Capture
       ↓
3. Button Bubble
       ↓
4. Parent Bubble
```

So:

```text
Parent Capture
Button Capture
Button Bubble
Parent Bubble
```

---

# The Complete Event Flow

A useful mental model is:

```text
                 CAPTURING
                    ↓
        Parent ────────────────┐
                    ↓          │
                 Button        │
                    ↑          │
        ───────────────────────┘
                 BUBBLING
```

Or more simply:

```text
Capture:

outer → parent → target

Bubble:

target → parent → outer
```

---

# `event.stopPropagation()`

You can stop an event from continuing through the propagation chain.

```jsx
<div onClick={() => console.log("Parent")}>
  <button
    onClick={(event) => {
      event.stopPropagation();
      console.log("Button");
    }}
  >
    Click
  </button>
</div>
```

Now:

```text
Button
```

The parent doesn't receive the event because propagation was stopped.

---

# Your Portal Example

Your example is particularly useful because it combines:

* Event capturing
* Event bubbling
* React's event system
* Portals

You have:

```jsx
<div
  onClickCapture={() => console.log("outer div")}
>
  ...
  <Alert />
</div>
```

And `Alert` is rendered using:

```jsx
createPortal(
  <div
    onClickCapture={() => {
      onClose();
      console.log("inner div");
    }}
  >
    ...
  </div>,
  document.querySelector("#alert-holder")
)
```

The interesting thing is that the portal changes the **DOM location**, but not the **React tree relationship**.

---

# Portal Event Propagation

Even though the alert's DOM may be somewhere else:

```text
<body>
 ├── #root
 │    └── App
 │         └── Alert
 │
 └── #alert-holder
      └── Alert DOM
```

React still considers:

```text
App
 │
 └── Alert
```

to be the React relationship.

Therefore, React events from a portal can propagate through the React tree.

---

# Your `onClickCapture`

You have:

```jsx
<div
  onClickCapture={() => console.log("outer div")}
>
```

and inside the portal:

```jsx
<div
  onClickCapture={() => {
    onClose();
    console.log("inner div");
  }}
>
```

Both are **capture-phase handlers**.

When the alert is clicked, React can propagate the event through the React hierarchy:

```text
Outer App div
      ↓
Alert div
```

Therefore the capture handlers execute from outer → inner:

```text
outer div
inner div
```

The important concept here is:

> **Portal DOM placement does not break React's event propagation through the React tree.**

---

# Event Listeners

There are two related concepts worth distinguishing.

### React event handlers

```jsx
<button onClick={handleClick}>
  Click
</button>
```

React manages the event handling for you.

---

### Native DOM event listeners

You can also directly use:

```jsx
element.addEventListener(
  "click",
  handler
);
```

and remove it with:

```jsx
element.removeEventListener(
  "click",
  handler
);
```

In React, native listeners are normally registered inside an effect:

```jsx
useEffect(() => {
  const handleClick = () => {
    console.log("clicked");
  };

  document.addEventListener(
    "click",
    handleClick
  );

  return () => {
    document.removeEventListener(
      "click",
      handleClick
    );
  };
}, []);
```

The cleanup is important.

---

# React vs Native Event Listeners

| React                              | Native DOM                                   |
| ---------------------------------- | -------------------------------------------- |
| `onClick`                          | `addEventListener("click", ...)`             |
| React manages listener lifecycle   | You manage it                                |
| JSX syntax                         | DOM API                                      |
| Usually preferred inside React     | Useful for document/window/custom DOM events |
| Cleanup generally handled by React | You must explicitly remove listeners         |

---

# Capture with Native Event Listeners

The native API can explicitly enable capture:

```jsx
element.addEventListener(
  "click",
  handler,
  { capture: true }
);
```

Without it:

```jsx
element.addEventListener(
  "click",
  handler
);
```

the listener operates during the bubbling phase.

React provides the equivalent through:

```jsx
onClickCapture
```

---

# Example: Native Capturing

```jsx
document.addEventListener(
  "click",
  () => {
    console.log("capture");
  },
  { capture: true }
);
```

Conceptually:

```text
outer
  ↓
target
```

---

# Example: Native Bubbling

```jsx
document.addEventListener(
  "click",
  () => {
    console.log("bubble");
  }
);
```

Conceptually:

```text
target
  ↓
outer
```

---

# Event Propagation vs Event Delegation

These concepts are related but different.

### Event propagation

Describes how an event travels:

```text
capture → target → bubble
```

### Event delegation

Uses bubbling to handle events from many children with one listener.

Example:

```jsx
<ul onClick={handleClick}>
  <li>One</li>
  <li>Two</li>
  <li>Three</li>
</ul>
```

Instead of putting:

```jsx
onClick
```

on every `li`, the parent can handle clicks from all of them.

---

# Event Delegation Example

```jsx
const handleClick = (event) => {
  if (event.target.tagName === "LI") {
    console.log(event.target.textContent);
  }
};

return (
  <ul onClick={handleClick}>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
  </ul>
);
```

Clicking:

```text
One
```

causes the event to bubble:

```text
li
 ↓
ul
```

and the `ul` handles it.

---

# Important Mental Model

Remember these three phases:

```text
        CAPTURE
           ↓
    outer → inner

         TARGET

           ↓
        BUBBLE
           ↑
    inner → outer
```

In practice:

```text
Parent onClickCapture
        ↓
Child onClickCapture
        ↓
Child onClick
        ↓
Parent onClick
```

---

# Interview Questions

### What is event bubbling?

The process where an event travels from the target element toward its ancestors.

```text
child → parent → grandparent
```

---

### What is event capturing?

The process where an event travels from an ancestor toward the target.

```text
grandparent → parent → child
```

---

### How do you use capturing in React?

Add `Capture` to the event handler:

```jsx
onClickCapture
```

---

### How do you stop propagation?

```jsx
event.stopPropagation();
```

---

### What is event delegation?

Handling events from multiple child elements using a common ancestor, usually by taking advantage of event bubbling.

---

### Does a React Portal stop event propagation?

No. Portal events can propagate through the **React tree**, even when the portal's DOM is mounted somewhere else.

---

### What's the difference between `onClick` and `onClickCapture`?

```jsx
onClick
```

handles the event during the bubbling phase.

```jsx
onClickCapture
```

handles it during the capture phase.

---

# Key Takeaways

* **Capturing:** outside → inside.
* **Bubbling:** inside → outside.
* `onClickCapture` is React's capture-phase handler.
* `onClick` is normally handled during bubbling.
* `event.stopPropagation()` stops further propagation.
* **Event delegation** relies heavily on bubbling.
* Native listeners use `addEventListener` and optionally `{ capture: true }`.
* Native listeners must generally be cleaned up with `removeEventListener`.
* React Portals **do not necessarily break React event propagation** because events follow the React component hierarchy.
* The complete model to remember:

```text
CAPTURE
outer
  ↓
parent
  ↓
target
  ↑
parent
  ↑
outer
BUBBLE
```
