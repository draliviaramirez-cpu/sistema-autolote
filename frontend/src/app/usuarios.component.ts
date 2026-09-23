import { afterNextRender, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rol, Usuario, UsuariosService } from './usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent {
  usuarios: Usuario[] = [];
  cargando = true;
  mensaje = '';
  error = '';

  nuevoUsuario = { nombre: '', email: '', password: '', rol: 'vendedor' as Rol };
  // Contraseña nueva escrita en la tabla, por id de usuario (vacía = no cambiarla)
  nuevasPasswords: Record<number, string> = {};

  constructor(
    private usuariosService: UsuariosService,
    private changeDetector: ChangeDetectorRef,
  ) {
    afterNextRender(() => this.cargarUsuarios());
  }

  private mostrar(mensaje: string, error = ''): void {
    this.mensaje = mensaje;
    this.error = error;
    this.changeDetector.detectChanges();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.mostrar('', err.error?.error || 'No se pudo cargar la lista de usuarios.');
      },
    });
  }

  agregarUsuario(): void {
    const { nombre, email, password } = this.nuevoUsuario;
    if (!nombre.trim() || !email.trim() || !password) {
      this.mostrar('', 'Nombre, correo y contraseña son obligatorios.');
      return;
    }
    if (password.length < 4) {
      this.mostrar('', 'La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    this.usuariosService.addUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.nuevoUsuario = { nombre: '', email: '', password: '', rol: 'vendedor' };
        this.mostrar('Usuario creado correctamente. Ya puede iniciar sesión.');
        this.cargarUsuarios();
      },
      error: (err) => this.mostrar('', err.error?.error || 'No se pudo crear el usuario.'),
    });
  }

  actualizarUsuario(usuario: Usuario): void {
    const password = this.nuevasPasswords[usuario.id];
    this.usuariosService
      .updateUsuario(usuario.id, {
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        ...(password ? { password } : {}),
      })
      .subscribe({
        next: () => {
          delete this.nuevasPasswords[usuario.id];
          this.mostrar(password ? 'Usuario y contraseña actualizados.' : 'Usuario actualizado.');
          this.cargarUsuarios();
        },
        error: (err) => this.mostrar('', err.error?.error || 'No se pudo actualizar el usuario.'),
      });
  }

  eliminarUsuario(usuario: Usuario): void {
    if (!confirm(`¿Eliminar al usuario ${usuario.nombre}?`)) {
      return;
    }
    this.usuariosService.deleteUsuario(usuario.id).subscribe({
      next: () => {
        this.mostrar('Usuario eliminado.');
        this.cargarUsuarios();
      },
      error: (err) => this.mostrar('', err.error?.error || 'No se pudo eliminar el usuario.'),
    });
  }
}
