# `useDeferredValue`

`useDeferredValue` lets React treat a value as **less urgent**, so updates that depend on that value can be rendered later when the UI is busy.

It is useful when:

> **A fast-changing value controls an expensive component, and we don't want that expensive component to block the responsive part of the UI.**

---

## The Problem

Here:

```jsx
const [keyword, setKeyword] = useState("");
const deferredKeyword = useDeferredValue(keyword);
```

The input updates `keyword` immediately:

```jsx
<input
  value={keyword}
  onChange={(e) => setKeyword(e.target.value)}
/>
```

But instead of giving `keyword` directly to the expensive component:

```jsx
<HeavyComponent keyword={keyword} />
```

we give it:

```jsx
<HeavyComponent keyword={deferredKeyword} />
```

So React can prioritize:

```text
HIGH PRIORITY
    ↓
Input interaction
    ↓
keyword


LOWER PRIORITY
    ↓
HeavyComponent
    ↓
deferredKeyword
```

---

# The Heavy Component

Your component intentionally blocks the main thread:

```jsx
const Component = ({ keyword }) => {
  const init = performance.now();

  while (init > performance.now() - 100) {
    // Slowing down the component on purpose.
  }

  return (
    <>
      <h2>I am a slow component</h2>
      {keyword}
    </>
  );
};
```

Every render takes approximately **100ms**.

And:

```jsx
export const HeavyComponent = React.memo(Component);
```

means React can skip rendering it when its props haven't changed.

---

# Without `useDeferredValue`

Suppose we did:

```jsx
const [keyword, setKeyword] = useState("");

return (
  <>
    <input
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
    />

    <HeavyComponent keyword={keyword} />
  </>
);
```

When you type:

```text
a
```

the sequence is roughly:

```text
User types "a"
      ↓
setKeyword("a")
      ↓
React renders
      ↓
Input updates
      ↓
HeavyComponent renders
      ↓
100ms blocking work
      ↓
Screen can update
```

If the user types quickly:

```text
a → b → c → d
```

every update can cause the expensive component to participate in rendering.

The input can therefore **feel laggy**.

---

# With `useDeferredValue`

Now:

```jsx
const deferredKeyword = useDeferredValue(keyword);
```

The input uses the immediate value:

```jsx
<input value={keyword} />
```

while the expensive component uses:

```jsx
<HeavyComponent keyword={deferredKeyword} />
```

Conceptually:

```text
User types
   ↓
keyword changes immediately
   ↓
React prioritizes input update
   ↓
Input stays responsive
   ↓
React works on deferredKeyword
   ↓
HeavyComponent eventually receives new value
```

So you can temporarily have:

```text
keyword          = "react"
deferredKeyword  = "rea"
```

for a short period.

Eventually:

```text
keyword          = "react"
deferredKeyword  = "react"
```

---

# Your `console.log` Demonstrates This

You have:

```jsx
console.log("keyword", keyword);
console.log("deferredKeyword", deferredKeyword);
```

You may see something conceptually like:

```text
keyword          ""
deferredKeyword  ""

keyword          "r"
deferredKeyword  ""

keyword          "r"
deferredKeyword  "r"

keyword          "re"
deferredKeyword  "r"

keyword          "re"
deferredKeyword  "re"
```

The important point is:

> **The deferred value is allowed to temporarily lag behind the original value.**

---

# Why `React.memo` Is Also Here

You have:

```jsx
export const HeavyComponent = React.memo(Component);
```

This is complementary to `useDeferredValue`.

`React.memo` says:

> "If the props haven't changed, don't render this component again."

`useDeferredValue` says:

> "This particular value doesn't need to update as urgently."

Together:

```text
keyword
   │
   ▼
useDeferredValue
   │
   ▼
deferredKeyword
   │
   ▼
React.memo
   │
   ▼
HeavyComponent
```

However, **`React.memo` alone doesn't solve the problem** if `keyword` changes every time:

```jsx
<HeavyComponent keyword={keyword} />
```

Because:

```text
keyword "r"  → prop changed → render
keyword "re" → prop changed → render
keyword "rea" → prop changed → render
```

`memo` can't skip those renders.

`useDeferredValue` allows React to deprioritize those updates.

---

# Important: It Doesn't Debounce

This is a very important distinction.

`useDeferredValue` is **not**:

```text
Wait 300ms
↓
Then update
```

like a debounce.

Instead, it tells React:

> **"This update is lower priority. Do it when React has time."**

### Debounce

```text
a
  ↓
wait
  ↓
ab
  ↓
wait
  ↓
abc
  ↓
wait
  ↓
run
```

### `useDeferredValue`

```text
a
 ↓
React can update it when possible

ab
 ↓
React can update it when possible

abc
 ↓
React can update it when possible
```

There is **no fixed delay**.

---

# Complete Revision Component

```jsx
import {
  useDeferredValue,
  useState,
} from "react";

import { HeavyComponent } from "./components/heavy-component";

function App() {
  /*
   * This is the immediate value.
   *
   * It should update as soon as the user types.
   */
  const [keyword, setKeyword] = useState("");

  /*
   * React is allowed to defer updates to this value.
   *
   * It can temporarily be different from `keyword`.
   */
  const deferredKeyword = useDeferredValue(keyword);

  console.log("keyword:", keyword);
  console.log("deferredKeyword:", deferredKeyword);

  return (
    <>
      {/*
       * The input uses the immediate value.
       * Therefore it should remain responsive.
       */}
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/*
       * The expensive component receives the deferred value.
       *
       * React can prioritize the input and render this
       * component later.
       */}
      <HeavyComponent
        keyword={deferredKeyword}
      />
    </>
  );
}

export default App;
```

And:

```jsx
import React from "react";

const Component = ({ keyword }) => {
  /*
   * Artificially make rendering expensive.
   */
  const init = performance.now();

  while (init > performance.now() - 100) {
    // Intentionally block for ~100ms.
  }

  return (
    <>
      <h2>I am a slow component</h2>
      {keyword}
    </>
  );
};

/*
 * Avoid rendering when `keyword` hasn't changed.
 */
export const HeavyComponent = React.memo(Component);
```

---

# Mental Model

Remember this:

```text
useState
   ↓
Immediate / urgent value
   ↓
UI that must stay responsive


useDeferredValue
   ↓
Lower-priority version of that value
   ↓
Expensive UI
```

### One-line revision note

> **`useDeferredValue` allows a frequently changing value to lag behind so expensive UI depending on it can be rendered at a lower priority, keeping urgent interactions such as typing responsive.**
