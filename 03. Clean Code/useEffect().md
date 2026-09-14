# You Might Not Need an Effect

`useEffect` is an **escape hatch** for synchronizing React with something outside React.

The key question is:

> **Is this code running because the component was displayed, or because something happened?**

If you can calculate something during render or handle it in an event handler, **you usually don't need an Effect**. 

---

## 1. What is an Effect actually for?

Effects are primarily for synchronizing with **external systems**, such as:

* Browser DOM APIs
* Network
* Third-party widgets
* External stores
* Subscriptions

```text
React state/props
       ↓
     Render
       ↓
      DOM
       ↓
   useEffect
       ↓
External system
```

Don't use an Effect simply because:

> "Something changed, so I need to do something."

First ask whether that "something" can be derived during render or handled directly by an event.

---

# 2. Derived data → calculate during render

### ❌ Unnecessary Effect

```jsx
const [firstName, setFirstName] = useState("Taylor");
const [lastName, setLastName] = useState("Swift");

const [fullName, setFullName] = useState("");

useEffect(() => {
  setFullName(firstName + " " + lastName);
}, [firstName, lastName]);
```

This causes an unnecessary sequence:

```text
firstName changes
      ↓
render
      ↓
Effect runs
      ↓
setFullName()
      ↓
render again
```

There is no reason for `fullName` to be state because it can already be derived from existing state.

### ✅ Calculate during render

```jsx
const [firstName, setFirstName] = useState("Taylor");
const [lastName, setLastName] = useState("Swift");

const fullName = firstName + " " + lastName;
```

Mental model:

```text
Existing state
     ↓
derived value
     ↓
render
```

### Rule

> **If a value can be calculated from existing props/state, don't store it as separate state.**

This avoids:

* extra render passes
* redundant state
* synchronization bugs
* state getting out of sync

---

# 3. Expensive calculations → `useMemo`

Suppose:

```jsx
const visibleTodos = getFilteredTodos(todos, filter);
```

If `getFilteredTodos()` is cheap, just calculate it during render.

```jsx
const visibleTodos = getFilteredTodos(todos, filter);
```

But if the calculation is expensive and the component frequently re-renders because of unrelated state:

```jsx
const [newTodo, setNewTodo] = useState("");
```

then you can memoize it:

```jsx
const visibleTodos = useMemo(
  () => getFilteredTodos(todos, filter),
  [todos, filter]
);
```

Now:

```text
newTodo changes
     ↓
component renders
     ↓
todos/filter unchanged
     ↓
reuse memoized result
```

Whereas:

```text
todos changes
     ↓
recalculate

filter changes
     ↓
recalculate
```

### Important

`useMemo` is **not an Effect replacement**.

It is for caching a **pure calculation during rendering**.

```text
useMemo → optimize calculation

useEffect → synchronize with external system
```

The React docs also note that the React Compiler can automatically memoize many calculations, reducing the need for manual `useMemo`. 

---

# 4. Resetting all state → use a `key`

Suppose:

```jsx
function ProfilePage({ userId }) {
  const [comment, setComment] = useState("");

  useEffect(() => {
    setComment("");
  }, [userId]);
}
```

### ❌ Problem

When `userId` changes:

```text
userId changes
     ↓
render with old comment
     ↓
DOM updated
     ↓
Effect runs
     ↓
setComment("")
     ↓
render again
```

Also, if there are many state variables/children that need resetting, you'd have to synchronize all of them.

### ✅ Use a key

```jsx
function ProfilePage({ userId }) {
  return <Profile userId={userId} key={userId} />;
}

function Profile({ userId }) {
  const [comment, setComment] = useState("");

  // ...
}
```

Now React treats:

```text
<Profile key="user1" />
```

and:

```text
<Profile key="user2" />
```

as different component instances.

Therefore:

```text
userId/key changes
       ↓
old Profile removed
       ↓
new Profile created
       ↓
state starts fresh
```

This also resets the state of its children.

### Key mental model

> **A different key means "this is a different component instance."**

This connects directly with React's **preserving/resetting state** behavior.

---

# 5. Adjusting only part of state

Sometimes you don't want to reset the entire component.

Example:

```jsx
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    setSelection(null);
  }, [items]);
}
```

### Better than Effect

The source demonstrates adjusting state during rendering:

```jsx
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  const [prevItems, setPrevItems] = useState(items);

  if (items !== prevItems) {
    setPrevItems(items);
    setSelection(null);
  }

  // ...
}
```

The important condition is:

```jsx
items !== prevItems
```

Without a condition, you'd create an infinite render loop.

React immediately retries rendering after updating the **same component's** state during render, before its children are rendered or the DOM is updated. 

### But this is not the preferred first choice

The recommended order is generally:

```text
Can I calculate it?
       ↓ yes
calculate during render

Can I reset the whole subtree?
       ↓ yes
use a key

Can I avoid storing the derived object?
       ↓ yes
store minimal state / derive the rest

Only then
       ↓
adjust state during render
```

For example, instead of storing the selected item:

```jsx
const [selection, setSelection] = useState(null);
```

store its ID:

```jsx
const [selectedId, setSelectedId] = useState(null);

const selection =
  items.find(item => item.id === selectedId) ?? null;
```

This is often cleaner because `selection` is derived from the current `items`.

---

# 6. Event-specific logic → event handler

Suppose both buttons add a product:

```jsx
function handleBuyClick() {
  addToCart(product);
}

function handleCheckoutClick() {
  addToCart(product);
  navigateTo("/checkout");
}
```

You might be tempted to detect the result of `addToCart` with an Effect:

### ❌

```jsx
useEffect(() => {
  if (product.isInCart) {
    showNotification(
      `Added ${product.name} to the shopping cart!`
    );
  }
}, [product]);
```

But the notification isn't caused by:

> "The component appeared."

It's caused by:

> **"The user clicked Buy/Checkout."**

So:

### ✅

```jsx
function buyProduct() {
  addToCart(product);
  showNotification(
    `Added ${product.name} to the shopping cart!`
  );
}

function handleBuyClick() {
  buyProduct();
}

function handleCheckoutClick() {
  buyProduct();
  navigateTo("/checkout");
}
```

### Rule

> **If the logic is caused by a specific user interaction, put it in the event handler.**

---

# 7. Event vs Effect — the important distinction

Ask:

### "Why does this code need to run?"

| Reason                              | Where?                 |
| ----------------------------------- | ---------------------- |
| Component was displayed             | `useEffect`            |
| User clicked a button               | Event handler          |
| User submitted form                 | Event handler          |
| Value can be derived                | Render                 |
| Expensive pure calculation          | `useMemo`              |
| External store changed              | `useSyncExternalStore` |
| Need to synchronize external system | `useEffect`            |

A useful mental model:

```text
                 Why does it run?
                       │
          ┌────────────┴────────────┐
          │                         │
    User interaction          Component displayed
          │                         │
          ↓                         ↓
   Event handler               useEffect
```

---

# 8. POST requests

Not all network requests belong in the same place.

### Analytics when page appears

```jsx
useEffect(() => {
  post("/analytics/event", {
    eventName: "visit_form"
  });
}, []);
```

This is appropriate because:

> The form was displayed.

### Form submission

```jsx
function handleSubmit(e) {
  e.preventDefault();

  post("/api/register", {
    firstName,
    lastName
  });
}
```

This is appropriate because:

> The user submitted the form.

So:

```text
Page displayed
     ↓
useEffect
     ↓
analytics


Submit clicked
     ↓
event handler
     ↓
POST /api/register
```

---

# 9. Avoid chains of Effects

Consider:

```jsx
useEffect(() => {
  if (card?.gold) {
    setGoldCardCount(c => c + 1);
  }
}, [card]);

useEffect(() => {
  if (goldCardCount > 3) {
    setRound(r => r + 1);
    setGoldCardCount(0);
  }
}, [goldCardCount]);

useEffect(() => {
  if (round > 5) {
    setIsGameOver(true);
  }
}, [round]);
```

This creates:

```text
setCard()
   ↓
render
   ↓
Effect
   ↓
setGoldCardCount()
   ↓
render
   ↓
Effect
   ↓
setRound()
   ↓
render
   ↓
Effect
   ↓
setIsGameOver()
   ↓
render
```

This is a **chain of state updates through Effects**.

Problems:

1. unnecessary render passes
2. difficult data flow
3. tightly coupled state
4. harder debugging
5. fragile when requirements change

---

# 10. Calculate state transitions together

Instead:

```jsx
function handlePlaceCard(nextCard) {
  if (isGameOver) {
    throw Error("Game already ended.");
  }

  setCard(nextCard);

  if (nextCard.gold) {
    if (goldCardCount < 3) {
      setGoldCardCount(goldCardCount + 1);
    } else {
      setGoldCardCount(0);
      setRound(round + 1);

      if (round === 5) {
        alert("Good game!");
      }
    }
  }
}
```

And derive:

```jsx
const isGameOver = round > 5;
```

Now the entire state transition is driven by **one event**.

```text
User places card
       ↓
handlePlaceCard()
       ↓
calculate all next state
       ↓
multiple setState calls
       ↓
React batches updates
       ↓
render
```

### State snapshot reminder

Inside an event handler:

```jsx
setRound(round + 1);
```

doesn't immediately change the local `round` variable.

If you need the next value:

```jsx
const nextRound = round + 1;
```

then use:

```jsx
setRound(nextRound);
```

---

# 11. Notifying parents about state changes

Suppose:

```jsx
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    onChange(isOn);
  }, [isOn, onChange]);
}
```

### ❌ Unnecessary Effect

The child changes state:

```text
click
 ↓
setIsOn()
 ↓
render
 ↓
Effect
 ↓
onChange()
 ↓
parent state update
 ↓
another render
```

Instead, update both during the event:

```jsx
function updateToggle(nextIsOn) {
  setIsOn(nextIsOn);
  onChange(nextIsOn);
}

function handleClick() {
  updateToggle(!isOn);
}
```

React batches these updates.

---

# 12. Even better: controlled component

You may not need local state at all.

```jsx
function Toggle({ isOn, onChange }) {
  function handleClick() {
    onChange(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      onChange(true);
    } else {
      onChange(false);
    }
  }
}
```

Now:

```text
Parent
 ├── owns isOn
 └── passes isOn + onChange
          ↓
       Toggle
```

This is **lifting state up**.

### Rule

> Whenever two components need to keep separate pieces of state synchronized, consider lifting the state to their common parent.

---

# 13. Don't pass data upward through an Effect

### ❌

```jsx
function Parent() {
  const [data, setData] = useState(null);

  return <Child onFetched={setData} />;
}

function Child({ onFetched }) {
  const data = useSomeAPI();

  useEffect(() => {
    if (data) {
      onFetched(data);
    }
  }, [onFetched, data]);
}
```

This creates awkward data flow:

```text
Child
 ↓
Effect
 ↓
Parent state
 ↓
Parent render
 ↓
Child
```

React's natural data flow is:

```text
Parent
  ↓
Child
```

So if both need the data:

### ✅

```jsx
function Parent() {
  const data = useSomeAPI();

  return <Child data={data} />;
}

function Child({ data }) {
  // use data
}
```

> **Prefer data flowing down through props rather than child Effects updating parent state.**

---

# 14. External stores → `useSyncExternalStore`

Sometimes the source of truth exists **outside React**.

Example:

```jsx
navigator.onLine
```

The browser can change this value without React knowing.

You could manually synchronize it:

```jsx
useEffect(() => {
  function updateState() {
    setIsOnline(navigator.onLine);
  }

  window.addEventListener("online", updateState);
  window.addEventListener("offline", updateState);

  return () => {
    window.removeEventListener("online", updateState);
    window.removeEventListener("offline", updateState);
  };
}, []);
```

But React provides:

```jsx
useSyncExternalStore
```

for this exact problem.

```jsx
function subscribe(callback) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true
  );
}
```

Mental model:

```text
External store
      ↓
useSyncExternalStore
      ↓
React component
```

---

# 15. Fetching data → Effect can be appropriate

Fetching is an important exception.

```jsx
useEffect(() => {
  fetchResults(query, page).then(json => {
    setResults(json);
  });
}, [query, page]);
```

This is appropriate when the requirement is:

> **While this component is displayed, keep its results synchronized with the network for the current `query` and `page`.**

It isn't necessarily tied to the typing event itself.

For example, `query` could come from:

* URL
* browser Back/Forward navigation
* initial props
* user typing

The Effect is about synchronizing the displayed results with the current query/page.

---

# 16. Fetching race condition

Suppose the user types quickly:

```text
"h"
 ↓
"he"
 ↓
"hel"
 ↓
"hell"
 ↓
"hello"
```

You might start:

```text
Request A → "h"
Request B → "he"
Request C → "hel"
Request D → "hell"
Request E → "hello"
```

But responses don't necessarily arrive in the same order:

```text
hello → response
hell  → response
hel   → response
```

If you blindly call:

```jsx
setResults(json);
```

an old request could overwrite newer results.

### Race condition

```text
"hello" request
     ↓
new result

"hell" request
     ↓
old result
     ↓
overwrites new result ❌
```

---

# 17. Cleanup stale requests

The source uses an `ignore` flag:

```jsx
useEffect(() => {
  let ignore = false;

  fetchResults(query, page).then(json => {
    if (!ignore) {
      setResults(json);
    }
  });

  return () => {
    ignore = true;
  };
}, [query, page]);
```

When dependencies change:

```text
old Effect cleanup
      ↓
ignore = true

new Effect
      ↓
new request
```

Therefore, an old response can't update the state.

```text
Request A → stale → ignored
Request B → stale → ignored
Request C → current → accepted
```

The source also notes that real applications need to consider things such as caching, server rendering, and avoiding network waterfalls; modern frameworks often provide better built-in data-fetching mechanisms than writing raw Effects in components. 

---

# 18. Custom hooks can hide Effect complexity

Instead of repeating:

```jsx
useEffect(...)
```

in every component, extract the synchronization logic:

```jsx
function useData(url) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let ignore = false;

    fetch(url)
      .then(response => response.json())
      .then(json => {
        if (!ignore) {
          setData(json);
        }
      });

    return () => {
      ignore = true;
    };
  }, [url]);

  return data;
}
```

Then:

```jsx
function SearchResults({ query }) {
  const params = new URLSearchParams({ query });

  const results = useData(`/api/search?${params}`);

  // ...
}
```

The component gets a declarative API:

```text
useData(url)
   ↓
data
```

rather than worrying about the synchronization implementation.

---

# 19. Application initialization

The source also discusses logic that should run **once per app load**.

A common temptation:

```jsx
useEffect(() => {
  loadDataFromLocalStorage();
  checkAuthToken();
}, []);
```

But in development, components can be remounted, so an empty-dependency Effect should not be confused with:

> "This can literally only ever execute once for the entire application."

For true app-load initialization, the source presents approaches such as a module-level guard:

```jsx
let didInit = false;

function App() {
  useEffect(() => {
    if (!didInit) {
      didInit = true;

      loadDataFromLocalStorage();
      checkAuthToken();
    }
  }, []);
}
```

Or module initialization:

```jsx
if (typeof window !== "undefined") {
  checkAuthToken();
  loadDataFromLocalStorage();
}
```

The latter should be kept to appropriate root/application entry modules because module-level code executes when the module is imported. 

---

# 20. Quick decision tree

When you're about to write:

```jsx
useEffect(...)
```

ask:

```text
             Do I need useEffect?
                     │
                     ↓
       Can I calculate the value
          during rendering?
              /          \
            YES           NO
             ↓             ↓
        calculate      Is it caused
        during render   by an event?
                       /          \
                     YES           NO
                      ↓             ↓
                Event handler   Is it an
                                external system?
                               /           \
                             YES            NO
                              ↓              ↓
                         useEffect      Reconsider
```

And for state:

```text
Can derived state be calculated?
        ↓
      YES → don't store it

Need expensive calculation?
        ↓
      YES → useMemo

Need to reset entire subtree?
        ↓
      YES → key

Need to synchronize an external system?
        ↓
      YES → useEffect

Need external store subscription?
        ↓
      YES → useSyncExternalStore
```

---

# 21. The core principle

The biggest takeaway from this chapter is:

> **Don't use Effects to orchestrate your application's internal data flow.**

Prefer:

```text
                 Internal React logic
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
       Render        Event handler    Derived value
          │              │              │
          ↓              ↓              ↓
      calculate       update state     calculate
```

Use Effects when crossing the boundary:

```text
React
  │
  │ useEffect
  ↓
External system
```

---

## Revision sheet

| Problem                                | Prefer                               |
| -------------------------------------- | ------------------------------------ |
| Calculate `fullName` from names        | Render                               |
| Filter todos                           | Render                               |
| Expensive filtering                    | `useMemo`                            |
| Reset all state when identity changes  | `key`                                |
| Adjust a small piece of state          | Render-time adjustment, if necessary |
| Button → notification                  | Event handler                        |
| Form submit → POST                     | Event handler                        |
| Component displayed → analytics        | `useEffect`                          |
| Chain state updates                    | One event handler / reducer          |
| Two components need same state         | Lift state up                        |
| Child needs to give data to parent     | Move data fetching/state up          |
| External store subscription            | `useSyncExternalStore`               |
| Synchronize with external system       | `useEffect`                          |
| Fetch data based on current query/page | `useEffect` can be appropriate       |
| Complex repeated Effect logic          | Custom Hook                          |

### One-line interview revision

> **Use Effects to synchronize React with external systems—not to derive data, respond to events, or orchestrate internal state; derive during render, handle interactions in event handlers, use keys to reset state, and use purpose-built hooks like `useMemo` or `useSyncExternalStore` when appropriate.** 
