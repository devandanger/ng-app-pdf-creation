import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { PdfDesignerRoutingModule } from './pdf-designer-routing.module';
import { LayoutEditorComponent } from '../layout-editor/layout-editor.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { ElementPaletteComponent } from '../element-palette/element-palette.component';
import { CanvasComponent } from '../canvas/canvas.component';
import { GridComponent } from '../grid/grid.component';
import { ElementComponent } from '../element/element.component';
import { PropertiesInspectorComponent } from '../properties-inspector/properties-inspector.component';
import { GridConfigComponent } from '../grid-config/grid-config.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    PdfDesignerRoutingModule,
    LayoutEditorComponent,
    ToolbarComponent,
    ElementPaletteComponent,
    CanvasComponent,
    GridComponent,
    ElementComponent,
    PropertiesInspectorComponent,
    GridConfigComponent
  ]
})
export class PdfDesignerModule { }
