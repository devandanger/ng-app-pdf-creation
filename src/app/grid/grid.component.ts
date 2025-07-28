import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { GridConfig } from '../interfaces/layout.interface';
import { LayoutStateService } from '../services/layout-state.service';

@Component({
  selector: 'app-grid',
  imports: [CommonModule],
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
  private destroy$ = new Subject<void>();

  constructor(private layoutStateService: LayoutStateService) {}

  ngOnInit() {
    this.layoutStateService.layout$
      .pipe(takeUntil(this.destroy$))
      .subscribe(layout => {
        this.gridConfig = layout.grid;
        this.generateGridCells();
      });
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
      console.log(`Grid cell clicked: row ${row}, col ${col}`);
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
}
