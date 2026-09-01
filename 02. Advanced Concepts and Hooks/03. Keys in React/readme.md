# React Keys & Component Identity

## What is this concept?

React uses **keys to determine the identity of elements between renders**.

A key is not primarily about forcing a component to "re-render." More precisely:

> **Changing a key tells React that this is a different component instance, so React should unmount the old instance and mount a new one.**

This is especially important when you want to **reset component state**.

---

## The Problem

Suppose we have:

```jsx
{changeShirts ? (
  <>
    <span>Shirts counts: </span>
    <Counter />
  </>
) : (
  <>
    <span>Shoes counts: </span>
    <Counter />
  </>
)}
```

You might expect switching between Shirts and Shoes to create a fresh `Counter`.

But React sees:

```text
Fragment
 └── Counter
```

on both sides.

From React's perspective, the `Counter` is still essentially the **same component in the same position**.

Therefore its state is preserved.

---

# React Preserves State by Position

Consider:

```jsx
<Counter />
```

with:

```jsx
const [count, setCount] = useState(0);
```

If React sees the same component type in the same position:

```text
Counter
  ↓
Counter
```

it assumes:

> "This is the same Counter. Keep its state."

So:

```text
Before:
Counter → count = 5

After:
Counter → count = 5
```

The component re-renders, but its state is preserved.

---

# Using a Key

Now:

```jsx
<Counter key="shirts" />
```

and:

```jsx
<Counter key="shoes" />
```

When switching:

```text
Counter key="shirts"
        ↓
Counter key="shoes"
```

React sees a different identity.

Therefore:

```text
Old Counter
    ↓
UNMOUNT

New Counter
    ↓
MOUNT
```

The new component starts with:

```jsx
const [count, setCount] = useState(0);
```

again.

So the counter resets.

---

# The Important Correction

It's tempting to say:

> "Changing the key forces React to re-render the component."

That's not quite accurate.

The more precise statement is:

> **Changing the key causes React to treat the element as a different component instance, resulting in the old component being unmounted and a new one being mounted.**

A normal re-render does **not** reset state.

---

# Example

```jsx
{changeShirts ? (
  <>
    <span>Shirts counts: </span>
    <Counter key="shirts" />
  </>
) : (
  <>
    <span>Shoes counts: </span>
    <Counter key="shoes" />
  </>
)}
```

The keys provide different identities:

```text
Shirts mode
    ↓
Counter("shirts")
    ↓
count = 0


Switch


Shoes mode
    ↓
Counter("shoes")
    ↓
count = 0
```

Switch back:

```text
Shoes
Counter("shoes")
count = 3

        ↓

Shirts
Counter("shirts")
count = 0
```

And if React keeps the previous instance around conceptually in the tree structure, switching back to that identity can preserve its state depending on the reconciliation structure; the key's essential role here is that `"shirts"` and `"shoes"` are distinct identities, so React won't reuse one instance as the other.

---

# Alternative: Different Parent Types

You mentioned another solution:

> "We need to keep them in different-appearing parent components like `div` vs `section`."

Yes.

For example:

```jsx
{changeShirts ? (
  <div>
    <Counter />
  </div>
) : (
  <section>
    <Counter />
  </section>
)}
```

Now React sees:

```text
div
 └── Counter
```

versus:

```text
section
 └── Counter
```

The root element's type changed:

```text
div → section
```

Therefore React replaces that subtree, causing the `Counter` to be recreated.

---

# Why Does This Work?

React reconciliation considers element **type + position + key** when determining identity.

For example:

```jsx
<div>
  <Counter />
</div>
```

and:

```jsx
<section>
  <Counter />
</section>
```

have different parent types.

So React doesn't simply preserve the existing subtree.

---

# Keys Are Better for Explicit Identity

Instead of using:

```jsx
<div>
  <Counter />
</div>
```

versus:

```jsx
<section>
  <Counter />
</section>
```

you can explicitly communicate the intended identity:

```jsx
<Counter key="shirts" />
```

and:

```jsx
<Counter key="shoes" />
```

This is much clearer.

The key is essentially saying:

```text
"This Counter represents Shirts."

"This Counter represents Shoes."
```

---

# Mental Model

Think of React state as being associated with a component's **position and identity in the rendered tree**, rather than with the JSX function itself.

```text
Position + Type + Key
          ↓
      Component
          ↓
        State
```

Change the identity:

```text
Counter + "shirts"
        ↓
     State A
```

to:

```text
Counter + "shoes"
        ↓
     State B
```

and React treats them as different instances.

---

# Why Keys Are Needed in Lists

This is the same fundamental reason React asks for keys when rendering arrays.

```jsx
users.map((user) => (
  <User key={user.id} user={user} />
))
```

Suppose:

```text
Before:

A
B
C
```

Then:

```text
After:

X
A
B
C
```

Without keys, React may primarily reason based on positions:

```text
position 0: A → X
position 1: B → A
position 2: C → B
```

With stable keys:

```text
A → A
B → B
C → C

X → new
```

React can correctly preserve each component's identity and state.

---

# Bad Keys

Avoid:

```jsx
key={Math.random()}
```

or:

```jsx
key={Date.now()}
```

because the key changes every render.

That can cause:

```text
Old component
     ↓
unmount

New component
     ↓
mount
```

on every render.

This destroys state and can cause unnecessary work.

---

# Index as Key

This:

```jsx
items.map((item, index) => (
  <Item key={index} />
))
```

can be problematic when the list can be reordered, inserted into, or deleted from.

Prefer a stable identifier:

```jsx
items.map((item) => (
  <Item key={item.id} />
))
```

---

# Key Is Not Passed as a Prop

This is another important point.

```jsx
<Counter key="shirts" />
```

does **not** mean:

```jsx
const Counter = ({ key }) => ...
```

`key` is a special React property used by React's reconciliation process.

If the component needs the value itself:

```jsx
<Counter
  key="shirts"
  type="shirts"
/>
```

Then:

```jsx
const Counter = ({ type }) => {
  ...
};
```

---

# Re-render vs Remount

This distinction is worth memorizing.

### Re-render

```text
render
  ↓
same component instance
  ↓
state preserved
```

Example:

```jsx
setCount(count + 1);
```

The component renders again, but:

```text
count
```

is preserved.

---

### Remount

```text
old component
      ↓
   unmount
      ↓
new component
      ↓
initial state
```

Changing the key can cause this.

---

# Practical Rule

If your intention is:

### "Update the UI"

Use:

```jsx
setState(...)
```

### "Re-render"

React normally handles this automatically after state/prop/context changes.

### "Reset this component's state"

Consider giving it a different key:

```jsx
<Component key={someIdentity} />
```

### "Create a completely different component instance"

Use a different key or component identity.

---

# Interview Questions

### Does changing a key cause a re-render?

Not merely a re-render.

It changes the component's identity, so React can **unmount the old instance and mount a new one**.

---

### Why does the state reset when the key changes?

Because the old component instance is no longer considered the same component. A new instance is created with fresh initial state.

---

### Why do keys matter in lists?

They allow React to identify which items correspond to which component instances when the list changes.

---

### Can keys be random?

No. Keys should be **stable and predictable**.

---

### Can I access `key` inside the component?

No. `key` is a special React attribute and isn't passed through as a normal prop.

---

### What is better: different parent types or keys?

Use **keys when your intention is to express component identity**.

This:

```jsx
<Counter key="shirts" />
```

communicates the intention much better than:

```jsx
<div>
  <Counter />
</div>
```

versus:

```jsx
<section>
  <Counter />
</section>
```

---

# Key Takeaways

* React preserves state based on **component identity in the rendered tree**.
* A normal re-render **does not reset state**.
* Changing a `key` makes React treat the element as a **different identity**.
* This can cause the old instance to unmount and a new instance to mount.
* Different parent element types can also cause a subtree to be replaced, but using keys is usually the clearer way to express intentional identity changes.
* Keys are therefore about much more than eliminating React warnings in `.map()`.
* The deeper concept is:

```text
React
  ↓
Reconciliation
  ↓
Component Identity
  ↓
State Preservation
```

**Best mental model:**

> **Same type + same position + same key → React tries to preserve the component and its state.**

> **Different key/type → React treats it as a different identity.**
