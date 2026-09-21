import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Venta {
  id: number;
  fecha_venta: string;
  precio_total: string;
  impuestos: string;
  vehiculo_id: number;
  marca: string;
  modelo: string;
  anio: number;
  cliente_id: number;
  cliente_nombre: string;
  cliente_apellido: string;
  vendedor_id: number;
  vendedor_nombre: string;
}

export interface ConversionResultado {
  monedaOrigen: string;
  monedaDestino: string;
  montoOriginal: number;
  montoConvertido: number;
  tasa: number;
  fecha: string;
}

@Injectable({
  providedIn: 'root',
})
export class VentasService {
  private apiUrl = 'http://localhost:3000/api/ventas';
  private tasasUrl = 'http://localhost:3000/api/tasas-cambio';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  private getHeaders() {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiUrl, this.getHeaders());
  }

  // La conversión de moneda es pública, no necesita token
  convertir(monto: number, moneda: string): Observable<ConversionResultado> {
    const params = `monto=${monto}&moneda=${moneda}`;
    return this.http.get<ConversionResultado>(`${this.tasasUrl}/convertir?${params}`);
  }
}
