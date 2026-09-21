import { Routes } from '@angular/router';
import { ClientesComponent } from './clientes.component';

export const routes: Routes = [
    { path: 'clientes', component: ClientesComponent },
  { path: '', redirectTo: 'clientes', pathMatch: 'full' }
];
