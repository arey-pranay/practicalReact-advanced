# Callback Refs, `useCallback`, and Why `realInputRef` Exists

Your example is demonstrating **callback refs** rather than the usual object ref:

```jsx
const inputRef = useCallback((input) => {
  ...
}, []);
```

This is useful when you want to **run code immediately when a DOM element is attached or detached**.

---

## The normal `useRef` approach

Normally, you'd write:

```jsx
const inputRef = useRef(null);

return (
  <>
    <button onClick={() => setShow((s) => !s)}>
      Switch
    </button>

    {show && <input ref={inputRef} />}
  </>
);
```

React will automatically do:

```text
input appears
    ↓
inputRef.current = DOM element
```

and when it disappears:

```text
input disappears
    ↓
inputRef.current = null
```

But **nothing automatically happens when the ref is attached**.

So if you want:

> "Whenever this input appears, focus it."

you need something like:

```jsx
useEffect(() => {
  if (show) {
    inputRef.current?.focus();
  }
}, [show]);
```

---

# Callback Ref

Instead, you can give React a function:

```jsx
const inputRef = useCallback((input) => {
  if (input) {
    input.focus();
  }
}, []);
```

Now React calls that function when the element is attached.

```text
Input mounted
      ↓
React calls callback
      ↓
inputRef(inputElement)
      ↓
input.focus()
```

And when the element is removed:

```text
Input unmounted
      ↓
React calls callback
      ↓
inputRef(null)
```

That's why you have:

```jsx
if (input === null) return;
```

You're handling the **detach** case.

---

# Your Code

```jsx
const inputRef = useCallback((input) => {
  realInputRef.current = input;

  if (input === null) return;

  input.focus();
}, []);
```

Here `input` is actually the DOM element:

```text
input
 ↓
<HTMLInputElement>
```

when attached.

So:

```jsx
input.focus();
```

works immediately.

---

# Why not simply use a normal ref?

You absolutely **can** use a normal ref.

For this particular example, the simpler solution is:

```jsx
const inputRef = useRef(null);

useEffect(() => {
  if (show) {
    inputRef.current?.focus();
  }
}, [show]);

return (
  <>
    <button onClick={() => setShow((s) => !s)}>
      Switch
    </button>

    {show && <input ref={inputRef} />}
  </>
);
```

But there's an important difference.

### Object ref

```jsx
<input ref={inputRef} />
```

React assigns:

```jsx
inputRef.current = input;
```

You then need another mechanism such as `useEffect` to react to that assignment.

### Callback ref

```jsx
<input ref={inputRef} />
```

where:

```jsx
const inputRef = useCallback((input) => {
  input.focus();
}, []);
```

React directly calls your function when the element becomes available.

So:

```text
Object ref:

DOM appears
   ↓
ref.current = DOM
   ↓
nothing else happens


Callback ref:

DOM appears
   ↓
callback(DOM)
   ↓
your code executes immediately
```

---

# The Element Focus Issue

This is where callback refs become particularly useful.

Imagine:

```jsx
const inputRef = useRef(null);

useEffect(() => {
  if (show) {
    inputRef.current?.focus();
  }
}, [show]);
```

This works because the effect runs after the render and after the DOM has been committed.

But if your goal is specifically:

> "When React attaches this particular DOM node, immediately perform some operation."

a callback ref expresses that more directly.

```jsx
const inputRef = useCallback((input) => {
  if (input) {
    input.focus();
  }
}, []);
```

The callback receives the actual element at the moment React attaches it.

---

# Why `realInputRef`?

This part is subtle and important.

You have:

```jsx
const realInputRef = useRef(null);

const inputRef = useCallback((input) => {
  realInputRef.current = input;

  if (input === null) return;

  input.focus();
}, []);
```

There are actually **two different things** here.

### `realInputRef`

This is a real React ref object:

```jsx
{
  current: ...
}
```

So you can do:

```jsx
realInputRef.current
```

from anywhere in the component.

---

### `inputRef`

This is a function:

```jsx
(input) => {
  ...
}
```

It is a **callback ref**, not an object ref.

Therefore:

```jsx
inputRef.current
```

doesn't make sense.

There is no `.current`.

---

# Why Not Stop at `inputRef`?

You could write:

```jsx
const inputRef = useCallback((input) => {
  input.focus();
}, []);
```

This is perfectly valid if all you need is:

> "Focus the element when it appears."

But suppose later you want:

```jsx
const doSomething = () => {
  realInputRef.current.focus();
};
```

You need a persistent reference to the DOM element.

That's where:

```jsx
const realInputRef = useRef(null);
```

comes in.

You effectively have:

```text
                 callback ref
                     ↓
React ───────→ inputRef(input)
                     │
                     ├──→ input.focus()
                     │
                     └──→ realInputRef.current = input
                                      │
                                      ↓
                              persistent access
```

So:

```text
inputRef
   ↓
"Run this code when the element attaches."

realInputRef
   ↓
"Keep a reference to the element so I can access it later."
```

---

# Why `useCallback`?

You could technically write:

```jsx
const inputRef = (input) => {
  realInputRef.current = input;

  if (input) {
    input.focus();
  }
};
```

But this function is recreated **on every render**.

```text
Render 1 → function A
Render 2 → function B
Render 3 → function C
```

And callback refs have an important behavior:

> If the callback ref function changes, React may need to detach the old callback ref and attach the new one.

Conceptually:

```text
Previous render:

<input ref={function A} />

Next render:

<input ref={function B} />
```

React sees that the callback itself changed:

```text
function A !== function B
```

so it can do:

```text
function A(null)   // detach
       ↓
function B(input)  // attach
```

That can cause your callback logic to execute again.

---

# `useCallback` Fixes That

You have:

```jsx
const inputRef = useCallback((input) => {
  realInputRef.current = input;

  if (input === null) return;

  input.focus();
}, []);
```

Because the dependency array is empty:

```jsx
[]
```

React keeps the **same function reference** across renders.

Conceptually:

```text
Render 1 → function A
Render 2 → function A
Render 3 → function A
```

instead of:

```text
Render 1 → function A
Render 2 → function B
Render 3 → function C
```

Therefore React doesn't unnecessarily treat the callback ref as a new ref callback on every render.

---

# Complete Example

```jsx
import {
  useCallback,
  useRef,
  useState,
} from "react";

function App() {
  const [show, setShow] = useState(false);

  /*
   * This is a REAL ref object.
   *
   * It has:
   *
   *     realInputRef.current
   *
   * We use it when we want to keep access to the
   * actual DOM element after the callback has run.
   */
  const realInputRef = useRef(null);

  /*
   * This is a CALLBACK REF.
   *
   * React calls this function when the input is attached:
   *
   *     inputRef(inputElement)
   *
   * And when it is detached:
   *
   *     inputRef(null)
   *
   * useCallback keeps the callback function stable between
   * renders.
   */
  const inputRef = useCallback((input) => {
    /*
     * Store the actual DOM element inside our real ref.
     *
     * This allows us to later do:
     *
     *     realInputRef.current
     */
    realInputRef.current = input;

    /*
     * React calls the callback with null when the element
     * is removed.
     */
    if (input === null) return;

    /*
     * The input has just been attached to the DOM.
     * We can immediately perform DOM operations on it.
     */
    input.focus();
  }, []);

  return (
    <>
      <button
        onClick={() => setShow((s) => !s)}
      >
        Switch
      </button>

      {show && (
        <input
          type="text"
          ref={inputRef}
        />
      )}
    </>
  );
}

export default App;
```

---

# The Main Concept

Don't think of callback refs as:

> "Another way of writing `useRef`."

Think of them as:

> **A callback that React invokes when a DOM node is attached or detached.**

```jsx
ref={inputRef}
```

with:

```jsx
const inputRef = (element) => {
  // element became available
};
```

is fundamentally different from:

```jsx
const inputRef = useRef(null);
```

because the first is a **function React calls**, while the second is a **ref object React writes to**.

---

## One-line revision note

> **Use callback refs when you need to execute logic exactly when a DOM element is attached/detached; use `useRef` when you mainly need persistent access to the DOM element. `useCallback` keeps the callback ref stable so React doesn't unnecessarily detach and reattach it on every render.**
