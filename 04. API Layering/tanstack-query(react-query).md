# TanStack Query v5 — Complete Revision README

> Scope: React.js, Next.js (App Router), React Native, and Node.js/Express APIs.
>
> Goal: Learn how to set up TanStack Query, fetch and update data, handle cancellation, pagination, infinite scrolling, caching, optimistic updates, and production concerns.

TanStack Query is primarily a client-side/server-state management library. It manages data fetched from APIs, including caching, loading states, background refetching, mutations, and synchronization.

It is not a replacement for Express. Express creates the API; TanStack Query consumes and manages the API data on the client.

This README uses the TanStack Query v5 object-based API. v5 requires React 18 or later.

![](https://www.google.com/s2/favicons?domain=https://tanstack.com\&sz=32)

TanStack Query React Docs

+1

# 1. What Problem Does TanStack Query Solve?

Without TanStack Query, every component might manually implement:

```
Fetch data
    ↓
Loading state
    ↓
Error handling
    ↓
Store response
    ↓
Cache data
    ↓
Refetch data
    ↓
Retry failed requests
    ↓
Cancel requests
    ↓
Synchronize multiple components
```

Example:

JavaScript

```
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

This works, but becomes repetitive as your application grows.

TanStack Query provides a centralized query cache and APIs for handling these operations.

```
                 API Server
                     │
                     ▼
             TanStack Query
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
    Cache         Fetching       Mutations
       │             │             │
       └─────────────┼─────────────┘
                     ▼
                  UI
```

## Client state vs server state

|
Client state

|

Server state

|
| --- | --- |
|

Modal open/closed

|

Users fetched from API

|
|

Selected tab

|

Products from database

|
|

Input value

|

Current profile

|
|

Theme preference

|

Orders

|
|

Sidebar visibility

|

Notifications

|

TanStack Query focuses on server state.

You can still use:

* `useState`

* `useReducer`

* Context

* Zustand

* Redux

for client-side state.

# 2. Core Concepts

|
Concept

|

Meaning

|
| --- | --- |
|

`QueryClient`

|

Central manager for query cache and operations

|
|

`QueryClientProvider`

|

Makes the client available to React components

|
|

Query

|

Read/fetch server data

|
|

Mutation

|

Create, update, or delete server data

|
|

Query key

|

Unique identity of cached data

|
|

Query function

|

Function that fetches data

|
|

Query cache

|

Stores query results

|
|

`staleTime`

|

How long data is considered fresh

|
|

`gcTime`

|

How long inactive cache data is retained

|
|

`invalidateQueries`

|

Marks matching queries as stale and usually triggers refetching

|
|

`setQueryData`

|

Directly updates cached data

|
|

`useInfiniteQuery`

|

Manages paginated/infinite data

|

# 3. Installation

## React.js / Next.js

Bash

```
npm install @tanstack/react-query
```

Development tools:

Bash

```
npm install -D @tanstack/react-query-devtools
```

## React Native

Bash

```
npm install @tanstack/react-query
```

You may also need to configure your HTTP client and platform-specific network behavior.

TanStack Query's React APIs are shared across React web and React Native, while the UI components and application setup differ.

# 4. Basic Setup

Create a `query-client.js` file:

JavaScript

```
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
    },
  },
});
```

Wrap your application:

JavaScript

```
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./query-client";
import App from "./App";

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

export default Root;
```

### Mental model

```
QueryClient
    ↓
QueryClientProvider
    ↓
All descendant components
    ↓
useQuery / useMutation
```

Every component using TanStack Query needs access to the appropriate `QueryClient`.

# 5. Next.js App Router Setup

In Next.js App Router, create a provider component.

TypeScript

```
// app/providers.tsx
"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { useState } from "react";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

Add it to the root layout:

TypeScript

```
// app/layout.tsx
import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Why use `useState` for the client?

TypeScript

```
const [queryClient] = useState(
  () => new QueryClient()
);
```

This creates the `QueryClient` once for the lifetime of that provider instance instead of creating a new client on every render.

A new client on every render could cause cache loss and unnecessary reinitialization.

## Important Next.js distinction

Next.js App Router supports:

* Server Components

* Client Components

* Server-side fetching

* Route Handlers

* Streaming and Suspense

* Client-side TanStack Query

TanStack Query hooks such as `useQuery` run in Client Components, so the component using them must be within a client-side boundary.

TanStack Query can also be integrated with Next.js server prefetching and hydration, but that is a separate setup from the basic client-only approach.

# 6. Query Keys

A query key uniquely identifies a query in the cache.

JavaScript

```
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});
```

For a specific user:

JavaScript

```
useQuery({
  queryKey: ["users", userId],
  queryFn: () => fetchUser(userId),
});
```

For filtered data:

JavaScript

```
useQuery({
  queryKey: ["users", { role: "admin" }],
  queryFn: () => fetchUsers({ role: "admin" }),
});
```

Think of a query key as a cache address:

```
["users"]
["users", 1]
["users", 2]
["users", { role: "admin" }]
```

These represent different cached data.

## Query key rule

Every variable that changes the fetched result should generally be included in the query key.

JavaScript

```
useQuery({
  queryKey: ["posts", page, category],
  queryFn: () => fetchPosts({ page, category }),
});
```

When `page` or `category` changes, TanStack Query identifies a different query.

# 7. Query Function

A query function should:

1. Return a Promise.

2. Resolve with the data.

3. Throw when the request fails.

4. Accept the query function context when cancellation or other query metadata is needed.

Basic function:

JavaScript

```
const fetchUsers = async () => {
  const response = await fetch("/api/users");

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};
```

The query:

JavaScript

```
const result = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});
```

The query function can also receive:

JavaScript

```
const fetchUsers = async ({ signal }) => {
  const response = await fetch("/api/users", {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};
```

TanStack Query supplies the query function context, including an `AbortSignal`.

![](https://www.google.com/s2/favicons?domain=https://old.tanstack.com\&sz=32)

TanStack Query React Docs

+1

# 8. Basic `useQuery`

JavaScript

```
import { useQuery } from "@tanstack/react-query";

const fetchUsers = async () => {
  const response = await fetch("/api/users");

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

export default function Users() {
  const {
    data,
    error,
    isPending,
    isError,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>{error.message}</p>;
  }

  return (
    <>
      {isFetching && <p>Refreshing...</p>}

      {data.map((user) => (
        <p key={user.id}>{user.name}</p>
      ))}
    </>
  );
}
```

## Important v5 state names

TanStack Query v5 uses:

* `status: "pending"` instead of `"loading"`

* `isPending` for the pending status

* `isFetching` when a fetch is currently running

* `isLoading` as a derived state representing initial loading (`isPending && isFetching`)

The naming differences are documented in the v5 migration guide.

![](https://www.google.com/s2/favicons?domain=https://tanstack.com\&sz=32)

TanStack Query React Docs

+1

# 9. `isPending` vs `isFetching` vs `isLoading`

This is important for avoiding flickering loaders.

|
Property

|

Meaning

|
| --- | --- |
|

`isPending`

|

Query has no successful result yet

|
|

`isFetching`

|

A request is currently running

|
|

`isLoading`

|

Initial fetch is pending and currently fetching

|
|

`isRefetching`

|

Fetching after the initial fetch

|

Conceptual behavior:

```
Initial request:
isPending = true
isFetching = true
isLoading = true
```

After success:

```
isPending = false
isFetching = false
isLoading = false
```

During refetch:

```
isPending = false
isFetching = true
isLoading = false
```

Therefore:

JavaScript

```
if (isPending) {
  return <FullPageLoader />;
}

return (
  <>
    {isFetching && <SmallSpinner />}
    <Users data={data} />
  </>
);
```

This preserves the existing data during background refetching.

# 10. Query Lifecycle

```
Component mounts
      ↓
Query key identified
      ↓
Check cache
      ↓
Is cached data available?
   ┌──┴───┐
   No    Yes
   ↓      ↓
Fetch   Display cache
   ↓      ↓
Success / error
      ↓
Cache result
      ↓
Possible background refetch
```

TanStack Query automatically manages cached data and query observers.

A query can be observed by multiple components:

```
Component A ─┐
Component B ─┼──> Same query key ──> Shared cache
Component C ─┘
```

This avoids every component independently maintaining an unrelated copy of the same server data.

# 11. `staleTime` and `gcTime`

## `staleTime`

Determines how long data remains fresh.

JavaScript

```
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  staleTime: 60 * 1000,
});
```

Here, data is considered fresh for one minute.

Fresh data generally does not need an automatic refetch merely because another component mounts.

## `gcTime`

Controls how long inactive query data remains in the cache before garbage collection.

JavaScript

```
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  gcTime: 5 * 60 * 1000,
});
```

### Difference

|
Option

|

Question

|
| --- | --- |
|

`staleTime`

|

When should cached data be considered stale?

|
|

`gcTime`

|

How long should unused cached data remain?

|

Mental model:

```
Fetched data
    ↓
Fresh for staleTime
    ↓
Stale
    ↓
Query becomes inactive
    ↓
Retained until gcTime
    ↓
Garbage collected
```

`staleTime` does not mean the data is deleted after that duration.

# 12. Automatic Refetching

TanStack Query can refetch data in response to certain events, depending on configuration.

Common triggers include:

* Mounting a query

* Regaining window focus on web

* Reconnecting to the network

* Explicit invalidation

* Configured polling

Example:

JavaScript

```
useQuery({
  queryKey: ["notifications"],
  queryFn: fetchNotifications,
  refetchInterval: 10_000,
});
```

This requests updates approximately every 10 seconds while the query is active, subject to the library's scheduling and environment behavior.

Disable focus refetching:

JavaScript

```
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  refetchOnWindowFocus: false,
});
```

Use these options intentionally. Not every API needs constant polling.

# 13. Handling Errors and Retries

Query functions should throw errors:

JavaScript

```
const fetchUsers = async () => {
  const response = await fetch("/api/users");

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
};
```

Configure retries:

JavaScript

```
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  retry: 2,
});
```

Disable retries:

JavaScript

```
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  retry: false,
});
```

Conditional retry:

JavaScript

```
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  retry: (failureCount, error) => {
    if (error.status === 404) {
      return false;
    }

    return failureCount < 2;
  },
});
```

Important: the error type and HTTP status must be handled consistently by your application. TanStack Query's client-side default retry count is three, while server-side retries default to zero in v5.

![](https://www.google.com/s2/favicons?domain=https://tanstack.dev\&sz=32)

TanStack Query React Docs

+1

# 14. Query Cancellation

TanStack Query provides an `AbortSignal` to query functions.

You should pass it to APIs that support cancellation.

JavaScript

```
const fetchUsers = async ({ signal }) => {
  const response = await fetch("/api/users", {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};
```

Usage:

JavaScript

```
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});
```

When the query becomes obsolete or inactive, TanStack Query can abort the signal. Whether the underlying request is actually cancelled depends on whether your query function consumes the signal.

![](https://www.google.com/s2/favicons?domain=https://old.tanstack.com\&sz=32)

TanStack Query React Docs

+1

# 15. Cancellation With Multiple Requests

For a request with multiple dependent calls:

JavaScript

```
const fetchUserDashboard = async ({ signal }) => {
  const userResponse = await fetch("/api/user", {
    signal,
  });

  if (!userResponse.ok) {
    throw new Error("Failed to fetch user");
  }

  const user = await userResponse.json();

  const ordersResponse = await fetch("/api/orders", {
    signal,
  });

  if (!ordersResponse.ok) {
    throw new Error("Failed to fetch orders");
  }

  const orders = await ordersResponse.json();

  return {
    user,
    orders,
  };
};
```

Pass the same signal to each request.

```
Query cancelled
      ↓
AbortSignal becomes aborted
      ↓
User request cancelled
      ↓
Orders request cancelled
```

This avoids allowing the request chain to continue when its result is no longer needed.

# 16. Manual Cancellation

You can cancel queries through the `QueryClient`.

JavaScript

```
const queryClient = useQueryClient();

const cancelUsers = () => {
  queryClient.cancelQueries({
    queryKey: ["users"],
  });
};
```

Example:

JavaScript

```
<button onClick={cancelUsers}>
  Cancel request
</button>
```

Cancellation behavior depends on whether the query function consumes the signal and how the request library handles aborting.

# 17. Query Invalidation

Invalidation tells TanStack Query that cached data should be considered stale.

JavaScript

```
const queryClient = useQueryClient();

queryClient.invalidateQueries({
  queryKey: ["users"],
});
```

This is commonly used after a successful mutation:

```
Create user
    ↓
Mutation succeeds
    ↓
Invalidate ["users"]
    ↓
Users query refetches when appropriate
```

Invalidation is not the same as manually deleting the cache.

It marks matching queries as stale and may trigger refetching for active queries.

# 18. `refetch` vs `invalidateQueries`

|
Method

|

Purpose

|
| --- | --- |
|

`refetch()`

|

Manually refetch the current query

|
|

`invalidateQueries()`

|

Mark matching cached queries stale and refetch according to query behavior

|
|

`resetQueries()`

|

Reset matching queries to their initial state

|
|

`removeQueries()`

|

Remove matching inactive queries from the cache

|

Example:

JavaScript

```
const { refetch } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});
```

JavaScript

```
<button onClick={() => refetch()}>
  Refresh
</button>
```

Use invalidation when a mutation changes data that may be used by multiple components.

# 19. Mutations

Queries are usually for reading data.

Mutations are for operations such as:

* `POST`

* `PUT`

* `PATCH`

* `DELETE`

Example API function:

JavaScript

```
const createUser = async (user) => {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  return response.json();
};
```

Mutation:

JavaScript

```
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

const CreateUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });

  return (
    <button
      disabled={mutation.isPending}
      onClick={() =>
        mutation.mutate({
          name: "Pranay",
        })
      }
    >
      {mutation.isPending ? "Creating..." : "Create user"}
    </button>
  );
};
```

Mutation states include:

```
idle
pending
success
error
```

# 20. `mutate` vs `mutateAsync`

## `mutate`

JavaScript

```
mutation.mutate(user);
```

Useful when you want to trigger the operation and handle lifecycle callbacks.

## `mutateAsync`

JavaScript

```
try {
  const result = await mutation.mutateAsync(user);
  console.log(result);
} catch (error) {
  console.error(error);
}
```

Useful when you need to await the result in an async function.

```
mutate
   ↓
Trigger operation

mutateAsync
   ↓
Returns a Promise
   ↓
await result
```

# 21. Mutation Lifecycle Callbacks

JavaScript

```
const mutation = useMutation({
  mutationFn: createUser,

  onMutate: (variables) => {
    // Before mutation starts
  },

  onSuccess: (data, variables) => {
    // Mutation succeeded
  },

  onError: (error, variables, context) => {
    // Mutation failed
  },

  onSettled: () => {
    // Runs after success or error
  },
});
```

A typical pattern:

JavaScript

```
const mutation = useMutation({
  mutationFn: updateUser,

  onSettled: () => {
    queryClient.invalidateQueries({
      queryKey: ["users"],
    });
  },
});
```

`onSettled` is useful when the cache should be synchronized regardless of whether the mutation succeeds or fails.

# 22. Updating Cached Data

Instead of refetching after every operation, you can update the cache directly.

JavaScript

```
queryClient.setQueryData(
  ["users", userId],
  (oldUser) => ({
    ...oldUser,
    name: "Updated Name",
  }),
);
```

This is useful when you already know the exact new data.

### Refetch approach

```
Mutation succeeds
      ↓
Invalidate query
      ↓
Fetch from server
      ↓
Update cache
```

### Direct cache update

```
Mutation succeeds
      ↓
Update cache directly
      ↓
UI updates immediately
```

Direct cache updates require careful handling because the cache must remain consistent with the server.

# 23. Optimistic Updates

An optimistic update updates the UI before the server confirms success.

Example:

```
User clicks Like
      ↓
Immediately show liked state
      ↓
Send request
      ↓
Success → Keep change
Failure → Roll back
```

This makes interactions feel faster but requires rollback logic.

# 24. Optimistic Update Example

JavaScript

```
const mutation = useMutation({
  mutationFn: updateTodo,

  onMutate: async (updatedTodo) => {
    await queryClient.cancelQueries({
      queryKey: ["todos"],
    });

    const previousTodos = queryClient.getQueryData([
      "todos",
    ]);

    queryClient.setQueryData(
      ["todos"],
      (oldTodos = []) =>
        oldTodos.map((todo) =>
          todo.id === updatedTodo.id
            ? { ...todo, ...updatedTodo }
            : todo,
        ),
    );

    return {
      previousTodos,
    };
  },

  onError: (error, variables, context) => {
    queryClient.setQueryData(
      ["todos"],
      context.previousTodos,
    );
  },

  onSettled: () => {
    queryClient.invalidateQueries({
      queryKey: ["todos"],
    });
  },
});
```

### Why cancel existing queries?

A background refetch could overwrite your optimistic update.

```
Optimistic update
      +
Background refetch
      ↓
Possible cache conflict
```

Cancelling the relevant query before updating helps avoid that conflict.

# 25. Pagination

Pagination means loading data in separate pages.

Example API:

```
GET /api/products?page=1&limit=10
GET /api/products?page=2&limit=10
GET /api/products?page=3&limit=10
```

Use the page number in the query key:

JavaScript

```
const {
  data,
  isPending,
} = useQuery({
  queryKey: ["products", page],
  queryFn: () => fetchProducts(page),
});
```

TanStack Query treats each page as a distinct query because the page number is part of the key.

![](https://www.google.com/s2/favicons?domain=https://tanstack.dev\&sz=32)

TanStack Query React Docs

+1

# 26. Paginated API Function

JavaScript

```
const fetchProducts = async (page) => {
  const response = await fetch(
    `/api/products?page=${page}&limit=10`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
};
```

Example response:

JSON

```
{
  "items": [
    {
      "id": 1,
      "name": "Product 1"
    }
  ],
  "page": 1,
```

## 27. Paginated Query With `hasMore`

Continuing from the paginated API function.

Your API response should ideally tell the frontend whether more pages are available.

JSON

```
{
  "items": [
    {
      "id": 1,
      "name": "Product 1"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "hasMore": true
}
```

The frontend can use `hasMore` to disable the Next button when no more pages exist.

## 28. Basic Paginated Query

TypeScript

```
import { useState } from "react";
import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

const fetchProducts = async (page: number) => {
  const response = await fetch(
    `/api/products?page=${page}&limit=10`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
};

export default function Products() {
  const [page, setPage] = useState(1);

  const {
    data,
    error,
    isPending,
    isFetching,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["products", page],
    queryFn: () => fetchProducts(page),
    placeholderData: keepPreviousData,
  });

  if (isPending) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <>
      <h2>Products</h2>

      {data.items.map((product) => (
        <p key={product.id}>
          {product.name}
        </p>
      ))}

      {isFetching && <p>Fetching...</p>}

      <p>Page: {page}</p>

      <button
        disabled={page === 1 || isFetching}
        onClick={() => setPage((prev) => prev - 1)}
      >
        Previous
      </button>

      <button
        disabled={
          isPlaceholderData ||
          !data.hasMore ||
          isFetching
        }
        onClick={() => setPage((prev) => prev + 1)}
      >
        Next
      </button>
    </>
  );
}
```

### Why `isPlaceholderData`?

When you move to page 2:

1. The query key changes.

2. Page 2 is fetched.

3. Page 1's data is temporarily displayed.

4. `isPlaceholderData` becomes `true`.

5. Page 2 arrives.

6. Page 2 replaces the placeholder data.

The Next button should not blindly advance based on information from the previous page. TanStack Query's official pagination guide uses `keepPreviousData` and `isPlaceholderData` for this purpose.

![](https://www.google.com/s2/favicons?domain=https://tanstack.com\&sz=32)

TanStack Query React Docs

+1

## 29. `placeholderData` vs `initialData`

These options have different purposes.

|
Option

|

Purpose

|
| --- | --- |
|

`initialData`

|

Provides initial data and persists it in the query cache

|
|

`placeholderData`

|

Temporarily displays data while the query is pending

|
|

`keepPreviousData`

|

Helper function for retaining the previous query result through `placeholderData`

|

TypeScript

```
useQuery({
  queryKey: ["products", page],
  queryFn: () => fetchProducts(page),
  placeholderData: keepPreviousData,
});
```

`placeholderData` is not persisted as the actual query result in the cache. `initialData`, on the other hand, is persisted.

![](https://www.google.com/s2/favicons?domain=https://tanstack.dev\&sz=32)

TanStack Query React Docs

+1

## 30. Page Number vs Cursor Pagination

There are two common pagination approaches.

### Page-based

```
GET /products?page=1
GET /products?page=2
GET /products?page=3
```

The client calculates or increments the page number.

### Cursor-based

```
GET /products?cursor=abc
GET /products?cursor=xyz
GET /products?cursor=pqr
```

The server returns the cursor for the next page.

JSON

```
{
  "items": [],
  "nextCursor": "xyz"
}
```

### Comparison

|
Page-based

|

Cursor-based

|
| --- | --- |
|

Simple to implement

|

Better for changing datasets

|
|

Easy to jump to a page

|

Usually sequential navigation

|
|

Can duplicate/skip records when data changes

|

Cursor can represent a stable position

|
|

Often used with page numbers

|

Often used with feeds and infinite scroll

|

The pagination approach should match the API design.

# 31. Infinite Queries

Use `useInfiniteQuery` when the user progressively loads more data.

Typical examples:

* Social media feeds

* Product catalogs

* Activity feeds

* Comments

* Chat history

* Infinite scrolling

* Load More buttons

Unlike a normal query, infinite query data has this structure:

TypeScript

```
{
  pages: [],
  pageParams: [],
}
```

TanStack Query v5 requires `initialPageParam` and uses `getNextPageParam` to calculate the next page parameter.

![](https://www.google.com/s2/favicons?domain=https://tanstack.com\&sz=32)

TanStack Query React Docs

+1

## 32. Infinite Query API

Assume the server returns:

JSON

```
{
  "items": [
    {
      "id": 1,
      "name": "Product 1"
    }
  ],
  "nextCursor": 10
}
```

The next request should use the returned cursor:

```
Request 1: cursor = 0
Request 2: cursor = 10
Request 3: cursor = 20
```

API function:

TypeScript

```
type ProductsPage = {
  items: {
    id: number;
    name: string;
  }[];
  nextCursor: number | null;
};

const fetchProducts = async ({
  pageParam,
  signal,
}: {
  pageParam: number;
  signal: AbortSignal;
}): Promise<ProductsPage> => {
  const response = await fetch(
    `/api/products?cursor=${pageParam}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
};
```

## 33. `useInfiniteQuery` Setup

TypeScript

```
import { useInfiniteQuery } from "@tanstack/react-query";

const Products = () => {
  const query = useInfiniteQuery({
    queryKey: ["products"],

    queryFn: fetchProducts,

    initialPageParam: 0,

    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor ?? undefined;
    },
  });

  return null;
};
```

### How `getNextPageParam` works

```
First request
pageParam = 0
      ↓
Server returns nextCursor = 10
      ↓
getNextPageParam() returns 10
      ↓
Second request
pageParam = 10
      ↓
Server returns nextCursor = 20
```

When `getNextPageParam` returns `null` or `undefined`, TanStack Query considers that there is no next page.

![](https://www.google.com/s2/favicons?domain=https://tanstack.com\&sz=32)

TanStack Query React Docs

+1

## 34. Complete Infinite Query Component

TypeScript

```
import {
  useInfiniteQuery,
} from "@tanstack/react-query";

const Products = () => {
  const {
    data,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["products"],

    queryFn: fetchProducts,

    initialPageParam: 0,

    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor ?? undefined;
    },
  });

  if (isPending) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <>
      {data.pages.map((page, pageIndex) => (
        <div key={pageIndex}>
          {page.items.map((product) => (
            <p key={product.id}>
              {product.name}
            </p>
          ))}
        </div>
      ))}

      <button
        disabled={
          !hasNextPage ||
          isFetchingNextPage
        }
        onClick={() => fetchNextPage()}
      >
        {isFetchingNextPage
          ? "Loading..."
          : hasNextPage
            ? "Load More"
            : "No more products"}
      </button>
    </>
  );
};
```

## 35. Understanding `data.pages`

The result is not a simple array:

TypeScript

```
data = {
  pages: [
    {
      items: [/* page 1 */],
      nextCursor: 10,
    },
    {
      items: [/* page 2 */],
      nextCursor: 20,
    },
  ],

  pageParams: [0, 10],
};
```

To render every item:

TypeScript

```
data.pages.map((page) => (
  page.items.map((product) => (
    <p key={product.id}>
      {product.name}
    </p>
  ))
))
```

A more convenient approach is flattening the pages:

TypeScript

```
const products =
  data?.pages.flatMap((page) => page.items) ?? [];
```

Then:

TypeScript

```
{products.map((product) => (
  <p key={product.id}>{product.name}</p>
))}
```

### Important distinction

```
useQuery
    ↓
data = one response

useInfiniteQuery
    ↓
data.pages = multiple responses
```

# 36. Infinite Query State Properties

|
Property

|

Purpose

|
| --- | --- |
|

`fetchNextPage`

|

Loads the next page

|
|

`hasNextPage`

|

Indicates whether another page exists

|
|

`isFetchingNextPage`

|

Indicates that the next page is loading

|
|

`fetchPreviousPage`

|

Loads the previous page

|
|

`hasPreviousPage`

|

Indicates whether a previous page exists

|
|

`isFetchingPreviousPage`

|

Indicates that the previous page is loading

|
|

`data.pages`

|

Contains all loaded pages

|
|

`data.pageParams`

|

Contains the parameters used for each page

|

The separate `isFetchingNextPage` state allows you to distinguish loading more items from a background refetch.

![](https://www.google.com/s2/favicons?domain=https://tanstack.com\&sz=32)

TanStack Query React Docs

# 37. Infinite Scroll With `IntersectionObserver`

A browser can detect when an element becomes visible using `IntersectionObserver`.

We place a sentinel at the end of the list:

```
Product 1
Product 2
Product 3
Product 4
Product 5
      ↓
  Sentinel
```

When the sentinel becomes visible:

```
Sentinel visible
      ↓
Check hasNextPage
      ↓
Check !isFetchingNextPage
      ↓
fetchNextPage()
```

## 38. Complete Browser Infinite Scroll

TypeScript

```
import {
  useEffect,
  useRef,
} from "react";

import {
  useInfiniteQuery,
} from "@tanstack/react-query";

const Products = () => {
  const loadMoreRef = useRef<HTMLDivElement | null>(
    null,
  );

  const {
    data,
    error,
    isPending,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products"],

    queryFn: fetchProducts,

    initialPageParam: 0,

    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor ?? undefined;
    },
  });

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible =
          entries[0]?.isIntersecting;

        if (
          isVisible &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <>
      {data.pages.map((page, pageIndex) => (
        <div key={pageIndex}>
          {page.items.map((product) => (
            <p key={product.id}>
              {product.name}
            </p>
          ))}
        </div>
      ))}

      <div ref={loadMoreRef}>
        {isFetchingNextPage
          ? "Loading more..."
          : hasNextPage
            ? "Scroll to load more"
            : "No more products"}
      </div>
    </>
  );
};
```

### Why disconnect the observer?

The cleanup function:

TypeScript

```
return () => {
  observer.disconnect();
};
```

prevents the observer from continuing to observe the old element after the component unmounts or the Effect is recreated.

# 39. Preventing Duplicate Infinite Requests

The observer can fire multiple times.

For example:

```
Sentinel visible
      ↓
fetchNextPage()
      ↓
Sentinel still visible
      ↓
Observer fires again
```

Use a guard:

TypeScript

```
if (
  isVisible &&
  hasNextPage &&
  !isFetchingNextPage
) {
  fetchNextPage();
}
```

The condition ensures:

* There is another page.

* A next-page request isn't already running.

Infinite queries use one cache entry, and simultaneous fetches require care because concurrent operations can potentially overwrite data.

![](https://www.google.com/s2/favicons?domain=https://tanstack.com\&sz=32)

TanStack Query React Docs

# 40. React Native Infinite Scroll

React Native does not use the browser's `IntersectionObserver` in the same way.

For a `FlatList`, use `onEndReached`.

TypeScript

```
import { FlatList, Text } from "react-native";

const products =
  data?.pages.flatMap((page) => page.items) ?? [];

return (
  <FlatList
    data={products}

    keyExtractor={(item) =>
      String(item.id)
    }

    renderItem={({ item }) => (
      <Text>{item.name}</Text>
    )}

    onEndReached={() => {
      if (
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    }}

    onEndReachedThreshold={0.5}
  />
);
```

### `onEndReachedThreshold`

TypeScript

```
onEndReachedThreshold={0.5}
```

This tells `FlatList` approximately how close to the end it should be before triggering the callback. Tune this value according to the size of your items and the desired loading experience.

# 41. React Native Loading Footer

Use `ListFooterComponent` to show a loading indicator at the bottom.

TypeScript

```
import {
  ActivityIndicator,
  FlatList,
  Text,
} from "react-native";

const Footer = () => {
  if (isFetchingNextPage) {
    return <ActivityIndicator />;
  }

  if (!hasNextPage) {
    return <Text>No more products</Text>;
  }

  return null;
};
```

TypeScript

```
<FlatList
  data={products}
  renderItem={({ item }) => (
    <Text>{item.name}</Text>
  )}
  ListFooterComponent={Footer}
  onEndReached={() => {
    if (
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }}
/>
```

# 42. Infinite Query With Page Numbers

A cursor is not mandatory.

If the API uses page numbers:

TypeScript

```
const fetchProducts = async ({
  pageParam,
  signal,
}) => {
  const response = await fetch(
    `/api/products?page=${pageParam}&limit=10`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return response.json();
};
```

TypeScript

```
useInfiniteQuery({
  queryKey: ["products"],

  queryFn: fetchProducts,

  initialPageParam: 1,

  getNextPageParam: (
    lastPage,
    allPages,
    lastPageParam,
  ) => {
    if (!lastPage.hasMore) {
      return undefined;
    }

    return lastPageParam + 1;
  },
});
```

The third argument, `lastPageParam`, is useful because the next page can be calculated from the parameter used for the previous page.

# 43. Infinite Query Refetching

An important behavior:

When an infinite query becomes stale and needs to refetch, TanStack Query refetches the loaded pages sequentially, beginning with the first page.

Why?

```
Page 1 → Page 2 → Page 3
```

If the dataset has changed, reusing old cursors blindly can cause:

* Duplicate records

* Skipped records

* Invalid cursors

Sequential refetching helps avoid using stale cursor positions.

![](https://www.google.com/s2/favicons?domain=https://tanstack.com\&sz=32)

TanStack Query React Docs

# 44. Limiting Stored Pages With `maxPages`

An infinite feed can grow significantly:

```
Page 1
Page 2
Page 3
...
Page 100
```

Keeping every page can increase memory usage and refetch work.

TanStack Query supports:

TypeScript

```
useInfiniteQuery({
  queryKey: ["products"],

  queryFn: fetchProducts,

  initialPageParam: 0,

  getNextPageParam: (lastPage) => {
    return lastPage.nextCursor ?? undefined;
  },

  getPreviousPageParam: (
    firstPage,
  ) => {
    return firstPage.previousCursor ?? undefined;
  },

  maxPages: 3,
});
```

Only a limited number of pages are retained.

When using `maxPages`, configure the necessary next and previous page parameters according to your navigation requirements.

![](https://www.google.com/s2/favicons?domain=https://tanstack.com\&sz=32)

TanStack Query React Docs

+1

# 45. Manual Cache Updates for Infinite Queries

Infinite query data has a specific structure:

TypeScript

```
{
  pages: [...],
  pageParams: [...],
}
```

When updating the cache manually, preserve both arrays.

### Remove the first page

TypeScript

```
queryClient.setQueryData(
  ["products"],
  (data) => {
    if (!data) {
      return data;
    }

    return {
      pages: data.pages.slice(1),
      pageParams: data.pageParams.slice(1),
    };
  },
);
```

### Why preserve `pageParams`?

The two arrays correspond to each other:

```
pages[0]     ↔ pageParams[0]
pages[1]     ↔ pageParams[1]
pages[2]     ↔ pageParams[2]
```

If you modify `pages` without making the corresponding change to `pageParams`, the infinite query's structure can become inconsistent.

![](https://www.google.com/s2/favicons?domain=https://tanstack.com\&sz=32)

TanStack Query React Docs

# 46. Updating an Item Inside Infinite Data

Suppose a user updates a product's name.

TypeScript

```
queryClient.setQueryData(
  ["products"],
  (data) => {
    if (!data) {
      return data;
    }

    return {
      ...data,

      pages: data.pages.map((page) => ({
        ...page,

        items: page.items.map((product) =>
          product.id === updatedProduct.id
            ? {
                ...product,
                ...updatedProduct,
              }
            : product,
        ),
      })),
    };
  },
);
```

Notice:

* The top-level object is preserved.

* Every page is mapped.

* Every item is mapped.

* `pageParams` remains unchanged.

Afterward, you may still invalidate the query if the server could have changed other related fields.

# 47. Query Cancellation in Infinite Queries

Use the supplied `signal`:

TypeScript

```
const fetchProducts = async ({
  pageParam,
  signal,
}) => {
  const response = await fetch(
    `/api/products?cursor=${pageParam}`,
    {
      signal,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
};
```

This allows TanStack Query to communicate cancellation to the underlying `fetch` request.

```
Infinite query request
      ↓
Request becomes obsolete
      ↓
AbortSignal triggered
      ↓
fetch() can abort
```

The query function must consume the signal for the underlying fetch to be cancelled.

![](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub

# 48. Prefetching the Next Page

You can prefetch data before the user needs it.

For normal queries:

TypeScript

```
await queryClient.prefetchQuery({
  queryKey: ["products", 2],
  queryFn: () => fetchProducts(2),
});
```

For infinite queries, use the appropriate infinite-query prefetch API and preserve the required infinite data structure.

Prefetching can be useful when:

* The user is near the end of a page.

* You know the next page will probably be needed.

* The user hovers over a navigation link.

* You want to reduce perceived loading time.

Do not prefetch unlimited pages unnecessarily, especially on mobile networks.

# 49. Complete Feature Decision Tree

```
Do you need to fetch data?
        │
        ▼
Is it one logical result?
        │
   ┌────┴────┐
   │         │
  Yes        No, pages
   │         │
useQuery  useInfiniteQuery
   │         │
   ▼         ▼
Query key  initialPageParam
queryFn    getNextPageParam
   │         │
   └────┬────┘
        ▼
Does data change on server?
        │
        ▼
    useMutation
        │
        ▼
Update cache or invalidate
        │
        ▼
Need more pages?
        │
        ▼
fetchNextPage()
```

# 50. Final Revision Notes

### Paginated `useQuery`

TypeScript

```
useQuery({
  queryKey: ["products", page],
  queryFn: () => fetchProducts(page),
  placeholderData: keepPreviousData,
});
```

* Each page is a separate query key.

* `keepPreviousData` prevents abrupt loading transitions.

* `isPlaceholderData` indicates that previous data is being displayed.

### Infinite `useInfiniteQuery`

TypeScript

```
useInfiniteQuery({
  queryKey: ["products"],
  queryFn: fetchProducts,
  initialPageParam: 0,
  getNextPageParam: (lastPage) => {
    return lastPage.nextCursor ?? undefined;
  },
});
```

* Data is stored in `pages`.

* `fetchNextPage()` loads more data.

* `hasNextPage` indicates whether another page exists.

* `isFetchingNextPage` identifies next-page loading.

* `maxPages` limits retained pages.

### Infinite scroll

```
Sentinel visible
      ↓
hasNextPage?
      ↓
!isFetchingNextPage?
      ↓
fetchNextPage()
```

### One-line interview revision

> Paginated queries use the page or cursor in the query key, while infinite queries maintain a collection of pages using `initialPageParam` and `getNextPageParam`; infinite scrolling triggers `fetchNextPage` when a sentinel or list boundary becomes visible, with guards against duplicate requests and optional page limits for memory and refetch performance.

Official references:

* Paginated queries 

* Infinite queries 

* Query cancellation 

* Mutations

