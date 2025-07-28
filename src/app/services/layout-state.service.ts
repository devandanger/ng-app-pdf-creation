import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Layout, LayoutElement, GridConfig, ElementTemplate } from '../interfaces/layout.interface';

@Injectable({
  providedIn: 'root'
})
export class LayoutStateService {
  private readonly defaultGridConfig: GridConfig = {
    columns: 12,
    rows: 8,
    gap: 10,
    page: {
      width: '210mm',
      height: '297mm',
      orientation: 'portrait'
    }
  };

  private readonly defaultLayout: Layout = {
    grid: this.defaultGridConfig,
    elements: []
  };

  private layoutSubject = new BehaviorSubject<Layout>(this.defaultLayout);
  private selectedElementSubject = new BehaviorSubject<string | null>(null);

  layout$ = this.layoutSubject.asObservable();
  selectedElement$ = this.selectedElementSubject.asObservable();

  constructor() { }

  getLayout(): Layout {
    return this.layoutSubject.value;
  }

  getCurrentLayout(): Layout {
    return this.layoutSubject.value;
  }

  updateLayout(layout: Layout): void {
    this.layoutSubject.next(layout);
  }

  updateGridConfig(gridConfig: GridConfig): void {
    const currentLayout = this.getLayout();
    this.updateLayout({
      ...currentLayout,
      grid: gridConfig
    });
  }

  addElement(element: LayoutElement): void {
    const currentLayout = this.getLayout();
    const newElements = [...currentLayout.elements, element];
    this.updateLayout({
      ...currentLayout,
      elements: newElements
    });
  }

  updateElement(elementId: string, updates: Partial<LayoutElement>): void {
    const currentLayout = this.getLayout();
    const newElements = currentLayout.elements.map(element =>
      element.id === elementId ? { ...element, ...updates } : element
    );
    this.updateLayout({
      ...currentLayout,
      elements: newElements
    });
  }

  removeElement(elementId: string): void {
    const currentLayout = this.getLayout();
    const newElements = currentLayout.elements.filter(element => element.id !== elementId);
    this.updateLayout({
      ...currentLayout,
      elements: newElements
    });
    
    if (this.selectedElementSubject.value === elementId) {
      this.selectElement(null);
    }
  }

  selectElement(elementId: string | null): void {
    this.selectedElementSubject.next(elementId);
  }

  getSelectedElement(): LayoutElement | null {
    const selectedId = this.selectedElementSubject.value;
    if (!selectedId) return null;
    
    const layout = this.getLayout();
    return layout.elements.find(element => element.id === selectedId) || null;
  }

  generateElementId(): string {
    return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  resetLayout(): void {
    this.updateLayout(this.defaultLayout);
    this.selectElement(null);
  }

  loadLayout(layout: Layout): void {
    this.updateLayout(layout);
    this.selectElement(null);
  }

  exportLayoutJson(): string {
    return JSON.stringify(this.getLayout(), null, 2);
  }

  getElementTemplates(): ElementTemplate[] {
    return [
      {
        type: 'text',
        label: 'Text Block',
        icon: 'text_fields',
        defaultContent: '<p>Click to edit text</p>',
        defaultStyles: {
          color: '#333333',
          fontSize: '14px',
          textAlign: 'left',
          lineHeight: 1.5
        }
      },
      {
        type: 'image',
        label: 'Image',
        icon: 'image',
        defaultStyles: {}
      }
    ];
  }
}
