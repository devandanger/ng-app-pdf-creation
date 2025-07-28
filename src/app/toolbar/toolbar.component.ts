import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridConfigComponent } from '../grid-config/grid-config.component';
import { LayoutStateService } from '../services/layout-state.service';
import { PdfGeneratorService, PdfExportProgress } from '../services/pdf-generator.service';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule, GridConfigComponent],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  isExporting = false;
  exportProgress: PdfExportProgress | null = null;

  constructor(
    private layoutStateService: LayoutStateService,
    private pdfGeneratorService: PdfGeneratorService
  ) {}

  async onExportPdf() {
    if (this.isExporting) return;

    const layout = this.layoutStateService.getCurrentLayout();
    
    if (layout.elements.length === 0) {
      alert('Please add some elements to the layout before exporting.');
      return;
    }

    this.isExporting = true;
    this.exportProgress = null;

    try {
      await this.pdfGeneratorService.exportToPdf(
        layout,
        { filename: 'my-layout-design.pdf' },
        (progress) => {
          this.exportProgress = progress;
        }
      );
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      this.isExporting = false;
      // Keep progress visible for a moment
      setTimeout(() => {
        this.exportProgress = null;
      }, 2000);
    }
  }

  onResetLayout() {
    if (confirm('Are you sure you want to reset the layout? This will remove all elements.')) {
      this.layoutStateService.resetLayout();
    }
  }

  onSaveLayout() {
    const layout = this.layoutStateService.getCurrentLayout();
    const dataStr = JSON.stringify(layout, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'layout-design.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  onLoadLayout() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const layout = JSON.parse(e.target?.result as string);
            this.layoutStateService.loadLayout(layout);
          } catch (error) {
            alert('Invalid layout file. Please select a valid JSON layout file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  getEstimatedPdfSize(): string {
    const layout = this.layoutStateService.getCurrentLayout();
    const estimate = this.pdfGeneratorService.estimatePdfSize(layout);
    return `${estimate.width} × ${estimate.height} (${estimate.elements} elements)`;
  }
}
