# Recursive Components

## What is a Recursive Component?

A **Recursive Component** is a React component that renders **itself** until it reaches a base condition.

Just like a recursive function calls itself to solve a smaller version of a problem, a recursive component renders itself for nested UI structures.

It is ideal for displaying **hierarchical or tree-like data**.

---

## Why use Recursive Components?

- Display nested objects.
- Render tree structures.
- Handle data with unknown depth.
- Eliminate repetitive nested loops.
- Keep code simple and scalable.

---

## Folder Structure

```
Recursive Components
│── App.jsx
│── components/
│     └── recursive.jsx
```

---

## Example Data

```jsx
const myNestedObject = {
    key1: "value1",
    key2: {
        innerKey1: "innerValue1",
        innerKey2: {
            innerInnerKey1: "innerInnerValue1",
            innerInnerKey2: "innerInnerValue2",
        },
    },
    key3: "value3",
};
```

---

## Usage

```jsx
<Recursive data={myNestedObject} />
```

---

## Implementation

```jsx
export const Recursive = ({ data }) => {
    if (!isValidObj(data)) {
        return <li>{data}</li>;
    }

    const pairs = Object.entries(data);

    return (
        <>
            {pairs.map(([key, value]) => (
                <li>
                    {key}
                    <ul>
                        <Recursive data={value} />
                    </ul>
                </li>
            ))}
        </>
    );
};
```

---

# How it Works

The component checks whether the current value is an object.

If it is:

```
Render children
↓

Call Recursive again
```

Otherwise:

```
Render value
↓

Stop recursion
```

---

# Base Case

Every recursive component needs a stopping condition.

```jsx
if (!isValidObj(data)) {
    return <li>{data}</li>;
}
```

Without this base case:

```
Recursive()

↓

Recursive()

↓

Recursive()

↓

Infinite recursion
```

resulting in a stack overflow.

---

# Recursive Flow

```
Root Object
      │
      ▼
key1
      │
value1 ✔

key2
      │
      ▼
innerKey1
      │
innerValue1 ✔

innerKey2
      │
      ▼
innerInnerKey1

...
```

Each nested object triggers another render of the same component.

---

# Output Structure

```
key1
 └── value1

key2
 ├── innerKey1
 │     └── innerValue1
 │
 └── innerKey2
       ├── innerInnerKey1
       │      └── innerInnerValue1
       │
       └── innerInnerKey2
              └── innerInnerValue2

key3
 └── value3
```

---

# Why `Object.entries()`?

```jsx
Object.entries(data)
```

Converts

```jsx
{
    a: 1,
    b: 2
}
```

into

```jsx
[
    ["a", 1],
    ["b", 2]
]
```

making it easy to iterate over keys and values.

---

# Advantages

- Elegant solution for nested data.
- Supports arbitrary depth.
- Eliminates deeply nested loops.
- Highly reusable.
- Mirrors recursive algorithms.

---

# Disadvantages

- Requires a proper base case.
- Deep recursion can impact performance.
- Harder to debug than iterative code.
- Large trees may require virtualization.

---

# Real-world Examples

Recursive components are commonly used for:

- File explorers
- Folder trees
- JSON viewers
- Comment threads
- Reddit discussions
- Organization charts
- Navigation menus
- Category trees
- AST (Abstract Syntax Tree) viewers

---

# Example: Folder Structure

```
Documents
│
├── Work
│     ├── Resume.pdf
│     └── Notes.txt
│
├── Personal
│     ├── Photos
│     └── Videos
│
└── Music
```

Each folder contains more folders.

A recursive component renders this naturally.

---

# Recursive vs Iterative Rendering

### Recursive

```jsx
<Tree node={node} />
```

Works for any depth.

---

### Iterative

```jsx
data.map(...)

data.children.map(...)

data.children.children.map(...)
```

Only works for a known number of levels.

---

# Interview Questions

### What is a Recursive Component?

A component that renders itself to display nested or hierarchical data until a base condition is reached.

---

### Why do we need a base case?

Without a stopping condition, the component would keep rendering itself indefinitely, causing infinite recursion and eventually a stack overflow.

---

### Why use recursion instead of loops?

Loops only work well when the nesting depth is known. Recursion naturally handles data structures with unknown or arbitrary depth.

---

### Why use `Object.entries()`?

It converts an object into an iterable array of key-value pairs, making it easy to recursively process each property.

---

### What types of data are best suited for recursion?

- Trees
- Nested objects
- Nested arrays
- Graph-like hierarchies (with cycle protection)
- File systems
- Menus
- Comments

---

# Possible Improvements

### Add React Keys

The current implementation should include a `key` prop.

```jsx
pairs.map(([key, value]) => (
    <li key={key}>
        ...
    </li>
));
```

---

### Handle Arrays Separately

Currently arrays are treated as objects.

A production implementation often checks:

```jsx
Array.isArray(data)
```

to render list items more appropriately.

---

### Detect Circular References

Objects that reference themselves can cause infinite recursion.

Example:

```jsx
const obj = {};

obj.self = obj;
```

Production JSON viewers typically track visited objects to avoid this issue.

---

### Expand/Collapse Nodes

Large trees become easier to navigate by allowing users to expand or collapse nested sections.

---

# Best Practices

- Always define a clear base case.
- Add `key` props when rendering lists.
- Handle arrays and objects appropriately.
- Consider lazy rendering or virtualization for very large trees.
- Keep recursive components focused on rendering a single level of the hierarchy.

---

# Key Takeaways

- **Recursive Components** render themselves to display nested data structures.
- They are the most natural solution for trees and hierarchical data.
- A base case is essential to prevent infinite recursion.
- They eliminate repetitive nested loops and support data of arbitrary depth.
- Recursive components are widely used in file explorers, JSON viewers, nested comments, menus, and many other tree-based UIs.
