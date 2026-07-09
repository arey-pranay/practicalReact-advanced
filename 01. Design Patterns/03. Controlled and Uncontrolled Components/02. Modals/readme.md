# Controlled vs Uncontrolled Modal

## What are they?

A modal can be implemented in two different ways:

- **Controlled Modal** – The parent component controls whether the modal is open.
- **Uncontrolled Modal** – The modal manages its own open/close state internally.

---

# Controlled Modal

## Implementation

```jsx
<ControlledModal
    shouldShow={isOpen}
    close={() => setIsOpen(false)}
>
    <Profile />
</ControlledModal>
```

The parent owns the state.

```jsx
const [isOpen, setIsOpen] = useState(false);
```

Whenever `isOpen` changes, the modal appears or disappears.

---

## Flow

```
Parent
   │
   ▼
isOpen State
   │
   ▼
ControlledModal
   │
   ▼
Render / Hide
```

---

## Advantages

- Parent always knows modal state.
- Easy to open from anywhere.
- Can synchronize multiple components.
- Ideal for routing and global state.
- Better for complex applications.

---

## Disadvantages

- More props (`shouldShow`, `close`).
- Parent manages additional state.

---

# Uncontrolled Modal

## Implementation

```jsx
export const UncontrolledModal = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsOpen(true)}>
                Show Modal
            </button>

            {isOpen && (
                <Modal>
                    {children}
                </Modal>
            )}
        </>
    );
};
```

The modal owns its own visibility.

---

## Flow

```
User Click
     │
     ▼
Modal State
     │
     ▼
Render / Hide
```

---

## Advantages

- Very simple API.
- Parent doesn't manage modal state.
- Less boilerplate.
- Great for reusable dialogs.

---

## Disadvantages

- Parent cannot know if the modal is open.
- Harder to close from outside.
- Difficult to coordinate multiple components.
- Less flexible for complex applications.

---

# Comparison

| Feature | Controlled | Uncontrolled |
|---------|------------|--------------|
| State Owner | Parent | Modal |
| Parent knows open state | ✅ | ❌ |
| Easy external control | ✅ | ❌ |
| Simple API | ❌ | ✅ |
| Best for reusable apps | ✅ | ⚠️ |
| Good for simple dialogs | ⚠️ | ✅ |

---

# When to Use

### Use Controlled Modal when

- Confirmation dialogs
- Login modals
- Shopping cart
- Settings
- Multi-step workflows
- Route-driven modals

---

### Use Uncontrolled Modal when

- Tooltips
- Help dialogs
- Demo components
- Simple popups
- Small reusable UI components

---

# Interview Questions

### Why is this called a Controlled Modal?

Because the parent controls its visibility by passing state through props.

---

### Why is this called an Uncontrolled Modal?

Because the modal manages its own visibility internally using `useState`.

---

### Which approach is more common?

Controlled modals are much more common in production applications because they provide better coordination and predictability.

---

### Can an uncontrolled modal be closed from the parent?

Not easily. Since the parent doesn't own the state, you'd need refs, imperative handles, or additional APIs to control it externally.

---

# Best Practices

- Prefer controlled modals for production applications.
- Use uncontrolled modals for simple, self-contained components.
- Always close the modal when clicking the backdrop or pressing **Escape**.
- Stop event propagation inside the modal content to prevent accidental closing.
- Consider rendering modals using **React Portals** to avoid z-index and overflow issues.

---

# Key Takeaways

- **Controlled Modal** → Parent owns the state.
- **Uncontrolled Modal** → Modal owns the state.
- Controlled components provide greater flexibility and coordination.
- Uncontrolled components are simpler but less configurable.
- Most UI libraries (Material UI, Chakra UI, Ant Design, Radix UI) primarily expose controlled modal APIs while often supporting uncontrolled usage as a convenience.
