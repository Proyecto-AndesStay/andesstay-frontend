import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';

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
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink],
  template: `
    <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 950px; margin: 0 auto;">
      
      <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0056b3; padding-bottom: 15px; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0;">🏔️ AndesStay - Sistema Cloud Native</h2>
          <!-- Evidencia EP1: Lectura de roles y scopes desde los claims del token -->
          <div *ngIf="authService.isLoggedIn()" style="font-size: 12px; color: #555; margin-top: 5px;">
            <strong>Roles JWT:</strong> {{ userRoles.length ? userRoles.join(', ') : 'Usuario Estándar' }} |
            <strong>Scopes:</strong> {{ userScopes.length ? userScopes.join(', ') : 'N/A' }}
          </div>
        </div>
        
        <div *ngIf="authService.isLoggedIn()" style="display: flex; align-items: center; gap: 10px;">
          <span style="font-weight: bold;">
            👤 {{ authService.getActiveAccount()?.name }}
          </span>
          <button (click)="logout()" style="background-color: #dc3545; color: white; border: none; padding: 8px 14px; border-radius: 4px; cursor: pointer;">
            Cerrar Sesión
          </button>
        </div>

        <div *ngIf="!authService.isLoggedIn() && (authService.isLoading$ | async)" style="font-weight: bold; color: #0056b3;">
          ⏳ Validando sesión en Microsoft...
        </div>

        <button *ngIf="!authService.isLoggedIn() && !(authService.isLoading$ | async)" (click)="login()" style="background-color: #0056b3; color: white; border: none; padding: 10px 18px; border-radius: 4px; cursor: pointer; font-size: 15px;">
          🔑 Iniciar Sesión con Microsoft
        </button>
      </header>

      <!-- Barra de Navegación Modular (EP1 / EP3) -->
      <nav *ngIf="authService.isLoggedIn()" style="display: flex; gap: 12px; margin-bottom: 25px; background: #e9ecef; padding: 10px; border-radius: 6px;">
        <a routerLink="/" style="text-decoration: none; padding: 8px 14px; border-radius: 4px; font-weight: bold;"
           [style.background]="!isAdminRoute() ? '#0056b3' : 'transparent'"
           [style.color]="!isAdminRoute() ? 'white' : '#0056b3'">
          📋 Panel de Reservas
        </a>
        <a routerLink="/admin-mq" style="text-decoration: none; padding: 8px 14px; border-radius: 4px; font-weight: bold;"
           [style.background]="isAdminRoute() ? '#0056b3' : 'transparent'"
           [style.color]="isAdminRoute() ? 'white' : '#0056b3'">
          ⚙️ Administración RabbitMQ (Admin)
        </a>
      </nav>

      <!-- Aquí se carga AdminMqComponent cuando entras a /admin-mq -->
      <router-outlet></router-outlet>

      <!-- Vista de Reservas (se oculta cuando estás en /admin-mq) -->
      <main *ngIf="authService.isLoggedIn() && !isAdminRoute()">
        <div *ngIf="successMessage" style="background-color: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
          {{ successMessage }}
        </div>
        <div *ngIf="errorMessage" style="background-color: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
          {{ errorMessage }}
        </div>

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
              <input type="date" [(ngModel)]="newReservation.checkInDate" name="checkInDate" min="2025-01-01" max="2030-12-31" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;" required>
            </div>
            <div>
              <label style="display:block; margin-bottom:5px; font-weight:bold;">Fecha Check-Out:</label>
              <input type="date" [(ngModel)]="newReservation.checkOutDate" name="checkOutDate" min="2025-01-01" max="2030-12-31" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;" required>
            </div>
            <div style="grid-column: span 2; text-align: right; margin-top: 10px;">
              <button type="submit" [disabled]="saving" style="background-color: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-size: 15px; cursor: pointer;">
                {{ saving ? 'Guardando...' : '💾 Guardar Reserva' }}
              </button>
            </div>
          </form>
        </section>

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
                <td style="padding: 10px; border: 1px solid #ddd;">{{ r.roomType || 'Cabaña Estándar' }}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">{{ r.checkInDate }}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">{{ r.checkOutDate }}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  <span style="background: #e2e3e5; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                    {{ r.status }}
                  </span>
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; display: flex; gap: 6px; justify-content: center;">
                  <button *ngIf="r.status === 'CREADA'" (click)="changeStatus(r.id, 'CONFIRMADA')" style="background-color: #198754; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    ✅ Confirmar (MQ)
                  </button>
                  <button *ngIf="r.status === 'CONFIRMADA'" (click)="changeStatus(r.id, 'EN_ESTADIA')" style="background-color: #0d6efd; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    🏨 Check-In
                  </button>
                  <button (click)="deleteReservation(r.id)" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
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

      <div *ngIf="!authService.isLoggedIn() && !(authService.isLoading$ | async)" style="text-align: center; margin-top: 50px; color: #666;">
        <p style="font-size: 18px;">Debes iniciar sesión con tu cuenta corporativa para acceder al sistema AndesStay.</p>
      </div>
    </div>
  `
})
export class App implements OnInit {
  title = 'AndesStay - Gestión de Reservas';
  private apiUrl = `${environment.apiBaseUrl}/reservations`;
  
  reservations: Reservation[] = [];
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  newReservation: Reservation = {
    guestName: '', roomType: 'Cabaña Estándar', checkInDate: '', checkOutDate: '', status: 'CREADA'
  };

  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isLoading$.subscribe((isLoading) => {
      if (!isLoading && this.authService.isLoggedIn()) {
        this.loadReservations();
      }
    });
  }

  get userRoles(): string[] {
    return this.authService.getRoles ? this.authService.getRoles() : [];
  }

  get userScopes(): string[] {
    return this.authService.getScopes ? this.authService.getScopes() : [];
  }

  isAdminRoute(): boolean {
    return this.router.url.includes('/admin-mq');
  }

  login(): void { this.authService.login(); }
  logout(): void { this.authService.logout(); }

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
        this.errorMessage = 'Error al conectar con el backend (' + err.status + ')';
        this.loading = false;
      }
    });
  }

  submitReservation(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const guest = this.newReservation.guestName ? this.newReservation.guestName.trim() : '';
    if (guest.length < 3) {
      this.errorMessage = 'El nombre del huésped debe tener al menos 3 caracteres.';
      return;
    }
    if (!this.newReservation.checkInDate || !this.newReservation.checkOutDate) {
      this.errorMessage = 'Debes ingresar tanto la fecha de Check-In como la de Check-Out.';
      return;
    }

    const checkIn = new Date(this.newReservation.checkInDate);
    const checkOut = new Date(this.newReservation.checkOutDate);
    const minYear = 2025;
    const maxYear = 2030;

    if (
      isNaN(checkIn.getTime()) ||
      isNaN(checkOut.getTime()) ||
      checkIn.getFullYear() < minYear ||
      checkIn.getFullYear() > maxYear ||
      checkOut.getFullYear() < minYear ||
      checkOut.getFullYear() > maxYear
    ) {
      this.errorMessage = `Las fechas deben ser reales y estar entre los años ${minYear} y ${maxYear}.`;
      return;
    }

    if (checkOut <= checkIn) {
      this.errorMessage = 'La fecha de Check-Out debe ser posterior a la fecha de Check-In.';
      return;
    }

    this.saving = true;
    this.http.post<Reservation>(this.apiUrl, this.newReservation).subscribe({
      next: (created) => {
        this.successMessage = `¡Reserva creada con éxito para ${created.guestName}! (Notificación enviada a RabbitMQ)`;
        this.saving = false;
        this.newReservation = { guestName: '', roomType: 'Cabaña Estándar', checkInDate: '', checkOutDate: '', status: 'CREADA' };
        this.loadReservations();
      },
      error: (err) => {
        console.error('Error al crear reserva:', err);
        this.errorMessage = err.error?.message || 'Error al guardar la reserva (' + err.status + ')';
        this.saving = false;
      }
    });
  }

  changeStatus(id: number | undefined, newStatus: string): void {
    if (!id) return;
    this.errorMessage = '';
    this.successMessage = '';
    this.http.put(`${this.apiUrl}/${id}/status`, { status: newStatus }).subscribe({
      next: () => {
        this.successMessage = `Reserva #${id} actualizada a ${newStatus} (Eventos enviados a RabbitMQ).`;
        this.loadReservations();
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.errorMessage = err.error?.message || `Error al cambiar estado (${err.status})`;
      }
    });
  }

  deleteReservation(id?: number): void {
    if (!id) return;
    if (!confirm(`¿Estás seguro de eliminar la reserva #${id}?`)) return;
    this.errorMessage = '';
    this.successMessage = '';
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