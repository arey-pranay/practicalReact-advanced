## Event Bus / Event Emitter Pattern

### What is it?

This example demonstrates the **Event Emitter Pattern** in React using `mitt`.

Instead of passing state or callbacks through the component tree, components communicate through a **shared event emitter**.

Here:

```text
Buttons
   │
   │ emit("increment")
   ▼
Event Emitter
   │
   │ notify
   ▼
Counter
```

`Buttons` and `Counter` don't need to know about each other.

---

### Why use an Event Emitter?

It can be useful when two components are:

* Far apart in the component tree.
* Not naturally parent/child.
* Need to communicate through events rather than shared state.
* Part of a larger event-driven system.

---

## How `mitt` works

You create a shared emitter:

```jsx
import mitt from "mitt";

export const emitter = mitt();
```

It provides three important operations:

```jsx
emitter.emit()
emitter.on()
emitter.off()
```

Think of it as a small publish/subscribe system.

---

## Publishing an Event

`Buttons` publishes events:

```jsx
emitter.emit("increment");
```

and:

```jsx
emitter.emit("decrement");
```

It doesn't know who will receive them.

```text
Buttons
   │
   ├── emit("increment")
   │
   └── emit("decrement")
```

---

## Subscribing to Events

`Counter` subscribes:

```jsx
emitter.on("increment", onIncrement);
emitter.on("decrement", onDecrement);
```

Now whenever an event is emitted, the corresponding callback executes.

```text
emit("increment")
       │
       ▼
onIncrement()
       │
       ▼
setCount(count => count + 1)
```

---

## Unsubscribing

The cleanup function is extremely important:

```jsx
return () => {
    emitter.off("increment", onIncrement);
    emitter.off("decrement", onDecrement);
};
```

This removes the subscriptions when `Counter` unmounts.

Without cleanup, you can get:

* Memory leaks.
* Multiple handlers executing.
* Unexpected state updates.
* Increasing numbers of event listeners after remounts.

---

## Why `useEffect`?

Subscriptions are a **side effect**, so they belong inside `useEffect`.

```jsx
useEffect(() => {
    emitter.on(...);

    return () => {
        emitter.off(...);
    };
}, []);
```

The empty dependency array means the subscription is established when the component mounts and removed when it unmounts.

---

## Why Functional State Updates?

The handler uses:

```jsx
setCount(
    (count) => count + 1
);
```

rather than:

```jsx
setCount(count + 1);
```

This is important because the event handler can fire independently of React's render cycle.

The functional form always receives the latest state value.

---

## Complete Flow

```text
                  ┌───────────────┐
                  │    Buttons    │
                  └───────┬───────┘
                          │
                    emit("increment")
                          │
                          ▼
                  ┌───────────────┐
                  │    Emitter    │
                  └───────┬───────┘
                          │
                     notify
                          │
                          ▼
                  ┌───────────────┐
                  │    Counter    │
                  └───────┬───────┘
                          │
                    setCount(...)
                          │
                          ▼
                       UI update
```

The important part is that **Buttons doesn't directly call Counter**.

---

## Publish / Subscribe Model

This pattern is essentially:

### Publisher

```jsx
emitter.emit("increment");
```

### Subscriber

```jsx
emitter.on(
    "increment",
    onIncrement
);
```

### Unsubscribe

```jsx
emitter.off(
    "increment",
    onIncrement
);
```

This is commonly called **Pub/Sub (Publish/Subscribe)**.

---

## Why not just use props?

You could do:

```text
Parent
 ├── Buttons
 └── Counter
```

and let the parent own:

```jsx
const [count, setCount] = useState(0);
```

then pass:

```jsx
<Buttons
    onIncrement={...}
/>

<Counter
    count={count}
/>
```

For a simple counter, this is **much better**.

The event emitter becomes useful when communication is broader and more event-driven.

---

## Event Emitter vs Context

| Event Emitter                        | Context                           |
| ------------------------------------ | --------------------------------- |
| Event-based communication            | State/value sharing               |
| Publisher doesn't know subscribers   | Consumers explicitly read context |
| Loose coupling                       | Explicit dependency               |
| Good for events                      | Good for shared application state |
| Requires manual subscription cleanup | React manages subscriptions       |

---

## Event Emitter vs Redux

An event emitter is much simpler.

```text
Event Emitter

emit event
    ↓
listeners react
```

Redux-like architecture:

```text
Action
   ↓
Store
   ↓
Reducer
   ↓
New State
   ↓
Subscribers
```

Use an event emitter when you primarily need **events**.

Use a state-management solution when you need **shared state with predictable state transitions**.

---

## Real-world Examples

Event emitters can be useful for:

* Toast notifications
* Analytics events
* Global keyboard shortcuts
* Cross-component notifications
* WebSocket events
* Authentication events
* File upload events
* Application-wide events
* Communication with non-React code

For example:

```jsx
emitter.emit("show-toast", {
    message: "Saved successfully",
});
```

A toast component can subscribe:

```jsx
emitter.on(
    "show-toast",
    showToast
);
```

---

## Important React Caveat

A global emitter is **outside React's state system**.

React doesn't automatically know:

```jsx
emitter.emit(...)
```

happened.

The subscribed callback must ultimately cause a React state update:

```jsx
setCount(...)
```

which tells React to render again.

---

## Potential Problem: Global Event Emitters

This:

```jsx
export const emitter = mitt();
```

creates a global singleton.

That can become difficult to reason about in a large application because:

* Events can originate anywhere.
* Subscribers can be difficult to locate.
* Event names are strings.
* Dependencies aren't obvious.
* Debugging becomes harder.

For application state, prefer React state, Context, or a dedicated state-management solution when appropriate.

---

## Better Event Names

Instead of generic names:

```jsx
"increment"
"decrement"
```

large applications often use more descriptive events:

```jsx
"user:created"

"cart:item-added"

"notification:received"
```

This reduces collisions and makes the event system easier to understand.

---

## Interview Questions

### What is an Event Emitter?

An object that allows components or modules to publish events and other parts of the application to subscribe to those events.

---

### What pattern does this implement?

Primarily the **Publish/Subscribe pattern**, also commonly referred to as an event-driven architecture.

---

### Why do we need `off()`?

To remove event listeners and prevent memory leaks or stale subscriptions when the component unmounts.

---

### Why is `off()` inside the cleanup function?

Because React calls the cleanup function when the effect is removed or before it is re-run.

```jsx
useEffect(() => {
    subscribe();

    return () => {
        unsubscribe();
    };
}, []);
```

This gives the subscription the same lifecycle as the component.

---

### Does `Buttons` know about `Counter`?

No.

It only knows that an `"increment"` event exists.

The emitter handles the communication.

---

### Is this the best approach for the counter example?

No.

For this particular example, lifting state to the parent would be simpler:

```text
Parent
 ├── Buttons
 └── Counter
```

The event emitter becomes more interesting when components need loosely coupled, event-based communication.

---

## Best Practices

* Always unsubscribe in `useEffect` cleanup.
* Use descriptive event names.
* Avoid using an event emitter as a replacement for all React state.
* Keep the event vocabulary small and documented.
* Consider Context or state management for persistent shared state.
* Avoid global emitters when normal React composition can solve the problem.

---

## Key Takeaways

* **Event Emitters** allow components to communicate without directly passing props or callbacks.
* `emit()` publishes an event.
* `on()` subscribes to an event.
* `off()` removes a subscription.
* The pattern is based on **Publish/Subscribe**.
* It is useful for loosely coupled, event-driven communication.
* However, for ordinary React state sharing, **props, lifting state, Context, or custom hooks are usually preferable**.
* Always clean up subscriptions to avoid stale listeners and memory leaks.
