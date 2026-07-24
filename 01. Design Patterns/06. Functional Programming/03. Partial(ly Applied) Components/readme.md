# Partial Component Pattern (Partial Application)

## What is it?

The **Partial Component Pattern** applies the concept of **partial application** from functional programming to React.

Instead of manually creating wrapper components for every variation, a helper function pre-configures a component with default props.

Think of it as creating a "pre-filled" version of a component.

---

## Why use it?

- Eliminate repetitive wrapper components.
- Reduce boilerplate.
- Reuse common configurations.
- Build specialized components easily.
- Encourage functional programming principles.

---

## Folder Structure

```
Partial Component Pattern
│── App.jsx
│── components/
│     └── partial.jsx
```

---

## Implementation

```jsx
export const partial = (
    Component,
    partialProps
) => {
    return (props) => {
        return (
            <Component
                {...partialProps}
                {...props}
            />
        );
    };
};
```

This helper returns a new component with some props already defined.

---

## Creating Components

### Small Button

```jsx
const SmallButton =
    partial(Button, {
        size: "small",
    });
```

---

### Large Red Button

```jsx
const LargeRedButton =
    partial(Button, {
        size: "large",
        color: "crimson",
    });
```

No additional wrapper components are needed.

---

# How it Works

```
Button
   │
partial()
   │
Pre-configure Props
   │
   ▼
New Component
```

---

# Component Flow

```
<Button />

        ▲

partial(Button)

        ▲

<LargeRedButton />
```

Instead of writing wrapper components manually, the helper creates them for us.

---

# Example

When you write:

```jsx
<LargeRedButton
    text="Save"
/>
```

React internally renders

```jsx
<Button
    size="large"
    color="crimson"
    text="Save"
/>
```

The predefined props are automatically included.

---

# Why `...partialProps` First?

```jsx
<Component
    {...partialProps}
    {...props}
/>
```

The order is important.

Example:

```jsx
const LargeRedButton =
    partial(Button, {
        color: "red",
    });

<LargeRedButton
    color="blue"
/>
```

React renders

```jsx
<Button
    color="red"
    color="blue"
/>
```

The **last prop wins**, so the final color is:

```
blue
```

This allows consumers to override defaults when needed.

If the order were reversed:

```jsx
<Component
    {...props}
    {...partialProps}
/>
```

the predefined props would always override user-provided props, making the component less flexible.

---

# Advantages

- Very little boilerplate.
- Reusable helper.
- Easy to generate many component variants.
- Functional programming style.
- Cleaner than manually writing wrapper components.

---

# Disadvantages

- Adds another abstraction.
- Can be confusing for beginners.
- Overuse may hide where props originate.
- Less common than simple wrapper components.

---

# Real-world Examples

Partial application can be useful for creating:

- Primary buttons
- Secondary buttons
- Danger buttons
- Large cards
- Small cards
- Read-only inputs
- Preconfigured dialogs

Example:

```jsx
const DangerButton =
    partial(Button, {
        color: "red",
    });

const PrimaryButton =
    partial(Button, {
        color: "blue",
    });

const SuccessButton =
    partial(Button, {
        color: "green",
    });
```

---

# Manual Composition vs Partial

### Manual

```jsx
const SmallButton = (
    props
) => (
    <Button
        {...props}
        size="small"
    />
);
```

---

### Partial

```jsx
const SmallButton =
    partial(Button, {
        size: "small",
    });
```

Both produce the same result, but partial application scales better when creating many component variants.

---

# Partial Application (Functional Programming)

In functional programming, **partial application** means fixing some arguments of a function and returning a new function that accepts the remaining arguments.

React components are simply functions.

Instead of:

```jsx
Button(props)
```

we create

```jsx
SmallButton(props)
```

where some props are already supplied.

---

# Interview Questions

### What is partial application?

A technique where some arguments are fixed in advance, producing a new function that requires fewer arguments.

---

### How is this applied in React?

By pre-configuring component props to create specialized versions of a base component.

---

### Why spread `partialProps` before `props`?

Because React applies props from left to right. Placing `props` last allows consumers to override the predefined defaults.

---

### Is this different from composition?

Not really.

Partial application is **implemented using composition**, but it automates the creation of wrapper components instead of writing them manually.

---

### Would you use this in production?

Sometimes. It's useful when creating many similar component variants, but for a few variations, simple wrapper components are often more readable.

---

# Best Practices

- Keep the base component generic.
- Use partial application for frequently reused configurations.
- Spread predefined props before user props to allow overrides.
- Avoid hiding too much configuration behind multiple layers of partial components.
- Prefer descriptive names for generated components.

---

# Comparison

| Wrapper Components | Partial Pattern |
|--------------------|-----------------|
| Manual | Generated |
| More boilerplate | Less boilerplate |
| Easy to understand | More abstract |
| Good for a few variants | Good for many variants |
| Uses composition | Uses composition + partial application |

---

# Key Takeaways

- **Partial Component Pattern** applies functional programming concepts to React.
- It creates specialized components by pre-filling some props of a base component.
- A reusable `partial()` helper eliminates repetitive wrapper components.
- The order of prop spreading determines whether defaults can be overridden.
- This pattern is especially useful when generating multiple predefined component variants while keeping the base component generic.
