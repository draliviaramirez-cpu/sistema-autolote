import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vehiculo {
  id: number;
  marca: string;
  modelo: string;
  anio: number;
  precio: string | number;
  disponible: boolean | number;
  imagen_url: string | null;
}

export interface FiltrosVehiculo {
  marca?: string;
  modelo?: string;
  precio_min?: number;
  precio_max?: number;
  disponible?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class VehiculosService {
  private apiUrl = 'http://localhost:3000/api/vehiculos';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  private getHeaders() {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  // Público — no requiere token
  getVehiculos(filtros: FiltrosVehiculo = {}): Observable<Vehiculo[]> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    });
    return this.http.get<Vehiculo[]>(this.apiUrl, { params });
  }

  addVehiculo(vehiculo: Partial<Vehiculo>): Observable<any> {
    return this.http.post(this.apiUrl, vehiculo, this.getHeaders());
  }

  updateVehiculo(id: number, vehiculo: Partial<Vehiculo>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, vehiculo, this.getHeaders());
  }

  deleteVehiculo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}
