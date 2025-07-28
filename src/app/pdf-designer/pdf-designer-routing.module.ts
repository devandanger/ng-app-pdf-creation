import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutEditorComponent } from '../layout-editor/layout-editor.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutEditorComponent,
    title: 'PDF Layout Designer'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PdfDesignerRoutingModule { }
