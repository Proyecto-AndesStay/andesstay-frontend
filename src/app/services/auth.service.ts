import { Injectable, OnDestroy } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import {
  AccountInfo,
  EventMessage,
  EventType,
  InteractionStatus,
} from '@azure/msal-browser';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private readonly destroying$ = new Subject<void>();
  public readonly currentUser$ = new BehaviorSubject<AccountInfo | null>(null);
  public readonly isLoading$ = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly msalService: MsalService,
    private readonly msalBroadcastService: MsalBroadcastService
  ) {
    this.initAuth();
  }

  private initAuth(): void {
    // 1. OBLIGATORIO: Procesar la respuesta del redirect cuando vuelve de Microsoft
    this.msalService.handleRedirectObservable()
      .pipe(takeUntil(this.destroying$))
      .subscribe({
        next: (result) => {
          if (result && result.account) {
            this.msalService.instance.setActiveAccount(result.account);
          }
          this.updateAccount();
          this.isLoading$.next(false);
        },
        error: (err) => {
          console.error('Error procesando redirección MSAL:', err);
          this.isLoading$.next(false);
        }
      });

    // 2. Escuchar cuando MSAL finalice cualquier interacción (startup o redirect)
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroying$)
      )
      .subscribe(() => {
        this.updateAccount();
        this.isLoading$.next(false);
      });

    // 3. Escuchar evento de login exitoso
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) =>
          msg.eventType === EventType.LOGIN_SUCCESS ||
          msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
        ),
        takeUntil(this.destroying$)
      )
      .subscribe((result: EventMessage) => {
        if (result.payload) {
          const payload = result.payload as any;
          if (payload.account) {
            this.msalService.instance.setActiveAccount(payload.account);
          }
        }
        this.updateAccount();
      });

    // 4. Respaldos por si la cuenta ya existía previamente en caché
    this.updateAccount();

    // 5. Temporizador de seguridad: si tras 1.5s sigue cargando, forzar fin de carga
    setTimeout(() => {
      if (this.isLoading$.value) {
        this.updateAccount();
        this.isLoading$.next(false);
      }
    }, 1500);
  }

  public updateAccount(): void {
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      let active = this.msalService.instance.getActiveAccount();
      if (!active) {
        active = accounts[0];
        this.msalService.instance.setActiveAccount(active);
      }
      this.currentUser$.next(active);
    } else {
      this.currentUser$.next(null);
    }
  }

  isLoggedIn(): boolean {
    return this.msalService.instance.getAllAccounts().length > 0 || this.currentUser$.value !== null;
  }

  getActiveAccount(): AccountInfo | null {
    return this.msalService.instance.getActiveAccount() || this.currentUser$.value;
  }

  login(): void {
    this.msalService.loginRedirect();
  }

  logout(): void {
    this.msalService.logoutRedirect();
  }

  ngOnDestroy(): void {
    this.destroying$.next();
    this.destroying$.complete();
  }
}
