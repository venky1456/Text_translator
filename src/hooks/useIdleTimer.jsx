import { useEffect, useRef } from 'react';

const useIdleTimer = (onIdle, timeout = 15 * 60 * 1000) => {
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onIdle(); // Call the onIdle callback when the user is idle
    }, timeout);
  };

  useEffect(() => {
    // Reset the timer on user activity
    const handleActivity = () => resetTimer();

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Start the timer
    resetTimer();

    // Cleanup event listeners and timer on unmount
    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [timeout, onIdle]);

  return null;
};

export default useIdleTimer;