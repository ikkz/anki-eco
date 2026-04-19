import { type ReactNode } from 'react';
import { CardShell } from '@/components/card-shell';
import { DomRenderer } from '@/components/dom-renderer';
import { useBack } from '@/hooks/use-back';
import { useCrossState } from '@/hooks/use-cross-state';
import { FIELD_ID } from '@/utils/const';
import { isFieldEmpty } from '@/utils/field';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useCreation from 'ahooks/es/useCreation';
import * as t from 'at/i18n';
import { AnkiField } from 'at/virtual/field';
import clsx from 'clsx';
import { shuffle } from 'remeda';

import { extractItems } from '@/features/item-ordering/extract';

function SortableItem({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative' as const, zIndex: 9999 } : {}),
  } as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        className,
        isDragging && 'opacity-60 ring-2 ring-indigo-500 shadow-xl relative z-[9999]',
      )}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

const DRAG_REORDER_DISTANCE = 4;

export default () => {
  const [back] = useBack();

  const items = useCreation(() => {
    const field = document.getElementById(FIELD_ID('items'));
    if (!field) return [];
    return extractItems(field);
  }, []);

  const [order, setOrder] = useCrossState<string[]>('item-ordering-order', () => {
    return shuffle(items.map((item) => item.id));
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
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder((currentOrder) => {
        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over.id as string);
        return arrayMove(currentOrder, oldIndex, newIndex);
      });
    }
  };

  const hasNote = !isFieldEmpty(FIELD_ID('note'));

  return (
    <CardShell
      title={t.question}
      questionExtra={
        <div className="mt-4 flex flex-col gap-2 relative">
          {back ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {t.itemOrderingYourOrder}
                </div>
                <div className="flex flex-col gap-2">
                  {order.map((id, index) => {
                    const item = items.find((i) => i.id === id);
                    if (!item) return null;
                    const isCorrect = id === String(index);
                    return (
                      <div
                        key={id}
                        className={clsx(
                          'p-3 rounded-lg border-2 flex items-center justify-between',
                          isCorrect
                            ? '!bg-green-50 !border-green-500 dark:!bg-opacity-10'
                            : '!bg-red-50 !border-red-500 dark:!bg-opacity-10',
                        )}
                      >
                        <div className="prose prose-sm dark:prose-invert rm-prose-y flex-1 overflow-hidden min-w-0">
                          <DomRenderer dom={item.node} clone />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2 mt-6">
                <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {t.itemOrderingCorrectOrder}
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border-2 border-transparent bg-indigo-50 dark:bg-indigo-50 dark:!bg-opacity-10"
                    >
                      <div className="prose prose-sm dark:prose-invert rm-prose-y flex-1 overflow-hidden min-w-0">
                        <DomRenderer dom={item.node} clone />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 select-none touch-none">
              <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
                {t.itemOrderingItems}
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={order} strategy={verticalListSortingStrategy}>
                  {order.map((id) => {
                    const item = items.find((i) => i.id === id);
                    if (!item) return null;
                    return (
                      <SortableItem
                        key={id}
                        id={id}
                        className="p-3 rounded-lg bg-indigo-50 border-2 border-transparent cursor-grab dark:bg-indigo-50 dark:!bg-opacity-10 focus:outline-none transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-neutral-400 dark:text-neutral-600 flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-grip-vertical"
                            >
                              <circle cx="9" cy="12" r="1" />
                              <circle cx="9" cy="5" r="1" />
                              <circle cx="9" cy="19" r="1" />
                              <circle cx="15" cy="12" r="1" />
                              <circle cx="15" cy="5" r="1" />
                              <circle cx="15" cy="19" r="1" />
                            </svg>
                          </div>
                          <div className="prose prose-sm dark:prose-invert rm-prose-y flex-1 overflow-hidden min-w-0">
                            <DomRenderer dom={item.node} clone />
                          </div>
                        </div>
                      </SortableItem>
                    );
                  })}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      }
      answerTitle={t.note}
      answer={
        hasNote ? (
          <AnkiField name="note" className={clsx('prose prose-sm', 'dark:prose-invert')} />
        ) : null
      }
    />
  );
};
