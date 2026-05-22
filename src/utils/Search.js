/* Dashy: Licensed under MIT, (C) Alicia Sykes 2024 <https://aliciasykes.com> */

/* Tile filtering utility */
import ErrorHandler from '@/utils/logging/ErrorHandler';

/**
 * Extracts the site name from domain
 * @param {string} url The URL to process
 * @returns {string} The hostname from URL
 */
const getDomainFromUrl = (url) => {
  if (!url) return '';
  const urlPattern = /^(?:https?:\/\/)?(?:w{3}\.)?([a-z\d.-]+)\.(?:[a-z.]{2,10})(?:[/\w.-]*)*/;
  const domainPattern = urlPattern.exec(url);
  return domainPattern ? domainPattern[1] : '';
};

/* Normalize a string for case/punctuation-insensitive matching */
const NORMALIZE_RE = /[^\w\s\p{Alpha}]/giu;
const normalize = (input) => (input == null ? '' : input.toString().toLowerCase().replace(NORMALIZE_RE, ''));

/* Per-tile cache of the concatenated searchable text */
const haystackCache = new WeakMap();

const buildHaystack = (tile) => {
  const {
    title, description, provider, url, tags,
  } = tile;
  const tagsStr = Array.isArray(tags) ? tags.join(' ') : (tags || '');
  return normalize(`${title || ''} ${provider || ''} ${description || ''} ${tagsStr} ${getDomainFromUrl(url)}`);
};

const getHaystack = (tile) => {
  let h = haystackCache.get(tile);
  if (h === undefined) {
    h = buildHaystack(tile);
    haystackCache.set(tile, h);
  }
  return h;
};

/**
 * Filter tiles based on users search term, and returns a filtered list
 * Will match based on title, description, provider, hostname from url and tags
 * Ignores case, special characters and other irrelevant things
 * @param {array} allTiles An array of tiles
 * @param {string} searchTerm The users search term
 * @returns A filtered array of tiles
 */
export const searchTiles = (allTiles, searchTerm) => {
  if (!searchTerm) return allTiles;
  if (!allTiles) return [];
  const words = normalize(searchTerm).split(/\s+/).filter(Boolean);
  if (!words.length) return allTiles;
  return allTiles.filter((tile) => {
    const haystack = getHaystack(tile);
    return words.every((word) => haystack.includes(word));
  });
};

/* From a list of search bangs, return the URL associated with it */
export const getSearchEngineFromBang = (searchQuery, bangList) => {
  const bangNames = Object.keys(bangList);
  const foundBang = bangNames.find((bang) => searchQuery.includes(bang));
  return bangList[foundBang];
};

/* For a given search engine key, return the corresponding URL, or throw error */
export const findUrlForSearchEngine = (searchEngine, availableSearchEngines) => {
  // If missing search engine, report error return false
  if (!searchEngine) { ErrorHandler('No search engine specified'); return undefined; }
  // If search engine is already a URL, then return it
  if ((/(http|https):\/\/[^]*/).test(searchEngine)) return searchEngine;
  // If search engine was found successfully, return the URL
  if (availableSearchEngines[searchEngine]) return availableSearchEngines[searchEngine];
  // Otherwise, there's been an error, log it and return false
  ErrorHandler(`Specified Search Engine was not Found: '${searchEngine}'`);
  return undefined;
};

/* Removes all known bangs from a search query */
export const stripBangs = (searchQuery, bangList) => {
  const bangNames = Object.keys(bangList || {});
  let q = searchQuery;
  bangNames.forEach((bang) => { q = q.replace(bang, ''); });
  return q.trim();
};
