import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { AccountInfo } from '@azure/msal-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div style="padding: 30px; font-family: sans-serif; max-width: 600px; margin: 40px auto; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2>AndesStay - Sistema de Reservas</h2>

      <div *ngIf="!isLoggedIn()">
        <p style="color: #666;">No has iniciado sesión en la plataforma.</p>
        <button (click)="login()" style="padding: 12px 24px; background-color: #0078d4; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
          Iniciar Sesión con Microsoft
        </button>
      </div>

      <div *ngIf="isLoggedIn()">
        <p style="font-size: 18px; color: #2e7d32;">
          ¡Bienvenido, <strong>{{ currentUser?.name || currentUser?.username }}</strong>!
        </p>
        <p style="font-size: 14px; color: #666;">
          Correo: {{ currentUser?.username }}
        </p>

        <div style="margin-top: 20px; display: flex; gap: 10px;">
          <button (click)="probarBackend()" style="padding: 10px 20px; background-color: #2e7d32; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
            Probar Backend Java (8080)
          </button>

          <button (click)="logout()" style="padding: 10px 20px; background-color: #d32f2f; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
            Cerrar Sesión
          </button>
        </div>

        <div *ngIf="respuestaBackend" style="margin-top: 20px; padding: 15px; background-color: #e8f5e9; border: 1px solid #4caf50; border-radius: 4px;">
          <h4 style="margin-top: 0; color: #2e7d32;">¡Respuesta recibida de Spring Boot! 🎉</h4>
          <pre style="background: #ffffff; padding: 10px; border-radius: 4px; font-size: 12px;">{{ respuestaBackend | json }}</pre>
        </div>

        <div *ngIf="errorBackend" style="margin-top: 20px; padding: 15px; background-color: #ffebee; border: 1px solid #f44336; border-radius: 4px;">
          <h4 style="margin-top: 0; color: #c62828;">Error de conexión con el Backend:</h4>
          <p style="margin: 0; color: #c62828;">{{ errorBackend }}</p>
        </div>
      </div>
    </div>
  `
})
export class AppComponent {
  respuestaBackend: any = null;
  errorBackend: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpClient
  ) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get currentUser(): AccountInfo | null {
    return this.authService.getActiveAccount();
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }

  probarBackend(): void {
    this.respuestaBackend = null;
    this.errorBackend = '';

    this.http.get('http://localhost:8080/api/v1/usuarios/protegido')
      .subscribe({
        next: (res) => {
          console.log('Respuesta del Backend Java:', res);
          this.respuestaBackend = res;
        },
        error: (err) => {
          console.error('Error al llamar al backend:', err);
          this.errorBackend = `Error ${err.status}: ${err.error?.message || err.message || 'No se pudo conectar con localhost:8080'}`;
        }
      });
  }
}