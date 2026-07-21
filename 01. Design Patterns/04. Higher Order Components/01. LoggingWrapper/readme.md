# Higher-Order Components (HOC)

## What is a Higher-Order Component?

A **Higher-Order Component (HOC)** is a function that takes a component as input and returns a new component with additional functionality.

It **doesn't modify the original component**. Instead, it wraps it and enhances its behavior.

```jsx
const EnhancedComponent = higherOrderComponent(Component);
```

Think of it as a decorator for React components.

---

## Why use HOCs?

HOCs help you reuse component logic without duplicating code.

Common use cases include:

- Authentication
- Authorization
- Logging
- Analytics
- Permissions
- Data fetching
- Error boundaries
- Feature flags

---

## Folder Structure

```
Higher Order Components
│── App.jsx
│── components/
│     ├── check-props.jsx
│     └── user-info.jsx
```

---

## Usage

```jsx
const UserInfoWrapper = checkProps(UserInfo);

<UserInfoWrapper
    propA="test1"
    blabla={{ a: 1 }}
/>
```

---

## Implementation

```jsx
export const checkProps = (Component) => {
    return (props) => {
        console.log(props);

        return <Component {...props} />;
    };
};
```

The HOC wraps `UserInfo` and logs every prop before rendering it.

---

## How it Works

```
UserInfo
    │
    ▼
checkProps()
    │
Returns New Component
    │
    ▼
<UserInfoWrapper />
    │
Logs Props
    │
Renders UserInfo
```

---

## Step-by-Step

### Original Component

```jsx
<UserInfo />
```

---

### Wrap it

```jsx
const UserInfoWrapper =
    checkProps(UserInfo);
```

---

### Render

```jsx
<UserInfoWrapper />
```

Internally React executes

```jsx
checkProps(UserInfo)(props)
```

which becomes

```jsx
console.log(props);

return <UserInfo {...props} />;
```

---

## Why spread props?

```jsx
<Component {...props} />
```

Without spreading the props, the wrapped component would never receive them.

The HOC can also:

- modify props
- inject new props
- remove props
- validate props

before forwarding them.

---

## Advantages

- Reusable logic.
- Doesn't modify original components.
- Easy to compose.
- Keeps concerns separated.
- Can wrap any React component.

---

## Disadvantages

- Can create deeply nested wrappers ("wrapper hell").
- Makes debugging React DevTools harder.
- Prop collisions can occur.
- Modern React often prefers custom hooks.

---

# Real-world Examples

### Authentication

```jsx
withAuth(ProfilePage)
```

Redirects users if they aren't logged in.

---

### Permissions

```jsx
withRole(AdminPanel)
```

Only renders for administrators.

---

### Analytics

```jsx
withTracking(Button)
```

Logs every button click.

---

### Loading States

```jsx
withLoading(ProductList)
```

Displays a spinner while data is loading.

---

### Error Handling

```jsx
withErrorBoundary(App)
```

Catches rendering errors and displays a fallback UI.

---

# Common HOC Naming Convention

Most HOCs start with **with**.

```jsx
withAuth()

withTheme()

withRouter()

withLoading()

withPermissions()

withTracking()

withErrorBoundary()
```

This makes their purpose immediately recognizable.

---

# HOC vs Custom Hook

| Higher-Order Component | Custom Hook |
|-------------------------|-------------|
| Wraps a component | Shares logic between components |
| Returns a new component | Returns state/functions |
| Uses composition | Uses hooks |
| Can inject props | Doesn't render UI |
| Older React pattern | Modern React pattern |

---

## Example

### HOC

```jsx
const Enhanced =
    withLoading(UserInfo);
```

---

### Hook

```jsx
const user = useUser();
```

Both solve code reuse but in different ways.

---

# Interview Questions

### What is a Higher-Order Component?

A function that accepts a component and returns a new enhanced component.

---

### Does an HOC modify the original component?

No.

It wraps the component and returns a new one.

---

### Why are HOCs called "Higher-Order"?

Because they are higher-order **functions**—functions that accept other functions (or components, which are functions) and return new functions/components.

---

### Why use prop spreading?

```jsx
<Component {...props} />
```

To forward all received props to the wrapped component.

---

### Are HOCs still used today?

Yes, but less frequently.

Modern React usually favors:

- Custom Hooks
- Context API
- Composition

However, many popular libraries still expose HOCs for compatibility (e.g., Redux's older `connect`, React Router's older `withRouter`).

---

# Best Practices

- Prefix HOCs with `with`.
- Never mutate the wrapped component.
- Forward all unrelated props.
- Avoid deeply nesting multiple HOCs.
- Set a helpful `displayName` for easier debugging:

```jsx
Wrapped.displayName = `withAuth(${Component.displayName || Component.name})`;
```

---

# Key Takeaways

- A **Higher-Order Component (HOC)** is a function that enhances another component.
- It accepts a component and returns a new component.
- HOCs are excellent for sharing cross-cutting concerns like authentication, logging, and permissions.
- They rely on composition instead of inheritance.
- While custom hooks are the preferred modern approach for sharing logic, understanding HOCs is important because they remain common in legacy codebases and some React libraries.
