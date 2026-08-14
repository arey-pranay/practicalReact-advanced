# React Portals

## What is a Portal?

A **Portal** allows a React component to render its UI into a different DOM node than the one where the component normally exists in the React tree.

The key API is:

```jsx
createPortal(children, domNode)
```

In this example:

```jsx
return createPortal(
  <div className="alert" onClick={onClose}>
    {children}
  </div>,
  document.querySelector("#alert-holder")
);
```

The `Alert` component is logically rendered inside `App`, but its HTML is physically inserted into `#alert-holder`.

---

## Why use Portals?

Portals are particularly useful when a UI element needs to visually escape its parent's DOM constraints.

Common examples:

* Modals
* Dialogs
* Tooltips
* Dropdowns
* Toast notifications
* Context menus
* Popovers
* Full-screen overlays

---

# Normal Rendering

Without a portal:

```text
React Tree

App
 ├── h1
 ├── button
 └── Alert
      └── div.alert
```

The DOM follows the same structure:

```html
<div id="root">
  <div>
    <h1>Other Content</h1>
    <button>Show Message</button>
    <div class="alert">
      ...
    </div>
  </div>
</div>
```

---

# Portal Rendering

With:

```jsx
createPortal(
  <div className="alert">
    ...
  </div>,
  document.querySelector("#alert-holder")
);
```

the DOM becomes conceptually:

```html
<div id="root">
  <div>
    <h1>Other Content</h1>
    <button>Show Message</button>
  </div>
</div>

<div id="alert-holder">
  <div class="alert">
    ...
  </div>
</div>
```

The important distinction is:

> **React tree ≠ DOM tree**

The component still belongs to `App` in the React tree, but its DOM is mounted somewhere else.

---

# How This Example Works

Initially:

```jsx
const [show, setShow] = useState(false);
```

So:

```jsx
<Alert show={false} />
```

and:

```jsx
if (!show) return;
```

prevents the alert from rendering.

When the button is clicked:

```jsx
setShow(true);
```

React renders the `Alert`.

The alert then creates a portal into:

```jsx
document.querySelector("#alert-holder")
```

---

# Closing the Alert

The parent passes:

```jsx
onClose={() => setShow(false)}
```

The portal uses it:

```jsx
<div
  className="alert"
  onClick={onClose}
>
```

Clicking the alert therefore updates state in `App`.

This demonstrates something important:

> Even though the portal's DOM is outside `#root`, it still participates in the same React component tree.

---

# React Tree vs DOM Tree

This is the most important concept to remember.

### React tree

```text
App
 │
 └── Alert
```

### DOM tree

```text
#root
 │
 └── App content


#alert-holder
 │
 └── Alert DOM
```

The portal changes the **DOM location**, not the **React ownership**.

---

# Why Not Just Use CSS?

Imagine this structure:

```html
<div class="container">
  <Alert />
</div>
```

The parent might have:

```css
.container {
  overflow: hidden;
}
```

or:

```css
.container {
  transform: translate(...);
}
```

or establish a particular stacking context.

A modal inside that element can therefore be clipped or appear behind other elements.

A portal allows the modal to be mounted somewhere like:

```html
<body>
  ...
  <div id="modal-root"></div>
</body>
```

making positioning and stacking much easier to control.

---

# A Common Portal Structure

A typical application might have:

```html
<body>
  <div id="root"></div>

  <div id="modal-root"></div>

  <div id="toast-root"></div>
</body>
```

Then:

```jsx
createPortal(
  <Modal />,
  document.querySelector("#modal-root")
);
```

and:

```jsx
createPortal(
  <Toast />,
  document.querySelector("#toast-root")
);
```

---

# Portal Does NOT Mean Separate React Application

A common misconception is that:

```jsx
createPortal(...)
```

creates a separate React application.

It doesn't.

You still have:

```text
One React application
       │
       ├── Normal DOM
       │
       └── Portal DOM
```

The portal simply changes where the JSX is mounted in the DOM.

---

# Events Still Work Through React

This is another important detail.

Suppose:

```jsx
function App() {
  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <div onClick={handleClick}>
      <Alert />
    </div>
  );
}
```

Even if `Alert` is rendered through a portal elsewhere in the DOM, React's event system still considers it part of the React tree.

Therefore, React events can propagate through the **React hierarchy**, even though the DOM hierarchy is different.

This is one of the most powerful properties of portals.

---

# Portal vs Normal Component

| Normal Component           | Portal                                 |
| -------------------------- | -------------------------------------- |
| DOM stays under parent     | DOM can be mounted elsewhere           |
| React tree = DOM hierarchy | React tree can differ from DOM         |
| Good for normal UI         | Good for overlays/popups               |
| Parent CSS can affect it   | Can escape problematic DOM constraints |

---

# Real-World Example: Modal

A common implementation is:

```jsx
const Modal = ({
  children,
  onClose,
}) => {
  return createPortal(
    <div className="backdrop">
      <div className="modal">
        {children}
      </div>
    </div>,
    document.querySelector("#modal-root")
  );
};
```

Usage remains natural:

```jsx
<App>
  <Modal>
    Are you sure?
  </Modal>
</App>
```

even though the modal's DOM is mounted elsewhere.

---

# Important Edge Cases

### Portal target may not exist

This:

```jsx
document.querySelector(
  "#alert-holder"
)
```

can return `null`.

Make sure the target exists before rendering.

For example:

```html
<div id="root"></div>
<div id="alert-holder"></div>
```

---

### Server-Side Rendering

Be careful with:

```jsx
document.querySelector(...)
```

during server rendering because `document` doesn't exist on the server.

Frameworks such as Next.js require appropriate client-side handling for browser-only APIs.

---

### Accessibility

A portal does not automatically make a modal accessible.

Production dialogs should consider:

* Focus management
* Keyboard navigation
* Escape-to-close
* `aria-*` attributes
* Focus trapping
* Screen readers
* Restoring focus after closing

---

# Interview Questions

### What is a React Portal?

A mechanism that allows React to render a component's DOM into a DOM node outside its normal parent DOM hierarchy.

---

### Why are portals useful?

They are useful for UI that needs to escape parent DOM constraints such as:

* `overflow: hidden`
* stacking contexts
* positioning contexts
* clipping

Typical examples are modals, tooltips, dropdowns, and notifications.

---

### Does a portal create a new React tree?

No.

It creates a different **DOM location**, while remaining part of the same React tree.

---

### Do events work through portals?

Yes. React events still follow the React component hierarchy even though the DOM hierarchy is different.

---

### When would you use a portal instead of absolute positioning?

When the component needs to escape its parent's DOM constraints or stacking/overflow behavior.

For example, a modal rendered inside a container with:

```css
overflow: hidden;
```

can be clipped. Rendering it through a portal outside that container avoids the problem.

---

# Best Practices

* Create dedicated DOM containers such as `#modal-root` or `#toast-root`.
* Use portals for UI that logically belongs to one component but visually needs to escape its DOM container.
* Handle accessibility explicitly.
* Be careful with `document` when using SSR.
* Don't use portals unnecessarily—normal React composition is simpler when the DOM hierarchy works naturally.

---

# Key Takeaways

* **React Portals** let you render DOM outside the normal DOM hierarchy of a component.
* The most important API is `createPortal()`.
* A portal changes the **DOM location**, not the **React ownership**.
* React events and context still work through the React tree.
* Portals are especially useful for **modals, dialogs, tooltips, dropdowns, and toast notifications**.
* The key mental model is:

```text
React Tree
    ≠
DOM Tree
```

That's the core idea behind React Portals.
