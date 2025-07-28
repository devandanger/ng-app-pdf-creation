import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LayoutStateService } from '../services/layout-state.service';
import { GridConfig } from '../interfaces/layout.interface';
import { PAGE_SIZES, PageSize } from '../constants/page-sizes.constant';

@Component({
  selector: 'app-grid-config',
  imports: [CommonModule, FormsModule],
  templateUrl: './grid-config.component.html',
  styleUrl: './grid-config.component.css'
})
export class GridConfigComponent implements OnInit, OnDestroy {
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

  pageSizes = PAGE_SIZES;
  selectedPageSize = 'a4';
  customWidth = '';
  customHeight = '';
  
  private destroy$ = new Subject<void>();

  constructor(private layoutStateService: LayoutStateService) {}

  ngOnInit() {
    this.layoutStateService.layout$
      .pipe(takeUntil(this.destroy$))
      .subscribe(layout => {
        this.gridConfig = { ...layout.grid };
        this.updateSelectedPageSize();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onColumnsChange(columns: number) {
    if (columns >= 1 && columns <= 24) {
      this.gridConfig.columns = columns;
      this.updateGridConfig();
    }
  }

  onRowsChange(rows: number) {
    if (rows >= 1 && rows <= 24) {
      this.gridConfig.rows = rows;
      this.updateGridConfig();
    }
  }

  onGapChange(gap: number) {
    if (gap >= 0 && gap <= 50) {
      this.gridConfig.gap = gap;
      this.updateGridConfig();
    }
  }

  onPageSizeChange(pageSizeName: string) {
    this.selectedPageSize = pageSizeName;
    const pageSize = this.pageSizes.find(size => size.name === pageSizeName);
    
    if (pageSize && pageSizeName !== 'custom') {
      this.gridConfig.page.width = pageSize.width;
      this.gridConfig.page.height = pageSize.height;
      this.updateGridConfig();
    }
  }

  onCustomSizeChange() {
    if (this.selectedPageSize === 'custom' && this.customWidth && this.customHeight) {
      this.gridConfig.page.width = this.customWidth;
      this.gridConfig.page.height = this.customHeight;
      this.updateGridConfig();
    }
  }

  onOrientationToggle() {
    const newOrientation = this.gridConfig.page.orientation === 'portrait' ? 'landscape' : 'portrait';
    this.gridConfig.page.orientation = newOrientation;
    this.updateGridConfig();
  }

  private updateGridConfig() {
    this.layoutStateService.updateGridConfig(this.gridConfig);
  }

  private updateSelectedPageSize() {
    const currentSize = this.pageSizes.find(size => 
      size.width === this.gridConfig.page.width && 
      size.height === this.gridConfig.page.height
    );
    
    if (currentSize) {
      this.selectedPageSize = currentSize.name;
    } else {
      this.selectedPageSize = 'custom';
      this.customWidth = this.gridConfig.page.width;
      this.customHeight = this.gridConfig.page.height;
    }
  }

  getOrientationIcon() {
    return this.gridConfig.page.orientation === 'portrait' ? '📄' : '📋';
  }

  getCurrentPageSizeDisplay() {
    const pageSize = this.pageSizes.find(size => size.name === this.selectedPageSize);
    return pageSize ? pageSize.displayName : 'Custom Size';
  }
}
