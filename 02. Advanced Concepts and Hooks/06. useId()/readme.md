# `useId` — Stable IDs for React

`useId` generates a **unique, stable ID** that React can use for things like:

* `<label>` → `<input>` associations
* Accessibility attributes
* Connecting related DOM elements

```jsx
const id = useId();
```

You can then derive multiple IDs from it:

```jsx
id={`${id}-email`}
id={`${id}-name`}
```

---

## Example

```jsx
import { useId, useState } from "react";

const Form = () => {
  const [email, setEmail] = useState("");

  /*
   * React generates an ID that is:
   *
   * - Unique for this component instance
   * - Stable across re-renders
   * - Safe to use with Server-Side Rendering
   */
  const id = useId();

  return (
    <div>
      <label htmlFor={`${id}-email`}>
        Email
      </label>

      <input
        id={`${id}-email`}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor={`${id}-name`}>
        Name
      </label>

      <input
        id={`${id}-name`}
        type="text"
      />
    </div>
  );
};

export default Form;
```

Since `App` renders `Form` twice:

```jsx
function App() {
  return (
    <>
      <Form />

      <p>
        It is a long established fact that a reader will be
        distracted by the readable content of a page when
        looking at its layout.
      </p>

      <Form />
    </>
  );
}
```

each `Form` gets a different ID.

Conceptually:

```text
Form #1
  id = :R1:
  email = :R1:-email
  name  = :R1:-name


Form #2
  id = :R2:
  email = :R2:-email
  name  = :R2:-name
```

So the labels and inputs don't accidentally share IDs.

---

# Why not `Math.random()`?

You might initially think:

```jsx
const id = Math.random();
```

This can appear to work in a normal client-side React application.

For example:

```jsx
const id = Math.random();

return (
  <>
    <label htmlFor={id}>Email</label>
    <input id={id} />
  </>
);
```

The browser gets some random ID:

```text
0.827364...
```

and everything appears fine.

### The problem is SSR

In Server-Side Rendering, React renders the component **twice in different environments**:

```text
             Server
               ↓
        Render HTML
               ↓
          send to browser
               ↓
            Client
               ↓
          Hydration
```

Suppose the server executes:

```js
Math.random()
```

and gets:

```text
0.12345
```

So the server produces:

```html
<input id="0.12345" />
```

But when React hydrates on the client, `Math.random()` runs again:

```text
0.98765
```

The client expects:

```html
<input id="0.98765" />
```

Now the server and client generated **different output**.

```text
SERVER
id="0.12345"

        ≠

CLIENT
id="0.98765"
```

This can lead to a **hydration mismatch**.

---

# `useId` solves this

React's `useId()` is designed to generate IDs that remain consistent between the server-rendered HTML and the client.

```jsx
const id = useId();
```

Conceptually:

```text
SERVER
Form → :R1:

        ↓ hydration

CLIENT
Form → :R1:
```

Therefore:

```text
Server HTML
     ↓
id=":R1:-email"
     ↓
Client hydration
     ↓
id=":R1:-email"
```

No random value needs to be independently generated on server and client.

---

# `useId` is NOT for list keys

This is important.

Don't do:

```jsx
items.map((item) => (
  <Item key={useId()} />
))
```

Hooks cannot be called inside loops like this, and `useId` isn't intended to generate list keys.

For lists, use the item's stable identity:

```jsx
items.map((item) => (
  <Item key={item.id} />
))
```

Remember:

```text
useId
  ↓
DOM IDs / accessibility


key
  ↓
React component identity
```

They solve different problems.

---

# `useId` vs `Math.random()`

|                                    | `useId()` | `Math.random()` |
| ---------------------------------- | --------- | --------------- |
| Stable across re-renders           | ✅         | ❌               |
| Unique between component instances | ✅         | Usually         |
| SSR-friendly                       | ✅         | ❌               |
| Hydration-safe                     | ✅         | ❌               |
| Intended for DOM IDs               | ✅         | Not ideal       |
| Intended for React keys            | ❌         | ❌               |

---

# Other Things to Remember

`useId` is particularly useful for accessibility:

```jsx
const id = useId();

return (
  <>
    <label htmlFor={`${id}-email`}>
      Email
    </label>

    <input
      id={`${id}-email`}
      aria-describedby={`${id}-help`}
    />

    <span id={`${id}-help`}>
      We'll never share your email.
    </span>
  </>
);
```

Now all the relationships are guaranteed to be unique for that component instance:

```text
label
  │
  │ htmlFor
  ▼
input
  │
  │ aria-describedby
  ▼
help text
```

### Mental model

> **`useId` is for generating stable IDs that need to connect DOM elements, especially when React is rendered on both the server and client.**

And the important SSR lesson is:

> **Anything nondeterministic during render—such as `Math.random()` or `Date.now()`—can produce different server and client markup and therefore cause hydration problems.**
