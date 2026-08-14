# Error Boundaries

## What is an Error Boundary?

An **Error Boundary** is a React component that catches JavaScript errors in its descendant component tree and displays a fallback UI instead of allowing the entire UI to crash.

The important distinction is that Error Boundaries are implemented using **class components** in React's built-in API.

In this example:

```jsx
<ErrorBoundary fallback={<h1>Error in child</h1>}>
  <Child />
</ErrorBoundary>
```

`ErrorBoundary` protects `Child`.

---

## Why use Error Boundaries?

Without an error boundary:

```text
Child throws error
      ↓
React rendering fails
      ↓
Potentially broken UI
```

With an error boundary:

```text
Child throws error
      ↓
ErrorBoundary catches it
      ↓
Fallback UI
```

This allows the application to fail **gracefully**.

---

# Basic Structure

```jsx
class ErrorBoundary extends React.Component {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error) {
    console.log(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
```

There are two important lifecycle methods:

```jsx
getDerivedStateFromError()
componentDidCatch()
```

---

# `getDerivedStateFromError`

```jsx
static getDerivedStateFromError(error) {
  return {
    hasError: true,
  };
}
```

This updates the component's state when an error occurs.

Initially:

```jsx
{
  hasError: false
}
```

After an error:

```jsx
{
  hasError: true
}
```

Then `render()` sees:

```jsx
if (this.state.hasError) {
  return this.props.fallback;
}
```

and displays the fallback UI.

---

# `componentDidCatch`

```jsx
componentDidCatch(error) {
  console.log("Error: ", error);
}
```

This is useful for **side effects related to the error**.

For example, production applications can use it to send errors to monitoring services.

Conceptually:

```text
Error
 │
 ├── getDerivedStateFromError()
 │       ↓
 │   Update UI
 │
 └── componentDidCatch()
         ↓
      Logging / Reporting
```

---

# The Example Flow

The parent renders:

```jsx
<ErrorBoundary>
  <Child />
</ErrorBoundary>
```

The child executes:

```jsx
useEffect(() => {
  ...
}, []);
```

and eventually an error is thrown.

The boundary changes:

```jsx
hasError: false
```

to:

```jsx
hasError: true
```

and renders:

```jsx
<h1>Error in child</h1>
```

instead of the child UI.

---

# Error Boundary API

The component uses:

### `getDerivedStateFromError`

Used to update state and render fallback UI.

```jsx
static getDerivedStateFromError(error) {
  return {
    hasError: true,
  };
}
```

### `componentDidCatch`

Used for side effects such as logging.

```jsx
componentDidCatch(error) {
  logError(error);
}
```

---

# What Errors Do Error Boundaries Catch?

Error boundaries catch errors occurring during:

* Rendering
* Lifecycle methods
* Constructors of child components

For example:

```jsx
const Child = () => {
  throw new Error("Something went wrong");

  return <div>Hello</div>;
};
```

The boundary can catch this.

---

# What They DON'T Catch

This is extremely important.

Error boundaries do **not** automatically catch errors from:

### Event handlers

```jsx
<button
  onClick={() => {
    throw new Error("Boom");
  }}
>
  Click
</button>
```

You should handle these yourself.

---

### Asynchronous callbacks

```jsx
setTimeout(() => {
  throw new Error("Boom");
}, 1000);
```

---

### Promise rejections

```jsx
fetch("/api")
  .then(...)
  .catch(...);
```

---

### Server-side rendering

Errors during server rendering need to be handled by the server/framework.

---

# Important Issue in Your Example

Your `Child` currently does:

```jsx
useEffect(() => {
  fetch("/").then(() => {
    throw new Error("Fetch Error");
  });
}, []);
```

This error occurs inside a **Promise callback**.

That is **not an error that React Error Boundaries catch**.

So this example does **not actually demonstrate a working Error Boundary**.

A boundary would catch something like:

```jsx
export const Child = () => {
  throw new Error("Render Error");

  return <h1>Child Component</h1>;
};
```

But it will not automatically catch:

```jsx
useEffect(() => {
  fetch("/").then(() => {
    throw new Error("Fetch Error");
  });
}, []);
```

For asynchronous errors, handle the error explicitly:

```jsx
useEffect(() => {
  fetch("/")
    .then(...)
    .catch((error) => {
      setError(error);
    });
}, []);
```

Or use a data-fetching library that integrates error state into React rendering.

---

# Error Boundary Scope

The boundary only protects its descendants.

```jsx
<ErrorBoundary>
  <Child />
</ErrorBoundary>
```

protects:

```text
ErrorBoundary
    │
    └── Child
```

But:

```jsx
<Child />

<ErrorBoundary>
  <OtherChild />
</ErrorBoundary>
```

doesn't protect the first `Child`.

---

# Multiple Error Boundaries

Large applications commonly use multiple boundaries:

```text
App
 │
 ├── ErrorBoundary
 │      └── Header
 │
 ├── ErrorBoundary
 │      └── Main Content
 │
 └── ErrorBoundary
        └── Sidebar
```

This allows one broken section to display a fallback without taking down the entire application.

---

# Where Should You Put Them?

Good locations include:

* Application root
* Routes/pages
* Major UI sections
* Complex third-party components
* Widgets
* Independent dashboard panels

For example:

```jsx
<ErrorBoundary fallback={<PageError />}>
  <Dashboard />
</ErrorBoundary>
```

and:

```jsx
<ErrorBoundary fallback={<WidgetError />}>
  <AnalyticsWidget />
</ErrorBoundary>
```

---

# Error Boundary vs `try/catch`

These solve different problems.

### `try/catch`

Used for ordinary JavaScript errors:

```jsx
try {
  doSomething();
} catch (error) {
  handleError(error);
}
```

---

### Error Boundary

Used for errors in React's rendering/lifecycle tree:

```jsx
<ErrorBoundary>
  <Component />
</ErrorBoundary>
```

Think:

```text
try/catch
    ↓
JavaScript execution

Error Boundary
    ↓
React component tree
```

---

# Error Boundary vs API Error Handling

An API request failing is generally **not itself an Error Boundary concern**.

Instead:

```jsx
const [error, setError] = useState(null);
```

and:

```jsx
try {
  ...
} catch (error) {
  setError(error);
}
```

Then render:

```jsx
if (error) {
  return <ErrorMessage />;
}
```

Error boundaries are primarily for **unexpected React errors**, not ordinary expected application states such as:

* 404
* 401
* network failure
* validation error

---

# Production Error Reporting

`componentDidCatch` can be used to send information to an error monitoring service.

Conceptually:

```jsx
componentDidCatch(error, errorInfo) {
  reportError(error, errorInfo);
}
```

The second argument provides additional React component-stack information.

---

# Interview Questions

### What is an Error Boundary?

A React component that catches errors in its descendant tree during rendering and lifecycle execution and displays fallback UI.

---

### Why is `getDerivedStateFromError` static?

React calls it to derive new state from an error before rendering the fallback UI. It does not need access to the component instance.

---

### What is `componentDidCatch` used for?

Side effects such as logging, monitoring, or sending error information to an external service.

---

### Can a functional component be an Error Boundary?

Not using React's built-in Error Boundary API directly.

The traditional implementation requires a class component.

You can, however, use third-party libraries that provide functional-component-friendly APIs.

---

### Do Error Boundaries catch event-handler errors?

No.

Event handlers should handle their own errors.

---

### Do Error Boundaries catch async errors?

Not automatically.

Errors from promises, timers, and other asynchronous callbacks need explicit error handling.

---

### Can an Error Boundary catch its own errors?

No. A boundary does not catch errors thrown by itself. It catches errors from its descendant tree.

---

# Best Practices

* Use boundaries around meaningful UI sections.
* Provide useful fallback UI.
* Log unexpected errors in production.
* Don't use Error Boundaries as a replacement for API error handling.
* Handle event-handler and asynchronous errors explicitly.
* Consider resetting the boundary when the user navigates or retries.

---

# Key Takeaways

* **Error Boundaries** provide a safety net for unexpected errors in React's component tree.
* `getDerivedStateFromError()` is used to render fallback UI.
* `componentDidCatch()` is used for logging and other side effects.
* Error Boundaries catch rendering/lifecycle errors, **not arbitrary JavaScript or asynchronous errors**.
* Your current `fetch().then(() => { throw ... })` example is an important distinction: **that error will not be caught by the Error Boundary**.
* In production applications, combine Error Boundaries with explicit API/error-state handling for a robust error strategy.
