import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';
import { GridConfig, ElementTemplate, LayoutElement } from '../interfaces/layout.interface';
import { LayoutStateService } from '../services/layout-state.service';
import { ElementComponent } from '../element/element.component';

@Component({
  selector: 'app-grid',
  imports: [CommonModule, DragDropModule, ElementComponent],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css'
})
export class GridComponent implements OnInit, OnDestroy {
  @Input() showGridLines = true;
  @Input() interactive = true;

  gridConfig: GridConfig = {
    columns: 12,
    rows: 8,
    gap: 10,
    page: {
      width: '210mm',
      height: '297mm',
      orientation: 'portrait'
    }
  };

  gridCells: Array<{row: number, col: number}> = [];
  elements: LayoutElement[] = [];
  selectedElementId: string | null = null;
  isDragActive = false;
  hoveredCell: {row: number, col: number} | null = null;
  private destroy$ = new Subject<void>();

  constructor(private layoutStateService: LayoutStateService) {}

  ngOnInit() {
    this.layoutStateService.layout$
      .pipe(takeUntil(this.destroy$))
      .subscribe(layout => {
        this.gridConfig = layout.grid;
        this.elements = layout.elements;
        this.generateGridCells();
      });

    this.layoutStateService.selectedElement$
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedId => {
        this.selectedElementId = selectedId;
      });
      
    // Grid component initialized
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateGridCells() {
    this.gridCells = [];
    for (let row = 1; row <= this.gridConfig.rows; row++) {
      for (let col = 1; col <= this.gridConfig.columns; col++) {
        this.gridCells.push({ row, col });
      }
    }
  }

  onCellClick(row: number, col: number) {
    if (this.interactive) {
      // Grid cell clicked
    }
  }

  getGridStyles() {
    const { width, height, orientation } = this.gridConfig.page;
    
    return {
      'grid-template-columns': `repeat(${this.gridConfig.columns}, 1fr)`,
      'grid-template-rows': `repeat(${this.gridConfig.rows}, 1fr)`,
      'gap': `${this.gridConfig.gap}px`,
      'width': orientation === 'landscape' ? height : width,
      'height': orientation === 'landscape' ? width : height,
      'max-width': '100%',
      'max-height': '80vh'
    };
  }

  getPageDimensions() {
    const { width, height, orientation } = this.gridConfig.page;
    return {
      width: orientation === 'landscape' ? height : width,
      height: orientation === 'landscape' ? width : height
    };
  }

  getCellStyles(row: number, col: number) {
    return {
      'grid-row': row.toString(),
      'grid-column': col.toString(),
      'border': this.showGridLines ? '1px dashed #e0e0e0' : 'none'
    };
  }

  onDrop(event: CdkDragDrop<any>) {
    
    if (event.previousContainer !== event.container) {
      // Dropping from element palette
      const template = event.item.data as ElementTemplate;
      const targetCell = this.getDropTargetCell(event);
      
      if (targetCell && template) {
        this.createElement(template, targetCell.row, targetCell.col);
      } else {
        // Cannot create element - missing targetCell or template
      }
    } else {
      // Moving existing element within grid
      const element = event.item.data as LayoutElement;
      const targetCell = this.getDropTargetCell(event);
      
      if (targetCell && element) {
        this.moveElement(element, targetCell.row, targetCell.col);
      } else {
        // Cannot move element - missing targetCell or element
      }
    }
  }

  private getDropTargetCell(event: CdkDragDrop<any>): {row: number, col: number} | null {
    const dropPoint = event.dropPoint;
    const containerElement = event.container.element.nativeElement;
    const rect = containerElement.getBoundingClientRect();
    
    // Calculate relative position within the grid
    const relativeX = dropPoint.x - rect.left;
    const relativeY = dropPoint.y - rect.top;
    
    // Calculate which cell was targeted
    const cellWidth = rect.width / this.gridConfig.columns;
    const cellHeight = rect.height / this.gridConfig.rows;
    
    const col = Math.floor(relativeX / cellWidth) + 1;
    const row = Math.floor(relativeY / cellHeight) + 1;
    
    // Validate bounds
    if (col >= 1 && col <= this.gridConfig.columns && row >= 1 && row <= this.gridConfig.rows) {
      return { row, col };
    }
    
    return null;
  }

  private createElement(template: ElementTemplate, row: number, col: number) {
    const element: LayoutElement = {
      id: this.layoutStateService.generateElementId(),
      type: template.type,
      gridPosition: {
        startCol: col,
        endCol: col + 1,
        startRow: row,
        endRow: row + 1
      },
      content: template.defaultContent,
      styles: { ...template.defaultStyles }
    };

    if (template.type === 'image') {
      element.src = '';
      element.fit = 'cover';
    }

    this.layoutStateService.addElement(element);
  }

  private moveElement(element: LayoutElement, newRow: number, newCol: number) {
    // Check if the target position is different from current position
    if (element.gridPosition.startRow === newRow && element.gridPosition.startCol === newCol) {
      return;
    }

    // Calculate the element's span
    const colSpan = element.gridPosition.endCol - element.gridPosition.startCol;
    const rowSpan = element.gridPosition.endRow - element.gridPosition.startRow;

    // Check if the new position would exceed grid boundaries
    if (newCol + colSpan > this.gridConfig.columns + 1 || newRow + rowSpan > this.gridConfig.rows + 1) {
      return;
    }

    // Check for conflicts with other elements (excluding the current element)
    const wouldConflict = this.elements.some(otherElement => {
      if (otherElement.id === element.id) return false; // Skip self

      return this.elementsOverlap(
        { startCol: newCol, endCol: newCol + colSpan, startRow: newRow, endRow: newRow + rowSpan },
        otherElement.gridPosition
      );
    });

    if (wouldConflict) {
      return;
    }

    // Update element position
    const updatedElement: Partial<LayoutElement> = {
      gridPosition: {
        startCol: newCol,
        endCol: newCol + colSpan,
        startRow: newRow,
        endRow: newRow + rowSpan
      }
    };

    this.layoutStateService.updateElement(element.id, updatedElement);
  }

  private elementsOverlap(pos1: any, pos2: any): boolean {
    return !(pos1.endCol <= pos2.startCol || 
             pos1.startCol >= pos2.endCol || 
             pos1.endRow <= pos2.startRow || 
             pos1.startRow >= pos2.endRow);
  }

  getElementsInCell(row: number, col: number): LayoutElement[] {
    return this.elements.filter(element => 
      col >= element.gridPosition.startCol && 
      col < element.gridPosition.endCol &&
      row >= element.gridPosition.startRow && 
      row < element.gridPosition.endRow
    );
  }

  onDragEnter(event: any) {
    this.isDragActive = true;
  }

  onDragExit(event: any) {
    this.isDragActive = false;
    this.hoveredCell = null;
  }

  onCellHover(row: number, col: number) {
    if (this.isDragActive) {
      this.hoveredCell = { row, col };
    }
  }

  onCellLeave() {
    if (this.isDragActive) {
      this.hoveredCell = null;
    }
  }

  isHoveredCell(row: number, col: number): boolean {
    return this.hoveredCell?.row === row && this.hoveredCell?.col === col;
  }

  isElementSelected(elementId: string): boolean {
    return this.selectedElementId === elementId;
  }

  onElementClick(elementId: string) {
    this.layoutStateService.selectElement(elementId);
  }

  onElementDelete(elementId: string) {
    this.layoutStateService.removeElement(elementId);
  }

  onElementResize(event: {element: LayoutElement, newSpan: {cols: number, rows: number}}) {
    const { element, newSpan } = event;
    
    // Check if new size would exceed grid boundaries
    const maxCol = element.gridPosition.startCol + newSpan.cols;
    const maxRow = element.gridPosition.startRow + newSpan.rows;
    
    if (maxCol > this.gridConfig.columns + 1 || maxRow > this.gridConfig.rows + 1) {
      return;
    }
    
    // Check for conflicts with other elements
    const newPosition = {
      startCol: element.gridPosition.startCol,
      endCol: element.gridPosition.startCol + newSpan.cols,
      startRow: element.gridPosition.startRow,
      endRow: element.gridPosition.startRow + newSpan.rows
    };
    
    const wouldConflict = this.elements.some(otherElement => {
      if (otherElement.id === element.id) return false; // Skip self
      return this.elementsOverlap(newPosition, otherElement.gridPosition);
    });
    
    if (wouldConflict) {
      return;
    }
    
    // Update element size
    const updatedElement: Partial<LayoutElement> = {
      gridPosition: newPosition
    };
    
    this.layoutStateService.updateElement(element.id, updatedElement);
  }

}
