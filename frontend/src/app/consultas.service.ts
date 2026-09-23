import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Consulta {
  id: number;
  cliente_id: number;
  vehiculo_id: number;
  tipo: 'informacion' | 'prueba_manejo';
  mensaje: string | null;
  fecha: string;
  cliente_nombre: string;
  cliente_apellido: string;
  marca: string;
  modelo: string;
}

@Injectable({ providedIn: 'root' })
export class ConsultasService {
  private readonly apiUrl = 'http://localhost:3000/api/consultas';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  private options() {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
  }

  getConsultas(clienteId?: number): Observable<Consulta[]> {
    let params = new HttpParams();
    if (clienteId) {
      params = params.set('cliente_id', clienteId);
    }
    return this.http.get<Consulta[]>(this.apiUrl, { ...this.options(), params });
  }

  addConsulta(consulta: {
    cliente_id: number | undefined;
    vehiculo_id: number | undefined;
    tipo: '' | 'informacion' | 'prueba_manejo';
    mensaje: string;
  }): Observable<{ id: number; message: string }> {
    return this.http.post<{ id: number; message: string }>(this.apiUrl, consulta, this.options());
  }

  deleteConsulta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.options());
  }
}
