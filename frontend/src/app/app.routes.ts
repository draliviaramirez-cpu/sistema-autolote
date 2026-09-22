import { Routes } from '@angular/router';
import { ClientesComponent } from './clientes.component';
import { VentasComponent } from './ventas.component';
import { VehiculosComponent } from './vehiculos.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },
  { path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard] },
  { path: 'ventas', component: VentasComponent, canActivate: [AuthGuard] },
  { path: 'vehiculos', component: VehiculosComponent, canActivate: [AuthGuard] },
];