import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LayoutStateService } from '../services/layout-state.service';
import { LayoutElement } from '../interfaces/layout.interface';

@Component({
  selector: 'app-properties-inspector',
  imports: [CommonModule, FormsModule],
  templateUrl: './properties-inspector.component.html',
  styleUrl: './properties-inspector.component.css'
})
export class PropertiesInspectorComponent implements OnInit, OnDestroy {
  selectedElement: LayoutElement | null = null;
  private destroy$ = new Subject<void>();

  constructor(private layoutStateService: LayoutStateService) {}

  ngOnInit() {
    // Subscribe to selected element changes
    this.layoutStateService.selectedElement$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(selectedId => {
      if (selectedId) {
        const layout = this.layoutStateService.getCurrentLayout();
        this.selectedElement = layout.elements.find(el => el.id === selectedId) || null;
      } else {
        this.selectedElement = null;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateElementProperty(property: string, value: any) {
    if (this.selectedElement) {
      const updates: Partial<LayoutElement> = {};
      
      if (property === 'content') {
        updates.content = value;
      } else if (property === 'src') {
        updates.src = value;
      } else if (property === 'fit') {
        updates.fit = value as 'cover' | 'contain' | 'fill';
      } else if (property.startsWith('styles.')) {
        const styleProperty = property.replace('styles.', '');
        updates.styles = {
          ...this.selectedElement.styles,
          [styleProperty]: value
        };
      }
      
      this.layoutStateService.updateElement(this.selectedElement.id, updates);
    }
  }

  getTextAlignments() {
    return [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
      { value: 'justify', label: 'Justify' }
    ];
  }

  getImageFitModes() {
    return [
      { value: 'cover', label: 'Cover' },
      { value: 'contain', label: 'Contain' },
      { value: 'fill', label: 'Fill' }
    ];
  }

  parsePixelValue(value: string | undefined): number {
    if (!value) return 0;
    return parseInt(value.replace('px', ''), 10) || 0;
  }

  getFontSizeValue(): number {
    return this.parsePixelValue(this.selectedElement?.styles?.fontSize) || 14;
  }

  getBorderWidthValue(): number {
    return this.parsePixelValue(this.selectedElement?.styles?.borderWidth) || 0;
  }

  getPaddingValue(): number {
    return this.parsePixelValue(this.selectedElement?.styles?.padding) || 8;
  }

  onInputChange(event: Event, property: string) {
    const target = event.target as HTMLInputElement;
    this.updateElementProperty(property, target.value);
  }

  onNumberInputChange(event: Event, property: string, unit: string = '') {
    const target = event.target as HTMLInputElement;
    this.updateElementProperty(property, target.value + unit);
  }

  onSelectChange(event: Event, property: string) {
    const target = event.target as HTMLSelectElement;
    this.updateElementProperty(property, target.value);
  }
}
