export interface GridConfig {
  columns: number;
  rows: number;
  gap: number;
  page: {
    width: string;
    height: string;
    orientation: 'portrait' | 'landscape';
  };
}

export interface GridPosition {
  startCol: number;
  endCol: number;
  startRow: number;
  endRow: number;
}

export interface ElementStyles {
  color?: string;
  fontSize?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  backgroundColor?: string;
  padding?: string;
  border?: string;
  borderRadius?: string;
}

export interface LayoutElement {
  id: string;
  type: 'text' | 'image';
  gridPosition: GridPosition;
  content?: string;
  src?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'stretch';
  styles?: ElementStyles;
}

export interface Layout {
  grid: GridConfig;
  elements: LayoutElement[];
}

export interface ElementTemplate {
  type: 'text' | 'image';
  label: string;
  icon?: string;
  defaultContent?: string;
  defaultStyles?: ElementStyles;
}