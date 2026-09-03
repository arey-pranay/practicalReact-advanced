> With `useEffect`, React renders → commits the DOM → **browser may paint** → `useEffect` runs → state update causes another render.

That means the user can briefly see the **intermediate/wrong position**.

With `useLayoutEffect`:

> React renders → commits DOM → `useLayoutEffect` runs **before the browser paints** → state update → React renders again → browser paints the final result.

So the intermediate position isn't visibly painted.

# `useLayoutEffect`

`useLayoutEffect` is similar to `useEffect`, but it runs **synchronously after React updates the DOM and before the browser paints the screen**.

This makes it useful when you need to:

* Measure DOM elements
* Read element dimensions/positions
* Position elements based on their actual DOM position
* Make visual corrections before the user sees the page

---

## `useEffect`

The approximate lifecycle is:

```text
State/props change
      ↓
React renders
      ↓
DOM is updated
      ↓
Browser paints
      ↓
useEffect runs
      ↓
setState()
      ↓
React renders again
      ↓
Browser paints again
```

Therefore, if `useEffect` changes something visual, the user can potentially see the intermediate state.

---

## `useLayoutEffect`

With `useLayoutEffect`:

```text
State/props change
      ↓
React renders
      ↓
DOM is updated
      ↓
useLayoutEffect runs
      ↓
setState()
      ↓
React renders again
      ↓
Browser paints
```

The browser waits for the layout effect to finish before painting.

---

## Example

Suppose we want to position an element **30px below a button**.

We need to first render the button, then measure its position using:

```js
buttonRef.current.getBoundingClientRect()
```

and finally position the other element.

```jsx
import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";

function App() {
  const [show, setShow] = useState(false);
  const [top, setTop] = useState(0);

  const buttonRef = useRef(null);

  useLayoutEffect(() => {
    // The element may not exist yet.
    if (!buttonRef.current || !show) {
      setTop(0);
      return;
    }

    /*
     * getBoundingClientRect() gives us the element's
     * actual position after React has updated the DOM.
     */
    const { bottom } = buttonRef.current.getBoundingClientRect();

    /*
     * Update the position before the browser paints.
     */
    setTop(bottom + 30);
  }, [show]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setShow((show) => !show)}
      >
        Show
      </button>

      {show && (
        <div
          style={{
            position: "absolute",
            top,
            border: "2px solid black",
            padding: "10px",
          }}
        >
          Some text...
        </div>
      )}
    </>
  );
}

export default App;
```

### Why not `useEffect`?

If we changed:

```jsx
useLayoutEffect(() => {
```

to:

```jsx
useEffect(() => {
```

the sequence could become:

```text
show = true
    ↓
Render
    ↓
Element initially uses top = 0
    ↓
DOM updated
    ↓
Browser paints  ← user may see wrong position
    ↓
useEffect runs
    ↓
Measure button
    ↓
setTop(...)
    ↓
Render
    ↓
Correct position
```

With `useLayoutEffect`:

```text
show = true
    ↓
Render
    ↓
DOM updated
    ↓
useLayoutEffect
    ↓
Measure button
    ↓
setTop(...)
    ↓
Render
    ↓
Browser paints
```

So the user sees the **final position**, rather than the intermediate one.

---

## When to use which?

### Use `useEffect` for most side effects

```jsx
useEffect(() => {
  fetchData();
}, []);
```

Examples:

* API requests
* Subscriptions
* Timers
* Logging
* Synchronizing with external systems

### Use `useLayoutEffect` for layout-sensitive work

```jsx
useLayoutEffect(() => {
  const rect = elementRef.current.getBoundingClientRect();
  // calculate position/size
}, []);
```

Examples:

* Measuring DOM
* Positioning tooltips/popovers
* Preventing visual flicker
* Reading layout immediately after DOM changes

---

## Important Warning

`useLayoutEffect` blocks the browser from painting while it runs.

Therefore, don't put expensive work inside it:

```jsx
useLayoutEffect(() => {
  // ❌ expensive computation
  // ❌ large loops
  // ❌ heavy processing
}, []);
```

Prefer `useEffect` unless you specifically need to perform work **before paint**.

### Mental model

```text
useEffect

Render → DOM → PAINT → Effect


useLayoutEffect

Render → DOM → Layout Effect → PAINT
```

**The core reason to use `useLayoutEffect`:**

> **When you need to read or modify the DOM and don't want the user to see the intermediate visual state.**
