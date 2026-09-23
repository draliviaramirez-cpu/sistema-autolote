import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Rol = 'admin' | 'vendedor';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  creado_en: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly apiUrl = 'http://localhost:3000/api/usuarios';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  private options() {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, this.options());
  }

  addUsuario(usuario: { nombre: string; email: string; password: string; rol: Rol }): Observable<{ id: number; message: string }> {
    return this.http.post<{ id: number; message: string }>(this.apiUrl, usuario, this.options());
  }

  updateUsuario(id: number, usuario: { nombre: string; email: string; rol: Rol; password?: string }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, usuario, this.options());
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.options());
  }
}
