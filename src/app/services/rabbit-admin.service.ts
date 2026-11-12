import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface QueueRequest {
  name: string;
  durable: boolean;
  autoDelete?: boolean;
  dlqName?: string;
}

export interface ExchangeRequest {
  name: string;
  type: 'direct' | 'topic' | 'fanout' | 'headers';
  durable: boolean;
}

export interface BindingRequest {
  queueName: string;
  exchangeName: string;
  routingKey: string;
}

@Injectable({ providedIn: 'root' })
export class RabbitAdminService {
  // Ajusta el prefijo si tu BFF enruta hacia /api/admin/mq o directamente a /queues
  private baseUrl = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) {}

  getQueues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/queues`);
  }

  createQueue(payload: QueueRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/queues`, payload);
  }

  deleteQueue(name: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/queues/${encodeURIComponent(name)}`);
  }

  createExchange(payload: ExchangeRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/exchanges`, payload);
  }

  deleteExchange(name: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/exchanges/${encodeURIComponent(name)}`);
  }

  createBinding(payload: BindingRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/bindings`, payload);
  }
}