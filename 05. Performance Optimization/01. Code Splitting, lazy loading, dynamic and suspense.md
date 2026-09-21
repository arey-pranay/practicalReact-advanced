# Code Splitting, Lazy Loading & Suspense — React + Next.js

These concepts are closely related, but they solve different parts of the performance problem.

> Code splitting decides how JavaScript is divided. Lazy loading decides when a piece of code is loaded. Suspense decides what UI to display while something is not ready.

# 1. Why Do We Need Code Splitting?

Imagine your application has these features:

```
Your application
├── Dashboard
├── Analytics
├── Rich Text Editor
├── Payment Modal
├── 3D Viewer
├── Admin Panel
└── PDF Editor
```

Without code splitting, the browser might need to download a large JavaScript bundle containing code for features the user never visits.

```
Initial page load
      ↓
Download entire application JavaScript
      ↓
Parse and execute everything
      ↓
Show the page
```

This can lead to:

* Larger initial JavaScript downloads

* Slower parsing and execution

* Delayed interactivity

* Increased memory usage

* Poor performance on mobile devices

### With code splitting

```
Initial page
    ↓
Load only required JavaScript
    ↓
User opens Analytics
    ↓
Load Analytics chunk
    ↓
User opens PDF Editor
    ↓
Load PDF Editor chunk
```

The objective is not always to minimize the total JavaScript downloaded. It is to avoid downloading and executing unnecessary code too early.

# 2. Is Code Splitting Still Relevant?

## Yes, but the responsibility has changed.

Modern frameworks and bundlers automatically perform substantial code splitting.

|
Environment

|

Default behavior

|
| --- | --- |
|

React + Vite

|

Bundler supports code splitting, especially through dynamic imports

|
|

Next.js App Router

|

Splits route and client-side JavaScript automatically

|
|

Next.js Pages Router

|

Automatically splits page bundles

|
|

React Native

|

Supports bundling strategies, but web-style code splitting requires platform-specific handling

|
|

Manual Webpack setup

|

You may need to configure splitting yourself

|

Next.js automatically splits code by page and also prefetches eligible linked routes in production.

![](https://www.google.com/s2/favicons?domain=https://nextjs.org\&sz=32)

Next.js

### Important

You should still understand code splitting because you may need to:

* Split a large client component

* Delay a heavy library

* Load a modal only when opened

* Avoid loading a chart library on the initial page

* Diagnose a large JavaScript bundle

* Choose an appropriate Suspense boundary

The framework handles the mechanism; you still make architectural decisions.

# 3. Code Splitting vs Lazy Loading

These terms are related but not identical.

## Code splitting

Break the application into separate JavaScript chunks.

```
main.js
analytics.js
editor.js
admin.js
```

## Lazy loading

Load a particular chunk only when it is needed.

```
Initial load → main.js

User opens editor → editor.js
```

Dynamic imports are commonly used to request code on demand:

TypeScript

```
const module = await import("./Editor");
```

### Mental model

```
Code splitting = divide the code

Lazy loading = delay loading a divided part
```

You can code-split a module without necessarily delaying its loading—for example, a framework may preload a chunk for an upcoming route.

# 4. How Do You Identify What Should Be Lazy Loaded?

Do not automatically lazy load every component.

Use this decision process:

```
Is the component needed for the initial screen?
          │
       ┌──┴──┐
       │     │
      Yes    No
       │     │
Load it   Consider lazy loading
normally       │
               ▼
Is it expensive or rarely used?
               │
          ┌────┴────┐
          │         │
         Yes        No
          │         │
     Lazy load   Normal import
```

## Good candidates

* Large modals

* Rich text editors

* Charts and analytics dashboards

* Code editors

* PDF viewers

* Maps

* 3D/WebGL components

* Admin-only interfaces

* Components shown after user interaction

* Libraries used by only one feature

## Poor candidates

* Navigation

* Primary page heading

* Above-the-fold content

* Small frequently used components

* Components needed immediately for the main user journey

### Practical questions

Before lazy loading a component, ask:

1. Is it required to render the initial screen?

2. How large is its dependency tree?

3. How frequently is it used?

4. Can the user tolerate a loading state?

5. Will loading it later actually improve the initial experience?

6. Can the loading state be designed clearly?

# 5. React `lazy()`

React provides `lazy()` for loading a component through a dynamic import.

TypeScript

```
import { lazy } from "react";

const HeavyComponent = lazy(
  () => import("./HeavyComponent"),
);
```

The import is not evaluated as a normal static import at the beginning of the application.

React loads the component when it is rendered and the module is needed.

### Normal import

TypeScript

```
import HeavyComponent from "./HeavyComponent";
```

Conceptually:

```
Module is included in the normal dependency graph.
```

### Lazy import

TypeScript

```
const HeavyComponent = lazy(
  () => import("./HeavyComponent"),
);
```

Conceptually:

```
Component code is requested when React needs to render it.
```

`lazy()` expects the dynamically imported module to resolve to a module whose `.default` export is a valid React component.

# 6. React `lazy()` Requires `Suspense`

A lazy component may not be ready immediately.

Therefore, React needs a fallback UI.

TypeScript

```
import { lazy, Suspense } from "react";

const HeavyComponent = lazy(
  () => import("./HeavyComponent"),
);

export default function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Rendering flow

```
React tries to render HeavyComponent
                ↓
JavaScript module is not ready
                ↓
Suspense displays fallback
                ↓
Module finishes loading
                ↓
React renders HeavyComponent
```

### Important distinction

`Suspense` does not itself perform the dynamic import.

```
lazy()     → loads the component
Suspense   → displays fallback while it is unavailable
```

# 7. Conditional Lazy Loading

This is useful for components that are not needed until a user interaction.

TypeScript

```
import {
  lazy,
  Suspense,
  useState,
} from "react";

const SettingsModal = lazy(
  () => import("./SettingsModal"),
);

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Open Settings
      </button>

      {open && (
        <Suspense fallback={<p>Loading modal...</p>}>
          <SettingsModal
            onClose={() => setOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}
```

### What happens?

```
Initial render
    ↓
SettingsModal is not rendered
    ↓
Modal code does not need to be requested
    ↓
User clicks Open Settings
    ↓
SettingsModal renders
    ↓
Chunk is requested
    ↓
Fallback is displayed
    ↓
Modal appears
```

This is a good pattern when the modal contains substantial code or dependencies.

# 8. `Suspense` Is More Than a Lazy Loading Feature

Suspense is a mechanism for displaying fallback UI while React waits for something that suspends rendering.

Common uses include:

* Lazy-loaded components

* Suspense-enabled data fetching

* Streaming UI

* Async server-rendered content

* Loading independent parts of a page

TypeScript

```
<Suspense fallback={<LoadingSkeleton />}>
  <Analytics />
</Suspense>
```

### Suspense does not automatically handle every async function

This will not automatically suspend merely because it returns a Promise:

TypeScript

```
function Component() {
  const data = fetch("/api/data");

  return <div>Data</div>;
}
```

Suspense must be integrated with a supported data-loading mechanism or framework feature.

# 9. Choosing the Correct Suspense Boundary

The location of the boundary affects the user experience.

## Boundary around the whole page

TypeScript

```
<Suspense fallback={<FullPageLoader />}>
  <Dashboard />
</Suspense>
```

If `Dashboard` suspends, the entire boundary displays the fallback.

## Granular boundaries

TypeScript

```
<>
  <Header />

  <Suspense fallback={<ChartSkeleton />}>
    <AnalyticsChart />
  </Suspense>

  <Suspense fallback={<CommentsSkeleton />}>
    <Comments />
  </Suspense>
</>
```

Now each section can load independently.

```
Header              → available
Analytics Chart     → loading
Comments            → loading
```

### Rule of thumb

Place a Suspense boundary around a section that can independently load without blocking the rest of the experience.

Avoid unnecessarily wrapping the entire application in one generic loading screen.

# 10. Next.js: Does It Handle This Automatically?

## Next.js App Router

Next.js automatically handles significant parts of:

* Route-level code splitting

* Server Component rendering

* Streaming

* Route prefetching

* Loading UI through `loading.tsx`

Next.js supports streaming through `loading.tsx` and component-level React `<Suspense>` boundaries.

![](https://www.google.com/s2/favicons?domain=https://nextjs.org\&sz=32)

Next.js

However, Next.js does not automatically decide that every large client component should load only after a specific user action. You may still need to use dynamic imports.

# 11. Next.js `next/dynamic`

In Next.js, `next/dynamic` provides a convenient abstraction for dynamically importing components.

TypeScript

```
"use client";

import dynamic from "next/dynamic";

const AnalyticsChart = dynamic(
  () => import("./AnalyticsChart"),
);
```

Use it like a normal component:

TypeScript

```
export default function Dashboard() {
  return <AnalyticsChart />;
}
```

You can provide a loading component:

TypeScript

```
const AnalyticsChart = dynamic(
  () => import("./AnalyticsChart"),
  {
    loading: () => <p>Loading chart...</p>,
  },
);
```

Next.js documents dynamic imports as a way to split and defer component code, including components that are not required during initial rendering.

![](https://www.google.com/s2/favicons?domain=https://nextjs.org\&sz=32)

Next.js

# 12. `next/dynamic` With `ssr: false`

Some components depend on browser-only APIs:

* `window`

* `document`

* WebGL

* Browser storage

* Certain charting libraries

* Browser-specific third-party libraries

For a client-only component:

TypeScript

```
"use client";

import dynamic from "next/dynamic";

const BrowserEditor = dynamic(
  () => import("./BrowserEditor"),
  {
    ssr: false,
  },
);
```

### Meaning

```
ssr: false
    ↓
Do not render this dynamically imported component
on the server.
```

Do not use `ssr: false` automatically.

Use it when the component genuinely cannot render on the server. Disabling SSR can negatively affect initial content visibility and SEO for components that could otherwise be server-rendered.

Also, in the App Router, `ssr: false` must be used from a Client Component.

# 13. `next/dynamic` vs React `lazy`

|
React `lazy()`

|

Next.js `dynamic()`

|
| --- | --- |
|

Built into React

|

Next.js-specific helper

|
|

Used with `Suspense`

|

Supports Next.js loading configuration

|
|

General React applications

|

Next.js applications

|
|

Does not provide Next.js-specific SSR options

|

Supports options such as `ssr: false`

|
|

Common for client-side React code splitting

|

Integrates with Next.js rendering behavior

|

### React

TypeScript

```
const Chart = lazy(() => import("./Chart"));

<Suspense fallback={<p>Loading...</p>}>
  <Chart />
</Suspense>
```

### Next.js

TypeScript

```
const Chart = dynamic(
  () => import("./Chart"),
  {
    loading: () => <p>Loading...</p>,
  },
);
```

For a Next.js application, prefer `next/dynamic` when you need Next.js-specific behavior. Use React `lazy()` when you specifically want React's lazy/Suspense pattern.

# 14. Next.js `loading.tsx`

Next.js App Router supports a special file:

```
app/
├── dashboard/
│   ├── page.tsx
│   └── loading.tsx
```

TypeScript

```
// app/dashboard/loading.tsx

export default function Loading() {
  return <p>Loading dashboard...</p>;
}
```

This creates a loading UI for the route segment.

Conceptually:

```
Navigate to /dashboard
          ↓
Dashboard content is not ready
          ↓
Next.js displays loading.tsx
          ↓
Dashboard content becomes available
```

`loading.tsx` is built on React Suspense and is useful for route-level streaming and fallback UI.

![](https://www.google.com/s2/favicons?domain=https://nextjs.org\&sz=32)

Next.js

### `loading.tsx` vs component Suspense

|
`loading.tsx`

|

`<Suspense>`

|
| --- | --- |
|

Route-segment-level loading UI

|

Component-level loading UI

|
|

Convention provided by Next.js

|

Explicitly placed in your component tree

|
|

Useful for navigation

|

Useful for granular sections

|
|

Automatically creates a Suspense boundary

|

You control the boundary

|

# 15. Next.js Server Components and Client Components

This is particularly important in the App Router.

By default, files under the App Router are Server Components unless marked with:

TypeScript

```
"use client";
```

Server Components do not send their component JavaScript to the browser in the same way Client Components do.

### Example

TypeScript

```
// app/dashboard/page.tsx

import Chart from "./Chart";

export default async function Dashboard() {
  const data = await fetchDashboardData();

  return (
    <>
      <h1>Dashboard</h1>
      <Chart data={data} />
    </>
  );
}
```

If `Chart` is a Server Component, its server-rendered output does not require shipping the entire component's implementation as client JavaScript.

But if `Chart` requires browser interaction:

TypeScript

```
"use client";

export default function Chart() {
  // useState, event handlers, browser APIs, etc.
}
```

Then its client-side dependency graph contributes to the browser bundle.

### Important mental model

```
Server Component
    → runs on server
    → reduces client JavaScript requirements

Client Component
    → needs browser JavaScript
    → may benefit from dynamic imports
```

Server Components reduce the amount of code that needs to run in the browser, but they do not eliminate the need to understand code splitting for Client Components.

# 16. How to Approach a Real Project

Suppose you are building a product dashboard.

```
Dashboard
├── Header
├── Stats Cards
├── Sales Chart
├── Rich Text Notes
├── Export PDF Modal
└── 3D Product Preview
```

## Step 1: Identify the critical path

Ask:

> What must the user see and interact with immediately?

Likely:

```
Header
Stats Cards
Basic Dashboard Layout
```

Load those normally.

## Step 2: Identify expensive or uncommon features

```
Rich Text Notes
Export PDF Modal
3D Product Preview
```

These are potential lazy-loading candidates.

## Step 3: Measure before changing

Check:

* Production bundle size

* JavaScript network requests

* Lighthouse performance

* Chrome Performance panel

* Bundle analyzer output

* Component usage frequency

Do not assume a component is expensive just because it looks complicated.

## Step 4: Choose the loading trigger

|
Requirement

|

Approach

|
| --- | --- |
|

Needed on initial render

|

Normal import

|
|

Needed when navigating to a route

|

Framework route splitting

|
|

Needed only after clicking a button

|

Conditional dynamic import

|
|

Heavy client-only widget

|

`next/dynamic`, potentially `ssr: false`

|
|

Independent async section

|

`Suspense` boundary

|
|

Route-level loading

|

`loading.tsx`

|

## Step 5: Design the fallback

A fallback should match the expected content:

TypeScript

```
<Suspense fallback={<ChartSkeleton />}>
  <Chart />
</Suspense>
```

A skeleton is often more useful than:

TypeScript

```
<p>Loading...</p>
```

because it preserves the layout and reduces visual shifting.

# 17. Example: Lazy Loading a Heavy Editor

TypeScript

```
"use client";

import {
  lazy,
  Suspense,
  useState,
} from "react";

const Editor = lazy(
  () => import("./Editor"),
);

export default function DocumentPage() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <>
      <h1>Document</h1>

      <p>Document content goes here.</p>

      <button
        onClick={() => setShowEditor(true)}
      >
        Edit Document
      </button>

      {showEditor && (
        <Suspense fallback={<EditorSkeleton />}>
          <Editor />
        </Suspense>
      )}
    </>
  );
}

function EditorSkeleton() {
  return (
    <div>
      <p>Loading editor...</p>
    </div>
  );
}
```

### Why this approach?

* The document content is immediately available.

* The editor is not required for reading.

* The editor may have a large dependency tree.

* Code is requested only when editing begins.

* The fallback gives feedback during loading.

# 18. Lazy Loading Does Not Always Improve Performance

Lazy loading introduces a trade-off.

### Benefits

* Smaller initial JavaScript

* Less initial parsing and execution

* Faster initial interaction in some cases

* Reduced initial resource usage

### Costs

* Additional network request when the component is needed

* Possible loading delay after user interaction

* More complex loading and error states

* Potentially worse experience if the user needs the component immediately

  Without lazy loading:
  Initial load is heavier
  Component opens immediately

  With lazy loading:
  Initial load is lighter
  Component may take time to open

### Solution: Prefetching

If you know the user will probably need a component soon, you can preload it before the actual interaction.

For example, preload on hover or when the component becomes likely to be used. However, use this carefully because prefetching also consumes bandwidth.

# 19. Common Mistakes

## Mistake 1: Lazy loading everything

TypeScript

```
const Button = lazy(() => import("./Button"));
```

For a tiny, frequently used component, this can add unnecessary complexity and requests.

## Mistake 2: One giant Suspense boundary

TypeScript

```
<Suspense fallback={<FullPageLoader />}>
  <EntireApplication />
</Suspense>
```

A small delayed component could cause the entire page to display a loader.

## Mistake 3: Using `ssr: false` without a reason

It is not a universal performance switch. Use it for components that genuinely require the browser.

## Mistake 4: Forgetting error handling

A dynamic import can fail due to:

* Network problems

* Deployment changes

* Stale cached chunk references

* CDN issues

Suspense handles waiting, but an Error Boundary can handle rendering failures.

TypeScript

```
<ErrorBoundary>
  <Suspense fallback={<p>Loading...</p>}>
    <LazyComponent />
  </Suspense>
</ErrorBoundary>
```

## Mistake 5: Using loading UI without preserving layout

A generic loading message may cause content to shift when the component appears. Prefer a fallback with approximately the same dimensions as the final component.

# 20. Identifying Code Splitting in DevTools

Open Chrome DevTools.

## Network tab

Filter by:

```
JS
```

Look for multiple JavaScript files being requested.

Then:

1. Reload the page.

2. Observe initial JavaScript requests.

3. Trigger the lazy-loaded component.

4. Check whether another chunk is requested.

## Coverage tab

Chrome DevTools can show how much JavaScript was used versus unused.

This helps identify JavaScript that may be unnecessarily loaded early.

## Build analysis

For Next.js, inspect the production build and use an appropriate bundle analysis tool to identify large dependencies.

Look for:

```
Large chart library
Large editor package
Duplicate dependencies
Unexpected client-side imports
```

### Key principle

> Do not decide to lazy load from source code alone. Use the production build and runtime measurements to validate the benefit.

# 21. How the Concepts Connect

```
Large application
      ↓
Code splitting
      ↓
Separate chunks
      ↓
Lazy loading
      ↓
Load chunk when required
      ↓
Component is temporarily unavailable
      ↓
Suspense fallback
      ↓
Component renders
```

Next.js adds framework-level optimizations:

```
Next.js
├── Route-based code splitting
├── Prefetching
├── Server Components
├── Streaming
├── loading.tsx
└── next/dynamic
```

These reduce the amount of manual work, but component-level decisions are still important.

# 22. Quick Comparison

|
Feature

|

Main responsibility

|
| --- | --- |
|

Static `import`

|

Import module as part of the normal dependency graph

|
|

Dynamic `import()`

|

Load a module asynchronously

|
|

Code splitting

|

Divide code into separate chunks

|
|

`React.lazy()`

|

Create a lazy React component from a dynamic import

|
|

`<Suspense>`

|

Show fallback while a child suspends

|
|

`next/dynamic`

|

Next.js component-level dynamic import helper

|
|

`loading.tsx`

|

Next.js route-level loading UI

|
|

Server Components

|

Reduce the client-side JavaScript requirement

|
|

Error Boundary

|

Handle rendering errors, including failed lazy component rendering

|

# 23. Interview Revision

### Why do we need code splitting?

To avoid loading and executing JavaScript for features that are not needed immediately, improving initial loading and interaction performance.

### Is it relevant in Next.js?

Yes. Next.js automatically performs route-level code splitting and other optimizations, but developers still need to split large Client Components and defer rarely used features.

### What is the difference between lazy loading and code splitting?

Code splitting divides code into separate chunks. Lazy loading delays requesting a chunk until it is needed.

### Why is Suspense needed with `React.lazy()`?

The lazy component may not be available during rendering, so Suspense provides fallback UI until the module loads.

### What is the difference between `loading.tsx` and Suspense?

`loading.tsx` provides Next.js route-segment loading UI, while `<Suspense>` lets you define more granular component-level boundaries.

### One-line revision

> Code splitting divides JavaScript into independently loadable chunks, lazy loading delays unnecessary chunks until needed, and Suspense provides fallback UI while a component or supported async resource is unavailable; Next.js automates route-level splitting and streaming but still requires deliberate optimization of large Client Components.
