import fs from 'node:fs/promises';
import path from 'node:path';

export interface Sponsor {
  username: string;
  avatar: string;
  url: string;
}

/**
 * Parse the sponsors list from README.md between <!-- sponsors-start --> and <!-- sponsors-end --> markers.
 * Extracts GitHub username, avatar URL, and profile URL from the markdown table rows.
 */
export async function loadSponsors(): Promise<Sponsor[]> {
  const readmePath = path.join(import.meta.dirname, '../../../README.md');
  const content = await fs.readFile(readmePath, { encoding: 'utf8' });

  const startMarker = '<!-- sponsors-start -->';
  const endMarker = '<!-- sponsors-end -->';
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    return [];
  }

  const section = content.slice(startIdx + startMarker.length, endIdx);
  const sponsors: Sponsor[] = [];

  // Match table rows: | <a href="URL"><img src="AVATAR" ...alt="NAME" /></a> | [@NAME](URL) |
  const rowRegex =
    /\|\s*<a href="([^"]+)"><img src="([^"]+)"[^>]*\/><\/a>\s*\|\s*\[@([^\]]+)\]\(([^)]+)\)\s*\|/g;

  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(section)) !== null) {
    sponsors.push({
      url: match[1],
      avatar: match[2],
      username: match[3],
    });
  }

  return sponsors;
}
