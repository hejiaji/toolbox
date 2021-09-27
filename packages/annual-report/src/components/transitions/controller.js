import { useRef } from "react";

export const useTransitionController = () => {
  const ref = useRef({ next: () => Promise.reject() });
  return ref.current;
};
