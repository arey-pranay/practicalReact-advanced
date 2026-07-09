# Resource Loader Pattern

## What is it?

The **Resource Loader Pattern** is a reusable React component that handles **data fetching** and injects the fetched data into its child components.

Instead of every component making its own API call, a single wrapper component is responsible for loading the data and passing it down as props.

---

## Why use it?

- Eliminates duplicate data-fetching logic.
- Promotes separation of concerns.
- Makes presentational components independent of APIs.
- Improves reusability.
- Easier to test UI components.

---

## Folder Structure

```
Resource Loader
│── App.jsx
│── components/
│     ├── resource-loader.jsx
│     ├── user-info.jsx
│     └── book-info.jsx
```

---

## Usage

```jsx
<ResourceLoader
    resourceUrl="/users/1"
    resourceName="user"
>
    <UserInfo />
</ResourceLoader>
```

```jsx
<ResourceLoader
    resourceUrl="/books/1"
    resourceName="book"
>
    <BookInfo />
</ResourceLoader>
```

---

## Implementation

```jsx
export const ResourceLoader = ({
    resourceUrl,
    resourceName,
    children,
}) => {
    const [resource, setResource] = useState(null);

    useEffect(() => {
        (async () => {
            const response = await axios.get(resourceUrl);
            setResource(response.data);
        })();
    }, [resourceUrl]);

    return (
        <>
            {React.Children.map(children, child =>
                React.cloneElement(child, {
                    [resourceName]: resource,
                })
            )}
        </>
    );
};
```

---

## How it Works

1. Parent provides the API URL.
2. `ResourceLoader` fetches the data.
3. Data is stored in local state.
4. `cloneElement()` injects the fetched resource into every child.
5. Child components simply render the received data.

Flow:

```
Parent
   │
   ▼
ResourceLoader
   │
Fetch API
   │
Store Response
   │
cloneElement()
   │
   ▼
Child Component
```

---

## Props

| Prop | Type | Description |
|------|------|-------------|
| `resourceUrl` | string | API endpoint to fetch data from |
| `resourceName` | string | Name of the prop passed to children |
| `children` | ReactNode | Components that receive the fetched resource |

---

## Dynamic Prop Injection

This line makes the component generic:

```jsx
{
    [resourceName]: resource;
}
```

If

```jsx
resourceName="user"
```

the child receives

```jsx
<UserInfo user={resource} />
```

If

```jsx
resourceName="book"
```

the child receives

```jsx
<BookInfo book={resource} />
```

No code changes are required inside `ResourceLoader`.

---

## Advantages

- Reusable for any REST endpoint.
- Prevents duplicate fetching logic.
- Keeps UI components focused on rendering.
- Dynamic prop names make it highly flexible.
- Works with any child component.

---

## Limitations

- No loading state.
- No error handling.
- Refetches whenever `resourceUrl` changes.
- Uses `cloneElement`, which is less common in modern React.
- Better alternatives exist for complex applications (custom hooks or React Query).

---

## Real-world Use Cases

- User profile pages
- Product details
- Blog posts
- Dashboard widgets
- Settings pages
- Admin panels

---

## Interview Questions

### Why use a Resource Loader?

To centralize data-fetching logic and keep UI components focused solely on presentation.

---

### Why use `React.cloneElement()`?

It allows the wrapper component to inject additional props into its children without modifying the child component itself.

---

### Why use a dynamic prop name?

Using

```jsx
{
    [resourceName]: resource;
}
```

makes the component reusable for different resources (`user`, `book`, `product`, etc.) instead of hardcoding prop names.

---

### What happens when `resourceUrl` changes?

The `useEffect` dependency detects the change, triggers a new API request, updates the state, and re-renders the child with the new data.

---

### What are better alternatives?

For larger applications:

- Custom Hooks (`useUser`, `useBook`)
- React Query / TanStack Query
- SWR
- Redux Toolkit Query

These provide caching, retries, loading states, and background refetching.

---

## Best Practices

- Add loading and error states.
- Cancel in-flight requests on unmount.
- Validate child components before cloning.
- Keep this component responsible only for data fetching.
- Use custom hooks or data-fetching libraries for production-scale applications.

---

## Key Takeaways

- **Resource Loader** separates data fetching from UI.
- It fetches data once and injects it into child components.
- `React.cloneElement()` enables prop injection.
- Dynamic prop names make the component generic and reusable.
- Ideal for learning React composition, though modern apps often prefer custom hooks or dedicated data-fetching libraries.
