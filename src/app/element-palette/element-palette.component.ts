import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutStateService } from '../services/layout-state.service';
import { ElementTemplate } from '../interfaces/layout.interface';

@Component({
  selector: 'app-element-palette',
  imports: [CommonModule, DragDropModule],
  templateUrl: './element-palette.component.html',
  styleUrl: './element-palette.component.css'
})
export class ElementPaletteComponent implements OnInit {
  elementTemplates: ElementTemplate[] = [];

  constructor(private layoutStateService: LayoutStateService) {}

  ngOnInit() {
    this.elementTemplates = this.layoutStateService.getElementTemplates();
  }

  onDragStart(template: ElementTemplate) {
    // Drag started
  }

  // Prevent items from being dropped back into the palette
  noReturnPredicate = () => false;
}
