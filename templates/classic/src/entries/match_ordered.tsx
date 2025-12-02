import { CardShell } from '@/components/card-shell';
import { NativeText } from '@/components/native-text';
import { Tag } from '@/components/tag';
import { useBack } from '@/hooks/use-back';
import { useCrossState } from '@/hooks/use-cross-state';
import { tw } from '@/styles/tw';
import { FIELD_ID } from '@/utils/const';
import { domToText } from '@/utils/dom-to-text';
import { isFieldEmpty } from '@/utils/field';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useCreation from 'ahooks/es/useCreation';
import useMemoizedFn from 'ahooks/es/useMemoizedFn';
import * as t from 'at/i18n';
import { AnkiField } from 'at/virtual/field';
import clsx from 'clsx';
import { FC, useMemo } from 'react';

type Item = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
};

type Collection = {
  category: Category;
  items: Item[];
};

const belongTo = (item: Item, items: Item[]) =>
  !!items.find(({ name }) => name === item.name);

const SortableItem: FC<{
  item: Item;
  status?: 'correct' | 'missed' | 'wrong' | 'default';
}> = ({ item, status = 'default' }) => {
  const [back] = useBack();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: back,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 99999 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Tag
        size="md"
        className={isDragging ? 'shadow' : undefined}
        color={
          (
            {
              correct: 'green',
              missed: 'yellow',
              wrong: 'red',
              default: 'default',
            } as const
          )[status]
        }
      >
        <NativeText text={item.name} />
      </Tag>
    </div>
  );
};

const CategoryContainer: FC<{
  collection: Collection;
  items: Item[];
}> = ({ collection, items }) => {
  const { category } = collection;
  const [back] = useBack();

  const getItemStatus = useMemoizedFn((item: Item, index: number) => {
    if (!back) return 'default';
    const expectedItem = collection.items[index];
    if (expectedItem && expectedItem.name === item.name) return 'correct';
    if (belongTo(item, collection.items)) return 'wrong';
    return 'wrong';
  });

  const missedItems = useMemo(() => {
    if (!back) return [];
    return collection.items.filter((item) => !belongTo(item, items));
  }, [collection.items, items, back]);

  return (
    <div className={clsx('border p-2 min-h-20 rounded', tw.borderColor)}>
      <div className="font-semibold text-lg">{category.name}</div>
      <div className="flex flex-col gap-2 mt-2">
        {items.map((item, index) => (
          <SortableItem
            key={item.id}
            item={item}
            status={getItemStatus(item, index)}
          />
        ))}
        {missedItems.map((item) => (
          <SortableItem key={item.id} item={item} status="missed" />
        ))}
      </div>
    </div>
  );
};

const Playground: FC<{ collections: Collection[] }> = ({ collections }) => {
  const [categoryItems, setCategoryItems] = useCrossState(
    'ordered-category-items',
    () => {
      const result: Record<string, Item[]> = {};
      collections.forEach((collection) => {
        result[collection.category.id] = [...collection.items];
      });
      return result;
    },
  );

  const handleDragEnd = useMemoizedFn((categoryId: string) => {
    return (event: any) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const items = categoryItems[categoryId];
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        setCategoryItems({
          ...categoryItems,
          [categoryId]: newItems,
        });
      }
    };
  });

  const [back] = useBack();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div className={clsx('mt-2', back ? '' : 'select-none')}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {collections.map((collection) => (
          <DndContext
            key={collection.category.id}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd(collection.category.id)}
          >
            <SortableContext
              items={categoryItems[collection.category.id].map(
                (item) => item.id,
              )}
              strategy={verticalListSortingStrategy}
            >
              <CategoryContainer
                collection={collection}
                items={categoryItems[collection.category.id]}
              />
            </SortableContext>
          </DndContext>
        ))}
      </div>
      {back ? (
        <div className="text-sm flex justify-end gap-2 mt-4">
          <Tag size="sm" color="green">
            {t.correctAnswer}
          </Tag>
          <Tag size="sm" color="red">
            {t.wrongAnswer}
          </Tag>
          <Tag size="sm" color="yellow">
            {t.missedAnswer}
          </Tag>
        </div>
      ) : null}
    </div>
  );
};

export default () => {
  const hasNote = !isFieldEmpty(FIELD_ID('note'));
  const collections = useCreation((): Collection[] => {
    const node = document.getElementById(FIELD_ID('items'));
    const text = node ? domToText(node, ['br']) : '';
    return text
      .split('\n')
      .filter((line) => line.includes('::'))
      .map((line) => {
        const colonIndex = line.indexOf('::');
        const category = line.substring(0, colonIndex).trim();
        const items = line
          .substring(colonIndex + 2)
          .split(',,')
          .map((item) => item.trim());
        return {
          category,
          items,
        };
      })
      .map(
        ({ category, items }, idx) =>
          ({
            category: {
              name: category,
              id: idx.toString(),
            },
            items: items.map((item, itemIdx) => ({
              name: item,
              id: `${idx}-${itemIdx}`,
            })),
          }) as Collection,
      );
  }, []);

  return (
    <CardShell
      title={t.question}
      questionExtra={<Playground collections={collections} />}
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
