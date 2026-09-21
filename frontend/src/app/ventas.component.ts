import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService, Venta } from './ventas.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
})
export class VentasComponent implements OnInit {
  ventas: Venta[] = [];
  cargando = true;
  error = '';

  // Conversión de moneda
  monedaSeleccionada = 'EUR';
  monedasDisponibles = ['EUR', 'HNL', 'GBP'];
  // Guarda el resultado convertido por id de venta, para no perder los demás al convertir uno
  conversiones: Record<number, { moneda: string; monto: number }> = {};

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas() {
    this.cargando = true;
    this.error = '';
    this.ventasService.getVentas().subscribe({
      next: (data) => {
        this.ventas = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las ventas. ¿Iniciaste sesión?';
        this.cargando = false;
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
      },
      error: () => {
        this.conversiones[venta.id] = { moneda: this.monedaSeleccionada, monto: NaN };
      },
    });
  }
}
