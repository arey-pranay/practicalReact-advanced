# Component Composition

## What is Component Composition?

**Composition** is the practice of building new components by combining existing components instead of modifying or inheriting from them.

React strongly favors **composition over inheritance**.

In this example:

```
Button

↓

SmallButton

↓

SmallRedButton
```

Each component adds behavior while reusing the previous one.

---

## Why use Composition?

- Reuse components.
- Avoid duplicate code.
- Build specialized components.
- Keep components small.
- Improve maintainability.

---

## Folder Structure

```
Component Composition
│── App.jsx
│── components/
│     └── composition.jsx
```

---

## Base Component

```jsx
export const Button = ({
    size,
    color,
    text,
}) => {
    return (
        <button
            style={{
                fontSize:
                    size === "large"
                        ? "25px"
                        : "16px",
                backgroundColor: color,
            }}
        >
            {text}
        </button>
    );
};
```

The base component is generic.

It knows nothing about:

- red buttons
- blue buttons
- submit buttons

It simply renders whatever props it receives.

---

# First Composition

```jsx
export const SmallButton = (
    props
) => {
    return (
        <Button
            {...props}
            size="small"
        />
    );
};
```

Instead of rewriting the entire button, we reuse `Button` and provide one fixed prop.

```
Button

↓

SmallButton
```

---

# Second Composition

```jsx
export const SmallRedButton = (
    props
) => {
    return (
        <SmallButton
            {...props}
            color="crimson"
        />
    );
};
```

Now another component is built on top of `SmallButton`.

```
Button

↓

SmallButton

↓

SmallRedButton
```

---

# Component Hierarchy

```
<Button />

        ▲

<SmallButton />

        ▲

<SmallRedButton />
```

Each level specializes the previous component.

---

# Prop Overriding

Consider:

```jsx
<SmallButton
    text="Hello"
/>
```

Internally React renders

```jsx
<Button
    text="Hello"
    size="small"
/>
```

For

```jsx
<SmallRedButton />
```

React ultimately renders

```jsx
<Button
    size="small"
    color="crimson"
/>
```

The consumer doesn't need to repeatedly specify these props.

---

# How it Works

```
SmallRedButton

↓

SmallButton

↓

Button

↓

HTML Button
```

Every component simply forwards props while adding new defaults.

---

# Why use `...props`?

```jsx
<Button
    {...props}
    size="small"
/>
```

This forwards every prop while overriding only the ones we care about.

Example:

```jsx
<SmallButton
    text="Save"
    disabled
/>
```

becomes

```jsx
<Button
    text="Save"
    disabled
    size="small"
/>
```

Without prop spreading, additional props would be lost.

---

# Advantages

- Eliminates duplicate code.
- Keeps components reusable.
- Easy to create specialized variants.
- Encourages small focused components.
- Follows React philosophy.

---

# Disadvantages

- Deep composition chains can become difficult to follow.
- Too many wrapper components may complicate debugging.
- Sometimes a simple prop is sufficient instead of another wrapper.

---

# Real-world Examples

Component composition is everywhere in UI libraries.

Examples include:

```
<Button />

↓

<PrimaryButton />

↓

<PrimaryLargeButton />

↓

<PrimaryLargeRoundedButton />
```

Other examples:

- Cards
- Alerts
- Badges
- Avatars
- Dialogs
- Navigation Items

---

# Composition vs Inheritance

### Composition

```jsx
<SmallButton />

↓

<Button />
```

Builds components using other components.

---

### Inheritance

```jsx
class SmallButton
    extends Button
```

Not recommended in React.

React's official documentation recommends **composition instead of inheritance**.

---

# Composition vs Configuration

Instead of creating:

```jsx
<SmallRedButton />
```

you could write:

```jsx
<Button
    size="small"
    color="crimson"
/>
```

Both approaches are valid.

Use composition when the combination is:

- reused often
- has semantic meaning
- improves readability

---

# Interview Questions

### What is Component Composition?

Building new components by combining existing components rather than extending them through inheritance.

---

### Why does React prefer composition?

Composition creates reusable, loosely coupled components that are easier to maintain and reason about than inheritance hierarchies.

---

### Why spread props?

```jsx
<Button
    {...props}
    size="small"
/>
```

It forwards all received props while allowing specific props to be overridden or fixed.

---

### Which value wins if the same prop appears twice?

The **last prop wins**.

Example:

```jsx
<Button
    color="blue"
    color="red"
/>
```

The resulting color is:

```
red
```

Likewise,

```jsx
<Button
    {...props}
    size="small"
/>
```

ensures `size` is always `"small"` even if `props` contains another `size`.

---

### Is composition only about wrapper components?

No.

Composition also includes:

- `children`
- Layout components
- Compound components
- Custom hooks working together
- Combining reusable UI primitives

---

# Best Practices

- Keep the base component generic.
- Build specialized components through composition.
- Forward unrelated props with `...props`.
- Avoid creating wrapper components for every tiny variation.
- Prefer configuration via props when it keeps the API simpler.

---

# Key Takeaways

- **Component Composition** is the foundation of React's design philosophy.
- Small, reusable components can be combined to create specialized UI without duplication.
- Wrapper components provide sensible defaults while forwarding additional props.
- React recommends **composition over inheritance** because it leads to more flexible, maintainable applications.
- Most modern component libraries are built around composition, making it one of the most important React concepts to master.
