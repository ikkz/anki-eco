import { FC, useCallback } from 'react';

export const DomRenderer: FC<{ dom: HTMLElement; clone?: boolean }> = ({ dom, clone }) => {
  const attachNode = useCallback(
    (ref: HTMLDivElement) => {
      if (dom && ref) {
        if (!clone) {
          dom.remove();
        }
        ref.innerHTML = '';
        ref.appendChild(clone ? dom.cloneNode(true) : dom);
      }
    },
    [dom, clone],
  );
  return <div ref={attachNode} />;
};
