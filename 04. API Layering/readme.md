# API States & Fetching Logic

API handling is a common pattern across **React.js, Next.js, and React Native**. The UI needs to represent the lifecycle of an asynchronous request, while the actual API can be implemented using **Node.js + Express**.

The core idea is to make API interaction predictable:

```text
User / Component
      ↓
    Request
      ↓
 ┌───────────┐
 │  Loading  │
 └─────┬─────┘
       ↓
 ┌─────┴──────────┐
 ↓                ↓
Success          Error
 ↓                ↓
Data            Message
```

---

# 1. API States

An API request is asynchronous, so the UI should represent its different states.

A basic state model is:

```js
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### States

| State     | Meaning                        |
| --------- | ------------------------------ |
| `idle`    | Request hasn't started         |
| `loading` | Request is currently running   |
| `success` | Request completed successfully |
| `error`   | Request failed                 |

For example:

```jsx
if (loading) {
  return <Loader />;
}

if (error) {
  return <ErrorMessage />;
}

return <UserList users={data} />;
```

The important point is that **API state and UI state are related but not the same thing**.

The API state describes:

```text
What is happening with the request?
```

The UI decides:

```text
What should I display because of that state?
```

---

# 2. Basic Fetching Logic

A simple React implementation:

```jsx
const Users = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/users");

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong.</p>;

  return <UserList users={data} />;
};
```

### Request lifecycle

```text
Component mounts
      ↓
setLoading(true)
      ↓
fetch()
      ↓
 ┌────┴────┐
 ↓         ↓
Success   Error
 ↓         ↓
setData   setError
 └────┬────┘
      ↓
setLoading(false)
```

`finally` is useful because loading should stop regardless of whether the request succeeds or fails.

---

# 3. HTTP Errors Are Not Automatically Fetch Errors

One important detail with `fetch`:

```js
const response = await fetch(url);
```

A `404` or `500` response does **not normally reject the promise**.

Therefore:

```js
if (!response.ok) {
  throw new Error("Request failed");
}
```

is important.

Without it:

```js
try {
  const response = await fetch("/api/users");
  const data = await response.json();

  setData(data);
} catch (error) {
  setError(error);
}
```

a `500` response could still reach the success path.

### Mental model

```text
Network failure
      ↓
fetch() rejects

HTTP 400/404/500
      ↓
fetch() usually resolves
      ↓
check response.ok
```

---

# 4. Enhancing API States

The basic:

```js
loading
data
error
```

model is often not enough.

Consider a page that already has data:

```text
Users:
Alice
Bob
Charlie
```

The user clicks **Refresh**.

The request is now loading again.

Should we completely remove the existing users and display:

```text
Loading...
```

?

Usually, **no**.

The user already has useful data.

This leads to the distinction between **initial loading** and **refetching**.

---

# 5. Initial Loading vs Refetching

Instead of only:

```js
loading
```

you can think in terms of:

```js
isLoading
isFetching
```

### Initial loading

There is no data yet:

```text
data = null
isLoading = true
```

Show:

```text
Loading users...
```

### Refetching

Data already exists:

```text
data = [...]
isFetching = true
```

Keep displaying:

```text
Alice
Bob
Charlie

Refreshing...
```

This produces a much better UX.

---

# 6. Avoiding Flickering Loaders

A common mistake:

```jsx
if (loading) {
  return <Loader />;
}

return <Users data={data} />;
```

Suppose:

```text
Initial request
    ↓
Loader
    ↓
Data
    ↓
Refetch
    ↓
Loader again
    ↓
Data
```

The entire UI disappears every time the request starts.

This creates **loader flickering**.

Instead:

```jsx
if (loading && !data) {
  return <Loader />;
}

return (
  <>
    <Users data={data} />

    {loading && (
      <SmallSpinner />
    )}
  </>
);
```

Now:

```text
Initial request
      ↓
Full loader
      ↓
Data displayed
      ↓
Refetch
      ↓
Existing data remains
      +
Small spinner
```

### Mental model

> **No data + loading → show primary loader.**
> **Data + loading → preserve UI and show secondary loading state.**

---

# 7. Why Loader Flickering Is Bad

Imagine a search page:

```text
Search: React
```

Results:

```text
React Hooks
React Router
React Query
```

User changes the search:

```text
Search: React Native
```

If the UI immediately becomes:

```text
Loading...
```

the whole page jumps.

Instead:

```text
Search: React Native

React Hooks
React Router
React Query

   Updating...
```

The UI remains stable while the new request completes.

This improves:

* perceived performance
* visual stability
* responsiveness
* user experience

---

# 8. API State Can Be More Explicit

For more complex applications, you can model the state explicitly.

```js
const [status, setStatus] = useState("idle");
const [data, setData] = useState(null);
const [error, setError] = useState(null);
```

Possible states:

```text
idle
loading
success
error
```

Then:

```jsx
switch (status) {
  case "idle":
    return <EmptyState />;

  case "loading":
    return <Loader />;

  case "error":
    return <ErrorMessage error={error} />;

  case "success":
    return <Users data={data} />;
}
```

This can be easier to reason about than multiple independent booleans.

---

# 9. Avoid Impossible States

With independent booleans:

```js
loading
error
data
```

you can accidentally create confusing combinations:

```text
loading = true
error = existing error
data = old data
```

Some combinations are valid, some aren't.

A state machine-like approach makes the request lifecycle more explicit:

```js
{
  status: "loading",
  data: null,
  error: null
}
```

or:

```js
{
  status: "success",
  data: users,
  error: null
}
```

---

# 10. Abstracting API States and Fetching Logic

If every component does this:

```jsx
useEffect(() => {
  setLoading(true);

  fetch(url)
    .then(...)
    .catch(...)
    .finally(...);
}, []);
```

you quickly get duplicated logic.

For example:

```text
Users
Products
Orders
Posts
Comments
Notifications
```

could all repeat the same lifecycle handling.

Instead, extract it into a custom hook.

---

# 11. `useFetch` Hook

```jsx
const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Request failed");
        }

        const result = await response.json();

        setData(result);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return {
    data,
    loading,
    error,
  };
};
```

Component:

```jsx
const Users = () => {
  const {
    data,
    loading,
    error,
  } = useFetch("/api/users");

  if (loading && !data) {
    return <Loader />;
  }

  if (error && !data) {
    return <ErrorMessage />;
  }

  return <UserList users={data} />;
};
```

Now the component mainly handles **presentation**.

---

# 12. Separation of Responsibilities

Without abstraction:

```text
Component
 ├── Fetch API
 ├── Handle loading
 ├── Handle errors
 ├── Parse response
 ├── Handle cleanup
 └── Render UI
```

With a hook:

```text
Component
 └── Render UI

useFetch
 ├── Fetch API
 ├── Loading state
 ├── Error state
 ├── Cleanup
 └── Response handling
```

This is essentially **separation of concerns**.

---

# 13. `refetch`

A useful improvement is exposing a `refetch` function.

```jsx
const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
```

Usage:

```jsx
const {
  data,
  loading,
  error,
  refetch,
} = useFetch("/api/users");

return (
  <>
    <button onClick={refetch}>
      Refresh
    </button>

    <UserList users={data} />
  </>
);
```

---

# 14. Request Abort Logic

Consider:

```jsx
useEffect(() => {
  fetch("/api/users");
}, []);
```

What happens if the component disappears before the request finishes?

The request may continue even though its result is no longer useful.

More importantly, for changing queries:

```text
Search "r"
   ↓
Request A

Search "re"
   ↓
Request B

Search "rea"
   ↓
Request C
```

Now three requests may be running simultaneously.

---

# 15. The Stale Response Problem

Suppose:

```text
Request A → "react"
Request B → "react native"
```

Request B starts later, but network timing isn't guaranteed.

It could finish first:

```text
B finishes
↓
React Native results

A finishes
↓
React results
```

Now the UI might incorrectly show results for `"react"` even though the current query is `"react native"`.

This is a **race condition / stale response problem**.

---

# 16. `AbortController`

`AbortController` allows you to cancel a fetch request.

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetch("/api/users", {
    signal: controller.signal,
  });

  return () => {
    controller.abort();
  };
}, []);
```

The cleanup function runs when:

* the component unmounts
* the dependency changes

depending on the effect lifecycle.

---

# 17. Abort Logic in a Search Request

```jsx
useEffect(() => {
  const controller = new AbortController();

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `/api/users?q=${keyword}`,
        {
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();

      setData(data);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      setError(error);
    }
  };

  fetchUsers();

  return () => {
    controller.abort();
  };
}, [keyword]);
```

Now:

```text
keyword = "react"
      ↓
Request A

keyword changes
      ↓
Abort Request A
      ↓
Request B
```

Only the relevant request continues.

---

# 18. Why Check `AbortError`?

Aborting a request is intentional.

You generally don't want to show:

```text
Something went wrong!
```

when you intentionally cancelled the request.

Therefore:

```js
catch (error) {
  if (error.name === "AbortError") {
    return;
  }

  setError(error);
}
```

means:

```text
AbortError
   ↓
Expected cancellation
   ↓
Ignore

Other error
   ↓
Real failure
   ↓
Show/log error
```

---

# 19. Abort vs Debounce

These solve **different problems**.

### Debounce

Controls **when a request starts**.

```text
r
re
rea
reac
react
        ↓ wait
      request
```

Useful for search inputs.

### Abort

Controls **already-running requests**.

```text
Request A running
      ↓
new query
      ↓
cancel A
      ↓
Request B
```

They can be used together.

```text
Typing
  ↓
Debounce
  ↓
Start request
  ↓
New query
  ↓
Abort previous request
```

---

# 20. Logging Errors

Errors should not disappear silently.

Bad:

```js
catch (error) {
  setError(error);
}
```

Better during development:

```js
catch (error) {
  console.error("Failed to fetch users:", error);
  setError(error);
}
```

But production applications generally need more than `console.error`.

---

# 21. User Error vs Developer Error

The user needs a useful message:

```text
Unable to load users.
Please try again.
```

The developer needs debugging information:

```text
GET /api/users
500
Request ID: abc123
```

These are different concerns.

```text
             Error
               ↓
       ┌───────┴───────┐
       ↓               ↓
     User            Developer
       ↓               ↓
 Friendly UI       Detailed logs
```

Don't expose internal server details directly to users.

---

# 22. What Should Be Logged?

Useful information can include:

```js
console.error("API request failed", {
  endpoint: "/api/users",
  status: response.status,
  error,
});
```

Depending on the application, production monitoring may capture:

* endpoint
* HTTP status
* request ID
* error type
* stack trace
* timestamp
* application version
* device/browser information

Avoid logging sensitive information such as:

* passwords
* authentication tokens
* API keys
* unnecessary personal information

---

# 23. React / Next.js / React Native

The same concepts apply across the React ecosystem:

```text
React.js
    │
    ├── useEffect
    ├── custom hooks
    ├── AbortController
    └── loading/error/data UI

Next.js
    │
    ├── Client Components
    ├── Server Components
    ├── Route Handlers
    ├── server-side data fetching
    └── client fetching when appropriate

React Native
    │
    ├── useEffect
    ├── custom hooks
    ├── fetch / HTTP clients
    └── ActivityIndicator / custom loading UI
```

The **API state principles remain the same** even though the rendering environment differs.

---

# 24. Express / Node.js Side

Express doesn't have React-style UI states.

Instead, it is responsible for producing predictable API responses.

Example:

```js
app.get("/users", async (req, res) => {
  try {
    const users = await getUsers();

    res.status(200).json({
      data: users,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);

    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
});
```

The frontend then interprets:

```text
200 → success
400 → bad request
401 → unauthenticated
403 → forbidden
404 → not found
500 → server error
```

So the two sides work together:

```text
             Express API
                  │
          HTTP response
                  ↓
       ┌──────────────────┐
       │ 200 / 400 / 500  │
       └────────┬─────────┘
                ↓
       React / Next / RN
                ↓
        UI API state
```

---

# 25. Don't Confuse HTTP Status With UI State

These are different concepts.

### HTTP state

```text
200
400
401
404
500
```

### Client UI state

```text
idle
loading
success
error
```

For example:

```text
HTTP 404
    ↓
Client receives response
    ↓
UI state = error
    ↓
Show "User not found"
```

---

# 26. Common API State Pattern

A good mental model:

```js
{
  data,
  error,
  loading,
  refetch
}
```

For more advanced applications:

```js
{
  data,
  error,
  isLoading,
  isFetching,
  isRefetching,
  refetch
}
```

This lets the UI distinguish:

```text
No data yet
    ↓
Initial loading

Existing data
    ↓
Refetching

Existing data + error
    ↓
Refresh failed, but old data can remain
```

That last case is especially useful.

---

# 27. Keep Previous Data When Refetching

Suppose:

```text
Page 1
──────
A
B
C
```

User navigates to page 2.

Instead of:

```text
Page 2
──────
Loading...
```

you can preserve page 1 temporarily:

```text
Page 2
──────
A
B
C

Fetching page 2...
```

Then replace it when page 2 arrives.

This is another application of the principle:

> **Loading does not always mean "remove the existing UI."**

---

# 28. Custom Hook With Better Loading Behavior

A conceptual version:

```jsx
const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const controller = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      setData(result);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      console.error("API request failed:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    error,
    loading,
    refetch: fetchData,
  };
};
```

**Important:** for real production code, the controller should normally be tied to the effect/request lifecycle so cleanup can abort the specific request. The conceptual goal is:

```text
fetching logic
     +
state management
     +
cleanup
     +
error handling
        ↓
   reusable hook
```

---

# 29. When to Use a Data-Fetching Library

For small applications:

```text
fetch()
+
useEffect()
+
custom hook
```

may be enough.

As the application grows, you may need:

* caching
* deduplication
* retries
* refetching
* stale data management
* pagination
* optimistic updates
* request cancellation
* background refetching

At that point, a dedicated data-fetching library such as **TanStack Query** can handle much of this instead of building everything yourself.

The underlying concepts remain the same.

---

# 30. Complete Mental Model

Think of API handling as several layers:

```text
                API
                 │
                 ↓
        ┌─────────────────┐
        │ Request lifecycle│
        └────────┬────────┘
                 ↓
       ┌───────────────────┐
       │ idle / loading /  │
       │ success / error   │
       └────────┬──────────┘
                ↓
       Existing data?
          /          \
        No            Yes
        ↓              ↓
  Full loader      Preserve UI
                     +
                  refetch UI
                ↓
         Request changes?
                ↓
          Abort old request
                ↓
           Error occurs?
           /           \
         Abort         Real error
          ↓               ↓
        Ignore       Log + show UI
```

---

# 31. Common Mistakes

### ❌ Treat every loading state as initial loading

```jsx
if (loading) return <Loader />;
```

Can cause flickering during refetches.

### ❌ Forget `response.ok`

```js
const response = await fetch(url);
const data = await response.json();
```

HTTP `4xx/5xx` responses aren't automatically thrown by `fetch`.

### ❌ Ignore race conditions

```text
Request A
Request B
Request A finishes last
```

Can result in stale data.

### ❌ Don't abort obsolete requests

Especially problematic with:

* search
* filters
* rapidly changing IDs
* route changes

### ❌ Put fetching logic into every component

Creates duplication.

### ❌ Show technical errors to users

Avoid:

```text
TypeError: Cannot read properties of undefined...
```

Prefer:

```text
Unable to load users. Please try again.
```

### ❌ Log sensitive information

Never casually log:

```js
console.log(token);
console.log(password);
```

---

# 32. Interview Comparison

| Concept           | Purpose                              |
| ----------------- | ------------------------------------ |
| API states        | Represent request lifecycle          |
| `loading`         | Request currently running            |
| `error`           | Request failed                       |
| `data`            | Successful/current data              |
| `isLoading`       | Usually initial loading              |
| `isFetching`      | Any active fetch/refetch             |
| Avoid flickering  | Preserve existing UI during refetch  |
| Custom hook       | Reuse fetching/state logic           |
| `AbortController` | Cancel obsolete requests             |
| Debounce          | Delay starting requests              |
| Error logging     | Help developers diagnose failures    |
| HTTP status       | Server/API result                    |
| UI state          | Client representation of that result |
| Express           | Produces HTTP responses              |
| React/RN          | Consumes responses and renders state |

---

# 33. Quick Revision

### API State

```text
idle → loading → success
               ↘ error
```

### Initial loading

```js
loading && !data
```

→ show full loader.

### Refetching

```js
loading && data
```

→ keep existing UI and show smaller loading indicator.

### Abstraction

```js
useFetch(url)
```

→ centralize request lifecycle.

### Abort

```js
const controller = new AbortController();

fetch(url, {
  signal: controller.signal,
});

return () => controller.abort();
```

→ cancel obsolete requests.

### Error

```js
if (!response.ok) {
  throw new Error("Request failed");
}
```

→ `fetch` does not automatically reject for HTTP errors.

### Logging

```js
console.error("API request failed", error);
```

→ developer-facing diagnostics; show a safe user-facing message separately.
---

## One-line interview revision

> **API fetching is about modeling the request lifecycle (`loading`, `success`, `error`), preserving existing data during refetches to avoid UI flicker, abstracting repeated fetching into hooks/services, aborting obsolete requests to prevent races and wasted work, and logging errors separately from user-facing error messages.**
