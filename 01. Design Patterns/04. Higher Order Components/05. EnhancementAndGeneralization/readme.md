# Generic Updatable Resource HOC

## What is it?

This pattern generalizes the previous **Updatable User HOC** into a reusable **Generic Updatable Resource HOC**.

Instead of being tied to a specific resource like a user, it can manage **any editable resource** by accepting:

- the resource URL
- the resource name

This follows the **Don't Repeat Yourself (DRY)** principle by extracting common CRUD logic into a reusable abstraction.

---

## Why use it?

- Eliminate duplicated CRUD logic.
- Support any resource (users, products, books, posts, etc.).
- Keep UI components presentational.
- Improve maintainability.
- Make the HOC configurable instead of resource-specific.

---

## Usage

```jsx
const UserInfoForm =
    includeUpdatableResource(
        UserForm,
        "/users/2",
        "user"
    );
```

The same HOC could also be used for:

```jsx
includeUpdatableResource(
    ProductForm,
    "/products/1",
    "product"
);
```

or

```jsx
includeUpdatableResource(
    BookForm,
    "/books/5",
    "book"
);
```

without changing the implementation.

---

# Generic API

```jsx
includeUpdatableResource(
    Component,
    resourceUrl,
    resourceName
);
```

## Parameters

| Parameter | Description |
|------------|-------------|
| `Component` | Component to enhance |
| `resourceUrl` | API endpoint |
| `resourceName` | Name of the injected resource |

---

# How it Works

```
Component
      ▲
      │
Injected Props
      ▲
      │
Generic HOC
      │
Fetch Resource
      │
Editable Copy
      │
Save
      │
Reset
```

The wrapped component doesn't know whether it's editing a user, product, book, or any other resource.

---

# Dynamic Prop Generation

One of the most interesting parts of this implementation is the use of **computed property names**.

```jsx
const resourceProps = {
    [resourceName]: updatableData,
};
```

If

```jsx
resourceName = "user"
```

the component receives

```jsx
{
    user: ...
}
```

If

```jsx
resourceName = "product"
```

it receives

```jsx
{
    product: ...
}
```

No additional code is required.

---

# Dynamic Function Names

The handlers are also generated dynamically.

```jsx
{
    [`onChange${toCapital(resourceName)}`]:
        changeHandler
}
```

If

```jsx
resourceName = "user"
```

the component receives

```jsx
onChangeUser
```

For

```jsx
resourceName = "book"
```

it becomes

```jsx
onChangeBook
```

Likewise:

```
onSaveUser

onSaveBook

onSaveProduct

onResetUser

onResetBook

...
```

The API feels natural regardless of the resource.

---

# Data Flow

```
GET Resource
      │
      ▼
Original Data
      │
Copy
      ▼
Editable Resource
      │
User Changes
      ▼
Change Handler
      │
Save
      ▼
POST Resource
```

---

# Why `toCapital()`?

```jsx
const toCapital = (str) =>
    str.charAt(0).toUpperCase() +
    str.slice(1);
```

This helper converts

```
user
```

into

```
User
```

allowing dynamic handler names like:

```
onSaveUser

onChangeUser

onResetUser
```

instead of

```
onSaveuser
```

---

# Advantages

- Completely generic.
- Removes duplicate code.
- Supports any REST resource.
- Cleaner API.
- Easy to extend.
- Keeps UI components reusable.

---

# Disadvantages

- More abstraction means slightly harder debugging.
- Many dynamically generated props can become difficult to discover.
- Still creates wrapper components.
- Modern React often favors custom hooks.

---

# Real-world Examples

This HOC could power editors for:

- Users
- Products
- Books
- Orders
- Blog Posts
- Categories
- Inventory Items
- Employee Records

without writing another HOC.

---

# Generic vs Resource-Specific HOC

### Resource-Specific

```jsx
includeUpdatableUser(
    UserForm
);
```

Works only for users.

---

### Generic

```jsx
includeUpdatableResource(
    ProductForm,
    "/products/1",
    "product"
);
```

Works for any resource.

---

# Interview Questions

### Why create a generic HOC?

To avoid duplicating nearly identical CRUD logic for every resource and make the solution reusable across different entities.

---

### What are computed property names?

JavaScript allows object keys to be created dynamically using square brackets.

```jsx
{
    [resourceName]: value
}
```

This enables flexible APIs without hardcoding property names.

---

### Why generate handler names dynamically?

It creates a cleaner, self-descriptive API. Instead of generic names like `changeHandler`, consumers receive contextual handlers such as `onChangeUser` or `onSaveProduct`, making the component easier to understand.

---

### What's the difference between this and the previous HOC?

The previous HOC was tightly coupled to a `User`. This version extracts the common logic so it can manage any editable resource.

---

### How would you implement this today?

In modern React, you'd typically move this logic into a generic custom hook, for example:

```jsx
const {
    resource,
    update,
    save,
    reset,
} = useUpdatableResource(
    "/users/2"
);
```

This avoids wrapper components while preserving the same reusable behavior.

---

# Best Practices

- Use meaningful resource names (`user`, `product`, `book`).
- Keep injected prop names predictable.
- Handle loading and error states.
- Prefer `PATCH` for partial updates when appropriate.
- Consider extracting the data management into a custom hook for new projects.

---

# Key Takeaways

- **Generic Updatable Resource HOC** abstracts editable resource management into a reusable component enhancer.
- It fetches, edits, saves, and resets any resource using configuration instead of hardcoded logic.
- Computed property names enable dynamic prop and handler generation, creating a clean and intuitive API.
- This demonstrates how HOCs can evolve from resource-specific implementations to highly reusable abstractions.
- In modern React, similar patterns are commonly implemented with **custom hooks**, but understanding this approach is valuable for mastering composition and abstraction.
