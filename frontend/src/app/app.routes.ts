import { Routes } from '@angular/router';
import { ClientesComponent } from './clientes.component';
import { VentasComponent } from './ventas.component';
import { VehiculosComponent } from './vehiculos.component';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login.component';
import { ConsultasComponent } from './consultas.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard] },
  { path: 'ventas', component: VentasComponent, canActivate: [AuthGuard] },
  { path: 'consultas', component: ConsultasComponent, canActivate: [AuthGuard] },
  { path: 'vehiculos', component: VehiculosComponent, canActivate: [AuthGuard] },
];