import { useEffect, useState } from "react";
import { progressEventName } from "@/lib/store";

export function useProgressVersion() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    function onChange() {
      setVersion((current) => current + 1);
    }

    const eventName = progressEventName();
    window.addEventListener(eventName, onChange);
    window.addEventListener("storage", onChange);

    return () => {
      window.removeEventListener(eventName, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return version;
}
