# Custom Hooks for Data Fetching

## What is it?

This example demonstrates how **Custom Hooks** allow you to extract reusable stateful logic from components.

Instead of using:

- Higher-Order Components (HOCs)
- Render Props
- Resource Loader components

the data-fetching logic is moved into reusable hooks.

This is the **modern React approach** for sharing logic.

---

## Why use Custom Hooks?

- Eliminate duplicated logic.
- Keep components focused on rendering.
- Reuse stateful behavior.
- Easier to test.
- No wrapper components.
- Cleaner JSX.

---

## Folder Structure

```
Custom Hooks
│── App.jsx
│── hooks/
│     ├── data-source.hook.js
│     └── resource.hook.js
│── components/
│     ├── user-info.jsx
│     └── book-info.jsx
```

---

# Generic Hook — `useDataSource`

## Implementation

```jsx
const resource = useDataSource(getData);
```

The hook accepts **any function** that returns data.

```jsx
const data = await getData();
```

The hook doesn't know where the data comes from.

It could be:

- API
- Local Storage
- IndexedDB
- Firebase
- Cookies
- GraphQL
- File System

---

## Implementation

```jsx
export const useDataSource = (getData) => {
    const [resource, setResource] =
        useState(null);

    useEffect(() => {
        (async () => {
            const data = await getData();
            setResource(data);
        })();
    }, [getData]);

    return resource;
};
```

---

## Example

### Server

```jsx
const user =
    useDataSource(fetchUser);
```

---

### Local Storage

```jsx
const message =
    useDataSource(
        getFromLocalStorage("msg")
    );
```

The same hook works for completely different data sources.

---

# Specialized Hook — `useResource`

Sometimes a generic hook is more flexible than necessary.

If your application frequently fetches REST resources, you can build a more specialized hook.

```jsx
const book =
    useResource("/books/2");
```

Internally it simply performs:

```
GET Resource

↓

Return Resource
```

without requiring a callback.

---

## Implementation

```jsx
export const useResource = (
    resourceUrl
) => {
    const [resource, setResource] =
        useState(null);

    useEffect(() => {
        (async () => {
            const response =
                await axios.get(resourceUrl);

            setResource(response.data);
        })();
    }, [resourceUrl]);

    return resource;
};
```

---

# Why `useCallback`?

In `UserInfo`:

```jsx
const fetchUser =
    useCallback(
        fetchFromServer(
            `/users/${userId}`
        ),
        [userId]
    );
```

Without `useCallback`:

```
Render

↓

New Function

↓

Dependency Changed

↓

useEffect Runs Again

↓

Fetch Again
```

Every render would create a new function reference, causing `useDataSource` to refetch unnecessarily.

`useCallback` memoizes the function so the effect only reruns when `userId` changes.

---

# Data Flow

```
Component
     │
     ▼
Custom Hook
     │
Fetch Data
     │
Store State
     │
Return Resource
     │
     ▼
Component UI
```

---

# Generic vs Specialized Hook

## Generic

```jsx
useDataSource(getData)
```

Works with anything.

---

## Specialized

```jsx
useResource("/users/1")
```

Works specifically with REST endpoints.

---

# Comparison

| Hook | Input | Use Case |
|------|-------|----------|
| `useDataSource` | Function | Any data source |
| `useResource` | URL | REST APIs |

---

# Advantages

- No wrapper components.
- Cleaner JSX.
- Easier to compose.
- Easy testing.
- Reusable.
- Preferred modern React pattern.

---

# Disadvantages

- Still needs loading/error handling.
- Every hook manages its own cache.
- Doesn't support retries.
- Doesn't deduplicate requests.
- Better libraries exist for complex applications.

---

# Real-world Examples

Custom hooks are commonly used for:

```
useUser()

useAuth()

useProducts()

useOrders()

useCart()

useTheme()

useWindowSize()

useDarkMode()

useDebounce()

useLocalStorage()

useOnlineStatus()
```

---

# Custom Hook vs HOC

| Custom Hook | HOC |
|--------------|-----|
| Shares logic | Wraps components |
| No extra JSX | Creates wrapper components |
| Returns values/functions | Injects props |
| Easier debugging | Wrapper nesting |
| Modern React | Older React pattern |

---

# Custom Hook vs Render Props

| Custom Hook | Render Props |
|--------------|--------------|
| Direct function call | Uses render callback |
| Cleaner JSX | Nested callbacks |
| Easier composition | Less common today |

---

# Interview Questions

### What is a Custom Hook?

A JavaScript function whose name starts with `use` and that uses other React hooks to encapsulate reusable stateful logic.

---

### Why use a Custom Hook?

To reuse stateful logic across multiple components without duplicating code or introducing wrapper components.

---

### Why does `useDataSource` accept a function instead of a URL?

Accepting a function makes it completely generic—it can retrieve data from any source, not just HTTP endpoints.

---

### Why create `useResource` if `useDataSource` already exists?

`useResource` is a convenience wrapper specialized for REST APIs. It simplifies the API when fetching from URLs is the common use case.

---

### Why use `useCallback` here?

Because `useEffect` depends on `getData`. Without `useCallback`, a new function would be created on every render, causing unnecessary refetches.

---

### How would this be implemented in production?

Most production React applications use libraries such as:

- TanStack Query (React Query)
- SWR
- RTK Query

These libraries provide:

- caching
- background refetching
- retries
- request deduplication
- optimistic updates
- loading and error management

---

# Best Practices

- Keep hooks focused on a single responsibility.
- Return only the data and actions the component needs.
- Memoize callback dependencies when passing functions into hooks.
- Handle loading and error states.
- Prefer specialized hooks (`useUser`, `useBook`) when they improve readability.

---

# Evolution of React Patterns

As React evolved, different patterns emerged for sharing logic:

```
Mixins (Deprecated)

↓

Higher-Order Components

↓

Render Props

↓

Custom Hooks (Current Standard)
```

Custom Hooks solve many of the problems introduced by HOCs and Render Props while keeping components simple and composable.

---

# Key Takeaways

- **Custom Hooks** are the modern solution for sharing stateful logic in React.
- `useDataSource` demonstrates a highly generic hook that can retrieve data from any source.
- `useResource` is a specialized hook built on the same idea for REST APIs.
- Hooks eliminate the need for wrapper components and render callbacks, resulting in cleaner, more maintainable code.
- Understanding HOCs and Render Props is valuable for legacy codebases, but new React applications should generally prefer **Custom Hooks** for reusable logic.
