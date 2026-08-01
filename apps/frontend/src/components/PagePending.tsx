import { useState } from "react";
import { useDateNow } from "__frontend/hooks/useDateNow";

export function PagePending() {
  const [startedAt] = useState(() => Date.now());
  const now = useDateNow();
  const seconds = Math.floor((now.getTime() - startedAt) / 1000);

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] w-full flex-1 flex-col items-center justify-center gap-3">
      <span
        className="loading loading-spinner loading-lg"
        aria-label="Loading"
      />
      <p className="text-sm text-base-content/60">
        Загрузка страницы: {seconds} сек
      </p>
    </div>
  );
}
