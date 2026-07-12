export type MatchItem = {
  id: string;
  html: string;
};

export type MatchCategory = {
  id: string;
  html: string;
};

export type MatchCollection = {
  category: MatchCategory;
  items: MatchItem[];
};

export const extractCollections = (field: HTMLElement): MatchCollection[] =>
  field.innerHTML
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .split('\n')
    .filter((line) => line.includes('::'))
    .map((line) => {
      const colonIndex = line.indexOf('::');
      return {
        category: line.substring(0, colonIndex).trim(),
        items: line
          .substring(colonIndex + 2)
          .split(',,')
          .map((item) => item.trim())
          .filter(Boolean),
      };
    })
    .map(({ category, items }, idx) => ({
      category: {
        html: category,
        id: idx.toString(),
      },
      items: items.map((item, itemIdx) => ({
        html: item,
        id: `${idx}-${itemIdx}`,
      })),
    }));
