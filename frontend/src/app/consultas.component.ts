import { afterNextRender, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Consulta, ConsultasService } from './consultas.service';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultas.component.html',
})
export class ConsultasComponent {
  consultas: Consulta[] = [];
  clienteIdFiltro: number | null = null;
  nuevaConsulta = {
    cliente_id: undefined as number | undefined,
    vehiculo_id: undefined as number | undefined,
    tipo: '' as '' | 'informacion' | 'prueba_manejo',
    mensaje: '',
  };
  cargando = true;
  mensaje = '';
  error = '';

  constructor(
    private consultasService: ConsultasService,
    private changeDetector: ChangeDetectorRef,
  ) {
    afterNextRender(() => this.cargarConsultas());
  }

  cargarConsultas(): void {
    this.cargando = true;
    this.error = '';
    this.consultasService.getConsultas(this.clienteIdFiltro || undefined).subscribe({
      next: (data) => {
        this.consultas = data;
        this.cargando = false;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.error || 'No se pudieron cargar las consultas.';
        this.cargando = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  agregarConsulta(): void {
    this.mensaje = '';
    this.error = '';
    this.consultasService.addConsulta(this.nuevaConsulta).subscribe({
      next: () => {
        this.mensaje = 'Consulta registrada correctamente.';
        this.nuevaConsulta = { cliente_id: undefined, vehiculo_id: undefined, tipo: '', mensaje: '' };
        this.cargarConsultas();
      },
      error: (error) => {
        this.error = error.error?.error || 'No se pudo registrar la consulta.';
        this.changeDetector.detectChanges();
      },
    });
  }

  eliminarConsulta(id: number): void {
    if (!confirm('¿Deseas eliminar esta consulta?')) {
      return;
    }
    this.consultasService.deleteConsulta(id).subscribe({
      next: () => {
        this.mensaje = 'Consulta eliminada correctamente.';
        this.cargarConsultas();
      },
      error: (error) => {
        this.error = error.error?.error || 'No se pudo eliminar la consulta.';
        this.changeDetector.detectChanges();
      },
    });
  }
}
