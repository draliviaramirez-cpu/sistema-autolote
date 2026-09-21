import { Component, OnInit } from '@angular/core';
import { ClientesService } from './clientes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent implements OnInit {
  clientes: any[] = [];
  nuevoCliente = { nombre: '', apellido: '', correo: '', telefono: '', direccion: '' };
  error = '';

  constructor(private clientesService: ClientesService) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes() {
    this.error = '';
    this.clientesService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: () => {
        this.error = 'No se pudieron cargar los clientes. ¿Iniciaste sesión?';
      },
    });
  }

  agregarCliente() {
    this.clientesService.addCliente(this.nuevoCliente).subscribe(() => {
      this.cargarClientes();
      this.nuevoCliente = { nombre: '', apellido: '', correo: '', telefono: '', direccion: '' };
    });
  }

  actualizarCliente(cliente: any) {
    this.clientesService.updateCliente(cliente.id, cliente).subscribe(() => {
      this.cargarClientes();
    });
  }

  eliminarCliente(id: number) {
    this.clientesService.deleteCliente(id).subscribe(() => {
      this.cargarClientes();
    });
  }
}
