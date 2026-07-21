# Higher-Order Components (Data Injection)

## What is it?

This pattern extends the concept of **Higher-Order Components (HOCs)** by using an HOC to **fetch data and inject it into a wrapped component**.

Instead of making every component responsible for loading its own data, the HOC handles the fetching and passes the result as a prop.

The wrapped component becomes a **pure presentational component**.

---

## Why use it?

- Reuse data-fetching logic.
- Keep UI components focused on rendering.
- Separate business logic from presentation.
- Improve maintainability.
- Follow the principle of composition.

---

## Folder Structure

```
Higher Order Components
│── App.jsx
│── components/
│     ├── include-user.jsx
│     └── user-info.jsx
```

---

## Usage

```jsx
const UserInfoWithUser =
    includeUser(UserInfo, "2");

<UserInfoWithUser />
```

The wrapped component automatically receives:

```jsx
<UserInfo user={user} />
```

without the parent needing to fetch anything.

---

## Implementation

```jsx
export const includeUser = (
    Component,
    userId
) => {
    return (props) => {
        const [user, setUser] = useState(null);

        useEffect(() => {
            (async () => {
                const response = await axios.get(
                    `/users/${userId}`
                );

                setUser(response.data);
            })();
        }, []);

        return (
            <Component
                {...props}
                user={user}
            />
        );
    };
};
```

---

## How it Works

```
UserInfo
    │
    ▼
includeUser(UserInfo, "2")
    │
Returns New Component
    │
Fetch User
    │
Inject user Prop
    │
    ▼
<UserInfo user={user} />
```

---

## Step-by-Step

### Wrap the component

```jsx
const UserInfoWithUser =
    includeUser(UserInfo, "2");
```

---

### HOC fetches the user

```jsx
axios.get("/users/2");
```

---

### Store in state

```jsx
setUser(response.data);
```

---

### Inject prop

```jsx
<Component
    {...props}
    user={user}
/>
```

The wrapped component doesn't know where the data came from.

---

# Data Injection

The HOC adds an additional prop.

Before wrapping:

```jsx
<UserInfo />
```

After wrapping:

```jsx
<UserInfo user={user} />
```

The parent never has to worry about fetching data.

---

# Advantages

- Removes duplicate fetching logic.
- Keeps UI components reusable.
- Separation of concerns.
- Easy to reuse with different components.
- Easy to compose with other HOCs.

---

# Disadvantages

- Adds another wrapper component.
- Can lead to nested HOCs.
- Harder to debug.
- No loading/error handling in this example.
- Custom hooks are usually preferred today.

---

# ⚠️ Important Note

Your current implementation has a bug.

```jsx
useEffect(() => {
    ...
});
```

Since there is **no dependency array**, the effect runs after **every render**.

Flow:

```
Render
   │
Fetch
   │
setUser()
   │
Render
   │
Fetch Again
   │
setUser()
```

This creates an infinite fetch loop.

It should be:

```jsx
useEffect(() => {
    (async () => {
        const response = await axios.get(
            `/users/${userId}`
        );

        setUser(response.data);
    })();
}, []);
```

or

```jsx
}, [userId]);
```

if the user ID can change.

---

# Real-world Examples

### Authentication

```jsx
withCurrentUser(Profile)
```

---

### Products

```jsx
withProduct(ProductPage)
```

---

### Orders

```jsx
withOrder(OrderSummary)
```

---

### Feature Flags

```jsx
withFeatureFlags(App)
```

---

### Theme Injection

```jsx
withTheme(Button)
```

---

# HOC vs Resource Loader

| Resource Loader | Data Injection HOC |
|-----------------|-------------------|
| Wraps JSX | Wraps Components |
| Uses `children` | Uses HOCs |
| Fetches once per instance | Fetches inside the HOC |
| Parent renders loader | Parent renders enhanced component |

---

# HOC vs Render Props

| HOC | Render Props |
|------|--------------|
| Returns a new component | Uses a render function |
| Injects props automatically | Parent decides rendering |
| Cleaner JSX | More flexible |
| Can compose multiple HOCs | Can become nested |

---

# HOC vs Custom Hook

### HOC

```jsx
const Enhanced =
    includeUser(UserInfo, "2");
```

---

### Custom Hook

```jsx
const user = useUser("2");

<UserInfo user={user} />
```

Modern React generally prefers the hook approach because it's simpler, easier to compose, and avoids creating additional wrapper components.

---

# Interview Questions

### What does this HOC do?

It fetches a user and injects it into the wrapped component as a `user` prop.

---

### Why use an HOC instead of fetching inside `UserInfo`?

It separates data fetching from presentation, allowing `UserInfo` to remain a reusable, presentational component.

---

### Why spread props?

```jsx
<Component
    {...props}
    user={user}
/>
```

This forwards any existing props while adding the new `user` prop.

---

### What's wrong with the current implementation?

The `useEffect` is missing a dependency array, causing the API request to run after every render and resulting in repeated fetching.

---

### How would you implement this today?

Most React applications would use:

- Custom Hooks
- React Query (TanStack Query)
- SWR
- RTK Query

instead of a data-fetching HOC.

---

# Best Practices

- Always include the correct dependency array in `useEffect`.
- Handle loading and error states.
- Keep the wrapped component presentational.
- Forward all unrelated props.
- Prefer custom hooks for new React codebases.

---

# Key Takeaways

- A **Data Injection HOC** enhances a component by fetching data and injecting it as props.
- It separates business logic from UI rendering.
- The wrapped component remains unaware of where its data comes from.
- This pattern was widely used before hooks and is still common in legacy React applications.
- In modern React, **custom hooks** are generally the preferred solution for sharing data-fetching logic.
