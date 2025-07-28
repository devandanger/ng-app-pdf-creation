import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { LayoutElement } from '../interfaces/layout.interface';

@Component({
  selector: 'app-element',
  imports: [CommonModule, DragDropModule],
  templateUrl: './element.component.html',
  styleUrl: './element.component.css'
})
export class ElementComponent implements OnInit {
  @Input() element!: LayoutElement;
  @Input() isSelected = false;
  @Output() elementClick = new EventEmitter<void>();
  @Output() elementDelete = new EventEmitter<void>();
  @Output() elementResize = new EventEmitter<{element: LayoutElement, newSpan: {cols: number, rows: number}}>();

  private isResizing = false;
  private resizeType: 'right' | 'bottom' | 'corner' | null = null;
  private originalSpan = { cols: 1, rows: 1 };

  ngOnInit() {
    if (!this.element) {
      console.error('ElementComponent: element input is required');
    }
  }

  onClick(event: Event) {
    event.stopPropagation();
    this.elementClick.emit();
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.elementDelete.emit();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.elementDelete.emit();
    }
  }

  onDragStart(event: CdkDragStart) {
    console.log('Element drag started:', this.element.id);
    // Add visual feedback for element being dragged
  }

  onDragEnd(event: CdkDragEnd) {
    console.log('Element drag ended:', this.element.id);
    // The grid component will handle the drop and position update
  }

  startResize(event: MouseEvent, type: 'right' | 'bottom' | 'corner') {
    event.preventDefault();
    event.stopPropagation();
    
    this.isResizing = true;
    this.resizeType = type;
    this.originalSpan = {
      cols: this.element.gridPosition.endCol - this.element.gridPosition.startCol,
      rows: this.element.gridPosition.endRow - this.element.gridPosition.startRow
    };

    const mouseMoveHandler = (e: MouseEvent) => this.onMouseMove(e);
    const mouseUpHandler = (e: MouseEvent) => this.onMouseUp(e, mouseMoveHandler, mouseUpHandler);

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    
    console.log('Started resizing element:', this.element.id, 'type:', type);
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isResizing || !this.resizeType) return;
    
    // Calculate new span based on mouse position
    // This is a simple implementation - could be enhanced with grid awareness
    const deltaX = event.movementX;
    const deltaY = event.movementY;
    
    let newCols = this.originalSpan.cols;
    let newRows = this.originalSpan.rows;
    
    if (this.resizeType === 'right' || this.resizeType === 'corner') {
      newCols = Math.max(1, newCols + Math.round(deltaX / 50)); // Approximate grid cell size
    }
    
    if (this.resizeType === 'bottom' || this.resizeType === 'corner') {
      newRows = Math.max(1, newRows + Math.round(deltaY / 50)); // Approximate grid cell size
    }
    
    // Emit resize event if span changed
    if (newCols !== this.originalSpan.cols || newRows !== this.originalSpan.rows) {
      this.elementResize.emit({
        element: this.element,
        newSpan: { cols: newCols, rows: newRows }
      });
      this.originalSpan = { cols: newCols, rows: newRows };
    }
  }

  private onMouseUp(event: MouseEvent, mouseMoveHandler: (e: MouseEvent) => void, mouseUpHandler: (e: MouseEvent) => void) {
    this.isResizing = false;
    this.resizeType = null;
    
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
    
    console.log('Finished resizing element:', this.element.id);
  }

  getElementStyles() {
    return {
      'grid-column': `${this.element.gridPosition.startCol} / ${this.element.gridPosition.endCol}`,
      'grid-row': `${this.element.gridPosition.startRow} / ${this.element.gridPosition.endRow}`,
      'color': this.element.styles?.color || '#333',
      'font-size': this.element.styles?.fontSize || '14px',
      'text-align': this.element.styles?.textAlign || 'left',
      'line-height': this.element.styles?.lineHeight || 1.5,
      'background-color': this.element.styles?.backgroundColor || 'transparent',
      'padding': this.element.styles?.padding || '8px',
      'border': this.element.styles?.border || 'none',
      'border-radius': this.element.styles?.borderRadius || '0'
    };
  }
}
