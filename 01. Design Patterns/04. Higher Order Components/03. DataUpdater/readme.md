# Higher-Order Components (Updatable Resource)

## What is it?

This pattern extends a **Higher-Order Component (HOC)** to not only fetch data, but also manage an **editable copy** of that data.

The HOC is responsible for:

- Fetching the resource
- Managing edit state
- Saving updates
- Resetting changes

The wrapped component simply renders the UI and invokes the provided handlers.

This is an example of separating **business logic** from **presentation**.

---

## Why use it?

- Centralizes update logic.
- Keeps UI components stateless.
- Makes editable forms reusable.
- Avoids duplicating CRUD logic across components.
- Promotes separation of concerns.

---

## Folder Structure

```
Higher Order Components
│── App.jsx
│── components/
│     ├── include-updatable-user.jsx
│     └── user-info.jsx
```

---

## Usage

```jsx
const UserInfoWithUser =
    includeUpdatableUser(UserInfo, "2");

<UserInfoWithUser />
```

The wrapped component automatically receives:

- editable user
- change handler
- save handler
- reset handler

---

## Implementation

```jsx
<Component
    {...props}
    updatableUser={updatableUser}
    changeHandler={userChangeHandler}
    userPostHandler={userPostHandler}
    resetUserHandler={resetUserHandler}
/>
```

The component itself contains **no fetching or updating logic**.

---

# How it Works

```
UserInfo
      ▲
      │
Editable Props
      ▲
      │
includeUpdatableUser()
      │
Fetch User
      │
Create Editable Copy
      │
Save Changes
      │
Reset Changes
```

---

# State Management

The HOC maintains two versions of the user.

```jsx
const [user, setUser] =
    useState(null);

const [updatableUser, setUpdatableUser] =
    useState(null);
```

### user

Original server data.

```
Server
   │
   ▼
user
```

---

### updatableUser

Editable copy used by the form.

```
user
  │
Copy
  ▼
updatableUser
```

Changes only affect the editable copy until saved.

---

# Editing Data

```jsx
const userChangeHandler = (updates) => {
    setUpdatableUser({
        ...updatableUser,
        ...updates,
    });
};
```

Instead of mutating state, updates are merged.

Example:

```
Current

{
    name: "John",
    age: 25
}

Update

{
    age: 26
}

Result

{
    name: "John",
    age: 26
}
```

---

# Saving

```jsx
await axios.post(
    `/users/${userId}`,
    {
        user: updatableUser,
    }
);
```

After a successful request:

```
Server
   │
Returns Updated User
   │
   ▼
user
   │
Copy
   ▼
updatableUser
```

Both states stay synchronized.

---

# Resetting

```jsx
setUpdatableUser(user);
```

All unsaved changes are discarded.

```
Original User
      │
      ▼
Editable Copy
```

---

# Data Flow

```
Server
   │
GET
   ▼
user
   │
Copy
   ▼
updatableUser
   │
User edits
   ▼
changeHandler()
   │
Save
   ▼
POST
   │
Server
```

---

# Props Injected

| Prop | Purpose |
|------|---------|
| `updatableUser` | Editable user object |
| `changeHandler` | Updates local edits |
| `userPostHandler` | Saves changes |
| `resetUserHandler` | Restores original data |

---

# Advantages

- Keeps components presentational.
- Centralizes CRUD logic.
- Reusable update mechanism.
- Easy to add validation.
- Easier testing.

---

# Disadvantages

- Creates another wrapper component.
- More props to pass.
- Harder debugging.
- Custom hooks are simpler today.

---

# Real-world Examples

- User profile editor
- Product editor
- CMS dashboards
- Blog editor
- Account settings
- Employee management

---

# HOC vs Custom Hook

### HOC

```jsx
const User =
    includeUpdatableUser(
        UserInfo,
        "2"
    );
```

---

### Hook

```jsx
const {
    user,
    update,
    save,
    reset,
} = useUser("2");
```

Modern React generally prefers the hook approach because it avoids additional wrapper components while keeping the same separation of concerns.

---

# Interview Questions

### Why keep two copies of the user?

One copy represents the original data from the server, while the second is an editable draft. This allows users to make changes without affecting the original until they explicitly save.

---

### Why not edit the original user object?

Mutating the original data makes it difficult to implement features like cancel, reset, undo, or compare unsaved changes.

---

### Why spread the updates?

```jsx
{
    ...updatableUser,
    ...updates,
}
```

This creates a new immutable object, which is the recommended approach for updating React state.

---

### Why reset from `user` instead of refetching?

Since the original server data is already stored locally, resetting is immediate and avoids an unnecessary network request.

---

### What would you improve in this implementation?

- Add loading and error states.
- Disable Save while the request is pending.
- Detect if there are unsaved changes.
- Use `PUT` or `PATCH` instead of `POST` for updates (depending on the API design).
- Extract the logic into a custom hook for modern React applications.

---

# Best Practices

- Never mutate the editable object directly.
- Keep the original server data immutable.
- Handle API errors gracefully.
- Show loading indicators during save operations.
- Disable Save when there are no changes.
- Prefer `PATCH` for partial updates when supported by the backend.

---

# Key Takeaways

- This HOC manages the complete lifecycle of an editable resource.
- It maintains both the original data and an editable copy.
- The wrapped component focuses only on rendering and user interactions.
- Separating editing logic from presentation makes components easier to reuse and maintain.
- While this pattern is useful for understanding React composition, modern applications typically implement similar behavior using **custom hooks** together with data-fetching libraries like **TanStack Query** or **RTK Query**.
  
