// Images are real PNG files from Twemoji (Twitter's open-source emoji
// artwork, CC-BY 4.0), served via jsdelivr's CDN - not text/emoji glyphs.
// Chosen over hotlinking arbitrary photo URLs since every URL here was
// verified to actually return 200 before being used (jsdelivr + a
// well-known open-source asset set is far less likely to rot or block
// hotlinking than a random photo site).
const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/';

export interface NamingItem {
  word: string;
  imageUrl: string;
  wrongOptions: string[];
}

export const NAMING_ITEMS: NamingItem[] = [
  { word: 'apple', imageUrl: `${TWEMOJI_BASE}1f34e.png`, wrongOptions: ['orange', 'tomato', 'banana'] },
  { word: 'dog', imageUrl: `${TWEMOJI_BASE}1f436.png`, wrongOptions: ['cat', 'cow', 'horse'] },
  { word: 'cup', imageUrl: `${TWEMOJI_BASE}2615.png`, wrongOptions: ['bowl', 'glass', 'plate'] },
  { word: 'chair', imageUrl: `${TWEMOJI_BASE}1fa91.png`, wrongOptions: ['table', 'stool', 'bench'] },
  { word: 'spoon', imageUrl: `${TWEMOJI_BASE}1f944.png`, wrongOptions: ['fork', 'knife', 'spatula'] },
  { word: 'book', imageUrl: `${TWEMOJI_BASE}1f4d6.png`, wrongOptions: ['magazine', 'notebook', 'folder'] },
  { word: 'shoe', imageUrl: `${TWEMOJI_BASE}1f45f.png`, wrongOptions: ['boot', 'sandal', 'sock'] },
  { word: 'ball', imageUrl: `${TWEMOJI_BASE}26bd.png`, wrongOptions: ['balloon', 'wheel', 'globe'] },
  { word: 'tree', imageUrl: `${TWEMOJI_BASE}1f333.png`, wrongOptions: ['bush', 'flower', 'plant'] },
  { word: 'car', imageUrl: `${TWEMOJI_BASE}1f697.png`, wrongOptions: ['truck', 'bus', 'bicycle'] },
  { word: 'banana', imageUrl: `${TWEMOJI_BASE}1f34c.png`, wrongOptions: ['apple', 'corn', 'orange'] },
  { word: 'cat', imageUrl: `${TWEMOJI_BASE}1f431.png`, wrongOptions: ['dog', 'rabbit', 'mouse'] },
  { word: 'hat', imageUrl: `${TWEMOJI_BASE}1f3a9.png`, wrongOptions: ['helmet', 'cap', 'crown'] },
  { word: 'key', imageUrl: `${TWEMOJI_BASE}1f511.png`, wrongOptions: ['lock', 'coin', 'whistle'] },
  { word: 'clock', imageUrl: `${TWEMOJI_BASE}23f0.png`, wrongOptions: ['watch', 'timer', 'phone'] },
];
