export type MatchItem = {
  id: string;
  html: string;
};

export type MatchCategory = {
  id: string;
  name: string;
};

export type MatchCollection = {
  category: MatchCategory;
  items: MatchItem[];
};

const getTextFromHtml = (html: string) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container.textContent?.trim() || '';
};

export const extractCollections = (field: HTMLElement): MatchCollection[] =>
  field.innerHTML
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .split('\n')
    .filter((line) => line.includes('::'))
    .map((line) => {
      const colonIndex = line.indexOf('::');
      return {
        category: getTextFromHtml(line.substring(0, colonIndex)),
        items: line
          .substring(colonIndex + 2)
          .split(',,')
          .map((item) => item.trim())
          .filter(Boolean),
      };
    })
    .map(({ category, items }, idx) => ({
      category: {
        name: category,
        id: idx.toString(),
      },
      items: items.map((item, itemIdx) => ({
        html: item,
        id: `${idx}-${itemIdx}`,
      })),
    }));
