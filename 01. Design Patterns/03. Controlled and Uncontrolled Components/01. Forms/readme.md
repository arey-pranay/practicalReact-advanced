# Controlled vs Uncontrolled Components

## What are they?

When working with forms in React, there are two ways to manage input values:

- **Controlled Components** – React state is the single source of truth.
- **Uncontrolled Components** – The DOM manages the input state, and React accesses values using refs.

---

## Why is this important?

Understanding these two approaches helps you choose the right strategy based on your application's requirements.

- Controlled forms are ideal for dynamic validation and complex form logic.
- Uncontrolled forms are simpler and often more performant for basic forms.

---

## Folder Structure

```
Controlled vs Uncontrolled
│── App.jsx
│── components/
│     ├── controlled-form.jsx
│     └── uncontrolled-form.jsx
```

---

# Controlled Components

## Implementation

```jsx
const [name, setName] = useState("");
const [age, setAge] = useState("");

<input
    value={name}
    onChange={(e) => setName(e.target.value)}
/>
```

---

## How it Works

1. User types into the input.
2. `onChange` fires.
3. React updates the state.
4. State changes trigger a re-render.
5. The updated state is passed back to the input through `value`.

Flow:

```
User Input
     │
     ▼
 onChange()
     │
     ▼
 React State
     │
     ▼
 Component Re-render
     │
     ▼
 Updated Input Value
```

---

## Validation Example

Since React owns the state, validation becomes straightforward.

```jsx
useEffect(() => {
    if (name.length < 1) {
        setError("The name cannot be empty");
    } else {
        setError("");
    }
}, [name]);
```

The UI updates automatically whenever the state changes.

---

## Advantages

- Single source of truth.
- Easy validation.
- Conditional rendering.
- Instant error messages.
- Easy form serialization.
- Better integration with React.

---

## Disadvantages

- Re-renders on every keystroke.
- More boilerplate.
- Can impact performance in very large forms.

---

# Uncontrolled Components

## Implementation

```jsx
const nameRef = React.createRef();

<input ref={nameRef} />
```

```jsx
const handleSubmit = () => {
    console.log(nameRef.current.value);
};
```

---

## How it Works

1. User types into the input.
2. The browser stores the value.
3. React does **not** update state.
4. On submit, React reads the value from the DOM using a ref.

Flow:

```
User Input
     │
     ▼
 Browser DOM
     │
     ▼
   Ref
     │
     ▼
Submit Handler
```

---

## Advantages

- Less code.
- No re-render on every keystroke.
- Better performance for simple forms.
- Easy integration with non-React libraries.

---

## Disadvantages

- Harder to validate while typing.
- React doesn't know the current input value.
- More difficult to implement dynamic UI.
- Less predictable than controlled components.

---

# Controlled vs Uncontrolled

| Feature | Controlled | Uncontrolled |
|---------|------------|--------------|
| Data stored in | React State | DOM |
| Uses `useState` | ✅ | ❌ |
| Uses `ref` | ❌ | ✅ |
| Re-renders on typing | ✅ | ❌ |
| Easy validation | ✅ | ❌ |
| Live form updates | ✅ | ❌ |
| Less boilerplate | ❌ | ✅ |
| Recommended for complex forms | ✅ | ❌ |

---

# When to Use Which?

### Use Controlled Components when:

- Form validation is required.
- Showing live previews.
- Enabling/disabling buttons dynamically.
- Managing complex forms.
- Integrating with libraries like Formik or React Hook Form (internally, many concepts are based on controlled state).

---

### Use Uncontrolled Components when:

- Building simple forms.
- Working with file inputs.
- Integrating with third-party DOM libraries.
- Performance is more important than real-time updates.
- You only need the values on form submission.

---

# Real-world Examples

### Controlled

- Login forms
- Signup forms
- Checkout forms
- Search bars
- Multi-step forms

### Uncontrolled

- File upload inputs
- Simple contact forms
- Embedded widgets
- Legacy HTML forms
- Third-party integrations

---

# Interview Questions

### What is a Controlled Component?

A controlled component is an input whose value is managed entirely by React state.

---

### What is an Uncontrolled Component?

An uncontrolled component stores its value in the DOM, and React accesses it using refs when needed.

---

### Why are controlled components more common?

Because they make validation, conditional rendering, form state management, and synchronization much easier.

---

### Why use refs in uncontrolled components?

Refs provide direct access to the underlying DOM element without storing the value in React state.

---

### Which approach is recommended?

For most React applications, **controlled components** are preferred because they align with React's declarative data flow. Uncontrolled components are useful in specific scenarios like file inputs or simple forms.

---

# Best Practices

- Prefer controlled components for interactive and complex forms.
- Use uncontrolled components for simple or performance-sensitive cases.
- Avoid mixing controlled and uncontrolled approaches for the same input.
- Handle form submission with `preventDefault()`.
- Consider libraries like **React Hook Form** for large forms, as they combine the benefits of both approaches.

---

# Key Takeaways

- **Controlled Components** use React state as the source of truth.
- **Uncontrolled Components** rely on the DOM and refs.
- Controlled components provide better validation and predictability.
- Uncontrolled components are simpler and avoid unnecessary re-renders.
- Choosing between them depends on the complexity and requirements of your form.
