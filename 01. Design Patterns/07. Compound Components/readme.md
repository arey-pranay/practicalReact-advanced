# Compound Components Pattern

## What is it?

The **Compound Components Pattern** is a React design pattern where multiple related components work together under a common parent.

Instead of passing numerous configuration props, the parent component exposes child components as static properties, allowing consumers to compose the UI naturally.

This pattern is commonly combined with the **Context API** so child components can share state without prop drilling.

---

## Why use Compound Components?

- Create flexible APIs.
- Avoid prop drilling.
- Let consumers control layout.
- Improve readability.
- Group related components together.
- Similar to how HTML elements naturally compose.

---

## Folder Structure

```
Compound Components
│── App.jsx
│── components/
│     └── card.jsx
```

---

# Usage

```jsx
<Card test="Value">
    <Card.Header>
        ...
    </Card.Header>

    <Card.Body>
        ...
    </Card.Body>

    <Card.Footer>
        ...
    </Card.Footer>
</Card>
```

Instead of configuring everything through props like:

```jsx
<Card
    title="Header"
    body="..."
    footer={<Buttons />}
/>
```

the consumer decides how the pieces are arranged.

---

# Implementation

The parent component exposes its children as static properties.

```jsx
Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;
```

This creates an intuitive API:

```jsx
<Card.Header />

<Card.Body />

<Card.Footer />
```

---

# How it Works

```
Card
 │
 ├── Header
 ├── Body
 └── Footer
```

All subcomponents belong to the same parent component.

---

# Context API

The parent provides shared data.

```jsx
<Context.Provider
    value={{ test }}
>
    {children}
</Context.Provider>
```

Any child component can access it.

```jsx
const { test } =
    useContext(Context);
```

without receiving it as a prop.

---

# Data Flow

```
<Card test="Value">

        │

Context Provider

        │

───────────────

│      │      │

▼      ▼      ▼

Header Body Footer
```

Every compound component can consume the shared context.

---

# Why Context?

Without Context:

```
Card

↓

Header(test)

↓

Body(test)

↓

Footer(test)
```

Props would need to be forwarded manually.

With Context:

```
Card

↓

Provider

↓

Header
```

The data is available wherever it's needed.

---

# Component Responsibilities

### Card

- Owns the shared state.
- Provides context.
- Renders children.

---

### Header

- Reads shared context.
- Displays header content.

---

### Body

- Displays body content.

---

### Footer

- Displays footer actions.

---

# Advantages

- Clean, expressive API.
- No prop drilling.
- Highly flexible layouts.
- Components remain reusable.
- Easy to extend with new sections.

---

# Disadvantages

- Slightly more complex implementation.
- Requires Context for shared state.
- Child components are usually intended to be used within the parent.
- Can be overkill for simple components.

---

# Real-world Examples

Many popular libraries use compound components.

Examples include:

```jsx
<Tabs>
    <Tabs.List />
    <Tabs.Trigger />
    <Tabs.Content />
</Tabs>
```

```jsx
<Accordion>
    <Accordion.Item />
    <Accordion.Trigger />
    <Accordion.Content />
</Accordion>
```

```jsx
<Select>
    <Select.Trigger />
    <Select.Content />
    <Select.Item />
</Select>
```

This API is common in libraries like **Radix UI**, **Reach UI**, and **Headless UI**.

---

# Compound Components vs Props

### Props API

```jsx
<Card
    title="Hello"
    footer={<Buttons />}
/>
```

Rigid structure.

---

### Compound Components

```jsx
<Card>
    <Card.Header />
    <Card.Body />
    <Card.Footer />
</Card>
```

Flexible structure.

Consumers decide the layout.

---

# Compound Components vs Children

Every compound component uses `children`, but not every component that accepts `children` is a compound component.

Example:

```jsx
<Card>
    ...
</Card>
```

is simply composition.

Compound components additionally expose related subcomponents:

```jsx
<Card.Header />
<Card.Body />
<Card.Footer />
```

that work together as one cohesive component.

---

# Interview Questions

### What are Compound Components?

A pattern where related components work together under a common parent, often sharing state through Context while allowing consumers to freely compose the UI.

---

### Why use Context?

To share state between the parent and child components without passing props through every intermediate component.

---

### Why expose static properties?

```jsx
Card.Header = Header;
```

This groups related components under a single namespace, making the API more discoverable and expressive.

---

### What are the advantages over passing props?

Compound components provide greater flexibility. Consumers choose the structure and order of the UI instead of being restricted to a fixed component layout.

---

### When should you use Compound Components?

When a component has multiple related parts that should work together, such as tabs, accordions, menus, dialogs, selects, cards, or forms.

---

# Possible Improvements

### Validate Children

Ensure only valid compound components are used inside `Card`.

---

### Separate Context

Move the context into its own file for larger components.

---

### Add More Shared State

The context could also expose:

- theme
- collapsed state
- selected item
- actions

making the component more interactive.

---

### Memoize Context Value

Currently:

```jsx
<Context.Provider
    value={{ test }}
>
```

creates a new object every render.

Using:

```jsx
const value = useMemo(
    () => ({ test }),
    [test]
);
```

avoids unnecessary re-renders of context consumers.

---

# Best Practices

- Keep compound components focused on one feature.
- Use Context to share only the required state.
- Export subcomponents as static properties.
- Keep the public API intuitive.
- Document which child components belong to the parent.

---

# Key Takeaways

- **Compound Components** allow multiple related components to work together through a shared parent.
- The parent typically manages state and shares it via **Context**, eliminating prop drilling.
- Exposing subcomponents as static properties (`Card.Header`, `Card.Body`, `Card.Footer`) creates a clean and discoverable API.
- This pattern offers far more flexibility than large prop-based APIs and is widely used in modern component libraries like Radix UI and Headless UI.
- Compound Components are one of the most important advanced React patterns for building reusable, scalable UI components.
