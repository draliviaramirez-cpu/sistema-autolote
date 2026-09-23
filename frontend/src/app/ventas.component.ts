import { afterNextRender, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService, Venta } from './ventas.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
})
export class VentasComponent {
  ventas: Venta[] = [];
  cargando = true;
  error = '';

  // Conversión de moneda
  monedaSeleccionada = 'EUR';
  monedasDisponibles = ['EUR', 'HNL', 'GBP'];
  // Guarda el resultado convertido por id de venta, para no perder los demás al convertir uno
  conversiones: Record<number, { moneda: string; monto: number }> = {};
  mensaje = '';
  nuevaVenta = {
    vehiculo_id: 0,
    cliente_id: 0,
    precio_total: 0,
    impuestos: 0,
    fecha_venta: new Date().toISOString().slice(0, 10),
  };

  constructor(
    private ventasService: VentasService,
    private changeDetector: ChangeDetectorRef,
  ) {
    afterNextRender(() => this.cargarVentas());
  }

  cargarVentas() {
    this.cargando = true;
    this.error = '';
    this.ventasService.getVentas().subscribe({
      next: (data) => {
        this.ventas = data.map((venta) => ({
          ...venta,
          fecha_venta: String(venta.fecha_venta).slice(0, 10),
        }));
        this.cargando = false;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.error || 'No se pudieron cargar las ventas.';
        this.cargando = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  get totalVentas(): number {
    return this.ventas.reduce((suma, v) => suma + Number(v.precio_total), 0);
  }

  convertirPrecio(venta: Venta) {
    this.ventasService.convertir(Number(venta.precio_total), this.monedaSeleccionada).subscribe({
      next: (res) => {
        this.conversiones[venta.id] = { moneda: res.monedaDestino, monto: res.montoConvertido };
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.conversiones[venta.id] = { moneda: this.monedaSeleccionada, monto: NaN };
        this.changeDetector.detectChanges();
      },
    });
  }

  agregarVenta(): void {
    this.error = '';
    this.mensaje = '';
    this.ventasService.addVenta(this.nuevaVenta).subscribe({
      next: () => {
        this.mensaje = 'Venta registrada correctamente.';
        this.nuevaVenta = { vehiculo_id: 0, cliente_id: 0, precio_total: 0, impuestos: 0, fecha_venta: new Date().toISOString().slice(0, 10) };
        this.cargarVentas();
      },
      error: (error) => {
        this.error = error.error?.error || 'No se pudo registrar la venta.';
        this.changeDetector.detectChanges();
      },
    });
  }

  actualizarVenta(venta: Venta): void {
    this.ventasService.updateVenta(venta.id, {
      precio_total: venta.precio_total,
      impuestos: venta.impuestos,
      fecha_venta: venta.fecha_venta,
    }).subscribe({
      next: () => {
        this.mensaje = 'Venta actualizada correctamente.';
        this.cargarVentas();
      },
      error: (error) => {
        this.error = error.error?.error || 'No se pudo actualizar la venta.';
        this.changeDetector.detectChanges();
      },
    });
  }

  eliminarVenta(id: number): void {
    if (!confirm('¿Deseas eliminar esta venta?')) {
      return;
    }
    this.ventasService.deleteVenta(id).subscribe({
      next: () => {
        this.mensaje = 'Venta eliminada correctamente.';
        this.cargarVentas();
      },
      error: (error) => {
        this.error = error.error?.error || 'No se pudo eliminar la venta.';
        this.changeDetector.detectChanges();
      },
    });
  }
}
