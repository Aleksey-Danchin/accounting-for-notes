import { defaultJotaiStore } from "__frontend/global/jotaiStorage";
import { atom, useAtomValue } from "jotai";

export const dateNowAtom = atom<Date>(new Date());

const frameInterval = 1000 / 60; // 60 fps

// Update dateNowAtom every frame to keep it in sync with the actual time
setInterval(
  () => defaultJotaiStore.set(dateNowAtom, new Date()),
  frameInterval,
);

// Hook to get the current date in milliseconds
export const useDateNow = () => useAtomValue(dateNowAtom);
