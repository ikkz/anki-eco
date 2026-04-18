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
  useDraggable,
  useDroppable,
  DndContext,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import useCreation from 'ahooks/es/useCreation';
import useMemoizedFn from 'ahooks/es/useMemoizedFn';
import * as t from 'at/i18n';
import { AnkiField } from 'at/virtual/field';
import clsx from 'clsx';
import { FC, useMemo } from 'react';
import { shuffle, clone } from 'remeda';

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

const belongTo = (item: Item, items: Item[]) => !!items.find(({ name }) => name === item.name);

const ItemComponent: FC<{
  item: Item;
  status?: 'correct' | 'missed' | 'wrong' | 'default';
}> = ({ item, status = 'default' }) => {
  const [back] = useBack();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    disabled: back,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        zIndex: isDragging ? 99999 : undefined,
        ...style,
      }}
      {...listeners}
      {...attributes}
    >
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
  dropped: Item[];
}> = ({ collection, dropped }) => {
  const { category } = collection;
  const [back] = useBack();
  const { setNodeRef } = useDroppable({ id: category.id, disabled: back });
  const missedItems = useMemo(
    () => collection.items.filter((item) => !belongTo(item, dropped)),
    [collection.items, dropped],
  );
  return (
    <div ref={setNodeRef} className={clsx('border p-2 min-h-20 rounded', tw.borderColor)}>
      <div className="font-semibold text-lg">{category.name}</div>
      <div className="flex flex-wrap gap-2 mt-2">
        {dropped.map((item) => (
          <ItemComponent
            status={back ? (belongTo(item, collection.items) ? 'correct' : 'wrong') : 'default'}
            key={item.id}
            item={item}
          />
        ))}
        {back ? (
          <>
            {missedItems.map((item) => (
              <ItemComponent status="missed" key={item.id} item={item} />
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
};

const Playground: FC<{ collections: Collection[] }> = ({ collections }) => {
  const allItems = useCreation(() => collections.map(({ items }) => items).flat(), []);
  const [items, setItems] = useCrossState('match-items', () =>
    shuffle(collections.map(({ items }) => items).flat()),
  );
  const [dropped, setDropped] = useCrossState('dropped-items', {} as Record<string, Item[]>);

  const onDrop = useMemoizedFn((itemId: string, categoryId: string) => {
    const item = allItems.find(({ id }) => id === itemId)!;
    if (items.find(({ id }) => id === itemId)) {
      setItems(items.filter((item) => item.id !== itemId));
    }
    const cloned = clone(dropped);
    for (const cid of Object.keys(cloned)) {
      cloned[cid] = cloned[cid].filter((item) => item.id !== itemId);
    }
    if (cloned[categoryId]) {
      cloned[categoryId].push(item);
    } else {
      cloned[categoryId] = [item];
    }

    setDropped(cloned);
  });

  const [back] = useBack();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={(event) => {
        if (event.over) {
          onDrop(event.active.id.toString(), event.over.id.toString());
        }
      }}
    >
      <div className={clsx('mt-2', back ? '' : 'select-none')}>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <ItemComponent key={item.id} item={item} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-4">
          {collections.map((collection) => (
            <CategoryContainer
              key={collection.category.id}
              collection={collection}
              dropped={dropped[collection.category.id] || []}
            />
          ))}
        </div>
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
    </DndContext>
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

  const [shuffledCollections] = useCrossState('shuffled-collections', () => shuffle(collections));

  return (
    <CardShell
      title={t.question}
      questionExtra={<Playground collections={shuffledCollections} />}
      answer={
        hasNote ? <AnkiField name="note" className={'prose prose-sm dark:prose-invert'} /> : null
      }
    />
  );
};
