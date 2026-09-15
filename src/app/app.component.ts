import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';

interface Reservation {
  id?: number;
  guestName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 950px; margin: 0 auto;">
      
      <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0056b3; padding-bottom: 15px; margin-bottom: 25px;">
        <h2>🏔️ AndesStay - Panel de Reservas</h2>
        
        <div *ngIf="authService.isLoggedIn()">
          <span style="margin-right: 15px; font-weight: bold;">
            👤 {{ authService.getActiveAccount()?.name }}
          </span>
          <button (click)="logout()" style="background-color: #dc3545; color: white; border: none; padding: 8px 14px; border-radius: 4px; cursor: pointer;">
            Cerrar Sesión
          </button>
        </div>

        <button *ngIf="!authService.isLoggedIn()" (click)="login()" style="background-color: #0056b3; color: white; border: none; padding: 10px 18px; border-radius: 4px; cursor: pointer; font-size: 15px;">
          🔑 Iniciar Sesión con Microsoft
        </button>
      </header>

      <!-- Contenido solo visible si está autenticado -->
      <main *ngIf="authService.isLoggedIn()">

        <!-- Mensajes de estado -->
        <div *ngIf="successMessage" style="background-color: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
          {{ successMessage }}
        </div>
        <div *ngIf="errorMessage" style="background-color: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
          {{ errorMessage }}
        </div>

        <!-- Formulario para crear reserva -->
        <section style="background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3>➕ Crear Nueva Reserva</h3>
          <form (ngSubmit)="submitReservation()" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            
            <div>
              <label style="display:block; margin-bottom:5px; font-weight:bold;">Nombre del Huésped:</label>
              <input type="text" [(ngModel)]="newReservation.guestName" name="guestName" placeholder="Ej: Juan Pérez" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;" required>
            </div>

            <div>
              <label style="display:block; margin-bottom:5px; font-weight:bold;">Tipo de Unidad:</label>
              <select [(ngModel)]="newReservation.roomType" name="roomType" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                <option value="Cabaña Estándar">Cabaña Estándar</option>
                <option value="Suite Montaña">Suite Montaña</option>
                <option value="Habitación Familiar">Habitación Familiar</option>
              </select>
            </div>

            <div>
              <label style="display:block; margin-bottom:5px; font-weight:bold;">Fecha Check-In:</label>
              <input type="date" [(ngModel)]="newReservation.checkInDate" name="checkInDate" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;" required>
            </div>

            <div>
              <label style="display:block; margin-bottom:5px; font-weight:bold;">Fecha Check-Out:</label>
              <input type="date" [(ngModel)]="newReservation.checkOutDate" name="checkOutDate" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
            </div>

            <div style="grid-column: span 2; text-align: right; margin-top: 10px;">
              <button type="submit" [disabled]="saving" style="background-color: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-size: 15px; cursor: pointer;">
                {{ saving ? 'Guardando...' : '💾 Guardar Reserva' }}
              </button>
            </div>
          </form>
        </section>

        <!-- Tabla de reservas recibidas -->
        <section>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3>📋 Listado de Reservas Registradas</h3>
            <button (click)="loadReservations()" style="background: #6c757d; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
              🔄 Actualizar Lista
            </button>
          </div>

          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background-color: #0056b3; color: white;">
                <th style="padding: 10px; border: 1px solid #ddd;">ID</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Huésped</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Unidad</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Check-In</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Check-Out</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Estado</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of reservations" style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; border: 1px solid #ddd;">#{{ r.id }}</td>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">{{ r.guestName }}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">{{ r.roomType }}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">{{ r.checkInDate }}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">{{ r.checkOutDate }}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  <span style="background: #e2e3e5; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                    {{ r.status }}
                  </span>
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
                  <button (click)="deleteReservation(r.id)" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 13px;">
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
              <tr *ngIf="reservations.length === 0 && !loading">
                <td colspan="7" style="text-align: center; padding: 20px; color: #777;">
                  No hay reservas registradas. Completa el formulario para ingresar la primera.
                </td>
              </tr>
            </tbody>
          </table>
        </section>

      </main>

      <div *ngIf="!authService.isLoggedIn()" style="text-align: center; margin-top: 50px; color: #666;">
        <p style="font-size: 18px;">Debes iniciar sesión con tu cuenta corporativa para acceder al sistema AndesStay.</p>
      </div>

    </div>
  `
})
export class AppComponent implements OnInit {
  title = 'AndesStay - Gestión de Reservas';
  
  private apiUrl = 'https://j1xya1b75e.execute-api.us-east-1.amazonaws.com/api/reservations';

  reservations: Reservation[] = [];
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  newReservation: Reservation = {
    guestName: '',
    roomType: 'Cabaña Estándar',
    checkInDate: '',
    checkOutDate: '',
    status: 'CREADA'
  };

  constructor(
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadReservations();
    }
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }

  loadReservations(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.http.get<Reservation[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.reservations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.errorMessage = 'Error al conectar con AWS API Gateway (' + err.status + ')';
        this.loading = false;
      }
    });
  }

  submitReservation(): void {
    if (!this.newReservation.guestName || !this.newReservation.checkInDate) {
      alert('Por favor completa el nombre del huésped y la fecha de ingreso.');
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.http.post<Reservation>(this.apiUrl, this.newReservation).subscribe({
      next: (created) => {
        this.successMessage = `¡Reserva creada con éxito para ${created.guestName}!`;
        this.saving = false;
        this.newReservation = {
          guestName: '',
          roomType: 'Cabaña Estándar',
          checkInDate: '',
          checkOutDate: '',
          status: 'CREADA'
        };
        this.loadReservations();
      },
      error: (err) => {
        console.error('Error al crear reserva:', err);
        this.errorMessage = 'Error al guardar la reserva (' + err.status + ')';
        this.saving = false;
      }
    });
  }

  deleteReservation(id?: number): void {
    if (!id) return;
    if (!confirm(`¿Estás seguro de eliminar la reserva #${id}?`)) return;

    this.errorMessage = '';
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.successMessage = `Reserva #${id} eliminada correctamente.`;
        this.loadReservations();
      },
      error: (err) => {
        console.error('Error al eliminar reserva:', err);
        this.errorMessage = 'Error al eliminar la reserva (' + err.status + ')';
      }
    });
  }
}
