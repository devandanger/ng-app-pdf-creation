export interface PageSize {
  name: string;
  width: string;
  height: string;
  displayName: string;
}

export const PAGE_SIZES: PageSize[] = [
  {
    name: 'a4',
    width: '210mm',
    height: '297mm',
    displayName: 'A4 (210 × 297 mm)'
  },
  {
    name: 'a3',
    width: '297mm',
    height: '420mm',
    displayName: 'A3 (297 × 420 mm)'
  },
  {
    name: 'a5',
    width: '148mm',
    height: '210mm',
    displayName: 'A5 (148 × 210 mm)'
  },
  {
    name: 'letter',
    width: '8.5in',
    height: '11in',
    displayName: 'Letter (8.5 × 11 in)'
  },
  {
    name: 'legal',
    width: '8.5in',
    height: '14in',
    displayName: 'Legal (8.5 × 14 in)'
  },
  {
    name: 'tabloid',
    width: '11in',
    height: '17in',
    displayName: 'Tabloid (11 × 17 in)'
  },
  {
    name: 'custom',
    width: '210mm',
    height: '297mm',
    displayName: 'Custom Size'
  }
];

export const DEFAULT_PAGE_SIZE = PAGE_SIZES[0]; // A4