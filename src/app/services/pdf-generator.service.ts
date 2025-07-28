import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { Layout, LayoutElement, GridConfig } from '../interfaces/layout.interface';

export interface PdfExportOptions {
  filename?: string;
  quality?: number;
  compression?: boolean;
}

export interface PdfExportProgress {
  stage: 'preparing' | 'processing-elements' | 'processing-images' | 'finalizing' | 'complete';
  progress: number;
  message: string;
  elementIndex?: number;
  totalElements?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {
  private readonly PDF_MARGIN = 20; // margin in PDF units (points)
  private readonly DPI = 72; // PDF default DPI

  constructor() { }

  async exportToPdf(
    layout: Layout, 
    options: PdfExportOptions = {},
    progressCallback?: (progress: PdfExportProgress) => void
  ): Promise<void> {
    const filename = options.filename || 'layout-design.pdf';
    
    try {
      // Stage 1: Preparing
      this.reportProgress(progressCallback, {
        stage: 'preparing',
        progress: 0,
        message: 'Preparing PDF document...'
      });

      // Calculate PDF dimensions based on grid configuration
      const pdfDimensions = this.calculatePdfDimensions(layout.grid);
      
      // Create jsPDF instance
      const pdf = new jsPDF({
        orientation: layout.grid.page.orientation === 'landscape' ? 'landscape' : 'portrait',
        unit: 'pt',
        format: this.getPageFormat(layout.grid.page.width, layout.grid.page.height)
      });

      // Stage 2: Processing elements
      this.reportProgress(progressCallback, {
        stage: 'processing-elements',
        progress: 20,
        message: 'Processing layout elements...',
        totalElements: layout.elements.length
      });

      // Process each element
      for (let i = 0; i < layout.elements.length; i++) {
        const element = layout.elements[i];
        
        this.reportProgress(progressCallback, {
          stage: 'processing-elements',
          progress: 20 + (i / layout.elements.length) * 50,
          message: `Processing element ${i + 1} of ${layout.elements.length}...`,
          elementIndex: i,
          totalElements: layout.elements.length
        });

        await this.addElementToPdf(pdf, element, layout.grid, pdfDimensions);
      }

      // Stage 3: Processing images (if any)
      this.reportProgress(progressCallback, {
        stage: 'processing-images',
        progress: 80,
        message: 'Optimizing images...'
      });

      // Stage 4: Finalizing
      this.reportProgress(progressCallback, {
        stage: 'finalizing',
        progress: 90,
        message: 'Finalizing PDF...'
      });

      // Save the PDF
      pdf.save(filename);

      // Stage 5: Complete
      this.reportProgress(progressCallback, {
        stage: 'complete',
        progress: 100,
        message: 'PDF exported successfully!'
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private calculatePdfDimensions(grid: GridConfig) {
    // Convert page dimensions from CSS units to PDF points
    const pageWidth = this.convertToPoints(grid.page.width);
    const pageHeight = this.convertToPoints(grid.page.height);
    
    // Calculate available space for grid (minus margins)
    const availableWidth = pageWidth - (this.PDF_MARGIN * 2);
    const availableHeight = pageHeight - (this.PDF_MARGIN * 2);
    
    // Calculate cell dimensions
    const cellWidth = availableWidth / grid.columns;
    const cellHeight = availableHeight / grid.rows;
    
    return {
      pageWidth,
      pageHeight,
      availableWidth,
      availableHeight,
      cellWidth,
      cellHeight,
      marginX: this.PDF_MARGIN,
      marginY: this.PDF_MARGIN
    };
  }

  private async addElementToPdf(
    pdf: jsPDF, 
    element: LayoutElement, 
    grid: GridConfig, 
    dimensions: any
  ): Promise<void> {
    // Calculate element position and size
    const x = dimensions.marginX + (element.gridPosition.startCol - 1) * dimensions.cellWidth;
    const y = dimensions.marginY + (element.gridPosition.startRow - 1) * dimensions.cellHeight;
    const width = (element.gridPosition.endCol - element.gridPosition.startCol) * dimensions.cellWidth;
    const height = (element.gridPosition.endRow - element.gridPosition.startRow) * dimensions.cellHeight;

    if (element.type === 'text') {
      await this.addTextElement(pdf, element, x, y, width, height);
    } else if (element.type === 'image') {
      await this.addImageElement(pdf, element, x, y, width, height);
    }
  }

  private async addTextElement(
    pdf: jsPDF, 
    element: LayoutElement, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): Promise<void> {
    // Set text properties
    const fontSize = this.parsePixelValue(element.styles?.fontSize) || 14;
    const fontWeight = element.styles?.fontWeight || 'normal';
    const textAlign = element.styles?.textAlign || 'left';
    const color = element.styles?.color || '#000000';

    // Set font
    pdf.setFont('helvetica', fontWeight === 'bold' ? 'bold' : 'normal');
    pdf.setFontSize(fontSize);
    
    // Set text color
    const rgb = this.hexToRgb(color);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);

    // Draw background if specified
    if (element.styles?.backgroundColor && element.styles.backgroundColor !== 'transparent') {
      const bgRgb = this.hexToRgb(element.styles.backgroundColor);
      pdf.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b);
      pdf.rect(x, y, width, height, 'F');
    }

    // Draw border if specified
    if (element.styles?.borderWidth && parseInt(element.styles.borderWidth) > 0) {
      const borderColor = element.styles.borderColor || '#cccccc';
      const borderRgb = this.hexToRgb(borderColor);
      pdf.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
      pdf.setLineWidth(parseInt(element.styles.borderWidth));
      pdf.rect(x, y, width, height, 'S');
    }

    // Clean and prepare text content
    const textContent = this.cleanTextContent(element.content || '');
    const padding = this.parsePixelValue(element.styles?.padding) || 8;
    
    // Calculate text area
    const textX = x + padding;
    const textY = y + padding + fontSize; // Add fontSize for baseline
    const textWidth = width - (padding * 2);
    const textHeight = height - (padding * 2);

    if (textContent) {
      // Split text into lines that fit within the width
      const lines = pdf.splitTextToSize(textContent, textWidth);
      
      // Calculate alignment offset
      let alignOffset = 0;
      if (textAlign === 'center') {
        alignOffset = textWidth / 2;
      } else if (textAlign === 'right') {
        alignOffset = textWidth;
      }

      // Draw text lines
      const lineHeight = fontSize * 1.2;
      for (let i = 0; i < lines.length; i++) {
        const lineY = textY + (i * lineHeight);
        if (lineY > y + textHeight) break; // Stop if text exceeds element height
        
        pdf.text(lines[i], textX + alignOffset, lineY, { 
          align: textAlign as any,
          maxWidth: textWidth 
        });
      }
    }
  }

  private async addImageElement(
    pdf: jsPDF, 
    element: LayoutElement, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): Promise<void> {
    if (!element.src) {
      // Draw placeholder for missing image
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(245, 245, 245);
      pdf.rect(x, y, width, height, 'FD');
      
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(12);
      pdf.text('No Image', x + width/2, y + height/2, { align: 'center' });
      return;
    }

    try {
      // Draw background if specified
      if (element.styles?.backgroundColor && element.styles.backgroundColor !== 'transparent') {
        const bgRgb = this.hexToRgb(element.styles.backgroundColor);
        pdf.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b);
        pdf.rect(x, y, width, height, 'F');
      }

      // Calculate image dimensions based on fit mode
      const imageDimensions = await this.calculateImageDimensions(
        element.src, 
        width, 
        height, 
        element.fit || 'cover'
      );

      // Add image to PDF
      pdf.addImage(
        element.src, 
        'JPEG', 
        imageDimensions.x + x, 
        imageDimensions.y + y, 
        imageDimensions.width, 
        imageDimensions.height
      );

      // Draw border if specified
      if (element.styles?.borderWidth && parseInt(element.styles.borderWidth) > 0) {
        const borderColor = element.styles.borderColor || '#cccccc';
        const borderRgb = this.hexToRgb(borderColor);
        pdf.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
        pdf.setLineWidth(parseInt(element.styles.borderWidth));
        pdf.rect(x, y, width, height, 'S');
      }

    } catch (error) {
      console.error('Error adding image to PDF:', error);
      // Draw error placeholder
      pdf.setDrawColor(220, 53, 69);
      pdf.setFillColor(248, 215, 218);
      pdf.rect(x, y, width, height, 'FD');
      
      pdf.setTextColor(114, 28, 36);
      pdf.setFontSize(10);
      pdf.text('Image Error', x + width/2, y + height/2, { align: 'center' });
    }
  }

  private async calculateImageDimensions(
    src: string, 
    containerWidth: number, 
    containerHeight: number, 
    fit: string
  ): Promise<{x: number, y: number, width: number, height: number}> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const imgRatio = img.width / img.height;
        const containerRatio = containerWidth / containerHeight;
        
        let width = containerWidth;
        let height = containerHeight;
        let x = 0;
        let y = 0;

        switch (fit) {
          case 'contain':
            if (imgRatio > containerRatio) {
              height = containerWidth / imgRatio;
              y = (containerHeight - height) / 2;
            } else {
              width = containerHeight * imgRatio;
              x = (containerWidth - width) / 2;
            }
            break;
          
          case 'cover':
            if (imgRatio > containerRatio) {
              width = containerHeight * imgRatio;
              x = (containerWidth - width) / 2;
            } else {
              height = containerWidth / imgRatio;
              y = (containerHeight - height) / 2;
            }
            break;
          
          case 'fill':
          case 'stretch':
          default:
            // Use container dimensions (stretch to fill)
            break;
        }

        resolve({ x, y, width, height });
      };
      
      img.onerror = () => {
        // Fallback to container dimensions
        resolve({ x: 0, y: 0, width: containerWidth, height: containerHeight });
      };
      
      img.src = src;
    });
  }

  private convertToPoints(cssValue: string): number {
    // Convert CSS units to PDF points (1 point = 1/72 inch)
    if (cssValue.endsWith('mm')) {
      return parseFloat(cssValue) * 2.834645669; // mm to points
    } else if (cssValue.endsWith('cm')) {
      return parseFloat(cssValue) * 28.34645669; // cm to points
    } else if (cssValue.endsWith('in')) {
      return parseFloat(cssValue) * 72; // inches to points
    } else if (cssValue.endsWith('px')) {
      return parseFloat(cssValue) * 0.75; // px to points (assuming 96 DPI)
    }
    
    // Default to points
    return parseFloat(cssValue) || 595; // A4 width fallback
  }

  private getPageFormat(width: string, height: string): [number, number] {
    const w = this.convertToPoints(width);
    const h = this.convertToPoints(height);
    return [w, h];
  }

  private parsePixelValue(value: string | undefined): number {
    if (!value) return 0;
    return parseInt(value.replace('px', ''), 10) || 0;
  }

  private hexToRgb(hex: string): {r: number, g: number, b: number} {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : {r: 0, g: 0, b: 0};
  }

  private cleanTextContent(html: string): string {
    // Remove HTML tags and decode entities
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  private reportProgress(
    callback: ((progress: PdfExportProgress) => void) | undefined,
    progress: PdfExportProgress
  ) {
    if (callback) {
      callback(progress);
    }
  }

  // Preview method to estimate PDF size
  estimatePdfSize(layout: Layout): {width: string, height: string, elements: number} {
    const dimensions = this.calculatePdfDimensions(layout.grid);
    return {
      width: `${Math.round(dimensions.pageWidth)}pt`,
      height: `${Math.round(dimensions.pageHeight)}pt`,
      elements: layout.elements.length
    };
  }
}
