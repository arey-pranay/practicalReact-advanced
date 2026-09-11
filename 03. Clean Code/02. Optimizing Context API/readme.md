# React Context + `useReducer` — State & Dispatch Context Pattern

This pattern combines **React Context** with **`useReducer`** to manage shared state without prop drilling.

The important idea in your implementation is that **state and `dispatch` are provided through separate contexts**.

---

## 1. Why this pattern?

Suppose `App` owns the counter:

```text
App
├── Display
│   └── needs count
└── Buttons
    └── needs dispatch
```

Without Context, you'd have to pass `count` and `dispatch` through props:

```text
App
 ↓ props
Display

App
 ↓ props
Buttons
```

With Context:

```text
             CartProvider
             /          \
       StateContext   DispatchContext
          ↓                ↓
       Display           Buttons
       count            dispatch()
```

Neither `Display` nor `Buttons` needs props from `App`.

---

# 2. `useReducer` manages the state

```tsx
type State = {
  count: number;
};

type Action = {
  type: "INCREMENT" | "DECREMENT";
};
```

The reducer defines **how state changes**:

```tsx
function reducer(state: State, action: Action) {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };

    case "DECREMENT":
      return { count: state.count - 1 };

    default:
      throw new Error("Provide a valid action.");
  }
}
```

Mental model:

```text
current state + action
        ↓
     reducer
        ↓
   new state
```

For example:

```tsx
dispatch({ type: "INCREMENT" });
```

becomes:

```text
{ count: 0 }
     +
 INCREMENT
     ↓
{ count: 1 }
```

The reducer itself doesn't directly change `state`.

Instead, it **returns a new state**.

---

# 3. `useReducer`

Inside `CartProvider`:

```tsx
const [state, dispatch] = useReducer(reducer, { count: 0 });
```

You get two things:

```text
state
  ↓
{ count: 0 }

dispatch
  ↓
function that sends actions
```

So:

```tsx
dispatch({ type: "INCREMENT" });
```

causes React to run:

```tsx
reducer(state, { type: "INCREMENT" });
```

and use the returned state.

---

# 4. Why two Contexts?

This is the most important part of your implementation.

You created:

```tsx
export const StateContext = createContext<StateContext | null>(null);

export const DispatchContext =
  createContext<DispatchContext | null>(null);
```

One context contains:

```text
StateContext
    ↓
{ count: 0 }
```

The other contains:

```text
DispatchContext
    ↓
dispatch function
```

Instead of doing:

```tsx
createContext({
  state,
  dispatch
});
```

you intentionally separate them.

### Why?

Because components can subscribe only to what they need.

`Display` needs:

```tsx
const { count } = useStateContext();
```

It doesn't need `dispatch`.

`Buttons` needs:

```tsx
const dispatch = useDispatchContext();
```

It doesn't need the state.

This gives a cleaner separation between:

```text
READ state       → StateContext
CHANGE state     → DispatchContext
```

---

# 5. Provider

Your provider:

```tsx
export const CartProvider = ({ children }: CartProviderProps) => {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>
        {children}
      </StateContext.Provider>
    </DispatchContext.Provider>
  );
};
```

The component tree becomes:

```text
CartProvider
│
├── DispatchContext.Provider
│   │
│   └── StateContext.Provider
│       │
│       ├── Display
│       └── Buttons
```

Both components can access the contexts because they're descendants of the providers.

---

# 6. `Display` — consuming state

```tsx
const Display = () => {
  const { count } = useStateContext();

  return <span className="span">{count}</span>;
};
```

`Display` only consumes `StateContext`.

```text
StateContext
     ↓
  { count }
     ↓
  Display
```

It can read the current value but doesn't need to know **how** the value changes.

---

# 7. `Buttons` — consuming dispatch

```tsx
const Buttons = () => {
  const dispatch = useDispatchContext();

  return (
    <div className="buttons">
      <button
        onClick={() => dispatch({ type: "DECREMENT" })}
      >
        ➖
      </button>

      <button
        onClick={() => dispatch({ type: "INCREMENT" })}
      >
        ➕
      </button>
    </div>
  );
};
```

`Buttons` doesn't directly modify `count`.

Instead:

```text
Button click
     ↓
dispatch({ type: "INCREMENT" })
     ↓
reducer
     ↓
{ count: count + 1 }
     ↓
StateContext updates
     ↓
Display re-renders
```

This keeps state transitions centralized inside the reducer.

---

# 8. Custom hooks

Instead of writing this everywhere:

```tsx
const value = useContext(StateContext);

if (value === null) {
  throw new Error("Must be wrapped inside Context.Provider");
}
```

you created:

```tsx
export function useStateContext() {
  const value = useContext(StateContext);

  if (value === null) {
    throw new Error("Must be wrapped inside Context.Provider");
  }

  return value;
}
```

And similarly:

```tsx
export function useDispatchContext() {
  const value = useContext(DispatchContext);

  if (value === null) {
    throw new Error("Must be wrapped inside Context.Provider");
  }

  return value;
}
```

Now consumers simply write:

```tsx
const { count } = useStateContext();
```

or:

```tsx
const dispatch = useDispatchContext();
```

### Why the null check?

Because your contexts are created with:

```tsx
createContext(... | null)
```

If a component isn't inside the corresponding provider:

```tsx
const value = useContext(StateContext);
```

will return `null`.

Instead of failing later with a confusing error, your custom hook immediately tells you:

```text
Must be wrapped inside Context.Provider
```

This is a useful **Context safety pattern**.

---

# 9. Complete data flow

```text
                    CartProvider
                         │
                 useReducer(reducer)
                         │
                ┌────────┴────────┐
                │                 │
              state            dispatch
                │                 │
                ↓                 ↓
         StateContext      DispatchContext
                │                 │
                ↓                 ↓
             Display           Buttons
                │                 │
                │          dispatch(INCREMENT)
                │                 │
                │                 ↓
                │              reducer
                │                 │
                └───────← new state
```

---

# 10. Why not put everything in one Context?

You could do:

```tsx
const CartContext = createContext({
  state,
  dispatch
});
```

Then:

```tsx
const { state } = useContext(CartContext);
```

and:

```tsx
const { dispatch } = useContext(CartContext);
```

This is simpler and completely valid.

But your approach:

```text
StateContext
DispatchContext
```

provides a more granular subscription model.

For example:

```tsx
Buttons
```

doesn't consume the state context, so changes to the state value don't cause `Buttons` to re-render **because of its context consumption**.

That's particularly useful when the application grows and many components only need to dispatch actions.

---

# 11. Context vs `useReducer`

These solve **different problems**.

### `useReducer`

Answers:

> How should state be updated?

```text
state + action → reducer → new state
```

### Context

Answers:

> How should components access this state/dispatch without prop drilling?

```text
Provider
   ↓
any descendant
```

Together:

```text
useReducer
   +
Context
   ↓
shared structured state management
```

This is essentially a lightweight pattern for global/shared state.

---

# 12. `useState` vs `useReducer`

### Simple state

```tsx
const [count, setCount] = useState(0);
```

Good when updates are simple:

```tsx
setCount(count + 1);
```

### More structured state

```tsx
const [state, dispatch] = useReducer(reducer, initialState);
```

Useful when there are multiple related actions:

```tsx
dispatch({ type: "INCREMENT" });
dispatch({ type: "DECREMENT" });
dispatch({ type: "RESET" });
dispatch({ type: "ADD_ITEM" });
dispatch({ type: "REMOVE_ITEM" });
```

The reducer becomes the centralized place defining state transitions.

---

# 13. TypeScript detail

This:

```tsx
type Action = {
  type: "INCREMENT" | "DECREMENT";
};
```

means TypeScript only allows:

```tsx
dispatch({ type: "INCREMENT" });
dispatch({ type: "DECREMENT" });
```

Something like:

```tsx
dispatch({ type: "RESET" });
```

will produce a TypeScript error.

For larger reducers, you can use a discriminated union:

```tsx
type Action =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "RESET" };
```

This becomes especially useful when actions carry different payloads.

---

# 14. Important distinction

Don't think:

> Context manages state.

More accurately:

```text
useReducer → manages state transitions

Context → shares state/dispatch with descendants
```

Context doesn't replace `useReducer`.

You can use them independently:

```tsx
useReducer
```

without Context, or:

```tsx
Context
```

with ordinary values/state.

But combining them is a common pattern for shared application state.

---

# 15. One-line revision

> **Context + `useReducer` centralizes state transitions in a reducer and exposes the state/dispatch to deeply nested components without prop drilling; splitting state and dispatch into separate contexts can reduce unnecessary context subscriptions.**
