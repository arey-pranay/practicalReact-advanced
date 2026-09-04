import {
  useCallback,
  useRef,
  useState,
} from "react";

function App() {
  const [show, setShow] = useState(false);

  /*
   * This is a REAL ref object.
   *
   * It has:
   *
   *     realInputRef.current
   *
   * We use it when we want to keep access to the
   * actual DOM element after the callback has run.
   */
  const realInputRef = useRef(null);

  /*
   * This is a CALLBACK REF.
   *
   * React calls this function when the input is attached:
   *
   *     inputRef(inputElement)
   *
   * And when it is detached:
   *
   *     inputRef(null)
   *
   * useCallback keeps the callback function stable between
   * renders.
   */
  const inputRef = useCallback((input) => {
    /*
     * Store the actual DOM element inside our real ref.
     *
     * This allows us to later do:
     *
     *     realInputRef.current
     */
    realInputRef.current = input;

    /*
     * React calls the callback with null when the element
     * is removed.
     */
    if (input === null) return;

    /*
     * The input has just been attached to the DOM.
     * We can immediately perform DOM operations on it.
     */
    input.focus();
  }, []);

  return (
    <>
      <button
        onClick={() => setShow((s) => !s)}
      >
        Switch
      </button>

      {show && (
        <input
          type="text"
          ref={inputRef}
        />
      )}
    </>
  );
}

export default App;
