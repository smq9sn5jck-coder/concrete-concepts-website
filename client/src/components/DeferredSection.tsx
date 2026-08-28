import type { PropsWithChildren } from "react";

export default function DeferredSection({ children }: PropsWithChildren) {
  return <div className="defer-below-fold">{children}</div>;
}
