import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";

function App() {
  const [show, setShow] = useState(false);
  const [top, setTop] = useState(0);

  const buttonRef = useRef(null);

  useLayoutEffect(() => {
    // The element may not exist yet.
    if (!buttonRef.current || !show) {
      setTop(0);
      return;
    }

    /*
     * getBoundingClientRect() gives us the element's
     * actual position after React has updated the DOM.
     */
    const { bottom } = buttonRef.current.getBoundingClientRect();

    /*
     * Update the position before the browser paints.
     */
    setTop(bottom + 30);
  }, [show]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setShow((show) => !show)}
      >
        Show
      </button>

      {show && (
        <div
          style={{
            position: "absolute",
            top,
            border: "2px solid black",
            padding: "10px",
          }}
        >
          Some text...
        </div>
      )}
    </>
  );
}

export default App;
