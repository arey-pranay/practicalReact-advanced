# Data Source with Render Props Pattern

## What is it?

The **Data Source with Render Props Pattern** is a React pattern where a component is responsible for **fetching data**, while the parent decides **how that data should be rendered** using a render function.

Instead of passing child components and injecting props with `cloneElement()`, the component calls a function (`render`) and passes the fetched data to it.

---

## Why use it?

- Separates data fetching from UI rendering.
- Makes components highly reusable.
- Gives complete control over rendering to the parent.
- Avoids using `React.cloneElement()`.
- Follows the Render Props pattern.

---

## Folder Structure

```
Data Source with Render Props
│── App.jsx
│── components/
│     ├── data-source-with-render-props.jsx
│     └── user-info.jsx
```

---

## Usage

```jsx
<DataSourceWithRenderProps
    getData={() => fetchData("/users/1")}
    render={(resource) => (
        <UserInfo user={resource} />
    )}
/>
```

---

## Implementation

```jsx
export const DataSourceWithRenderProps = ({
    getData,
    render,
}) => {
    const [resource, setResource] = useState(null);

    useEffect(() => {
        (async () => {
            const data = await getData();
            setResource(data);
        })();
    }, [getData]);

    return render(resource);
};
```

---

## How it Works

1. Parent provides a function to fetch data (`getData`).
2. The component executes that function.
3. The fetched data is stored in state.
4. Instead of rendering children, it calls the `render` function.
5. The parent receives the data and decides what UI to render.

Flow:

```
Parent
   │
   ├── getData()
   └── render(resource)
          ▲
          │
DataSourceWithRenderProps
          │
     Fetch Data
          │
     Store in State
          │
 Call render(resource)
```

---

## Props

| Prop | Type | Description |
|------|------|-------------|
| `getData` | `() => Promise<any>` | Function that fetches and returns data |
| `render` | `(data) => ReactNode` | Function responsible for rendering the UI |

---

## Why pass `getData` as a function?

Instead of hardcoding an API request, the component receives a function.

```jsx
getData={() => fetchData("/users/1")}
```

This makes it reusable for:

- Users
- Products
- Books
- Orders
- Posts

or even data from local storage or another source.

---

## Why use Render Props?

Instead of this:

```jsx
<ResourceLoader>
    <UserInfo />
</ResourceLoader>
```

we do:

```jsx
render={(resource) => (
    <UserInfo user={resource} />
)}
```

This provides complete flexibility over what gets rendered and how.

---

## Advantages

- Completely reusable.
- Doesn't rely on `React.cloneElement()`.
- Parent has full control over rendering.
- Easy to reuse with different UI components.
- Works with any type of data source.

---

## Limitations

- Can lead to deeply nested render functions ("render prop hell") if overused.
- No built-in loading or error states.
- Refetches when the `getData` function reference changes.
- In modern React, custom hooks are often preferred for this use case.

---

## Render Props vs Resource Loader

| Resource Loader | Render Props |
|-----------------|--------------|
| Uses `children` | Uses a `render` function |
| Injects props using `cloneElement()` | Passes data directly to the render function |
| Child components are wrapped inside the loader | Parent decides exactly what to render |
| Less flexible | More flexible |
| Simpler API | More explicit control |

---

## Real-world Use Cases

- User profile pages
- Product details
- Dashboard widgets
- Analytics panels
- Reports
- Any reusable data provider component

---

## Interview Questions

### What is the Render Props pattern?

A pattern where a component shares logic by accepting a function as a prop. That function receives data and returns the UI to render.

---

### Why use Render Props instead of `children`?

Render Props give the parent complete control over rendering without relying on prop injection (`cloneElement`).

---

### Why pass `getData` as a function?

It decouples the data source from the component, allowing it to work with any asynchronous operation, not just API requests.

---

### What happens when `getData` changes?

Since it's in the dependency array, the `useEffect` runs again, fetching fresh data and re-rendering the UI.

---

### What are the modern alternatives?

For most production applications:

- Custom Hooks
- React Query / TanStack Query
- SWR
- Redux Toolkit Query

These provide caching, retries, loading states, optimistic updates, and background refetching.

---

## Best Practices

- Memoize `getData` with `useCallback` if needed to avoid unnecessary refetches.
- Handle loading and error states.
- Keep the render function focused on presentation.
- Use render props when you need maximum rendering flexibility.
- Prefer custom hooks for shared stateful logic in modern React applications.

---

## Key Takeaways

- **Data Source with Render Props** separates data fetching from rendering.
- The component owns the fetching logic.
- The parent owns the rendering logic.
- Render Props provide greater flexibility than prop injection with `cloneElement()`.
- This pattern is foundational for understanding React composition and reusable logic, even though custom hooks are more common in modern React.
