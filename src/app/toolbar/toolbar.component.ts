import { Component } from '@angular/core';
import { GridConfigComponent } from '../grid-config/grid-config.component';

@Component({
  selector: 'app-toolbar',
  imports: [GridConfigComponent],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {

}
