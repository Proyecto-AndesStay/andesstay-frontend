import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RabbitAdminService, QueueRequest, ExchangeRequest, BindingRequest } from '../../services/rabbit-admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-mq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 24px; max-width: 900px; margin: 0 auto; font-family: sans-serif;">
      <h2>Panel de Administración RabbitMQ (AndesStay)</h2>
      <p><strong>Usuario:</strong> {{ userName }} | <strong>Roles JWT:</strong> {{ roles.join(', ') || 'Sin roles asignados' }}</p>

      <div *ngIf="statusMsg" [style.color]="isError ? '#b91c1c' : '#15803d'" style="padding: 10px; border: 1px solid; margin-bottom: 16px; border-radius: 4px;">
        {{ statusMsg }}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- Crear y Eliminar Colas -->
        <section style="border: 1px solid #ccc; padding: 16px; border-radius: 8px;">
          <h3>1. Gestión de Colas (Queues)</h3>
          <form (ngSubmit)="onCreateQueue()">
            <div style="margin-bottom: 8px;">
              <label>Nombre de la Cola *</label><br>
              <input type="text" [(ngModel)]="queueForm.name" name="qName" required placeholder="ej. reservas.notificaciones.queue" style="width: 100%; padding: 6px;" />
            </div>
            <div style="margin-bottom: 8px;">
              <label>DLQ Asociada (Opcional)</label><br>
              <input type="text" [(ngModel)]="queueForm.dlqName" name="qDlq" placeholder="ej. reservas.notificaciones.dlq" style="width: 100%; padding: 6px;" />
            </div>
            <div style="margin-bottom: 12px;">
              <label>
                <input type="checkbox" [(ngModel)]="queueForm.durable" name="qDurable" /> Durable
              </label>
            </div>
            <button type="submit" [disabled]="!queueForm.name.trim()">Crear Cola (POST /queues)</button>
          </form>

          <hr style="margin: 16px 0;" />
          <div>
            <label>Eliminar Cola por Nombre</label><br>
            <input type="text" [(ngModel)]="queueToDelete" placeholder="Nombre de la cola" style="width: 70%; padding: 6px; margin-right: 6px;" />
            <button (click)="onDeleteQueue()" [disabled]="!queueToDelete.trim()">Eliminar</button>
          </div>
        </section>

        <!-- Crear Exchanges y Bindings -->
        <section style="border: 1px solid #ccc; padding: 16px; border-radius: 8px;">
          <h3>2. Exchanges y Bindings</h3>
          <form (ngSubmit)="onCreateExchange()">
            <div style="margin-bottom: 8px;">
              <label>Nombre del Exchange *</label><br>
              <input type="text" [(ngModel)]="exchangeForm.name" name="exName" required placeholder="ej. andesstay.events.exchange" style="width: 100%; padding: 6px;" />
            </div>
            <div style="margin-bottom: 8px;">
              <label>Tipo</label><br>
              <select [(ngModel)]="exchangeForm.type" name="exType" style="width: 100%; padding: 6px;">
                <option value="direct">direct</option>
                <option value="topic">topic</option>
                <option value="fanout">fanout</option>
              </select>
            </div>
            <button type="submit" [disabled]="!exchangeForm.name.trim()">Crear Exchange</button>
          </form>

          <hr style="margin: 16px 0;" />
          <form (ngSubmit)="onCreateBinding()">
            <h4>Vincular Cola a Exchange (Binding)</h4>
            <input type="text" [(ngModel)]="bindingForm.queueName" name="bQueue" placeholder="Nombre Cola *" required style="width: 100%; padding: 6px; margin-bottom: 6px;" />
            <input type="text" [(ngModel)]="bindingForm.exchangeName" name="bExchange" placeholder="Nombre Exchange *" required style="width: 100%; padding: 6px; margin-bottom: 6px;" />
            <input type="text" [(ngModel)]="bindingForm.routingKey" name="bKey" placeholder="Routing Key (ej. reserva.creada) *" required style="width: 100%; padding: 6px; margin-bottom: 8px;" />
            <button type="submit" [disabled]="!bindingForm.queueName.trim() || !bindingForm.exchangeName.trim()">Crear Binding</button>
          </form>
        </section>
      </div>
    </div>
  `
})
export class AdminMqComponent implements OnInit {
  userName = '';
  roles: string[] = [];
  statusMsg = '';
  isError = false;

  queueForm: QueueRequest = { name: '', durable: true, dlqName: '' };
  queueToDelete = '';
  exchangeForm: ExchangeRequest = { name: '', type: 'topic', durable: true };
  bindingForm: BindingRequest = { queueName: '', exchangeName: '', routingKey: '' };

  constructor(
    private rabbitService: RabbitAdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const account = this.authService.getActiveAccount();
    this.userName = account?.username || account?.name || 'Autenticado';
    this.roles = this.authService.getRoles();
  }

  onCreateQueue(): void {
    if (!this.queueForm.name.trim()) return;
    this.rabbitService.createQueue(this.queueForm).subscribe({
      next: () => this.showFeedback(`Cola '${this.queueForm.name}' creada correctamente.`, false),
      error: (err) => this.showFeedback(`Error al crear cola: ${err.error?.message || err.message}`, true)
    });
  }

  onDeleteQueue(): void {
    if (!this.queueToDelete.trim()) return;
    this.rabbitService.deleteQueue(this.queueToDelete.trim()).subscribe({
      next: () => {
        this.showFeedback(`Cola '${this.queueToDelete}' eliminada.`, false);
        this.queueToDelete = '';
      },
      error: (err) => this.showFeedback(`Error al eliminar cola: ${err.error?.message || err.message}`, true)
    });
  }

  onCreateExchange(): void {
    if (!this.exchangeForm.name.trim()) return;
    this.rabbitService.createExchange(this.exchangeForm).subscribe({
      next: () => this.showFeedback(`Exchange '${this.exchangeForm.name}' creado.`, false),
      error: (err) => this.showFeedback(`Error al crear exchange: ${err.error?.message || err.message}`, true)
    });
  }

  onCreateBinding(): void {
    this.rabbitService.createBinding(this.bindingForm).subscribe({
      next: () => this.showFeedback(`Binding creado hacia '${this.bindingForm.queueName}'.`, false),
      error: (err) => this.showFeedback(`Error al crear binding: ${err.error?.message || err.message}`, true)
    });
  }

  private showFeedback(msg: string, isErr: boolean): void {
    this.statusMsg = msg;
    this.isError = isErr;
  }
}