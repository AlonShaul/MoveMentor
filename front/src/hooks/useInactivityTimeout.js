import { useEffect } from "react";

const useInactivityTimeout = (onTimeout, timeout = 120000) => {
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(onTimeout, timeout);
    };

    const handleActivity = () => {
      resetTimer();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);

    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [onTimeout, timeout]);
};

export default useInactivityTimeout;
