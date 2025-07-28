import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Angular PDF Layout Designer'
  },
  {
    path: 'designer',
    loadChildren: () => import('./pdf-designer/pdf-designer.module').then(m => m.PdfDesignerModule),
    title: 'PDF Layout Designer'
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
