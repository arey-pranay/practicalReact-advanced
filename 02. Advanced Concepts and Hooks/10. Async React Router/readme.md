# `lazy` + `Suspense` + React Router `defer`/`Await`

This concept combines **two different kinds of waiting**:

1. **Component/code loading** → `lazy()` + `Suspense`
2. **Data loading** → React Router `defer()` + `<Await>` + `Suspense`

The important idea is that **code and data can both be loaded asynchronously, and their loading states can be handled independently.**

---

## 1. `lazy()` — Lazy-load the component

Instead of immediately importing:

```jsx
import Club from "./components/club";
```

you have:

```jsx
const Club = lazy(() =>
  delay(import("./components/club"), 1000)
);
```

`import()` is a **dynamic import**.

Instead of putting the component's code into the initial JavaScript bundle, React can load it when needed.

Conceptually:

```text
Initial application
      ↓
User clicks Club
      ↓
Need Club component
      ↓
download Club's JS chunk
      ↓
render Club
```

Your `delay()` is only there to artificially make this visible:

```jsx
const delay = (data, interval) => {
  return new Promise((res) => {
    setTimeout(() => {
      res(data);
    }, interval);
  });
};
```

So:

```jsx
lazy(() => delay(import("./components/club"), 1000))
```

means:

```text
import Club
   ↓
wait 1 second
   ↓
resolve module
   ↓
React can render Club
```

---

# 2. `Suspense` handles the lazy component

A lazy component needs a `<Suspense>` boundary.

You have:

```jsx
<Suspense
  fallback={<NavContainer>Loading...</NavContainer>}
>
  <NavContainer>
    <Outlet />
  </NavContainer>
</Suspense>
```

When React encounters a component that isn't ready yet:

```text
<Club />
   ↓
Club JS not loaded
   ↓
Suspends
   ↓
Suspense catches it
   ↓
"Loading..."
```

Once the component finishes loading:

```text
Club JS loaded
   ↓
Suspense retries rendering
   ↓
<Club />
```

---

# 3. `defer()` — Don't wait for all data

Now there's a **different type of loading**.

Your route loader is:

```jsx
function loader() {
  const bookCountPromise = delay(10, 1000);
  const authorsPromise = delay("Codelicks", 2000);

  return defer({
    bookCountPromise,
    authorsPromise,
  });
}
```

There are two promises:

```text
bookCountPromise → 1 second
authorsPromise   → 2 seconds
```

The important thing is that `defer()` returns the promises rather than forcing the route to wait for them all before rendering the route UI.

Conceptually:

```text
Route loader
     ↓
defer(...)
     ↓
┌───────────────────────┐
│ Start both requests   │
│                       │
│ bookCount → 1 sec     │
│ authors   → 2 sec     │
└───────────────────────┘
     ↓
Render page immediately
     ↓
Each promise resolves independently
```

---

# 4. `useLoaderData()`

Inside `Books`:

```jsx
const { bookCountPromise, authorsPromise } = useLoaderData();
```

The loader's returned object becomes available through `useLoaderData()`.

So:

```jsx
return defer({
  bookCountPromise,
  authorsPromise,
});
```

becomes:

```text
useLoaderData()
      ↓
{
  bookCountPromise,
  authorsPromise
}
```

---

# 5. `<Await>` waits for a specific promise

For the book count:

```jsx
<Suspense fallback="Fetching...">
  <Await resolve={bookCountPromise}>
    {(data) => <strong>{data}</strong>}
  </Await>
</Suspense>
```

The flow is:

```text
bookCountPromise
      ↓
     Await
      ↓
Is it resolved?
   ↙       ↘
 NO         YES
 ↓           ↓
Suspense   render data
fallback
```

So initially:

```text
Available Books:
Fetching...
```

After 1 second:

```text
Available Books:
10
```

---

# 6. Multiple `<Suspense>` boundaries

You have another independent boundary:

```jsx
<Suspense fallback="Fetching...">
  <Await resolve={authorsPromise}>
    <Authors />
  </Await>
</Suspense>
```

This is useful because the two pieces of data have different completion times.

```text
             Books page
                 │
        ┌────────┴────────┐
        ↓                 ↓
 bookCountPromise    authorsPromise
    1 second             2 seconds
        ↓                 ↓
    10 appears       Codelicks appears
```

You don't need to wait for the slower `authorsPromise` before displaying the book count.

---

# 7. `useAsyncValue()`

Instead of doing:

```jsx
<Await resolve={authorsPromise}>
  {(data) => <Authors authors={data} />}
</Await>
```

you can access the resolved value from inside the `<Await>` tree using:

```jsx
const authors = useAsyncValue();
```

Your component:

```jsx
const Authors = () => {
  const authors = useAsyncValue();

  return <strong>{authors}</strong>;
};
```

works because it is rendered inside:

```jsx
<Await resolve={authorsPromise}>
  <Authors />
</Await>
```

Conceptually:

```text
authorsPromise
      ↓
    <Await>
      ↓
 resolved value
      ↓
 <Authors />
      ↓
useAsyncValue()
      ↓
"Codelicks"
```

### Mental model

```text
<Await>
   │
   └── Provides the resolved promise value
             │
             ↓
      useAsyncValue()
```

---

# 8. `defer` vs normal `await`

Without deferred loading, conceptually you could have:

```jsx
async function loader() {
  const bookCount = await delay(10, 1000);
  const authors = await delay("Codelicks", 2000);

  return {
    bookCount,
    authors,
  };
}
```

The route loader waits for the data before providing the completed loader result.

With your approach:

```jsx
function loader() {
  return defer({
    bookCountPromise: delay(10, 1000),
    authorsPromise: delay("Codelicks", 2000),
  });
}
```

the promises are handed to the UI, where `<Await>` can handle them.

That's the main reason for combining:

```text
defer
 +
Await
 +
Suspense
```

---

# 9. There are actually TWO Suspense scenarios here

This is the most important revision point from this example.

### A. Component loading

```jsx
const Club = lazy(() =>
  delay(import("./components/club"), 1000)
);
```

Handled by:

```jsx
<Suspense fallback="Loading...">
  <Outlet />
</Suspense>
```

```text
lazy()
 ↓
code isn't ready
 ↓
Suspense
 ↓
loading UI
```

### B. Data loading

```jsx
const promise = delay("Fetched Data", 1000);
```

Handled by:

```jsx
<Suspense fallback="Fetching...">
  <Await resolve={promise}>
    ...
  </Await>
</Suspense>
```

```text
defer()
 ↓
data isn't ready
 ↓
Await
 ↓
Suspense
 ↓
loading UI
```

So:

> **`Suspense` itself doesn't fetch your data or load your component. It provides the mechanism for displaying fallback UI while something in its subtree is suspended.**

---

# `lazy` vs `defer`

|                  | `lazy()`           | `defer()`               |
| ---------------- | ------------------ | ----------------------- |
| What is loading? | Component code     | Data                    |
| Mechanism        | Dynamic `import()` | Promises from loader    |
| Used with        | `Suspense`         | `Await` + `Suspense`    |
| Example          | `Club`             | `authorsPromise`        |
| Purpose          | Code splitting     | Streaming/deferred data |

---

# Your `Main` demonstrates the same data pattern

Loader:

```jsx
export function loader() {
  return defer({
    promise: delay("Fetched Data", 1000),
  });
}
```

Component:

```jsx
const { promise } = useLoaderData();

<Suspense fallback="Fetching...">
  <Await resolve={promise}>
    {(data) => <strong>{data}</strong>}
  </Await>
</Suspense>
```

So:

```text
loader
  ↓
defer({ promise })
  ↓
useLoaderData()
  ↓
<Await resolve={promise}>
  ↓
promise resolves
  ↓
render data
```

---

# `useNavigation()` is a different loading state

Your `Nav` also has:

```jsx
const { state } = useNavigation();
```

and:

```jsx
{state === "loading" && (
  <LoadingMessage>Loading...</LoadingMessage>
)}
```

This is about the **router's navigation state**, not specifically whether a particular promise inside the page has resolved.

So there are multiple layers:

```text
Navigation
    ↓
useNavigation()
    ↓
"Loading..."


Component code
    ↓
lazy()
    ↓
Suspense
    ↓
"Loading..."


Deferred data
    ↓
defer()
    ↓
Await
    ↓
Suspense
    ↓
"Fetching..."
```

They solve related but different problems.

---

# Complete Mental Model

Think of the whole application as:

```text
                    USER NAVIGATES
                         │
                         ▼
                  React Router
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
       Component needed       Route data needed
              │                     │
           lazy()                 loader()
              │                     │
              ▼                   defer()
       dynamic import              │
              │             ┌───────┴───────┐
              ▼             ▼               ▼
          Suspense       Promise 1       Promise 2
              │             │               │
          fallback        Await           Await
                            │               │
                            ▼               ▼
                          data            data
```

---

# One important practical distinction

`Suspense` is **not a generic replacement for `isLoading`**.

You don't do:

```jsx
<Suspense>
  fetch("/api/users")
</Suspense>
```

and expect Suspense to automatically understand the promise.

Something has to **suspend** in a way React understands. In your example, that is provided by:

* `lazy()` for component code
* React Router's `<Await>` for deferred loader data

---

## Revision Notes

### `lazy`

> **`lazy()` dynamically imports a component so its code can be loaded only when needed.**

### `Suspense`

> **`Suspense` displays fallback UI while something in its subtree is suspended.**

### `defer`

> **React Router's `defer()` allows loader data to remain as promises so the route can render while data is still resolving.**

### `Await`

> **`<Await>` handles a deferred promise from the router and renders its resolved value.**

### `useAsyncValue`

> **`useAsyncValue()` retrieves the value resolved by the nearest `<Await>` ancestor.**

### `useNavigation`

> **`useNavigation()` exposes React Router's current navigation state, useful for showing route-level loading feedback.**

### The big picture

> **`lazy` defers component code, `defer` defers route data, `Suspense` provides fallback boundaries, and `Await` consumes deferred router promises.**
