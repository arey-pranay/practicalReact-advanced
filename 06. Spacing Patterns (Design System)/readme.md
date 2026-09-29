# CSS Spacing / Layout Patterns

These patterns are mostly about **controlling space and relationships between elements without hardcoding arbitrary margins everywhere**.

---

## 1. Layers Pattern

### Idea
Place elements **on top of each other**.

```css
.container {
  position: relative;
}

.overlay {
  position: absolute;
  inset: 0;
}
```

Mental model:

```text
┌─────────────────┐
│   Background    │
│      ┌─────┐    │
│      │Text │    │
│      └─────┘    │
└─────────────────┘
```

### Use when
- Image + overlay
- Text over image
- Badges
- Decorative elements
- Floating controls

### Key point
The important relationship is **depth/overlap**, not normal document flow.

---

# 2. Split Pattern

### Idea
Put two pieces of content on opposite sides of a container.

```text
┌──────────────────────────┐
│ Left              Right  │
└──────────────────────────┘
```

Typically:

```css
.container {
  display: flex;
  justify-content: space-between;
}
```

Example:

```jsx
<header>
  <Logo />
  <Navigation />
</header>
```

### Use when
- Header: logo ↔ actions
- Card: title ↔ price
- Row: label ↔ value
- Navigation: left ↔ right

### Key idea

```text
available space
      ↓
[ LEFT ] ←──→ [ RIGHT ]
```

Don't manually calculate margins to push the right element away. Let layout distribute the space.

---

# 3. Column Pattern

### Idea
Stack elements vertically with consistent spacing.

```text
Element
   ↓
Element
   ↓
Element
   ↓
Element
```

```css
.column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

### Use when
- Forms
- Sidebars
- Settings pages
- Card content
- Vertical sections

### Important

Prefer:

```css
gap: 1rem;
```

over:

```css
.child {
  margin-bottom: 1rem;
}
```

because the **parent owns the spacing relationship**.

---

# 3. Columns Pattern

This is different from **Column Pattern**.

### Idea
Arrange multiple items horizontally into columns.

```text
┌──────┬──────┬──────┐
│  A   │  B   │  C   │
└──────┴──────┴──────┘
```

Usually:

```css
.columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
```

or:

```css
display: flex;
```

### Use when
- Product grids
- Feature sections
- Dashboard cards
- Three-column layouts

### Difference

| Pattern | Main direction |
|---|---|
| Column | Vertical stack |
| Columns | Multiple horizontal columns |

---

# 4. Grid Pattern

### Idea
Use **two-dimensional layout**: rows + columns.

```text
┌─────┬─────┬─────┐
│  A  │  B  │  C  │
├─────┼─────┼─────┤
│  D  │  E  │  F  │
└─────┴─────┴─────┘
```

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
```

Responsive version:

```css
grid-template-columns:
  repeat(auto-fit, minmax(200px, 1fr));
```

### Use when
The relationship between **both rows and columns** matters.

### Mental model

```text
Flexbox → primarily 1D
Grid    → 2D
```

---

# 5. Inline Bundle

### Idea
Keep a group of inline items together as a unit.

```text
[Icon] [Text] [Button] [Badge]
```

Instead of manually spacing each child:

```css
.bundle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
```

### Use when
- Icon + text
- Buttons
- Tags
- Metadata
- Avatar + username
- Small UI controls

### Key idea

**The bundle controls spacing between its children.**

---

# 5. Inline Bundle Pattern

Likely the more complete/reusable version of the inline bundle concept.

Example:

```jsx
<div className="inlineBundle">
  <Avatar />
  <span>Pranay</span>
  <Badge>Admin</Badge>
</div>
```

```css
.inlineBundle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
```

### Why `inline-flex`?

It behaves like an inline element externally, while its children use Flexbox internally.

```text
paragraph text [Avatar Name Badge] continues here
```

rather than forcing the entire bundle onto its own line.

---

# 6. Inline Pattern

### Idea
Arrange content naturally **along the inline axis**.

```text
Text   →   Icon   →   Button   →   Badge
```

Often:

```css
display: inline-flex;
align-items: center;
```

or ordinary inline elements.

### Use when
The content should behave like part of a sentence or inline flow.

Example:

```html
Learn more → Documentation
```

### Important distinction

```text
inline
  ↓
participates in text/inline flow

inline-flex
  ↓
inline externally + flex layout internally
```

---

# 7. Pad Pattern

### Idea
Give an element **internal spacing**.

```text
┌─────────────────────┐
│   ← padding →       │
│      CONTENT        │
│                     │
└─────────────────────┘
```

```css
.card {
  padding: 1rem;
}
```

### Padding vs Margin

```text
┌──────────────────────────────┐
│          margin              │
│   ┌──────────────────────┐   │
│   │       padding        │   │
│   │     CONTENT          │   │
│   └──────────────────────┘   │
└──────────────────────────────┘
```

**Padding = inside the box**

**Margin = outside the box**

### Use when
- Cards
- Buttons
- Inputs
- Sections
- Containers

---

# 8. Center Pattern

### Idea
Center content inside available space.

Most common:

```css
.center {
  display: grid;
  place-items: center;
}
```

or:

```css
display: flex;
justify-content: center;
align-items: center;
```

### Mental model

```text
┌──────────────────────┐
│                      │
│       CONTENT        │
│                      │
└──────────────────────┘
```

### Use when
- Empty states
- Loading indicators
- Hero content
- Modal contents
- Icons

### Important

Know **what** you're centering:

```text
horizontal only
vertical only
both
```

Don't blindly use `height: 100vh`; understand the containing block and available space.

---

# 9. Media Wrapper Pattern

### Idea
Create a predictable container around media.

```text
┌──────────────────────┐
│                      │
│       IMAGE          │
│                      │
└──────────────────────┘
```

Typical:

```css
.media {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### Why?

Without a fixed/aspect-ratio wrapper:

```text
image loads
   ↓
image height changes
   ↓
layout shifts
```

With a wrapper:

```text
wrapper reserves space
        ↓
image fills wrapper
        ↓
stable layout
```

### Use when
- Images
- Videos
- Thumbnails
- Avatars
- Cards
- Responsive media

---

# 9. Media Wrapper Pattern

This is likely the more specific/reusable form of the previous pattern.

Think of it as:

```jsx
<MediaWrapper>
  <img />
</MediaWrapper>
```

The wrapper owns:

- aspect ratio
- overflow
- positioning
- sizing
- object-fit behavior

The actual media owns:

- image/video content

This prevents every component from reinventing media sizing.

---

# 10. Over Pattern

### Idea
Allow one element to visually **overlap another**.

```text
┌──────────────────┐
│ IMAGE             │
│                   │
│        ┌──────┐   │
│        │badge │   │
└────────┴──────┘───┘
```

Typical implementation:

```css
.parent {
  position: relative;
}

.child {
  position: absolute;
}
```

Example:

```css
.badge {
  position: absolute;
  top: 0;
  right: 0;
}
```

### Difference from Layers

They're closely related:

```text
Layers → multiple elements occupying the same visual space

Over    → specifically positioning one element over/around another
```

Think:

**Layers = concept**

**Over = layout relationship**

---

# 11. Final Project

This is likely a **capstone implementation** combining the patterns above.

The important thing isn't memorizing the project itself.

You should be able to look at a UI and decompose it:

```text
Page
 │
 ├── Center
 │
 ├── Columns
 │    ├── Column
 │    │    ├── Pad
 │    │    └── Inline Bundle
 │    │
 │    └── Column
 │
 ├── Media Wrapper
 │
 └── Over / Layers
```

### What to practice

Given a screenshot:

1. Identify the outer container.
2. Identify the major layout direction.
3. Identify spacing relationships.
4. Identify repeated structures.
5. Identify media wrappers.
6. Identify overlapping elements.
7. Identify inline groups.
8. Implement using CSS layout primitives.

---

# 12. Modal Project

A modal is a good combination of several patterns.

Typical structure:

```text
Viewport
└── Overlay
    └── Center
        └── Modal
            ├── Pad
            ├── Column
            │   ├── Header
            │   ├── Content
            │   └── Actions
            └── ...
```

Typical CSS:

```css
.overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
}

.modal {
  padding: 1.5rem;
  max-width: 500px;
}
```

### Important React concepts

A production modal also needs:

- Portal
- Escape-key handling
- Focus management
- Focus restoration
- `aria-modal`
- accessible labeling
- scroll locking where appropriate

So this project connects nicely with the **React Portals** topic you already covered.

---

# The Bigger Mental Model

Don't memorize these as 12 unrelated CSS tricks.

Think of them as **layout relationships**:

```text
                  LAYOUT
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
   Direction     Spacing      Position
       │            │            │
   ┌───┴───┐    ┌───┴───┐    ┌──┴────┐
   │       │    │       │    │       │
 Column  Columns Pad     Gap  Layers  Over
   │
   └── Grid

Inline Bundle
Center
Media Wrapper
```

### The most important question

Instead of asking:

> "Which CSS pattern do I remember?"

Ask:

> **"What relationship do these elements have?"**

For example:

```text
Logo ←→ Nav
```

→ **Split**

```text
Title
  ↓
Description
  ↓
Button
```

→ **Column**

```text
A B C
D E F
```

→ **Grid**

```text
Icon + Text + Badge
```

→ **Inline Bundle**

```text
Content inside a card
```

→ **Pad**

```text
Text over image
```

→ **Layers / Over**

```text
Image with fixed 16:9 shape
```

→ **Media Wrapper**

```text
Content in the exact middle
```

→ **Center**

---

## One-line revision

> **Spacing patterns are about expressing relationships between elements—use layout primitives like Flexbox, Grid, padding, gap, positioning, and aspect-ratio instead of solving every spacing problem with arbitrary margins.**
