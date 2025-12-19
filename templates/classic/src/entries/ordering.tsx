import { CardShell } from '@/components/card-shell';
import { NativeText } from '@/components/native-text';
import { Tag } from '@/components/tag';
import { useBack } from '@/hooks/use-back';
import { useCrossState } from '@/hooks/use-cross-state';
import { caseSensitiveAtom } from '@/store/settings';
import { tw } from '@/styles/tw';
import { FIELD_ID } from '@/utils/const';
import { domToText } from '@/utils/dom-to-text';
import { getEditOps, type Op } from '@/utils/edit-ops';
import { isFieldEmpty } from '@/utils/field';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import useCreation from 'ahooks/es/useCreation';
import useMemoizedFn from 'ahooks/es/useMemoizedFn';
import * as t from 'at/i18n';
import { AnkiField } from 'at/virtual/field';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { FC, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { shuffle } from 'remeda';

type Piece = {
  id: string;
  text: string;
};

type Status = 'correct' | 'wrong' | 'missed' | 'default';
type ContainerId = (typeof CONTAINERS)[number];
type ItemsState = Record<ContainerId, string[]>;

const BANK_ID = 'ordering-bank';
const SEQUENCE_ID = 'ordering-sequence';
const CONTAINERS = [BANK_ID, SEQUENCE_ID] as const;
const GAP = 8;
const FALLBACK_SIZE = { width: 80, height: 32 };
const MIN_CONTAINER_HEIGHT = '5rem';
const DRAG_REORDER_DISTANCE = 4;

const tokenizeWords = (text: string) =>
  text.trim() ? text.trim().split(/\s+/) : [];

const getWordOps = (
  from: string,
  to: string,
  compare: (a: string, b: string) => boolean,
): Op[] => {
  const fromWords = tokenizeWords(from);
  const toWords = tokenizeWords(to);
  const encode = (len: number) =>
    Array.from({ length: len }, (_, idx) => String.fromCodePoint(idx + 1)).join(
      '',
    );
  const fromEncoded = encode(fromWords.length);
  const toEncoded = encode(toWords.length);
  const ops = getEditOps(fromEncoded, toEncoded, (a, b) => {
    const fromWord = fromWords[(a.codePointAt(0) || 1) - 1];
    const toWord = toWords[(b.codePointAt(0) || 1) - 1];
    return compare(fromWord ?? '', toWord ?? '');
  });
  return ops
    .map((op) => {
      const words = Array.from(op.content)
        .map((ch) => {
          const idx = (ch.codePointAt(0) || 1) - 1;
          return op.kind === 'insert' ? toWords[idx] : fromWords[idx];
        })
        .filter(Boolean);
      return { ...op, content: words.join(' ') };
    })
    .filter((op) => op.content.length > 0);
};

type LayoutItem = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type DragRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const buildLayout = (
  ids: string[],
  containerWidth: number,
  getSize: (id: string) => { width: number; height: number },
) => {
  const widthLimit = Math.max(containerWidth, 1);
  const positions = new Map<string, LayoutItem>();
  const ordered: LayoutItem[] = [];
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  ids.forEach((id) => {
    const size = getSize(id);
    const width = size.width || FALLBACK_SIZE.width;
    const height = size.height || FALLBACK_SIZE.height;
    if (x > 0 && x + width > widthLimit) {
      x = 0;
      y += rowHeight + GAP;
      rowHeight = 0;
    }
    const item = { id, x, y, width, height };
    positions.set(id, item);
    ordered.push(item);
    x += width + GAP;
    rowHeight = Math.max(rowHeight, height);
  });
  const height = ordered.length ? y + rowHeight : 0;
  return { positions, ordered, height };
};

const getInsertIndex = (
  ordered: LayoutItem[],
  point: { x: number; y: number },
) => {
  for (let i = 0; i < ordered.length; i += 1) {
    const item = ordered[i];
    if (point.y < item.y) {
      return i;
    }
    if (point.y <= item.y + item.height) {
      if (point.x <= item.x + item.width / 2) {
        return i;
      }
    }
  }
  return ordered.length;
};

const toDragRect = (
  rect?: { left: number; top: number; width: number; height: number } | null,
): DragRect | null =>
  rect
    ? {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }
    : null;

const getActiveDragRect = (active: DragMoveEvent['active']): DragRect | null =>
  toDragRect(active.rect.current.translated ?? active.rect.current.initial);

const PieceTag: FC<{ piece: Piece; status?: Status; className?: string }> = ({
  piece,
  status = 'default',
  className,
}) => {
  return (
    <Tag
      size="md"
      className={className}
      color={
        (
          {
            correct: 'green',
            wrong: 'red',
            missed: 'yellow',
            default: 'default',
          } as const
        )[status]
      }
    >
      <NativeText text={piece.text} />
    </Tag>
  );
};

const SortablePiece: FC<{
  piece: Piece;
  status?: Status;
  disabled?: boolean;
  position: LayoutItem;
  onClick?: () => void;
  isMoving?: boolean;
}> = ({ piece, status, disabled, position, onClick, isMoving }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: piece.id,
    disabled,
  });
  const outerStyle = {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: position.width,
    height: position.height,
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    transition: isDragging ? undefined : 'transform 150ms ease',
    boxSizing: 'border-box' as const,
  };
  const innerStyle = {
    width: '100%',
    height: '100%',
    opacity: isDragging ? 0.35 : isMoving ? 0 : 1,
    zIndex: isDragging ? 1 : undefined,
    touchAction: 'none' as const,
  };
  return (
    <div style={outerStyle} data-piece-id={piece.id}>
      <div
        ref={setNodeRef}
        style={innerStyle}
        {...attributes}
        {...listeners}
        onClick={onClick}
      >
        <PieceTag
          piece={piece}
          status={status}
          className={clsx(
            'cursor-grab select-none',
            isDragging ? 'cursor-grabbing' : '',
          )}
        />
      </div>
    </div>
  );
};

const StaticPiece: FC<{
  piece: Piece;
  status?: Status;
  position: LayoutItem;
  className?: string;
}> = ({ piece, status, position, className }) => {
  const style = {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: position.width,
    height: position.height,
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    transition: 'transform 150ms ease',
    boxSizing: 'border-box' as const,
    opacity: 0.35,
    zIndex: 1,
    pointerEvents: 'none' as const,
  };
  return (
    <div style={style} data-piece-id={piece.id}>
      <PieceTag
        piece={piece}
        status={status}
        className={clsx('cursor-grab select-none', className)}
      />
    </div>
  );
};

const SortableContainer: FC<{
  pieces: Piece[];
  statusMap: Map<string, Status>;
  disabled?: boolean;
  containerRef: (node: HTMLDivElement | null) => void;
  layout: {
    positions: Map<string, LayoutItem>;
    height: number;
  };
  isOver?: boolean;
  emptyHint?: string;
  placeholder?: Piece | null;
  onPieceClick?: (id: string) => void;
  movingId?: string | null;
}> = ({
  pieces,
  statusMap,
  disabled,
  containerRef,
  layout,
  isOver,
  emptyHint,
  placeholder,
  onPieceClick,
  movingId,
}) => {
  const placeholderPosition = placeholder
    ? layout.positions.get(placeholder.id)
    : null;
  const hasItems = pieces.length > 0 || placeholderPosition;
  return (
    <div
      className={clsx(
        'rounded border p-3 min-h-20 transition-colors',
        tw.borderColor,
        isOver ? 'bg-indigo-50/80 dark:bg-indigo-900/30' : '',
      )}
    >
      <div
        ref={containerRef}
        className="relative"
        style={{
          height: hasItems ? layout.height : undefined,
          minHeight: MIN_CONTAINER_HEIGHT,
        }}
      >
        {pieces.length ? (
          pieces.map((piece) => {
            const position = layout.positions.get(piece.id);
            if (!position) return null;
            return (
              <SortablePiece
                key={piece.id}
                piece={piece}
                status={statusMap.get(piece.id)}
                position={position}
                disabled={disabled}
                isMoving={movingId === piece.id}
                onClick={
                  onPieceClick ? () => onPieceClick(piece.id) : undefined
                }
              />
            );
          })
        ) : placeholderPosition ? null : (
          <div className="text-sm text-neutral-500">{emptyHint}</div>
        )}
        {placeholderPosition && placeholder ? (
          <StaticPiece
            piece={placeholder}
            status={statusMap.get(placeholder.id)}
            position={placeholderPosition}
          />
        ) : null}
      </div>
    </div>
  );
};

const Playground: FC<{ pieces: Piece[] }> = ({ pieces }) => {
  const [back] = useBack();
  const caseSensitive = useAtomValue(caseSensitiveAtom);
  const [items, setItems] = useCrossState<ItemsState>('ordering-items', () => ({
    [BANK_ID]: shuffle(pieces.map(({ id }) => id)),
    [SEQUENCE_ID]: [],
  }));
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeOrigin = useRef<ContainerId | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const pendingMoveRef = useRef<{
    id: string;
    fromRect: DOMRect;
  } | null>(null);
  const moveCloneRef = useRef<HTMLElement | null>(null);
  const moveTimeoutRef = useRef<number | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const sizeRef = useRef<Map<string, { width: number; height: number }>>(
    new Map(),
  );
  const [sizes, setSizes] = useState<
    Map<string, { width: number; height: number }>
  >(new Map());
  const containerRefs = useRef(new Map<ContainerId, HTMLDivElement>());
  const containerIdByNode = useRef(new WeakMap<Element, ContainerId>());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const containerRefCallbacks = useRef(
    new Map<ContainerId, (node: HTMLDivElement | null) => void>(),
  );
  const [containerWidths, setContainerWidths] = useState<
    Record<ContainerId, number>
  >({
    [BANK_ID]: 0,
    [SEQUENCE_ID]: 0,
  });
  const [dragState, setDragState] = useState<{
    overContainer: ContainerId | null;
    overIndex: number;
  } | null>(null);

  const pieceMap = useMemo(
    () => new Map<string, Piece>(pieces.map((piece) => [piece.id, piece])),
    [pieces],
  );
  const activePiece = activeId ? (pieceMap.get(activeId) ?? null) : null;

  useLayoutEffect(() => {
    if (!measureRef.current) return;
    const map = new Map<string, { width: number; height: number }>(
      sizeRef.current,
    );
    pieces.forEach((piece) => {
      const el = measureRef.current?.querySelector<HTMLElement>(
        `[data-measure-id="${piece.id}"]`,
      );
      if (el) {
        const rect = el.getBoundingClientRect();
        map.set(piece.id, { width: rect.width, height: rect.height });
      }
    });
    sizeRef.current = map;
    setSizes(map);
  }, [pieces]);

  useLayoutEffect(() => {
    if (!activeId) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevTouchAction = body.style.touchAction;
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    return () => {
      body.style.overflow = prevOverflow;
      body.style.touchAction = prevTouchAction;
    };
  }, [activeId]);

  useLayoutEffect(() => {
    if (!activeId) {
      setDragState(null);
    }
  }, [activeId]);

  const clearMoveArtifacts = useMemoizedFn((resetId: boolean) => {
    if (moveTimeoutRef.current) {
      window.clearTimeout(moveTimeoutRef.current);
      moveTimeoutRef.current = null;
    }
    if (moveCloneRef.current) {
      moveCloneRef.current.remove();
      moveCloneRef.current = null;
    }
    if (resetId) {
      setMovingId(null);
    }
  });

  useLayoutEffect(() => () => clearMoveArtifacts(true), [clearMoveArtifacts]);

  const getSize = (id: string) =>
    sizes.get(id) ?? sizeRef.current.get(id) ?? FALLBACK_SIZE;

  useLayoutEffect(() => {
    resizeObserverRef.current = new ResizeObserver((entries) => {
      setContainerWidths((prev) => {
        let next = prev;
        entries.forEach((entry) => {
          const id = containerIdByNode.current.get(entry.target);
          if (!id) return;
          const width = entry.contentRect.width;
          if (next[id] !== width) {
            if (next === prev) {
              next = { ...prev };
            }
            next[id] = width;
          }
        });
        return next;
      });
    });
    const observer = resizeObserverRef.current;
    containerRefs.current.forEach((node) => {
      observer?.observe(node);
    });
    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
    };
  }, []);

  const setContainerRef = useMemoizedFn((id: ContainerId) => {
    const existing = containerRefCallbacks.current.get(id);
    if (existing) return existing;
    const callback = (node: HTMLDivElement | null) => {
      const observer = resizeObserverRef.current;
      const prev = containerRefs.current.get(id);
      if (prev && observer) {
        observer.unobserve(prev);
      }
      if (node) {
        containerRefs.current.set(id, node);
        containerIdByNode.current.set(node, id);
        observer?.observe(node);
        setContainerWidths((prevWidths) => {
          const width = node.clientWidth;
          if (prevWidths[id] === width) {
            return prevWidths;
          }
          return { ...prevWidths, [id]: width };
        });
      } else {
        containerRefs.current.delete(id);
      }
    };
    containerRefCallbacks.current.set(id, callback);
    return callback;
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: DRAG_REORDER_DISTANCE },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: DRAG_REORDER_DISTANCE },
    }),
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_REORDER_DISTANCE },
    }),
  );

  const findContainer = useMemoizedFn(
    (id: string | undefined | null): ContainerId | null => {
      if (!id) return null;
      if ((CONTAINERS as readonly string[]).includes(id)) return id as ContainerId;
      const found = (CONTAINERS as readonly ContainerId[]).find((key) =>
        items[key].includes(id),
      ) as ContainerId | undefined;
      return found ?? null;
    },
  );

  const statusMap = useMemo(() => {
    if (!back) {
      return new Map<string, Status>();
    }
    const map = new Map<string, Status>();
    const sequence = items[SEQUENCE_ID];
    sequence.forEach((id, idx) => {
      map.set(id, pieces[idx]?.id === id ? 'correct' : 'wrong');
    });
    pieces.forEach((piece) => {
      if (!sequence.includes(piece.id)) {
        map.set(piece.id, 'missed');
      }
    });
    return map;
  }, [back, items, pieces]);

  const resetDrag = useMemoizedFn(() => {
    setActiveId(null);
    setDragState(null);
    activeOrigin.current = null;
  });

  const handlePieceClick = useMemoizedFn((pieceId: string) => {
    if (back || activeId) return;
    const origin = findContainer(pieceId);
    if (!origin) return;
    const target = origin === BANK_ID ? SEQUENCE_ID : BANK_ID;
    const sourceNode = document.querySelector<HTMLElement>(
      `[data-piece-id="${pieceId}"]`,
    );
    if (sourceNode) {
      clearMoveArtifacts(true);
      const fromRect = sourceNode.getBoundingClientRect();
      const clone = sourceNode.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.left = `${fromRect.left}px`;
      clone.style.top = `${fromRect.top}px`;
      clone.style.width = `${fromRect.width}px`;
      clone.style.height = `${fromRect.height}px`;
      clone.style.margin = '0';
      clone.style.transform = 'translate3d(0, 0, 0)';
      clone.style.zIndex = '9999';
      clone.style.pointerEvents = 'none';
      clone.style.boxSizing = 'border-box';
      clone.style.opacity = '1';
      document.body.appendChild(clone);
      moveCloneRef.current = clone;
      pendingMoveRef.current = { id: pieceId, fromRect };
      setMovingId(pieceId);
    } else {
      pendingMoveRef.current = null;
      setMovingId(null);
    }
    setItems((prev) => {
      const next: ItemsState = {
        [BANK_ID]: [...prev[BANK_ID]],
        [SEQUENCE_ID]: [...prev[SEQUENCE_ID]],
      };
      const originList = next[origin];
      const fromIndex = originList.indexOf(pieceId);
      if (fromIndex >= 0) {
        originList.splice(fromIndex, 1);
      }
      next[target].push(pieceId);
      return next;
    });
  });

  const handleDragStart = useMemoizedFn(({ active }: DragStartEvent) => {
    if (back) return;
    const id = active.id.toString();
    pendingMoveRef.current = null;
    clearMoveArtifacts(true);
    resetDrag();
    setActiveId(id);
    const origin = findContainer(id) as ContainerId | null;
    activeOrigin.current = origin;
  });

  const handleDragCancel = useMemoizedFn(() => {
    resetDrag();
  });

  const displayItems = useMemo(() => {
    if (!activeId || !activeOrigin.current) {
      return items;
    }
    if (!dragState?.overContainer) {
      return items;
    }
    const origin = activeOrigin.current;
    const next: ItemsState = {
      [BANK_ID]: [...items[BANK_ID]],
      [SEQUENCE_ID]: [...items[SEQUENCE_ID]],
    };
    const originList = next[origin];
    const originIndex = originList.indexOf(activeId);
    if (originIndex >= 0) {
      originList.splice(originIndex, 1);
    }
    const target = dragState.overContainer;
    const insertIndex = dragState.overIndex;
    const targetList = next[target];
    const safeIndex = Math.min(Math.max(insertIndex, 0), targetList.length);
    targetList.splice(safeIndex, 0, activeId);
    return next;
  }, [activeId, dragState, items]);

  const resolveDragState = useMemoizedFn(
    (activeIdStr: string, rect?: DragRect | null) => {
      if (!rect) return null;
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      for (const id of CONTAINERS) {
        const node = containerRefs.current.get(id);
        if (!node) continue;
        const box = node.getBoundingClientRect();
        if (
          center.x >= box.left &&
          center.x <= box.right &&
          center.y >= box.top &&
          center.y <= box.bottom
        ) {
          const local = { x: center.x - box.left, y: center.y - box.top };
          const list = displayItems[id].filter(
            (itemId) => itemId !== activeIdStr,
          );
          const layout = buildLayout(list, box.width, getSize);
          const index = getInsertIndex(layout.ordered, local);
          return { overContainer: id, overIndex: index };
        }
      }

      return null;
    },
  );

  const handleDragMove = useMemoizedFn(({ active, delta }: DragMoveEvent) => {
    if (back) return;
    const activeIdStr = active.id.toString();
    const distance = Math.hypot(delta.x, delta.y);
    if (distance < DRAG_REORDER_DISTANCE) {
      setDragState((prev) => (prev ? null : prev));
      return;
    }
    const rect = getActiveDragRect(active);
    const nextState = resolveDragState(activeIdStr, rect);

    setDragState((prev) => {
      if (
        prev?.overContainer === nextState?.overContainer &&
        prev?.overIndex === nextState?.overIndex
      ) {
        return prev;
      }
      return nextState;
    });
  });

  useLayoutEffect(() => {
    const pending = pendingMoveRef.current;
    if (!pending) return;
    const targetNode = document.querySelector<HTMLElement>(
      `[data-piece-id="${pending.id}"]`,
    );
    if (!targetNode) return;
    pendingMoveRef.current = null;
    const clone = moveCloneRef.current;
    if (!clone) return;
    const toRect = targetNode.getBoundingClientRect();
    const dx = toRect.left - pending.fromRect.left;
    const dy = toRect.top - pending.fromRect.top;
    if (Math.hypot(dx, dy) < 1) {
      clearMoveArtifacts(true);
      return;
    }
    clone.style.transition =
      'transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1)';
    requestAnimationFrame(() => {
      clone.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });
    const finalize = () => {
      clearMoveArtifacts(true);
    };
    clone.addEventListener('transitionend', finalize, { once: true });
    moveTimeoutRef.current = window.setTimeout(finalize, 260);
  }, [items, clearMoveArtifacts]);

  const handleDragEnd = useMemoizedFn(({ active }: DragEndEvent) => {
    if (back || !activeOrigin.current) {
      resetDrag();
      return;
    }

    const origin = activeOrigin.current;
    const activeIdStr = active.id.toString();
    const rect = getActiveDragRect(active);
    const drag = resolveDragState(activeIdStr, rect) ?? dragState;
    if (!drag?.overContainer) {
      resetDrag();
      return;
    }

    const target = drag.overContainer;
    const insertIndex = drag.overIndex;

    setItems((prev) => {
      const next = {
        [BANK_ID]: [...prev[BANK_ID]],
        [SEQUENCE_ID]: [...prev[SEQUENCE_ID]],
      };
      const originList = next[origin];
      const fromIndex = originList.indexOf(activeIdStr);
      if (fromIndex >= 0) {
        originList.splice(fromIndex, 1);
      }
      const targetList = next[target];
      const safeIndex = Math.min(Math.max(insertIndex, 0), targetList.length);
      targetList.splice(safeIndex, 0, activeIdStr);
      return next;
    });

    resetDrag();
  });

  const bankPieces = useMemo(
    () =>
      items[BANK_ID].map((id) => pieceMap.get(id)).filter(Boolean) as Piece[],
    [items, pieceMap],
  );
  const sequencePieces = useMemo(
    () =>
      items[SEQUENCE_ID].map((id) => pieceMap.get(id)).filter(
        Boolean,
      ) as Piece[],
    [items, pieceMap],
  );
  const bankPlaceholder =
    activePiece &&
    dragState?.overContainer === BANK_ID &&
    !items[BANK_ID].includes(activePiece.id)
      ? activePiece
      : null;
  const sequencePlaceholder =
    activePiece &&
    dragState?.overContainer === SEQUENCE_ID &&
    !items[SEQUENCE_ID].includes(activePiece.id)
      ? activePiece
      : null;
  const sequenceText = useMemo(() => {
    const sourceItems = back ? items : displayItems;
    return sourceItems[SEQUENCE_ID].map((id) => pieceMap.get(id))
      .filter(Boolean)
      .map((piece) => (piece as Piece).text)
      .join(' ');
  }, [back, displayItems, items, pieceMap]);
  const correctText = useMemo(
    () => pieces.map((piece) => piece.text).join(' '),
    [pieces],
  );
  const diffOps = useMemo(() => {
    if (!back) return null;
    const compare = (a: string, b: string) =>
      caseSensitive ? a === b : a.toLowerCase() === b.toLowerCase();
    return getWordOps(sequenceText, correctText, compare);
  }, [back, caseSensitive, sequenceText, correctText]);
  const layouts = useMemo(() => {
    return {
      [BANK_ID]: buildLayout(
        displayItems[BANK_ID],
        containerWidths[BANK_ID],
        getSize,
      ),
      [SEQUENCE_ID]: buildLayout(
        displayItems[SEQUENCE_ID],
        containerWidths[SEQUENCE_ID],
        getSize,
      ),
    };
  }, [containerWidths, displayItems, getSize]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={clsx('mt-3 space-y-3', back ? '' : 'select-none')}>
        {back ? (
          <>
            <div
              className={clsx('rounded border p-3 space-y-2', tw.borderColor)}
            >
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {t.orderingYourSentence}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300">
                {sequenceText ? <NativeText text={sequenceText} /> : '-'}
              </div>
            </div>
            <div
              className={clsx('rounded border p-3 space-y-2', tw.borderColor)}
            >
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {t.orderingCorrectSentence}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300">
                {correctText ? <NativeText text={correctText} /> : '-'}
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              ref={measureRef}
              className="fixed top-[-9999px] left-[-9999px] pointer-events-none"
              style={{ visibility: 'hidden' }}
            >
              {pieces.map((piece) => (
                <div
                  key={piece.id}
                  data-measure-id={piece.id}
                  style={{ display: 'inline-flex', boxSizing: 'border-box' }}
                >
                  <PieceTag piece={piece} />
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-neutral-500">
                {t.orderingFragments}
              </div>
              <SortableContainer
                pieces={bankPieces}
                statusMap={statusMap}
                disabled={back}
                emptyHint={t.orderingNoFragments}
                containerRef={setContainerRef(BANK_ID)}
                layout={layouts[BANK_ID]}
                isOver={dragState?.overContainer === BANK_ID}
                placeholder={bankPlaceholder}
                movingId={movingId}
                onPieceClick={handlePieceClick}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-neutral-500">
                {t.orderingArrangeHere}
              </div>
              <SortableContainer
                pieces={sequencePieces}
                statusMap={statusMap}
                disabled={back}
                emptyHint={t.orderingArrangeHint}
                containerRef={setContainerRef(SEQUENCE_ID)}
                layout={layouts[SEQUENCE_ID]}
                isOver={dragState?.overContainer === SEQUENCE_ID}
                placeholder={sequencePlaceholder}
                movingId={movingId}
                onPieceClick={handlePieceClick}
              />
            </div>
            <div className="text-sm text-neutral-500">
              {sequenceText ? (
                <NativeText text={sequenceText} />
              ) : (
                t.orderingSequencePlaceholder
              )}
            </div>
          </>
        )}
        {back ? (
          <div className="space-y-3">
            <div
              className={clsx('rounded border p-3 space-y-2', tw.borderColor)}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  {t.orderingYourAnswer}
                </div>
                <div className="text-xs text-neutral-500">
                  <span className="inline-flex items-center gap-1 mr-2">
                    <span className="inline-block h-2 w-2 rounded bg-green-300 dark:bg-green-800" />
                    {t.orderingMatch}
                  </span>
                  <span className="inline-flex items-center gap-1 mr-2">
                    <span className="inline-block h-2 w-2 rounded bg-yellow-300 dark:bg-yellow-800" />
                    {t.orderingMissing}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded bg-red-300 dark:bg-red-800" />
                    {t.orderingExtra}
                  </span>
                </div>
              </div>
              <div className="text-sm leading-6">
                {diffOps?.length
                  ? diffOps.map((op, idx) => (
                      <span
                        key={idx}
                        className={clsx('rounded px-1', {
                          'bg-green-200 dark:bg-green-900/50':
                            op.kind === 'retain',
                          'bg-yellow-200 dark:bg-yellow-900/50':
                            op.kind === 'insert',
                          'bg-red-200 dark:bg-red-900/50 line-through':
                            op.kind === 'delete',
                        })}
                      >
                        <NativeText
                          text={
                            idx < diffOps.length - 1
                              ? `${op.content} `
                              : op.content
                          }
                        />
                      </span>
                    ))
                  : '-'}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <DragOverlay dropAnimation={null}>
        {activePiece ? (
          <PieceTag
            piece={activePiece}
            status={statusMap.get(activePiece.id)}
            className="cursor-grabbing select-none shadow"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default () => {
  const hasNote = !isFieldEmpty(FIELD_ID('note'));
  const pieces = useCreation((): Piece[] => {
    const node = document.getElementById(FIELD_ID('items'));
    const text = node ? domToText(node, ['br']) : '';
    return text
      .split(/,,|\n/)
      .map((piece) => piece.trim())
      .filter(Boolean)
      .map(
        (text, idx) =>
          ({
            text,
            id: idx.toString(),
          }) as Piece,
      );
  }, []);

  return (
    <CardShell
      title={t.question}
      questionExtra={<Playground pieces={pieces} />}
      answer={
        hasNote ? (
          <AnkiField
            name="note"
            className={'prose prose-sm dark:prose-invert'}
          />
        ) : null
      }
    />
  );
};
