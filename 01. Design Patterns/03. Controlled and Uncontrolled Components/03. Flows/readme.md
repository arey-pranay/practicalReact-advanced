# Controlled vs Uncontrolled Flow Pattern

## What is it?

A **Flow Component** (or Wizard/Stepper) controls the navigation through a sequence of steps.

There are two approaches:

- **Controlled Flow** – The parent manages the current step and shared data.
- **Uncontrolled Flow** – The flow component manages its own state and progression.

This is the same idea as controlled vs uncontrolled forms, but applied to multi-step workflows.

---

## Why use it?

- Build onboarding flows
- Multi-step forms
- Checkout processes
- Registration wizards
- Surveys
- Authentication flows

---

# Uncontrolled Flow

## Implementation

```jsx
<UncontrolledFlow onDone={handleComplete}>
    <StepOne />
    <StepTwo />
    <StepThree />
    <StepFour />
</UncontrolledFlow>
```

The flow manages:

- current step
- collected data
- navigation

internally.

---

## How it Works

Each step receives a `next()` function.

```jsx
next({
    name: "John"
});
```

The flow component:

1. Merges the new data.
2. Moves to the next step.
3. Calls `onDone()` when finished.

```jsx
const updatedData = {
    ...data,
    ...dataFromStep,
};
```

---

## Flow

```
Step 1
   │
next(data)
   │
   ▼
Flow Component
   │
Merge Data
   │
Increment Step
   │
Render Next Step
```

---

## Advantages

- Extremely simple API.
- Parent doesn't manage step state.
- Ideal for reusable wizards.
- Automatically collects data.

---

## Disadvantages

- Parent cannot control navigation.
- Hard to jump between steps.
- Difficult to skip steps dynamically.
- Less flexible.

---

# Controlled Flow

## Implementation

```jsx
const [currentStepIndex, setCurrentStepIndex] = useState(0);
const [data, setData] = useState({});

<ControlledFlow
    currentStepIndex={currentStepIndex}
    onNext={next}
>
    <StepOne />
    <StepTwo />
    {data.age > 25 && <StepThree />}
    <StepFour />
</ControlledFlow>
```

The parent owns everything.

---

## How it Works

Each step calls:

```jsx
next({
    age: 30,
});
```

The parent decides:

- what data to save
- which step to render
- whether to skip steps
- when to finish

---

## Dynamic Steps

One major advantage is conditional rendering.

```jsx
{data.age > 25 && <StepThree />}
```

The parent can completely change the flow based on collected data.

For example:

- Skip payment for free plans.
- Skip company details for students.
- Show additional verification for admins.

This flexibility is difficult to achieve with an uncontrolled flow.

---

## Flow

```
Step
 │
next(data)
 │
 ▼
Parent
 │
Update State
 │
Choose Next Step
 │
 ▼
ControlledFlow
 │
 ▼
Render Current Step
```

---

## Advantages

- Parent has complete control.
- Easy conditional navigation.
- Can jump forward/backward.
- Supports branching workflows.
- Easy integration with routing or global state.

---

## Disadvantages

- More boilerplate.
- Parent manages all state.
- Slightly more complex API.

---

# Comparison

| Feature | Controlled | Uncontrolled |
|---------|------------|--------------|
| Step state | Parent | Flow Component |
| Data state | Parent | Flow Component |
| Parent controls navigation | ✅ | ❌ |
| Conditional steps | ✅ | ⚠️ Difficult |
| Jump to any step | ✅ | ❌ |
| Simpler API | ❌ | ✅ |
| Best for production | ✅ | ⚠️ Small flows |

---

# Real-world Examples

### Controlled Flow

- Checkout process
- Loan application
- Tax filing
- Employee onboarding
- Registration wizard
- Authentication setup

---

### Uncontrolled Flow

- Tutorials
- Product tours
- Demo walkthroughs
- Small questionnaires
- Learning modules

---

# Interview Questions

### Why use `React.cloneElement()`?

The flow injects the `next` function into each step without requiring every step to receive it manually.

```jsx
React.cloneElement(currentChild, {
    next,
});
```

---

### Why convert children to an array?

```jsx
React.Children.toArray(children)
```

This allows React children to be safely indexed, regardless of whether they were passed as a single child, fragments, or arrays.

---

### Why is Controlled Flow more flexible?

Because the parent owns the state and decides:

- current step
- navigation
- branching
- completion
- validation

---

### When would you choose Uncontrolled Flow?

When the workflow is simple, linear, and doesn't require external control or conditional logic.

---

### Which approach is more common?

Controlled flows are far more common in production because business workflows usually require validation, branching, persistence, and integration with routing or global state.

---

# Best Practices

- Keep each step focused on collecting or displaying a single piece of information.
- Validate data before calling `next()`.
- For controlled flows, store the entire form state in the parent.
- Support "Previous" navigation when appropriate.
- Persist progress for long workflows if users may leave and return.

---

# Key Takeaways

- A **Flow Component** manages multi-step workflows.
- **Uncontrolled Flow** owns the current step and collected data internally.
- **Controlled Flow** delegates state and navigation to the parent.
- Controlled flows enable conditional steps, branching, and external control.
- Use uncontrolled flows for simple linear wizards and controlled flows for production-grade applications.
