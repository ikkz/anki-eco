const GAP = 8;
const FALLBACK_SIZE = { width: 80, height: 32 };

export const LONG_PIECE_ROW_THRESHOLD = 0.65;

export type LayoutItem = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const clampPieceWidth = (width: number, containerWidth: number) => {
  const widthLimit = Math.max(containerWidth, 1);
  return Math.min(width || FALLBACK_SIZE.width, widthLimit);
};

export const shouldPieceTakeWholeRow = (width: number, containerWidth: number) => {
  const widthLimit = Math.max(containerWidth, 1);
  return width >= widthLimit * LONG_PIECE_ROW_THRESHOLD;
};

export const buildOrderingLayout = (
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
    const width = clampPieceWidth(size.width, widthLimit);
    const height = size.height || FALLBACK_SIZE.height;
    const takesWholeRow = shouldPieceTakeWholeRow(width, widthLimit);

    if (takesWholeRow && x > 0) {
      x = 0;
      y += rowHeight + GAP;
      rowHeight = 0;
    } else if (x > 0 && x + width > widthLimit) {
      x = 0;
      y += rowHeight + GAP;
      rowHeight = 0;
    }

    const item = { id, x, y, width, height };
    positions.set(id, item);
    ordered.push(item);

    if (takesWholeRow) {
      x = 0;
      y += height + GAP;
      rowHeight = 0;
      return;
    }

    x += width + GAP;
    rowHeight = Math.max(rowHeight, height);
  });

  const height = ordered.length ? (rowHeight > 0 ? y + rowHeight : y - GAP) : 0;
  return { positions, ordered, height };
};
