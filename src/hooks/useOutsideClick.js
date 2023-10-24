import { useEffect, useRef } from "react";

export function useOutsideClick(callback, listenCapturing = true) {
  const ref = useRef();

  useEffect(
    function () {
      function handleClick(e) {
        if (ref.current && !ref.current.contains(e.target)) callback();
      }

      // true is used here to make this callback function be invoked only in the capturing phase [Bubbling down] and not the bubbling phase [Bubbling up] which would have caused the window to be closed again immeditely after the click occur

      document.addEventListener("click", handleClick, listenCapturing);

      return () =>
        document.removeEventListener("click", handleClick, listenCapturing);
    },
    [callback, listenCapturing]
  );

  return { ref };
}
