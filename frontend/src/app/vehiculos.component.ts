import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiculosService, Vehiculo } from './vehiculos.service';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehiculos.component.html',
})
export class VehiculosComponent implements OnInit {
  vehiculos: Vehiculo[] = [];
  cargando = true;
  error = '';

  nuevoVehiculo = { marca: '', modelo: '', anio: new Date().getFullYear(), precio: 0, imagen_url: '' };

  // Filtros
  filtroMarca = '';
  filtroModelo = '';
  filtroPrecioMin: number | null = null;
  filtroPrecioMax: number | null = null;
  filtroSoloDisponibles = false;

  constructor(private vehiculosService: VehiculosService) {}

  ngOnInit(): void {
    this.cargarVehiculos();
  }

  cargarVehiculos() {
    this.cargando = true;
    this.error = '';
    this.vehiculosService
      .getVehiculos({
        marca: this.filtroMarca,
        modelo: this.filtroModelo,
        precio_min: this.filtroPrecioMin ?? undefined,
        precio_max: this.filtroPrecioMax ?? undefined,
        disponible: this.filtroSoloDisponibles ? true : undefined,
      })
      .subscribe({
        next: (data) => {
          this.vehiculos = data;
          this.cargando = false;
        },
        error: () => {
          this.error = 'No se pudieron cargar los vehículos.';
          this.cargando = false;
        },
      });
  }

  limpiarFiltros() {
    this.filtroMarca = '';
    this.filtroModelo = '';
    this.filtroPrecioMin = null;
    this.filtroPrecioMax = null;
    this.filtroSoloDisponibles = false;
    this.cargarVehiculos();
  }

  agregarVehiculo() {
    this.vehiculosService.addVehiculo(this.nuevoVehiculo).subscribe({
      next: () => {
        this.cargarVehiculos();
        this.nuevoVehiculo = { marca: '', modelo: '', anio: new Date().getFullYear(), precio: 0, imagen_url: '' };
      },
      error: () => {
        this.error = 'No se pudo registrar el vehículo. ¿Iniciaste sesión?';
      },
    });
  }

  actualizarVehiculo(vehiculo: Vehiculo) {
    this.vehiculosService.updateVehiculo(vehiculo.id, vehiculo).subscribe({
      next: () => this.cargarVehiculos(),
      error: () => (this.error = 'No se pudo actualizar el vehículo.'),
    });
  }

  eliminarVehiculo(id: number) {
    this.vehiculosService.deleteVehiculo(id).subscribe({
      next: () => this.cargarVehiculos(),
      error: (err) => {
        this.error =
          err?.error?.error || 'No se pudo eliminar el vehículo.';
      },
    });
  }
}
