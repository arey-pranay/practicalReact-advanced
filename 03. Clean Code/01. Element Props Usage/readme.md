This is the **Polymorphic Component** pattern in React: the same `Button` component can render as different HTML elements while keeping the same styling.

### What our code is doing

```jsx
<Button size="s">Small</Button>
<Button size="m">Medium</Button>
<Button size="l">Large</Button>
<Button size="xl">xLarge</Button>

<Button As="a" size="l" href="/">
  Link
</Button>
```

Normally, `Button` renders a `<button>`. But by passing `As="a"`, it renders an `<a>` instead.

The key part is:

```jsx
const Button = ({
  As = "button",
  size = "m",
  className = "",
  ...otherProps
}) => {
  return (
    <As
      {...otherProps}
      className={`${styles.button} ${styles[size]} ${className}`}
    />
  );
};
```

### 1. `As = "button"`

```jsx
As = "button"
```

`As` determines **which element/component React should render**.

So:

```jsx
<Button>Click</Button>
```

becomes conceptually:

```jsx
<button>Click</button>
```

while:

```jsx
<Button As="a" href="/">
  Link
</Button>
```

becomes:

```jsx
<a href="/">Link</a>
```

This works because JSX allows a variable to represent the element:

```jsx
const Element = "a";

<Element href="/">Link</Element>
```

React renders:

```html
<a href="/">Link</a>
```

---

### 2. `...otherProps`

Everything except `As`, `size`, and `className` is collected:

```jsx
{
  As,
  size,
  className,
  ...otherProps
}
```

For:

```jsx
<Button As="a" size="l" href="/" target="_blank">
  Link
</Button>
```

you effectively get:

```js
As = "a"
size = "l"
className = ""

otherProps = {
  href: "/",
  target: "_blank"
}
```

Then:

```jsx
<As {...otherProps}>
```

becomes:

```jsx
<a href="/" target="_blank">
```

This is called **prop forwarding**.

It is particularly useful for polymorphic components because different elements have different native props:

```jsx
<Button disabled />
```

can forward `disabled` to `<button>`, while:

```jsx
<Button As="a" href="/" />
```

can forward `href` to `<a>`.

---

### 3. Dynamic component rendering

This:

```jsx
<As>
```

is not literally an HTML `<As>` element.

Because `As` starts with a capital letter, React treats it as a component/element variable.

If:

```js
As = "button"
```

React renders:

```jsx
<button />
```

If:

```js
As = "a"
```

React renders:

```jsx
<a />
```

You could also pass a React component:

```jsx
<Button As={CustomButton}>
  Click
</Button>
```

Then `Button` would render `CustomButton`.

---

### 4. Why `className` is constructed this way

```jsx
className={`${styles.button} ${styles[size]} ${className}`}
```

You have three possible classes:

```text
base button styles
+
size-specific styles
+
user-provided custom styles
```

For example:

```jsx
<Button size="l" className="my-custom-class">
```

could result in:

```html
<button class="button large my-custom-class">
```

The default:

```jsx
className = ""
```

prevents getting `undefined` in the class string.

---

### 5. Important design pattern

This is generally called a **polymorphic component** or **`as` prop pattern**.

The idea is:

> Keep the behavior and styling of a component while allowing the underlying HTML element to change.

Common examples:

```jsx
<Button As="button" />
<Button As="a" />
<Button As={Link} />
```

This is useful for design systems.

For example, a design system might have:

```jsx
<Button>Submit</Button>
```

for actions and:

```jsx
<Button As="a" href="/pricing">
  Pricing
</Button>
```

for navigation, while both look visually identical.

### Interview points

* **`As`** is a polymorphic prop that controls the rendered element.
* **`...otherProps`** forwards element-specific props such as `href`, `disabled`, `target`, `aria-*`, etc.
* **`<As />`** is dynamic JSX; React uses the value of `As` to determine what to render.
* This pattern is commonly used in **design systems/component libraries**.
* In TypeScript, a production-quality polymorphic component should also type `As` and its props correctly, so `<Button As="a">` accepts anchor props while `<Button>` accepts button props.
* Semantics still matter: use a `<button>` for actions and an `<a>` for navigation rather than styling everything as a button.
