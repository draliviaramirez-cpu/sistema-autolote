import { afterNextRender, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiculosService, Vehiculo } from './vehiculos.service';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehiculos.component.html',
})
export class VehiculosComponent {
  vehiculos: Vehiculo[] = [];
  cargando = true;
  error = '';

  nuevoVehiculo = {
    marca: '',
    modelo: '',
    anio: undefined as number | undefined,
    precio: undefined as number | undefined,
    imagen_url: '',
  };

  // Filtros
  filtroMarca = '';
  filtroModelo = '';
  filtroPrecioMin: number | null = null;
  filtroPrecioMax: number | null = null;
  filtroSoloDisponibles = false;
  monedaSeleccionada = 'EUR';
  monedasDisponibles = ['EUR', 'HNL', 'GBP'];
  conversiones: Record<number, number> = {};

  constructor(
    private vehiculosService: VehiculosService,
    private changeDetector: ChangeDetectorRef,
  ) {
    afterNextRender(() => this.cargarVehiculos());
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
          this.changeDetector.detectChanges();
        },
        error: (error) => {
          this.error = 'No se pudieron cargar los vehículos.';
          this.cargando = false;
          if (error.error?.error) {
            this.error = error.error.error;
          }
          this.changeDetector.detectChanges();
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
      next: (respuesta) => {
        this.vehiculos = [
          { id: respuesta.id, disponible: true, ...this.nuevoVehiculo } as Vehiculo,
          ...this.vehiculos,
        ];
        this.nuevoVehiculo = {
          marca: '',
          modelo: '',
          anio: undefined,
          precio: undefined,
          imagen_url: '',
        };
        this.error = '';
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.error || 'No se pudo registrar el vehículo.';
        this.changeDetector.detectChanges();
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

  convertirPrecio(vehiculo: Vehiculo): void {
    this.vehiculosService.convertirPrecio(Number(vehiculo.precio), this.monedaSeleccionada).subscribe({
      next: (resultado) => {
        this.conversiones[vehiculo.id] = resultado.montoConvertido;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.error || 'No se pudo convertir el precio.';
        this.changeDetector.detectChanges();
      },
    });
  }
}
