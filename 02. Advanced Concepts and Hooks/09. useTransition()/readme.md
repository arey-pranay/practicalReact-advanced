# `useTransition`

`useTransition` is used when a **state update may trigger expensive rendering** and we want React to treat that update as **non-urgent**.

In your example, switching to `Reviews` causes React to render **300 intentionally slow reviews**. 

The important distinction:

```text
useDeferredValue
→ makes a VALUE less urgent

useTransition
→ makes a STATE UPDATE less urgent
```

---

## The problem

Normally:

```jsx
const sectionHandler = (sec) => {
  setSection(sec);
};
```

When clicking:

```text
Book Reviews
     ↓
setSection("Reviews")
     ↓
React renders Reviews
     ↓
300 Reviews × ~3ms
     ↓
expensive render
```

Your `Review` component deliberately blocks for roughly 3ms:

```jsx
const init = performance.now();

while (init > performance.now() - 3) {
  // Fake slow down.
}
```

So rendering all 300 reviews creates an intentionally expensive update. 

---

# `useTransition`

You use:

```jsx
const [isPending, startTransition] = useTransition();
```

Then:

```jsx
startTransition(() => {
  onClick();
});
```

This tells React:

> **The state update inside this function is a transition/non-urgent update.**

So:

```text
Urgent
──────
User interaction
Input
Click feedback
etc.

        ↓

Non-urgent
──────────
Expensive section rendering
```

React can prioritize urgent work over the transition.

---

# Your code

```jsx
const Button = ({ onClick, ...props }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <StyledButton
      onClick={() => {
        startTransition(() => {
          onClick();
        });
      }}
      {...props}
    />
  );
};
```

The important part is:

```jsx
startTransition(() => {
  onClick();
});
```

And `onClick` eventually calls:

```jsx
setSection(sec);
```

Therefore the `setSection` update becomes a transition.

---

# What actually happens

Suppose we're currently displaying:

```text
Cover
```

and click:

```text
Book Reviews
```

Without a transition:

```text
Click
 ↓
setSection("Reviews")
 ↓
Render Reviews
 ↓
Expensive 300-item render
 ↓
UI finishes updating
```

With a transition:

```text
Click
 ↓
startTransition(...)
 ↓
setSection("Reviews")
 ↓
React marks update as non-urgent
 ↓
React works on Reviews
 ↓
If more urgent work arrives,
React can prioritize it
```

The key word is **priority**.

`useTransition` doesn't magically make the 300 reviews render faster.

It tells React:

> "Don't treat this update as urgent."

---

# `isPending`

`useTransition` gives you two things:

```jsx
const [isPending, startTransition] = useTransition();
```

### `startTransition`

Used to mark updates as transitions:

```jsx
startTransition(() => {
  setSection("Reviews");
});
```

### `isPending`

Tells you whether a transition is currently pending:

```jsx
if (isPending) {
  // Show loading/pending UI
}
```

Your current code gets `isPending` but doesn't use it.

You could do:

```jsx
const Button = ({ onClick, children, ...props }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <StyledButton
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          onClick();
        });
      }}
      {...props}
    >
      {isPending ? "Loading..." : children}
    </StyledButton>
  );
};
```

Although in a real application, you might prefer showing a subtle pending indicator rather than disabling all navigation.

---

# Why `useTransition` instead of `useDeferredValue`?

This is one of the most important things to remember.

### `useDeferredValue`

You already saw:

```jsx
const [keyword, setKeyword] = useState("");

const deferredKeyword = useDeferredValue(keyword);
```

You have an existing value and say:

> "Give me a deferred version of this value."

```text
keyword
   ↓
useDeferredValue
   ↓
deferredKeyword
```

---

### `useTransition`

Here you control the state update itself:

```jsx
startTransition(() => {
  setSection("Reviews");
});
```

You're saying:

> "This state update can be treated as non-urgent."

```text
setSection(...)
      ↑
startTransition
```

### Easy memory trick

```text
useDeferredValue
    ↓
"Defer this VALUE"

useTransition
    ↓
"Defer this UPDATE"
```

---

# Complete commented version

```jsx
import { useState, useTransition } from "react";

import Cover from "./components/cover";
import Reviews from "./components/reviews";
import Writer from "./components/writer";

import { StyledButton } from "./components/styled-elements";

function App() {
  /*
   * This determines which section is currently displayed.
   */
  const [section, setSection] = useState("Cover");

  /*
   * This state update will be wrapped in startTransition
   * inside the Button component.
   */
  const sectionHandler = (sec) => {
    setSection(sec);
  };

  return (
    <>
      <Button onClick={() => sectionHandler("Cover")}>
        Cover
      </Button>

      <Button onClick={() => sectionHandler("Reviews")}>
        Book Reviews
      </Button>

      <Button onClick={() => sectionHandler("Writer")}>
        Book's Writer
      </Button>

      {/*
       * Reviews is intentionally expensive.
       *
       * Switching to it therefore represents a potentially
       * expensive rendering operation.
       */}
      {section === "Cover" ? (
        <Cover />
      ) : section === "Reviews" ? (
        <Reviews />
      ) : (
        <Writer />
      )}
    </>
  );
}

/*
 * Button turns its onClick state update into a transition.
 */
const Button = ({ onClick, ...props }) => {
  /*
   * isPending:
   *   tells us whether the transition is currently pending.
   *
   * startTransition:
   *   marks state updates inside its callback as
   *   non-urgent transition updates.
   */
  const [isPending, startTransition] = useTransition();

  return (
    <StyledButton
      onClick={() => {
        /*
         * Any state update caused by onClick is treated
         * as a transition.
         *
         * In this example, that eventually means:
         *
         *     setSection(...)
         *
         * is a non-urgent update.
         */
        startTransition(() => {
          onClick();
        });
      }}
      {...props}
    />
  );
};

export default App;
```

---

# `performance.now()` in this example

You're using:

```jsx
const init = performance.now();

while (init > performance.now() - 3) {
  // Fake slow down.
}
```

`performance.now()` is appropriate here because you're measuring **elapsed time / performance**, not a calendar time.

### `performance.now()`

```text
High-resolution elapsed timer
        ↓
Performance measurements
        ↓
Benchmarking
        ↓
Animation/performance work
```

It is based on the page's **time origin**, rather than the Unix epoch, and is designed for measuring elapsed time. Its resolution can be reduced by browsers for security/privacy, so don't think of "microseconds" as a guaranteed precision.

### `Date.now()`

```text
Current wall-clock time
        ↓
Unix timestamp
        ↓
Dates / timestamps
        ↓
"September 8, 2026, 12:30..."
```

It can also be affected by system clock adjustments.

### Revision table

|                      | `performance.now()`                                         | `Date.now()`      |
| -------------------- | ----------------------------------------------------------- | ----------------- |
| Measures             | Elapsed time                                                | Wall-clock time   |
| Starting point       | Page/context time origin                                    | Unix epoch        |
| Best for             | Performance measurement                                     | Dates/timestamps  |
| System clock changes | Generally unaffected                                        | Can affect result |
| Precision            | High-resolution timer, subject to browser privacy reduction | Milliseconds      |

So this:

```jsx
const start = performance.now();

while (performance.now() - start < 100) {
  // expensive work
}
```

is appropriate for **simulating expensive rendering**.

---

## One-line revision note

> **`useTransition` lets you mark a state update as non-urgent, allowing React to prioritize more important UI work while processing the potentially expensive update in the background. `isPending` can be used to show that the transition is still being processed.**
