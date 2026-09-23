import { afterNextRender, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService, Venta } from './ventas.service';
import { Vehiculo, VehiculosService } from './vehiculos.service';
import { ClientesService } from './clientes.service';

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
    vehiculo_id: undefined as number | undefined,
    cliente_id: undefined as number | undefined,
    precio_total: 0,
    impuestos: 0,
    impuesto_porcentaje: undefined as number | undefined,
    fecha_venta: new Date().toISOString().slice(0, 10),
  };
  vehiculosDisponibles: Vehiculo[] = [];
  clientesDisponibles: any[] = [];

  constructor(
    private ventasService: VentasService,
    private changeDetector: ChangeDetectorRef,
    private vehiculosService: VehiculosService,
    private clientesService: ClientesService,
  ) {
    afterNextRender(() => {
      this.cargarVentas();
      this.cargarCatalogos();
    });
  }

  cargarCatalogos(): void {
    this.vehiculosService.getVehiculos({ disponible: true }).subscribe({
      next: (vehiculos) => {
        this.vehiculosDisponibles = vehiculos;
        this.changeDetector.detectChanges();
      },
    });
    this.clientesService.getClientes().subscribe({
      next: (clientes) => {
        this.clientesDisponibles = clientes;
        this.changeDetector.detectChanges();
      },
    });
  }

  seleccionarVehiculo(): void {
    const vehiculo = this.vehiculosDisponibles.find(
      (item) => item.id === Number(this.nuevaVenta.vehiculo_id),
    );
    if (vehiculo) {
      this.nuevaVenta.precio_total = Number(vehiculo.precio);
      this.calcularImpuestos();
    }
  }

  get vehiculoSeleccionado(): Vehiculo | undefined {
    return this.vehiculosDisponibles.find(
      (vehiculo) => vehiculo.id === Number(this.nuevaVenta.vehiculo_id),
    );
  }

  get clienteSeleccionado(): any | undefined {
    return this.clientesDisponibles.find(
      (cliente) => cliente.id === Number(this.nuevaVenta.cliente_id),
    );
  }

  actualizarClienteSeleccionado(): void {
    this.changeDetector.detectChanges();
  }

  calcularImpuestos(): void {
    const precio = Number(this.nuevaVenta.precio_total) || 0;
    const porcentaje = Number(this.nuevaVenta.impuesto_porcentaje) || 0;
    this.nuevaVenta.impuestos = Number((precio * porcentaje / 100).toFixed(2));
  }

  get totalPagar(): number {
    return Number((Number(this.nuevaVenta.precio_total || 0) + Number(this.nuevaVenta.impuestos || 0)).toFixed(2));
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

    if (!this.vehiculoSeleccionado) {
      this.error = 'El vehículo indicado no existe o no está disponible.';
      return;
    }

    if (!this.clienteSeleccionado) {
      this.error = 'El cliente indicado no existe.';
      return;
    }

    if (!this.nuevaVenta.precio_total || this.nuevaVenta.precio_total <= 0) {
      this.error = 'El precio total debe ser mayor que cero.';
      return;
    }

    if (!this.nuevaVenta.fecha_venta) {
      this.error = 'La fecha de venta es obligatoria.';
      return;
    }

    const venta = {
      vehiculo_id: this.nuevaVenta.vehiculo_id,
      cliente_id: this.nuevaVenta.cliente_id,
      precio_total: this.nuevaVenta.precio_total,
      impuestos: this.nuevaVenta.impuestos,
      fecha_venta: this.nuevaVenta.fecha_venta,
    };
    this.ventasService.addVenta(venta).subscribe({
      next: () => {
        this.mensaje = 'Venta registrada correctamente.';
        this.nuevaVenta = { vehiculo_id: undefined, cliente_id: undefined, precio_total: 0, impuestos: 0, impuesto_porcentaje: undefined, fecha_venta: new Date().toISOString().slice(0, 10) };
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
