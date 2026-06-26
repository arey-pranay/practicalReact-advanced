# Split Screen Pattern

## What is it?

A Split Screen component is a layout component that divides the screen into multiple sections while allowing the parent to decide what content goes into each section.

Instead of hardcoding UI, the layout is abstracted into a reusable component.

---

## Why use it?

- Reusable layouts
- Separation of layout and content
- Easy to maintain
- Follows composition over inheritance
- Makes responsive layouts easier

---

## Folder Structure

```
Split Screen
│── App.jsx
│── components/
│     └── split-screen.jsx
```

---

## Code

### Usage

```jsx
<SplitScreen leftWidth={1} rightWidth={3}>
    <LeftSideComp />
    <RightSideComp />
</SplitScreen>
```

### Component

```jsx
export const SplitScreen = ({ children, leftWidth, rightWidth }) => {
    const [left, right] = children;

    return (
        <Container>
            <Panel flex={leftWidth}>{left}</Panel>
            <Panel flex={rightWidth}>{right}</Panel>
        </Container>
    );
};
```

---

## How it works

1. Parent passes children.
2. SplitScreen destructures them into left and right.
3. Flexbox divides available width.
4. `leftWidth` and `rightWidth` determine the flex ratio.
5. Children are rendered inside their respective panels.

Visual:

```
+-----------------------------------------+
| Left |              Right               |
| 1fr  |               3fr                |
+-----------------------------------------+
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| leftWidth | number | 1 | Flex value of left panel |
| rightWidth | number | 1 | Flex value of right panel |
| children | ReactNode[] | - | Two components to render |

---

## Advantages

✅ Highly reusable

✅ Keeps layout separate from content

✅ Easy to extend

✅ Clean composition

---

## Limitations

- Assumes exactly two children.
- Doesn't support responsive behavior by itself.
- Doesn't validate missing children.
- Better generalized into a Grid or Stack component for larger apps.

---

## Real-world Use Cases

- Documentation websites
- IDE layouts
- Dashboard + Sidebar
- Email clients
- Split editor
- Chat applications

---

## Interview Points

**Q. Why is this called a Layout Component?**

Because it controls *where* components are rendered rather than *what* they render.

---

**Q. Why use children instead of props?**

Using `children` makes the component composable and allows any React component to be passed without changing the API.

---

**Q. Why use flex instead of width?**

Flex creates proportional layouts that automatically adapt to available space.

---

## Key Takeaways

- Layout Components control positioning only.
- They improve reusability.
- They encourage composition.
- They don't own business logic.
