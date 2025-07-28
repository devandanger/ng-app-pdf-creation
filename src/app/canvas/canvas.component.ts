import { Component } from '@angular/core';
import { GridComponent } from '../grid/grid.component';

@Component({
  selector: 'app-canvas',
  imports: [GridComponent],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent {
  showGridLines = true;

  toggleGridLines() {
    this.showGridLines = !this.showGridLines;
  }
}
