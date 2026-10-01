# Composable React Layout Components with Styled Components

The goal is to turn common CSS spacing/layout patterns into a small set of **composable React layout primitives**.

Instead of repeatedly writing CSS for every component:

```jsx
<div className="card">
  <div className="content">
    ...
  </div>
</div>
```

we can express the **layout relationship** directly:

```jsx
<Stack gap="1rem">
  <Split>
    <Title />
    <Actions />
  </Split>
</Stack>
```

The implementation details live inside reusable `styled-components`.

---

# 1. Core Idea

A layout component should answer:

> **What relationship do these children have?**

Examples:

```text
A
↓
B
↓
C
```

→ `Stack`

```text
Left              Right
```

→ `Split`

```text
A   B   C
D   E   F
```

→ `Grid`

```text
Icon + Text + Badge
```

→ `Inline`

```text
Content in the center
```

→ `Center`

```text
Content inside a box
```

→ `Pad`

The component abstracts the **layout mechanism**, while props customize it.

---

# 2. Styled Components + Props

First:

```jsx
import styled from "styled-components";

const Stack = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ gap = "1rem" }) => gap};
`;
```

Now:

```jsx
<Stack gap="2rem">
  <h1>Hello</h1>
  <p>World</p>
</Stack>
```

The prop:

```jsx
gap="2rem"
```

is available to the styled-component function:

```js
({ gap = "1rem" }) => gap
```

This is **destructuring with a default value**.

Conceptually:

```js
props = {
  gap: "2rem"
};
```

and:

```js
({ gap = "1rem" })
```

extracts `gap`.

---

# 3. Why Destructure Props?

Instead of:

```jsx
const Stack = styled.div`
  gap: ${(props) => props.gap};
`;
```

we can write:

```jsx
const Stack = styled.div`
  gap: ${({ gap }) => gap};
`;
```

And with a default:

```jsx
const Stack = styled.div`
  gap: ${({ gap = "1rem" }) => gap};
`;
```

This makes the component's API immediately visible:

```text
Stack
 └── gap
```

---

# 4. Stack / Column

The `Stack` pattern represents a **vertical relationship**.

```jsx
const Stack = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ gap = "1rem" }) => gap};

  align-items: ${({ align = "stretch" }) => align};
`;
```

Usage:

```jsx
<Stack gap="1.5rem">
  <h1>Profile</h1>
  <p>Frontend Developer</p>
  <button>Edit Profile</button>
</Stack>
```

We can customize alignment:

```jsx
<Stack gap="1rem" align="center">
  <Avatar />
  <h2>Pranay</h2>
</Stack>
```

### Mental model

```text
Stack
 │
 ├── A
 │
 ├── gap
 │
 ├── B
 │
 ├── gap
 │
 └── C
```

The **parent owns the spacing relationship**.

---

# 5. Split

`Split` represents:

```text
Left                    Right
```

Implementation:

```jsx
const Split = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: ${({ align = "center" }) => align};

  gap: ${({ gap = "1rem" }) => gap};
`;
```

Usage:

```jsx
<Split>
  <h2>Profile</h2>
  <button>Edit</button>
</Split>
```

Another example:

```jsx
<Split align="flex-start">
  <span>Description</span>
  <span>Required</span>
</Split>
```

### Why this is useful

Instead of:

```css
button {
  margin-left: auto;
}
```

we express the actual relationship:

```jsx
<Split>
  <Title />
  <Actions />
</Split>
```

The layout component owns the distribution of space.

---

# 6. Inline Bundle

For tightly related elements:

```text
[Avatar] [Name] [Badge]
```

use `Inline`.

```jsx
const Inline = styled.div`
  display: inline-flex;

  align-items: ${({ align = "center" }) => align};

  gap: ${({ gap = "0.5rem" }) => gap};
`;
```

Usage:

```jsx
<Inline gap="0.75rem">
  <Avatar />
  <span>Pranay</span>
  <Badge>Admin</Badge>
</Inline>
```

### Why `inline-flex`?

Externally:

```text
inline
```

Internally:

```text
flex
```

So the whole group behaves like an inline element while its children use Flexbox.

---

# 7. Center

A reusable centering primitive:

```jsx
const Center = styled.div`
  display: grid;
  place-items: center;

  min-height: ${({ minHeight = "auto" }) => minHeight};
`;
```

Usage:

```jsx
<Center minHeight="300px">
  <Spinner />
</Center>
```

Or:

```jsx
<Center>
  <EmptyState />
</Center>
```

The component hides the implementation:

```css
display: grid;
place-items: center;
```

The consumer only needs to think:

```jsx
<Center>
```

---

# 8. Pad

`Pad` owns **internal spacing**.

```jsx
const Pad = styled.div`
  padding: ${({ padding = "1rem" }) => padding};
`;
```

Usage:

```jsx
<Pad padding="2rem">
  <h1>Dashboard</h1>
  <p>Welcome back.</p>
</Pad>
```

You can also expose directional control:

```jsx
const Pad = styled.div`
  padding-top: ${({ top = "0" }) => top};
  padding-right: ${({ right = "0" }) => right};
  padding-bottom: ${({ bottom = "0" }) => bottom};
  padding-left: ${({ left = "0" }) => left};
`;
```

But don't over-engineer the API prematurely.

Usually:

```jsx
<Pad padding="1rem">
```

is enough.

---

# 9. Grid

For two-dimensional layouts:

```jsx
const Grid = styled.div`
  display: grid;

  grid-template-columns:
    ${({ columns = "repeat(3, 1fr)" }) => columns};

  gap: ${({ gap = "1rem" }) => gap};
`;
```

Usage:

```jsx
<Grid columns="repeat(3, 1fr)" gap="1.5rem">
  <Card />
  <Card />
  <Card />
</Grid>
```

Responsive:

```jsx
<Grid columns="repeat(auto-fit, minmax(200px, 1fr))">
  {products.map(product => (
    <ProductCard key={product.id} />
  ))}
</Grid>
```

### Mental model

```text
Flexbox
   ↓
primarily 1D

Grid
   ↓
2D
```

---

# 10. Columns

If we specifically want `N` equal columns, we can create a convenience component.

```jsx
const Columns = styled.div`
  display: grid;

  grid-template-columns:
    ${({ count = 3 }) => `repeat(${count}, 1fr)`};

  gap: ${({ gap = "1rem" }) => gap};
`;
```

Usage:

```jsx
<Columns count={3}>
  <Feature />
  <Feature />
  <Feature />
</Columns>
```

The prop:

```jsx
count={3}
```

is a number.

It becomes:

```css
grid-template-columns: repeat(3, 1fr);
```

---

# 11. Media Wrapper

Media should usually have a predictable container.

```jsx
const Media = styled.div`
  position: relative;

  aspect-ratio:
    ${({ ratio = "16 / 9" }) => ratio};

  overflow: hidden;
`;
```

Usage:

```jsx
<Media ratio="16 / 9">
  <img src="/photo.jpg" />
</Media>
```

The wrapper owns:

```text
aspect ratio
overflow
positioning
```

The image owns:

```text
actual media
```

A styled image can also be created:

```jsx
const MediaImage = styled.img`
  width: 100%;
  height: 100%;

  object-fit: ${({ fit = "cover" }) => fit};
`;
```

Then:

```jsx
<Media>
  <MediaImage
    src="/photo.jpg"
    fit="cover"
  />
</Media>
```

---

# 12. Layers / Over

For overlapping elements, create a positioning context.

```jsx
const Layer = styled.div`
  position: relative;
`;
```

Then:

```jsx
const Overlay = styled.div`
  position: absolute;

  inset: ${({ inset = "0" }) => inset};
`;
```

Usage:

```jsx
<Layer>

  <img src="/hero.jpg" />

  <Overlay>
    <Center>
      <h1>Hello</h1>
    </Center>
  </Overlay>

</Layer>
```

Conceptually:

```text
Layer
 │
 ├── Image
 │
 └── Overlay
       │
       └── Center
```

The parent establishes:

```css
position: relative;
```

and the overlay uses:

```css
position: absolute;
```

---

# 13. Passing Normal DOM Props

Styled-components can also accept normal DOM props.

```jsx
const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ gap = "1rem" }) => gap};
`;
```

You can use:

```jsx
<Stack
  className="profile"
  id="profile-section"
>
  ...
</Stack>
```

These can be forwarded to the underlying `<div>`.

This gives you:

```text
Custom layout props
        +
Normal DOM props
```

---

# 14. The `$` Convention for Styling Props

One important styled-components pattern is using transient props.

Instead of:

```jsx
<Stack gap="2rem">
```

we can use:

```jsx
<Stack $gap="2rem">
```

Implementation:

```jsx
const Stack = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ $gap = "1rem" }) => $gap};
`;
```

Why?

`$gap` is treated as a **styling-only prop** and avoids accidentally passing layout-specific props onto the DOM.

Example:

```jsx
<Stack $gap="2rem">
```

The DOM receives the `<div>`, but `$gap` is used internally by styled-components.

This is particularly useful for props such as:

```text
$gap
$align
$columns
$padding
$ratio
```

that exist purely to control styling.

---

# 15. A Small Layout Library

We can now create:

```jsx
import styled from "styled-components";

export const Stack = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ $gap = "1rem" }) => $gap};
  align-items: ${({ $align = "stretch" }) => $align};
`;

export const Split = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: ${({ $align = "center" }) => $align};

  gap: ${({ $gap = "1rem" }) => $gap};
`;

export const Inline = styled.div`
  display: inline-flex;

  align-items: ${({ $align = "center" }) => $align};

  gap: ${({ $gap = "0.5rem" }) => $gap};
`;

export const Center = styled.div`
  display: grid;
  place-items: center;
`;

export const Pad = styled.div`
  padding: ${({ $padding = "1rem" }) => $padding};
`;

export const Grid = styled.div`
  display: grid;

  grid-template-columns:
    ${({ $columns = "repeat(3, 1fr)" }) => $columns};

  gap: ${({ $gap = "1rem" }) => $gap};
`;

export const Media = styled.div`
  position: relative;

  aspect-ratio:
    ${({ $ratio = "16 / 9" }) => $ratio};

  overflow: hidden;
`;

export const Layer = styled.div`
  position: relative;
`;

export const Overlay = styled.div`
  position: absolute;

  inset: ${({ $inset = "0" }) => $inset};
`;
```

---

# 16. Now We Can Compose

A dashboard:

```jsx
<Stack $gap="2rem">

  <Split>
    <h1>Dashboard</h1>

    <Inline $gap="0.75rem">
      <Avatar />
      <button>Settings</button>
    </Inline>
  </Split>

  <Grid
    $columns="repeat(3, 1fr)"
    $gap="1.5rem"
  >

    <Pad $padding="1.5rem">
      <Stack $gap="0.5rem">
        <h2>Users</h2>
        <strong>1,240</strong>
      </Stack>
    </Pad>

    <Pad $padding="1.5rem">
      <Stack $gap="0.5rem">
        <h2>Revenue</h2>
        <strong>₹2.4L</strong>
      </Stack>
    </Pad>

    <Pad $padding="1.5rem">
      <Stack $gap="0.5rem">
        <h2>Orders</h2>
        <strong>842</strong>
      </Stack>
    </Pad>

  </Grid>

</Stack>
```

Notice how little CSS the page itself contains.

The page is describing **relationships**:

```text
Stack
 │
 ├── Split
 │    ├── Title
 │    └── Inline
 │
 └── Grid
      ├── Pad
      │    └── Stack
      ├── Pad
      │    └── Stack
      └── Pad
           └── Stack
```

---

# 17. A More Realistic Example

Consider a user profile card:

```jsx
<Pad $padding="1.5rem">

  <Stack $gap="1rem">

    <Split>

      <Inline $gap="0.75rem">
        <Avatar />
        <Stack $gap="0.25rem">
          <strong>Pranay</strong>
          <span>Frontend Developer</span>
        </Stack>
      </Inline>

      <button>Edit</button>

    </Split>

    <p>
      Building React applications and exploring backend systems.
    </p>

    <Inline $gap="0.5rem">
      <Badge>React</Badge>
      <Badge>Next.js</Badge>
      <Badge>TypeScript</Badge>
    </Inline>

  </Stack>

</Pad>
```

No arbitrary:

```css
margin-left: 17px;
margin-top: 13px;
margin-bottom: 21px;
```

Instead:

```text
Pad
 └── Stack
      ├── Split
      │    ├── Inline
      │    │    └── Stack
      │    └── Button
      │
      ├── Paragraph
      │
      └── Inline
```

Every spacing relationship has an owner.

---

# 18. Why This Is Composable

The components don't know what they're containing.

`Stack` doesn't care whether its children are:

```jsx
<Stack>
  <Card />
  <Button />
</Stack>
```

or:

```jsx
<Stack>
  <Image />
  <Text />
  <Form />
</Stack>
```

Likewise, `Split` doesn't care whether it contains:

```jsx
<Split>
  <Logo />
  <Navigation />
</Split>
```

or:

```jsx
<Split>
  <ProductName />
  <Price />
</Split>
```

This is **composition**.

The primitive owns the relationship, not the content.

---

# 19. Component Responsibility

A good layout primitive should have a narrow responsibility.

```text
Stack
  → vertical spacing

Split
  → distribute two sides

Inline
  → inline grouping

Grid
  → 2D layout

Center
  → centering

Pad
  → internal spacing

Media
  → predictable media box

Layer
  → positioning context

Overlay
  → overlapping positioning
```

Avoid creating components such as:

```jsx
<DashboardCardWithHeaderAndActionsAndImage />
```

too early.

Prefer:

```jsx
<Pad>
  <Stack>
    <Split>
      ...
    </Split>
  </Stack>
</Pad>
```

Small primitives compose into larger layouts.

---

# 20. The Most Important Mental Model

Don't think:

> "I need a margin here."

Think:

> **"What relationship am I trying to express?"**

For example:

```text
Title
  ↓
Description
  ↓
Button
```

Use:

```jsx
<Stack>
```

---

```text
Title                    Price
```

Use:

```jsx
<Split>
```

---

```text
Icon  Name  Badge
```

Use:

```jsx
<Inline>
```

---

```text
A   B   C
D   E   F
```

Use:

```jsx
<Grid>
```

---

```text
┌─────────────────┐
│                 │
│    Content      │
│                 │
└─────────────────┘
```

Use:

```jsx
<Center>
```

---

```text
Image
  +
Badge on top
```

Use:

```jsx
<Layer>
  <Image />
  <Overlay />
</Layer>
```

---

```text
Content inside boundary
```

Use:

```jsx
<Pad>
```

---

```text
Fixed-shape image
```

Use:

```jsx
<Media>
```

---

# 21. The Architecture

The overall system becomes:

```text
                  Layout Primitives
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
   Direction          Spacing          Positioning
       │                 │                 │
   ┌───┴───┐         ┌───┴───┐        ┌───┴────┐
   │       │         │       │        │        │
 Stack   Split      Pad      Gap     Layer   Overlay
   │
   ├── Inline
   │
   └── Grid

              Media
                │
             Media box
```

Then real components are built **from these primitives**.

```text
Page
 │
 ├── Stack
 │
 ├── Split
 │
 ├── Grid
 │    └── Cards
 │
 └── Media
```

This is essentially creating a tiny **layout language inside React**.

---

# 22. Final Mental Model

The important progression is:

```text
Raw CSS
   ↓
CSS layout relationship
   ↓
Reusable styled-component
   ↓
Props customize it
   ↓
Components compose together
   ↓
Complex UI
```

For example:

```css
display: flex;
flex-direction: column;
gap: 1rem;
```

becomes:

```jsx
<Stack $gap="1rem">
```

And:

```css
display: flex;
justify-content: space-between;
```

becomes:

```jsx
<Split>
```

And:

```css
display: grid;
grid-template-columns: repeat(3, 1fr);
```

becomes:

```jsx
<Grid $columns="repeat(3, 1fr)">
```

The **CSS implementation disappears behind a semantic layout component**.

> **The goal isn't to create a component for every CSS property. Create small components that represent meaningful layout relationships, expose only useful variations through props, and compose those primitives to build the UI.**
