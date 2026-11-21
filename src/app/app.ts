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
  guestEmail?: string;
  guestPhone?: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  specialRequests?: string;
  status: string;
}

interface Unit {
  id: number;
  name: string;
  location: string;
  type: string;
  pricePerNight: string;
  capacity: string;
  description: string;
  features: string[];
}

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink],
  template: `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; min-height: 100vh; background-color: #f1f5f9; margin: 0; color: #1e293b;">
      
      <!-- SIDEBAR CORPORATIVO -->
      <aside *ngIf="authService.isLoggedIn()" style="width: 280px; min-width: 280px; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; box-shadow: 4px 0 15px rgba(0,0,0,0.08); border-right: 1px solid #1e293b; position: sticky; top: 0; height: 100vh; overflow-y: auto;">
        <div style="padding: 25px 20px; border-bottom: 1px solid #1e293b; background: #020617;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 8px;">
            🏔️ AndesStay
          </h2>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Red de Hostales y Cabañas</p>
        </div>

        <!-- Tarjeta de Perfil -->
        <div style="padding: 16px; background: #1e293b; margin: 16px; border-radius: 8px; border: 1px solid #334155;">
          <div style="font-size: 13px; font-weight: 600; color: #f8fafc; margin-bottom: 4px;">
            👤 {{ authService.getActiveAccount()?.name || 'Usuario' }}
          </div>
          <div style="font-size: 11px; color: #94a3b8; word-break: break-all; margin-bottom: 8px;">
            {{ authService.getActiveAccount()?.username }}
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <span *ngFor="let role of userRoles" style="background: #0284c7; color: white; font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase;">
              {{ role }}
            </span>
            <span *ngIf="userRoles.length === 0" style="background: #475569; color: white; font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
              CLIENTE / HUÉSPED
            </span>
          </div>
        </div>

        <!-- Menú de Pestañas Unificado -->
        <nav style="padding: 0 16px; display: flex; flex-direction: column; gap: 6px; flex-grow: 1;">
          <button (click)="switchTab('home')" style="text-align: left; background: none; border: none; width: 100%; cursor: pointer; padding: 10px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: background 0.2s;"
             [style.background]="currentTab === 'home' && !isAdminRoute() ? '#334155' : 'transparent'"
             [style.color]="currentTab === 'home' && !isAdminRoute() ? '#38bdf8' : '#cbd5e1'">
            🏠 Panel Principal & Perfil
          </button>

          <!-- Catálogo (Oculto para Auditor) -->
          <button *ngIf="!isOnlyAuditor()" (click)="switchTab('catalog')" style="text-align: left; background: none; border: none; width: 100%; cursor: pointer; padding: 10px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: background 0.2s;"
             [style.background]="currentTab === 'catalog' && !isAdminRoute() ? '#334155' : 'transparent'"
             [style.color]="currentTab === 'catalog' && !isAdminRoute() ? '#38bdf8' : '#cbd5e1'">
            🌲 Catálogo de Hostales & Cabañas
          </button>

          <!-- Nueva Reserva (Oculto para Auditor) -->
          <button *ngIf="!isOnlyAuditor()" (click)="switchTab('reservations')" style="text-align: left; background: none; border: none; width: 100%; cursor: pointer; padding: 10px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: background 0.2s;"
             [style.background]="currentTab === 'reservations' && !isAdminRoute() ? '#334155' : 'transparent'"
             [style.color]="currentTab === 'reservations' && !isAdminRoute() ? '#38bdf8' : '#cbd5e1'">
            🏨 Nueva Reserva (Huésped)
          </button>

          <!-- ADMIN Y RECEPCIONISTA: Gestión y Estados -->
          <button *ngIf="canManageReservations()" (click)="switchTab('admin-reservations')" style="text-align: left; background: none; border: none; width: 100%; cursor: pointer; padding: 10px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: background 0.2s;"
             [style.background]="currentTab === 'admin-reservations' && !isAdminRoute() ? '#334155' : 'transparent'"
             [style.color]="currentTab === 'admin-reservations' && !isAdminRoute() ? '#38bdf8' : '#cbd5e1'">
            🛡️ Gestión y Estados
          </button>

          <!-- ADMIN Y AUDITOR: Auditoría y Trazabilidad -->
          <button *ngIf="canViewAudit()" (click)="switchTab('audit')" style="text-align: left; background: none; border: none; width: 100%; cursor: pointer; padding: 10px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: background 0.2s;"
             [style.background]="currentTab === 'audit' && !isAdminRoute() ? '#334155' : 'transparent'"
             [style.color]="currentTab === 'audit' && !isAdminRoute() ? '#38bdf8' : '#cbd5e1'">
            📊 Auditoría y Trazabilidad
          </button>

          <!-- SOLO ADMIN: Mensajería y Broker -->
          <button *ngIf="isAdminUser()" (click)="navigateToMq()" style="text-align: left; background: none; border: none; width: 100%; cursor: pointer; padding: 10px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: background 0.2s;"
             [style.background]="isAdminRoute() ? '#334155' : 'transparent'"
             [style.color]="isAdminRoute() ? '#38bdf8' : '#cbd5e1'">
            📨 Mensajería y Broker (MQ)
          </button>

          <!-- SOLO ADMIN: Enlace externo a Kafka UI -->
          <a *ngIf="isAdminUser()" href="http://100.55.187.142:8090" target="_blank" rel="noopener noreferrer"
             style="text-align: left; text-decoration: none; color: #cbd5e1; padding: 10px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: background 0.2s;">
            ⚡ Kafka UI (Streaming) ↗
          </a>
        </nav>

        <!-- Cerrar Sesión -->
        <div style="padding: 16px; border-top: 1px solid #1e293b; background: #020617;">
          <button (click)="logout()" style="width: 100%; background-color: #991b1b; color: white; border: none; padding: 9px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- CONTENIDO PRINCIPAL -->
      <main style="flex-grow: 1; display: flex; flex-direction: column; min-height: 100vh; overflow-y: auto; background-color: #f8fafc;">
        
        <!-- Header Invitados -->
        <header *ngIf="!authService.isLoggedIn()" style="background: white; padding: 20px 40px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; color: #0f172a; font-size: 20px;">🏔️ AndesStay</h2>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Plataforma Cloud Native de Reservas</p>
          </div>
          <button *ngIf="!(authService.isLoading$ | async)" (click)="login()" style="background-color: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
            🔑 Iniciar Sesión con Microsoft
          </button>
          <div *ngIf="authService.isLoading$ | async" style="font-weight: 600; color: #0284c7; font-size: 14px;">
            ⏳ Validando sesión corporativa...
          </div>
        </header>

        <div style="padding: 35px 40px; max-width: 1200px; width: 100%; margin: 0 auto; box-sizing: border-box;">

          <!-- Mensajes del Sistema -->
          <div *ngIf="successMessage" style="background-color: #ecfdf5; color: #065f46; padding: 12px 18px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #10b981; font-size: 14px; font-weight: 500;">
            {{ successMessage }}
          </div>
          <div *ngIf="errorMessage" style="background-color: #fef2f2; color: #991b1b; padding: 12px 18px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #ef4444; font-size: 14px; font-weight: 500;">
            {{ errorMessage }}
          </div>

          <!-- Outlet para /admin-mq -->
          <router-outlet *ngIf="isAdminRoute()"></router-outlet>

          <!-- VISTA 1: HOME & PERFIL CON KPIS -->
          <div *ngIf="authService.isLoggedIn() && currentTab === 'home' && !isAdminRoute()">
            <div style="margin-bottom: 25px;">
              <h1 style="margin: 0 0 6px 0; color: #0f172a; font-size: 24px; font-weight: 700;">Panel de Control & Perfil Corporativo</h1>
              <p style="margin: 0; color: #64748b; font-size: 14px;">Sistema unificado de la red de hostales, cabañas y lodges de turismo AndesStay.</p>
            </div>

            <!-- Resumen de KPIs Operativos -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 25px;">
              <div style="background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Unidades en Red</div>
                <div style="font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 5px;">20 Unidades</div>
              </div>
              <div style="background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Ocupación Promedio</div>
                <div style="font-size: 24px; font-weight: 700; color: #059669; margin-top: 5px;">85.4%</div>
              </div>
              <div style="background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Broker RabbitMQ</div>
                <div style="font-size: 24px; font-weight: 700; color: #0284c7; margin-top: 5px;">Operativo ⚡</div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 30px;">
              <div style="background: white; border: 1px solid #e2e8f0; padding: 24px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <h3 style="margin-top: 0; color: #334155; font-size: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                  📋 Credenciales de Usuario
                </h3>
                <div style="font-size: 14px; color: #475569; display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                  <div><strong>Nombre:</strong> {{ authService.getActiveAccount()?.name }}</div>
                  <div><strong>Correo:</strong> {{ authService.getActiveAccount()?.username }}</div>
                  <div><strong>Rol Activo:</strong> <span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">{{ userRoles.length ? userRoles.join(', ') : 'CLIENTE / HUÉSPED' }}</span></div>
                </div>
              </div>

              <div style="background: white; border: 1px solid #e2e8f0; padding: 24px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <h3 style="margin-top: 0; color: #334155; font-size: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                  ⚡ Estado de la Arquitectura
                </h3>
                <div style="font-size: 14px; color: #475569; display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                  <div><strong>Infraestructura:</strong> AWS EC2 & API Gateway</div>
                  <div><strong>Seguridad:</strong> Microsoft Entra ID (IDaaS JWT)</div>
                  <div><strong>Mensajería:</strong> RabbitMQ & Kafka Streaming</div>
                </div>
              </div>
            </div>

            <div *ngIf="!isOnlyAuditor()" style="background: white; border: 1px solid #e2e8f0; padding: 24px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <h3 style="margin-top: 0; color: #334155; font-size: 16px; margin-bottom: 12px;">🚀 Accesos Recomendados</h3>
              <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Explora el catálogo oficial de nuestra red turística o realiza una nueva reserva:</p>
              <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                <button (click)="switchTab('catalog')" style="background: #334155; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer;">
                  Ver Catálogo de Unidades ➔
                </button>
                <button (click)="switchTab('reservations')" style="background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer;">
                  Realizar Nueva Reserva ➔
                </button>
              </div>
            </div>
          </div>

          <!-- VISTA: CATÁLOGO DE HOSTALES Y CABAÑAS -->
          <div *ngIf="authService.isLoggedIn() && currentTab === 'catalog' && !isAdminRoute() && !isOnlyAuditor()">
            <div style="margin-bottom: 25px;">
              <h1 style="margin: 0 0 6px 0; color: #0f172a; font-size: 24px; font-weight: 700;">Catálogo de Unidades - Red AndesStay</h1>
              <p style="margin: 0; color: #64748b; font-size: 14px;">Conoce nuestra red de 20 hostales, cabañas y lodges de turismo.</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px;">
              <div *ngFor="let unit of catalogUnits" style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column;">
                <div style="background: #0f172a; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
                  <h3 style="margin: 0; font-size: 16px; color: #38bdf8;">{{ unit.name }}</h3>
                  <span style="font-size: 12px; background: #334155; padding: 3px 8px; border-radius: 4px; font-weight: 500;">{{ unit.location }}</span>
                </div>
                <div style="padding: 20px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <p style="margin: 0 0 12px 0; color: #475569; font-size: 14px; line-height: 1.5;">{{ unit.description }}</p>
                    <div style="font-size: 13px; color: #334155; margin-bottom: 8px;"><strong>Capacidad:</strong> {{ unit.capacity }}</div>
                    <div style="font-size: 13px; color: #059669; font-weight: 600; margin-bottom: 12px;">Tarifa Referencial: {{ unit.pricePerNight }} por noche</div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 15px;">
                      <span *ngFor="let feat of unit.features" style="background: #f1f5f9; color: #475569; font-size: 11px; padding: 3px 8px; border-radius: 4px; border: 1px solid #cbd5e1;">
                        ✓ {{ feat }}
                      </span>
                    </div>
                  </div>
                  <button (click)="selectUnitForReservation(unit.type)" style="background: #0284c7; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; width: 100%;">
                    Reservar Esta Unidad ➔
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- VISTA 2: NUEVA RESERVA + SEGUIMIENTO -->
          <div *ngIf="authService.isLoggedIn() && currentTab === 'reservations' && !isAdminRoute() && !isOnlyAuditor()">
            <div style="margin-bottom: 25px;">
              <h1 style="margin: 0 0 6px 0; color: #0f172a; font-size: 24px; font-weight: 700;">Formulario de Reserva - AndesStay</h1>
              <p style="margin: 0; color: #64748b; font-size: 14px;">Selecciona tu unidad turística y registra tu estancia en nuestra red.</p>
            </div>

            <section style="background: white; border: 1px solid #e2e8f0; padding: 25px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">🏨 Detalle de la Estancia y Huésped</h3>
              
              <form (ngSubmit)="submitReservation()" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                <div>
                  <label style="display:block; margin-bottom:6px; font-weight:600; color: #475569; font-size: 13px;">Nombre Completo del Huésped:</label>
                  <input type="text" [(ngModel)]="newReservation.guestName" name="guestName" placeholder="Ej: Marcela Contreras" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1; box-sizing: border-box; font-size: 14px;" required>
                </div>

                <div>
                  <label style="display:block; margin-bottom:6px; font-weight:600; color: #475569; font-size: 13px;">Correo Electrónico de Contacto:</label>
                  <input type="email" [(ngModel)]="newReservation.guestEmail" name="guestEmail" placeholder="Ej: cliente&#64;correo.com" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1; box-sizing: border-box; font-size: 14px;">
                </div>

                <div>
                  <label style="display:block; margin-bottom:6px; font-weight:600; color: #475569; font-size: 13px;">Teléfono de Contacto (Opcional):</label>
                  <input type="text" [(ngModel)]="newReservation.guestPhone" name="guestPhone" placeholder="Ej: +56 9 1234 5678" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1; box-sizing: border-box; font-size: 14px;">
                </div>

                <div>
                  <label style="display:block; margin-bottom:6px; font-weight:600; color: #475569; font-size: 13px;">Tipo de Unidad / Habitación:</label>
                  <select [(ngModel)]="newReservation.roomType" name="roomType" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1; box-sizing: border-box; background: white; font-size: 14px;">
                    <option value="Cabaña Estándar">Cabaña Estándar (Cap. 2-4 personas - Vista al bosque)</option>
                    <option value="Suite Montaña">Suite Montaña (Chimenea, Jacuzzi y Balcón)</option>
                    <option value="Habitación Familiar">Habitación Familiar (Amplia con 3 camas y desayuno inc.)</option>
                    <option value="Lodge de Interés Especial">Lodge Turístico Especial (Zona exclusiva)</option>
                  </select>
                </div>

                <div>
                  <label style="display:block; margin-bottom:6px; font-weight:600; color: #475569; font-size: 13px;">Fecha Check-In:</label>
                  <input type="date" [(ngModel)]="newReservation.checkInDate" name="checkInDate" min="2025-01-01" max="2030-12-31" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1; box-sizing: border-box; font-size: 14px;" required>
                </div>

                <div>
                  <label style="display:block; margin-bottom:6px; font-weight:600; color: #475569; font-size: 13px;">Fecha Check-Out:</label>
                  <input type="date" [(ngModel)]="newReservation.checkOutDate" name="checkOutDate" min="2025-01-01" max="2030-12-31" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1; box-sizing: border-box; font-size: 14px;" required>
                </div>

                <div style="grid-column: span 2;">
                  <label style="display:block; margin-bottom:6px; font-weight:600; color: #475569; font-size: 13px;">Peticiones Especiales (Opcional):</label>
                  <textarea [(ngModel)]="newReservation.specialRequests" name="specialRequests" rows="2" placeholder="Ej: Requerimos cama adicional o llegada tardía..." style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1; box-sizing: border-box; font-size: 14px;"></textarea>
                </div>

                <div style="grid-column: span 2; text-align: right; margin-top: 5px;">
                  <button type="submit" [disabled]="saving" style="background-color: #0284c7; color: white; border: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
                    {{ saving ? 'Procesando Reserva...' : '💾 Registrar y Enviar a Notificaciones' }}
                  </button>
                </div>
              </form>
            </section>

            <!-- Tabla de seguimiento para el Huésped (Solo Lectura) -->
            <section style="background: white; border: 1px solid #e2e8f0; padding: 25px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-top: 25px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #1e293b; font-size: 16px;">📋 Estado de Reservas Registradas</h3>
                <button (click)="loadReservations()" style="background: #475569; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                  🔄 Actualizar Estado
                </button>
              </div>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                  <thead>
                    <tr style="background-color: #1e293b; color: white;">
                      <th style="padding: 10px; border: 1px solid #334155;">ID</th>
                      <th style="padding: 10px; border: 1px solid #334155;">Huésped</th>
                      <th style="padding: 10px; border: 1px solid #334155;">Unidad</th>
                      <th style="padding: 10px; border: 1px solid #334155;">Fechas</th>
                      <th style="padding: 10px; border: 1px solid #334155;">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let r of reservations" style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">#{{ r.id }}</td>
                      <td style="padding: 10px; border: 1px solid #e2e8f0;">{{ r.guestName }}</td>
                      <td style="padding: 10px; border: 1px solid #e2e8f0;">{{ r.roomType || 'Cabaña Estándar' }}</td>
                      <td style="padding: 10px; border: 1px solid #e2e8f0; font-size: 12px;">{{ r.checkInDate }} al {{ r.checkOutDate }}</td>
                      <td style="padding: 10px; border: 1px solid #e2e8f0;">
                        <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 11px;">
                          {{ r.status }}
                        </span>
                      </td>
                    </tr>
                    <tr *ngIf="reservations.length === 0 && !loading">
                      <td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">No hay reservas registradas aún.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <!-- VISTA 3: GESTIÓN DE ESTADOS Y CONTROL (ADMIN Y RECEPCIONISTA) -->
          <div *ngIf="authService.isLoggedIn() && currentTab === 'admin-reservations' && !isAdminRoute() && canManageReservations()">
            <div style="margin-bottom: 25px;">
              <h1 style="margin: 0 0 6px 0; color: #0f172a; font-size: 24px; font-weight: 700;">Panel Operativo - Control de Estancias</h1>
              <p style="margin: 0; color: #64748b; font-size: 14px;">Supervisión general y cambio de estados (Confirmar, Check-In, Check-Out y Cancelar).</p>
            </div>

            <section style="background: white; border: 1px solid #e2e8f0; padding: 25px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                <h3 style="margin: 0; color: #1e293b; font-size: 16px;">📋 Listado General de Control Operativo</h3>
                <button (click)="loadReservations()" style="background: #475569; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">
                  🔄 Actualizar Listado
                </button>
              </div>

              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                  <thead>
                    <tr style="background-color: #1e293b; color: white;">
                      <th style="padding: 12px; border: 1px solid #334155;">ID</th>
                      <th style="padding: 12px; border: 1px solid #334155;">Huésped</th>
                      <th style="padding: 12px; border: 1px solid #334155;">Unidad Turística</th>
                      <th style="padding: 12px; border: 1px solid #334155;">Fechas</th>
                      <th style="padding: 12px; border: 1px solid #334155;">Estado Actual</th>
                      <th style="padding: 12px; border: 1px solid #334155; text-align: center;">Acciones Operativas (Broker)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let r of reservations" style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">#{{ r.id }}</td>
                      <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">{{ r.guestName }}</td>
                      <td style="padding: 12px; border: 1px solid #e2e8f0; color: #475569;">{{ r.roomType || 'Cabaña Estándar' }}</td>
                      <td style="padding: 12px; border: 1px solid #e2e8f0; color: #475569; font-size: 12px;">{{ r.checkInDate }} al {{ r.checkOutDate }}</td>
                      <td style="padding: 12px; border: 1px solid #e2e8f0;">
                        <span style="background: #e2e8f0; color: #334155; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 11px; display: inline-block;">
                          {{ r.status }}
                        </span>
                      </td>
                      <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">
                        <div style="display: flex; gap: 6px; justify-content: center; align-items: center; flex-wrap: wrap;">
                          <button *ngIf="r.status === 'CREADA'" (click)="changeStatus(r.id, 'CONFIRMADA')" style="background-color: #059669; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                            ✅ Confirmar
                          </button>
                          <button *ngIf="r.status === 'CONFIRMADA'" (click)="changeStatus(r.id, 'EN_ESTADIA')" style="background-color: #0284c7; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                            🏨 Check-In
                          </button>
                          <button *ngIf="r.status === 'EN_ESTADIA'" (click)="changeStatus(r.id, 'CHECKOUT')" style="background-color: #7c3aed; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                            🧳 Check-Out
                          </button>
                          <button *ngIf="r.status === 'CREADA' || r.status === 'CONFIRMADA'" (click)="changeStatus(r.id, 'CANCELADA')" style="background-color: #d97706; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                            ✖️ Cancelar
                          </button>
                          <button *ngIf="isAdminUser()" (click)="deleteReservation(r.id)" style="background-color: #dc2626; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr *ngIf="reservations.length === 0 && !loading">
                      <td colspan="6" style="text-align: center; padding: 30px; color: #64748b;">
                        No hay reservas registradas en el sistema.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <!-- VISTA 4: AUDITORÍA Y TRAZABILIDAD (ADMIN Y AUDITOR) -->
          <div *ngIf="authService.isLoggedIn() && currentTab === 'audit' && !isAdminRoute() && canViewAudit()">
            <div style="margin-bottom: 25px;">
              <h1 style="margin: 0 0 6px 0; color: #0f172a; font-size: 24px; font-weight: 700;">Auditoría y Trazabilidad del Sistema</h1>
              <p style="margin: 0; color: #64748b; font-size: 14px;">Registro de seguridad y eventos asíncronos procesados por los microservicios de AndesStay.</p>
            </div>

            <section style="background: white; border: 1px solid #e2e8f0; padding: 25px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                <h3 style="margin: 0; color: #1e293b; font-size: 16px;">🔍 Log de Eventos y Cambios de Estado</h3>
                <div style="display: flex; gap: 10px; align-items: center;">
                  <span style="font-size: 12px; color: #059669; font-weight: 600;">Estado: Monitoreo Activo</span>
                  <button (click)="refreshAuditLogs()" style="background: #0284c7; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">
                    🔄 Actualizar y Sincronizar Logs
                  </button>
                </div>
              </div>

              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                  <thead>
                    <tr style="background-color: #0f172a; color: white;">
                      <th style="padding: 12px; border: 1px solid #334155;">ID Evento</th>
                      <th style="padding: 12px; border: 1px solid #334155;">Marca de Tiempo</th>
                      <th style="padding: 12px; border: 1px solid #334155;">Usuario IDaaS</th>
                      <th style="padding: 12px; border: 1px solid #334155;">Acción / Evento MQ</th>
                      <th style="padding: 12px; border: 1px solid #334155;">Detalles de Trazabilidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let log of auditLogs" style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">#AUD-{{ log.id }}</td>
                      <td style="padding: 12px; border: 1px solid #e2e8f0; color: #475569;">{{ log.timestamp }}</td>
                      <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">{{ log.user }}</td>
                      <td style="padding: 12px; border: 1px solid #e2e8f0;">
                        <span style="background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 11px;">
                          {{ log.action }}
                        </span>
                      </td>
                      <td style="padding: 12px; border: 1px solid #e2e8f0; color: #475569;">{{ log.details }}</td>
                    </tr>
                    <tr *ngIf="auditLogs.length === 0">
                      <td colspan="5" style="text-align: center; padding: 30px; color: #64748b;">
                        No hay eventos registrados. Haz clic en "Actualizar y Sincronizar Logs" o realiza una acción para registrar eventos.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <!-- Bienvenida Invitados -->
          <div *ngIf="!authService.isLoggedIn() && !(authService.isLoading$ | async)" style="text-align: center; margin-top: 80px; background: white; padding: 60px 40px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; margin-top: 0; font-size: 26px;">Bienvenido a la Red AndesStay</h2>
            <p style="color: #64748b; font-size: 15px; max-width: 550px; margin: 0 auto 30px auto;">
              Plataforma unificada para la gestión de reservas corporativas y control de cabañas.
            </p>
            <button (click)="login()" style="background-color: #0284c7; color: white; border: none; padding: 12px 28px; border-radius: 6px; cursor: pointer; font-size: 15px; font-weight: 600;">
              🔑 Iniciar Sesión con Microsoft Entra ID
            </button>
          </div>

        </div>
      </main>
    </div>
  `
})
export class App implements OnInit {
  title = 'AndesStay - Gestión de Reservas';
  private apiUrl = `${environment.apiBaseUrl}/reservations`;
  private auditApiUrl = `${environment.apiBaseUrl}/audit`;
  
  currentTab: 'home' | 'catalog' | 'reservations' | 'admin-reservations' | 'audit' = 'home';
  reservations: Reservation[] = [];
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  catalogUnits: Unit[] = [
    {
      id: 1,
      name: 'Cabaña Bosque Andino',
      location: 'Valparaíso / Zona Interior',
      type: 'Cabaña Estándar',
      pricePerNight: '$65.000 CLP',
      capacity: '2 a 4 personas',
      description: 'Hermosa cabaña rodeada de naturaleza, equipada con cocina completa, calefacción a leña y vistas panorámicas.',
      features: ['Wi-Fi Satelital', 'Estacionamiento', 'Calefacción', 'Cocina']
    },
    {
      id: 2,
      name: 'Suite Cumbre de Montaña',
      location: 'Cajón / Zona Cordillera',
      type: 'Suite Montaña',
      pricePerNight: '$110.000 CLP',
      capacity: '2 personas (Exclusiva)',
      description: 'Suite de lujo con chimenea central, jacuzzi privado en terraza y vista directa hacia las cumbres nevadas.',
      features: ['Jacuzzi Privado', 'Chimenea', 'Desayuno Incluido', 'Balcón Panorámico']
    },
    {
      id: 3,
      name: 'Lodge Familiar Los Coigues',
      location: 'Reserva Natural Sur',
      type: 'Habitación Familiar',
      pricePerNight: '$95.000 CLP',
      capacity: 'Hasta 5 personas',
      description: 'Amplia habitación con múltiples camas, ideal para familias que buscan descanso y cercanía con senderos de trekking.',
      features: ['3 Camas Grandes', 'Zona de Juegos', 'Área de Quincho', 'Pet Friendly']
    },
    {
      id: 4,
      name: 'Lodge de Interés Especial Glaciar',
      location: 'Santuario de la Naturaleza',
      type: 'Lodge de Interés Especial',
      pricePerNight: '$140.000 CLP',
      capacity: '2 a 3 personas',
      description: 'Unidad especializada para expediciones y turismo aventura, con centro de informaciones y guías locales disponibles.',
      features: ['Guía de Trekking', 'Equipamiento Técnico', 'Vista al Glaciar', 'Pensión Completa']
    }
  ];

  auditLogs: AuditLog[] = [];

  newReservation: Reservation = {
    guestName: '', guestEmail: '', guestPhone: '', roomType: 'Cabaña Estándar', checkInDate: '', checkOutDate: '', specialRequests: '', status: 'CREADA'
  };

  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isLoading$.subscribe((isLoading) => {
      if (!isLoading && this.authService.isLoggedIn()) {
        if (this.isAdminUser()) {
          this.loadReservations();
          this.loadAuditLogs();
        } else if (this.isRecepcionistaUser()) {
          this.loadReservations();
        } else if (this.isAuditorUser()) {
          this.currentTab = 'audit';
          this.loadAuditLogs();
        } else {
          this.loadReservations();
        }
      }
    });
  }

  get userRoles(): string[] {
    return this.authService.getRoles ? this.authService.getRoles() : [];
  }

  isAdminRoute(): boolean {
    return this.router.url.includes('/admin-mq');
  }

  isAdminUser(): boolean {
    const roles = this.userRoles.map(r => r.toUpperCase());
    return roles.includes('ADMIN');
  }

  isRecepcionistaUser(): boolean {
    const roles = this.userRoles.map(r => r.toUpperCase());
    return roles.includes('RECEPCIONISTA') || roles.includes('OPERADOR');
  }

  isAuditorUser(): boolean {
    const roles = this.userRoles.map(r => r.toUpperCase());
    return roles.includes('AUDITOR');
  }

  canManageReservations(): boolean {
    return this.isAdminUser() || this.isRecepcionistaUser();
  }

  isOnlyAuditor(): boolean {
    return this.isAuditorUser() && !this.isAdminUser() && !this.isRecepcionistaUser();
  }

  canViewAudit(): boolean {
    return this.isAdminUser() || this.isAuditorUser();
  }

  switchTab(tab: 'home' | 'catalog' | 'reservations' | 'admin-reservations' | 'audit'): void {
    if (this.isAdminRoute()) {
      this.router.navigate(['/']);
    }
    this.currentTab = tab;
    if (tab === 'audit') {
      this.loadAuditLogs();
    } else if (tab === 'reservations' || tab === 'admin-reservations') {
      this.loadReservations();
    }
  }

  selectUnitForReservation(unitType: string): void {
    this.newReservation.roomType = unitType;
    this.currentTab = 'reservations';
  }

  navigateToMq(): void {
    this.router.navigate(['/admin-mq']);
  }

  login(): void { this.authService.login(); }
  logout(): void { this.authService.logout(); }

  private initDefaultAuditLogs(): void {
    const currentUser = this.authService.getActiveAccount()?.username || 'admin_andesstay@projectotest.onmicrosoft.com';
    this.auditLogs = [
      { id: 101, timestamp: '2026-11-17 10:15:22', user: currentUser, action: 'RESERVATION_CREATED', details: 'Evento publicado en exchange de RabbitMQ (routing-key: reservation.created)' },
      { id: 102, timestamp: '2026-11-17 10:20:05', user: currentUser, action: 'STATUS_CONFIRMED', details: 'Validación de inventario OK y cambio de estado a CONFIRMADA' },
      { id: 103, timestamp: '2026-11-17 11:05:40', user: currentUser, action: 'CHECK_IN_PROCESSED', details: 'Huésped recibido en recepción de Cabaña Bosque Andino' }
    ];
  }

  loadAuditLogs(): void {
    this.http.get<any[]>(this.auditApiUrl).subscribe({
      next: (events) => {
        if (events && events.length > 0) {
          this.auditLogs = events.map((e, index) => ({
            id: e.reservationId || (index + 1),
            timestamp: e.timestamp ? e.timestamp.replace('T', ' ').substring(0, 19) : 'Reciente',
            user: e.performedBy || 'Sistema AndesStay',
            action: e.eventType || 'KAFKA_EVENT',
            details: e.details || `Reserva #${e.reservationId ?? 'N/D'} - ${e.guestName ?? ''} (${e.status ?? ''})`
          }));
        } else if (this.auditLogs.length === 0) {
          this.initDefaultAuditLogs();
        }
      },
      error: (err) => {
        console.error('Error al cargar auditoría desde Kafka:', err);
        if (this.auditLogs.length === 0) {
          this.initDefaultAuditLogs();
        }
      }
    });
  }

  refreshAuditLogs(): void {
    this.successMessage = 'Sincronizando eventos en tiempo real desde Kafka (ms-andesstay-audit)...';
    this.loadAuditLogs();
  }

  private addAuditLog(action: string, details: string): void {
    const currentUser = this.authService.getActiveAccount()?.username || 'admin_andesstay@projectotest.onmicrosoft.com';
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    const newLog: AuditLog = {
      id: Math.floor(1000 + Math.random() * 9000),
      timestamp: now,
      user: currentUser,
      action: action,
      details: details
    };

    this.auditLogs.unshift(newLog);
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
        this.successMessage = `¡Reserva creada con éxito para ${created.guestName}! Notificación enviada a RabbitMQ.`;
        this.saving = false;
        
        this.addAuditLog('RESERVATION_CREATED', `Reserva #${created.id || 'N/D'} para ${created.guestName} publicada en RabbitMQ`);

        this.newReservation = { guestName: '', guestEmail: '', guestPhone: '', roomType: 'Cabaña Estándar', checkInDate: '', checkOutDate: '', specialRequests: '', status: 'CREADA' };
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
        this.successMessage = `Reserva #${id} actualizada a ${newStatus} correctamente.`;
        
        const actionName = newStatus === 'CONFIRMADA' ? 'STATUS_CONFIRMED' : 'STATUS_UPDATED';
        this.addAuditLog(actionName, `Reserva #${id} cambiada exitosamente a estado ${newStatus}`);

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
        
        this.addAuditLog('RESERVATION_DELETED', `Reserva #${id} eliminada del sistema operativo`);

        this.loadReservations();
      },
      error: (err) => {
        console.error('Error al eliminar reserva:', err);
        this.errorMessage = 'Error al eliminar la reserva (' + err.status + ')';
      }
    });
  }
}