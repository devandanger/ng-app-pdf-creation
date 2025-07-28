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
  private startMousePos = { x: 0, y: 0 };
  private gridCellSize = { width: 50, height: 50 };

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
    // Element drag started - add visual feedback for element being dragged
  }

  onDragEnd(event: CdkDragEnd) {
    // Element drag ended - the grid component will handle the drop and position update
  }

  startResize(event: MouseEvent, type: 'right' | 'bottom' | 'corner') {
    event.preventDefault();
    event.stopPropagation();
    
    this.isResizing = true;
    this.resizeType = type;
    this.startMousePos = { x: event.clientX, y: event.clientY };
    this.originalSpan = {
      cols: this.element.gridPosition.endCol - this.element.gridPosition.startCol,
      rows: this.element.gridPosition.endRow - this.element.gridPosition.startRow
    };

    // Calculate grid cell size dynamically
    this.calculateGridCellSize();

    const mouseMoveHandler = (e: MouseEvent) => this.onMouseMove(e);
    const mouseUpHandler = (e: MouseEvent) => this.onMouseUp(e, mouseMoveHandler, mouseUpHandler);

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    
    // Started resizing element
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isResizing || !this.resizeType) return;
    
    // Calculate total mouse movement from start position
    const totalDeltaX = event.clientX - this.startMousePos.x;
    const totalDeltaY = event.clientY - this.startMousePos.y;
    
    let newCols = this.originalSpan.cols;
    let newRows = this.originalSpan.rows;
    
    if (this.resizeType === 'right' || this.resizeType === 'corner') {
      const colsToAdd = Math.round(totalDeltaX / this.gridCellSize.width);
      newCols = Math.max(1, this.originalSpan.cols + colsToAdd);
    }
    
    if (this.resizeType === 'bottom' || this.resizeType === 'corner') {
      const rowsToAdd = Math.round(totalDeltaY / this.gridCellSize.height);
      newRows = Math.max(1, this.originalSpan.rows + rowsToAdd);
    }
    
    // Only emit if span actually changed
    const currentCols = this.element.gridPosition.endCol - this.element.gridPosition.startCol;
    const currentRows = this.element.gridPosition.endRow - this.element.gridPosition.startRow;
    
    if (newCols !== currentCols || newRows !== currentRows) {
      this.elementResize.emit({
        element: this.element,
        newSpan: { cols: newCols, rows: newRows }
      });
    }
  }

  private onMouseUp(event: MouseEvent, mouseMoveHandler: (e: MouseEvent) => void, mouseUpHandler: (e: MouseEvent) => void) {
    this.isResizing = false;
    this.resizeType = null;
    
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
    
    // Finished resizing element
  }

  private calculateGridCellSize() {
    // Try to find the grid container to calculate actual cell size
    const gridContainer = document.querySelector('.grid-container');
    if (gridContainer) {
      const gridStyles = window.getComputedStyle(gridContainer);
      const gridTemplateColumns = gridStyles.gridTemplateColumns;
      const gridTemplateRows = gridStyles.gridTemplateRows;
      
      // Parse grid template to get number of columns/rows
      const columnCount = gridTemplateColumns.split(' ').length;
      const rowCount = gridTemplateRows.split(' ').length;
      
      if (columnCount > 0 && rowCount > 0) {
        const containerRect = gridContainer.getBoundingClientRect();
        this.gridCellSize = {
          width: containerRect.width / columnCount,
          height: containerRect.height / rowCount
        };
        // Calculated grid cell size
        return;
      }
    }
    
    // Fallback to default size if calculation fails
    this.gridCellSize = { width: 60, height: 60 };
    // Using fallback grid cell size
  }

  getElementStyles() {
    const styles: any = {
      'grid-column': `${this.element.gridPosition.startCol} / ${this.element.gridPosition.endCol}`,
      'grid-row': `${this.element.gridPosition.startRow} / ${this.element.gridPosition.endRow}`,
      'color': this.element.styles?.color || '#333',
      'font-size': this.element.styles?.fontSize || '14px',
      'font-weight': this.element.styles?.fontWeight || 'normal',
      'text-align': this.element.styles?.textAlign || 'left',
      'line-height': this.element.styles?.lineHeight || 1.5,
      'background-color': this.element.styles?.backgroundColor || 'transparent',
      'padding': this.element.styles?.padding || '8px',
      'border-radius': this.element.styles?.borderRadius || '0'
    };

    // Handle border styling
    if (this.element.styles?.borderWidth && parseInt(this.element.styles.borderWidth) > 0) {
      styles['border'] = `${this.element.styles.borderWidth} solid ${this.element.styles?.borderColor || '#cccccc'}`;
    } else if (this.element.styles?.border) {
      styles['border'] = this.element.styles.border;
    } else {
      styles['border'] = 'none';
    }

    return styles;
  }
}
