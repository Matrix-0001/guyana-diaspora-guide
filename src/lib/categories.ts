export const CATEGORIES = {
  money: 'Money & Remittances',
  immigration: 'Immigration & Visas',
  documents: 'Passports & Documents',
  property: 'Property & Investing',
} as const;

export type CategoryId = keyof typeof CATEGORIES;
