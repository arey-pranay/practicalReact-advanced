## Bonus:

    ### 1. Instead of clickable div:

#### Key Idea

A card should **not** become clickable by putting `onClick` on a `<div>`.

Instead, use a native interactive element:

* `<Link>` / `<a>` → navigation
* `<button>` → an action

Then use CSS to make that element's **interactive area cover the card**.

```text
Card
┌─────────────────────────────┐
│                             │
│   Image                     │
│                             │
│   Title                     │
│   Description               │
│                             │
│   ───────────────────────   │
│   Entire area → Link/Button │
└─────────────────────────────┘
```

This preserves native:

* keyboard interaction
* focus behavior
* screen-reader semantics
* browser link behavior
* accessibility

---

#### Link Card

For navigation:

```tsx
<div className="group relative">
  <h3>
    <Link
      href="/product/123"
      className="after:absolute after:inset-0"
    >
      Product title
    </Link>
  </h3>

  <p>Description...</p>
</div>
```

#### Why `relative`?

The parent establishes the containing block for:

```css
after:absolute
after:inset-0
```

So the pseudo-element covers the card rather than some unrelated ancestor.

#### Why `after:absolute after:inset-0`?

Equivalent conceptually to:

```css
position: absolute;
inset: 0;
```

It expands the link's clickable area to the card boundaries **without changing the DOM structure**.

---

#### Action Card

For a JavaScript action:

```tsx
<div className="relative focus-within:ring-2">
  <h3>Open details</h3>

  <button
    type="button"
    onClick={handleAction}
    className="absolute inset-0 z-10 h-full w-full opacity-0"
    aria-label="Open details"
  />
</div>
```

The important part is that the **button remains a real button**.

Don't do:

```tsx
<div onClick={handleAction}>
  ...
</div>
```

because then you'd have to recreate native button behavior yourself.

---

#### Why Native Elements Matter

A `<button>` automatically understands:

```text
Tab       → focus
Enter     → activate
Space     → activate
```

A link also gets native keyboard and browser behavior.

A `<div>` doesn't.

You could manually add:

```tsx
role="button"
tabIndex={0}
onKeyDown={...}
```

but that's generally **reinventing native browser behavior** and is easier to get wrong.

---

# Important Bonus: Nested Interactive Elements ⚠️

This is where the "entire card is clickable" pattern gets tricky.

Suppose you want:

```text
┌──────────────────────────────┐
│ Product                  🔖  │
│                              │
│ Description                  │
│                              │
│ [ Entire card → product ]    │
└──────────────────────────────┘
```

The bookmark must have **its own independent action**.

You should **not** put an actual `<button>` inside an `<a>` or put an `<a>` inside a `<button>`.

### Bad

```tsx
<Link href="/product">
  <div>
    Product

    <button onClick={bookmark}>
      🔖
    </button>
  </div>
</Link>
```

This creates **nested interactive controls**, which is invalid/problematic for accessibility and interaction.

---

##### Correct Pattern

Keep the card's navigation link and the independent button as **siblings**:

```tsx
<div className="group relative">
  <h3>
    <Link
      href="/product"
      className="after:absolute after:inset-0"
    >
      Product
    </Link>
  </h3>

  <button
    type="button"
    className="relative z-20"
    onClick={bookmark}
    aria-label="Bookmark product"
  >
    🔖
  </button>
</div>
```

The link's pseudo-element covers the card, while the bookmark is placed **above it with a higher `z-index`**.

```text
                    z-index: 20
                    ┌───┐
Card link layer     │ 🔖│ ← button wins
z-index: 10         └───┘
┌──────────────────────────────┐
│ Product                      │
│                              │
│ Description                  │
└──────────────────────────────┘
```

The independent button can therefore receive the click instead of triggering navigation.

---

## Interview Takeaways

#### ❌ Avoid

```tsx
<div onClick={...}>
```

for interactive UI.

### ✅ Prefer

```tsx
<Link />
```

for navigation.

```tsx
<button />
```

for actions.

### ✅ For a clickable card

Use:

```css
relative
```

on the card and:

```css
absolute inset-0
```

on the semantic interactive element/pseudo-element.

### ⚠️ With nested actions

Don't create:

```text
<a>
  <button />
</a>
```

or:

```text
<button>
  <a />
</button>
```

Instead, make them **siblings** and use positioning/z-index to control their hit areas.

---

## TL;DR

> **Make the semantic element clickable, not the card container.**
> Use CSS to expand its hit area rather than using `onClick` on a `<div>`.
> For cards with secondary actions, keep the navigation link and action buttons as **separate sibling interactive elements**.
