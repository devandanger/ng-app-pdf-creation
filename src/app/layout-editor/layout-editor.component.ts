import { Component } from '@angular/core';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { ElementPaletteComponent } from '../element-palette/element-palette.component';
import { CanvasComponent } from '../canvas/canvas.component';
import { PropertiesInspectorComponent } from '../properties-inspector/properties-inspector.component';

@Component({
  selector: 'app-layout-editor',
  imports: [
    ToolbarComponent,
    ElementPaletteComponent,
    CanvasComponent,
    PropertiesInspectorComponent
  ],
  templateUrl: './layout-editor.component.html',
  styleUrl: './layout-editor.component.css'
})
export class LayoutEditorComponent {

}
