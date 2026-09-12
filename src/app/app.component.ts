import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="main-container">
      <!-- Header / Navbar -->
      <header class="navbar">
        <div class="logo-container">
          <span class="logo-icon">🏔️</span>
          <span class="logo-text">AndesStay</span>
        </div>
        <div *ngIf="isLoggedIn" class="user-badge">
          <span class="status-dot"></span>
          <span class="user-name-header">{{ userName }}</span>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="content-body">
        
        <!-- Estado 1: No ha iniciado sesión -->
        <div *ngIf="!isLoggedIn" class="card login-card">
          <div class="card-icon">🔐</div>
          <h2>Bienvenido a AndesStay</h2>
          <p class="subtitle">
            Gestión centralizada de reservas y hospedaje. Inicia sesión para acceder a tu panel de control.
          </p>
          
          <button (click)="login()" class="btn btn-microsoft">
            <svg class="ms-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z"/>
              <path fill="#81bc06" d="M12 1h10v10H12z"/>
              <path fill="#05a6f0" d="M1 12h10v10H1z"/>
              <path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
            Iniciar Sesión con Microsoft
          </button>
        </div>

        <!-- Estado 2: Sesión Iniciada -->
        <div *ngIf="isLoggedIn" class="card welcome-card">
          <div class="profile-header">
            <div class="avatar">
              {{ userName.charAt(0).toUpperCase() }}
            </div>
            <div class="profile-info">
              <h2>¡Hola, {{ userName }}!</h2>
              <p class="email-text">{{ userEmail }}</p>
            </div>
          </div>

          <div class="info-box">
            <p><strong>Estado:</strong> Autenticado mediante Entra ID (Azure AD)</p>
            <p><strong>Plataforma:</strong> AndesStay Frontend System</p>
          </div>

          <div class="actions">
            <button (click)="logout()" class="btn btn-logout">
              Cerrar Sesión
            </button>
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f4f6f9;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #2c3e50;
    }

    .main-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 32px;
      background-color: #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .logo-icon {
      font-size: 24px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #1a2530;
      letter-spacing: -0.5px;
    }

    .user-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #eef2f6;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background-color: #2ecc71;
      border-radius: 50%;
    }

    .content-body {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 40px;
      max-width: 460px;
      width: 100%;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      text-align: center;
      transition: transform 0.2s ease;
    }

    .card-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .card h2 {
      margin: 0 0 10px 0;
      font-size: 24px;
      color: #1e293b;
    }

    .subtitle {
      color: #64748b;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 28px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-microsoft {
      background-color: #0078d4;
      color: #ffffff;
    }

    .btn-microsoft:hover {
      background-color: #005a9e;
      box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
    }

    .ms-icon {
      width: 18px;
      height: 18px;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 16px;
      text-align: left;
      margin-bottom: 24px;
    }

    .avatar {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: bold;
    }

    .profile-info h2 {
      font-size: 20px;
      margin: 0 0 4px 0;
    }

    .email-text {
      margin: 0;
      font-size: 13px;
      color: #64748b;
    }

    .info-box {
      background-color: #f8fafc;
      border-left: 4px solid #2563eb;
      padding: 12px 16px;
      text-align: left;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      color: #334155;
      margin-bottom: 24px;
    }

    .info-box p {
      margin: 4px 0;
    }

    .btn-logout {
      background-color: #ef4444;
      color: white;
    }

    .btn-logout:hover {
      background-color: #dc2626;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
  `]
})
export class AppComponent {
  constructor(private readonly authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get userName(): string {
    const account = this.authService.getActiveAccount();
    return account ? account.name || account.username : '';
  }

  get userEmail(): string {
    const account = this.authService.getActiveAccount();
    return account ? account.username : '';
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }
}

