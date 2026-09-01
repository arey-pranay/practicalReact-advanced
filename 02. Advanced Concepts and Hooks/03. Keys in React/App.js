import { useEffect, useState } from "react";

const Counter = () => {
  /*
   * React associates this state with the component's identity
   * in the rendered tree.
   *
   * ─────────────────────────────────────────────────────────
   * CASE 1: Same component + same position + same key
   *
   *     <Counter />
   *       ↓
   *     <Counter />
   *
   * React considers it the SAME Counter instance.
   * → Re-render happens
   * → State is PRESERVED
   *
   *     count: 5 → 5
   *
   *
   * CASE 2: Same component + different key
   *
   *     <Counter key="shirts" />
   *       ↓
   *     <Counter key="shoes" />
   *
   * React considers them DIFFERENT instances.
   * → Old Counter is unmounted
   * → New Counter is mounted
   * → State starts from its initial value
   *
   *     count: 5 → 0
   *
   *
   * CASE 3: Different parent element/type
   *
   *     <div>
   *       <Counter />
   *     </div>
   *
   *       ↓
   *
   *     <section>
   *       <Counter />
   *     </section>
   *
   * The parent type changed (div → section), so React
   * replaces that subtree.
   * → Counter is unmounted
   * → New Counter is mounted
   * → State resets
   *
   *
   * CASE 4: Same component but different position
   *
   *     <Counter />
   *     <Other />
   *
   *       ↓
   *
   *     <Other />
   *     <Counter />
   *
   * The Counter moved to a different position.
   * Depending on the surrounding tree/keys, React may treat
   * it as a different identity.
   *
   * Keys are the explicit way to tell React which item
   * represents which identity.
   *
   *
   * IMPORTANT:
   * A key does NOT simply "force a re-render".
   *
   * Changing a key changes the component's IDENTITY,
   * which can cause the old instance to unmount and a
   * new instance to mount.
   */

  const [count, setCount] = useState(0);

  /*
   * This effect lets us observe the lifecycle.
   *
   * If the Counter is merely re-rendered:
   *   → "Counter rendered" appears
   *   → mount effect does NOT run again
   *
   * If the Counter is remounted because its key/type changed:
   *   → cleanup runs
   *   → mount effect runs again
   */
  useEffect(() => {
    console.log("Counter mounted");

    return () => {
      console.log("Counter unmounted");
    };
  }, []);

  console.log("Counter rendered");

  return (
    <div>
      <p>Count: {count}</p>

      <button onClick={() => setCount((count) => count + 1)}>
        Increment
      </button>
    </div>
  );
};

export default Counter;
