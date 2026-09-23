import { afterNextRender, ChangeDetectorRef, Component } from '@angular/core';
import { ClientesService } from './clientes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent {
  clientes: any[] = [];
  nuevoCliente = { nombre: '', apellido: '', correo: '', telefono: '', direccion: '' };
  mensaje = '';
  error = '';

  constructor(
    private clientesService: ClientesService,
    private changeDetector: ChangeDetectorRef,
  ) {
    afterNextRender(() => this.cargarClientes());
  }

  cargarClientes() {
    this.error = '';
    this.clientesService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.error || 'No se pudo cargar la lista de clientes.';
        this.changeDetector.detectChanges();
      }
    });
  }

  agregarCliente() {
    this.mensaje = '';
    this.clientesService.addCliente(this.nuevoCliente).subscribe({
      next: (respuesta) => {
        this.clientes = [
          { id: respuesta.id, ...this.nuevoCliente },
          ...this.clientes,
        ];
        this.nuevoCliente = { nombre: '', apellido: '', correo: '', telefono: '', direccion: '' };
        this.mensaje = 'Cliente agregado correctamente.';
      },
      error: (error) => {
        this.mensaje = error.error?.error || 'No se pudo agregar el cliente.';
      }
    });
  }

  actualizarCliente(cliente: any) {
    this.mensaje = '';
    this.clientesService.updateCliente(cliente.id, cliente).subscribe({
      next: () => {
        this.cargarClientes();
        this.mensaje = 'Cliente actualizado correctamente.';
      },
      error: (error) => {
        this.mensaje = error.error?.error || 'No se pudo actualizar el cliente.';
      }
    });
  }

  eliminarCliente(id: number) {
    if (!confirm('¿Deseas eliminar este cliente?')) {
      return;
    }

    this.mensaje = '';
    this.clientesService.deleteCliente(id).subscribe({
      next: () => {
        this.cargarClientes();
        this.mensaje = 'Cliente eliminado correctamente.';
      },
      error: (error) => {
        this.mensaje = error.error?.error || 'No se pudo eliminar el cliente.';
      }
    });
  }
}
