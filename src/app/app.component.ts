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
  templateUrl: './app.component.html'
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
