import { Injectable } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus, AccountInfo } from '@azure/msal-browser';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoading = new BehaviorSubject<boolean>(true);
  public isLoading$ = this._isLoading.asObservable();

  constructor(
    private msalService: MsalService,
    private broadcastService: MsalBroadcastService
  ) {
    this.msalService.handleRedirectObservable().subscribe({
      next: () => {
        this.checkAndSetActiveAccount();
        this._isLoading.next(false);
      },
      error: (err) => {
        console.error('Error en sesión:', err);
        this._isLoading.next(false);
      }
    });

    this.broadcastService.inProgress$
      .pipe(filter((status: InteractionStatus) => status === InteractionStatus.None))
      .subscribe(() => {
        this.checkAndSetActiveAccount();
        this._isLoading.next(false);
      });
  }

  private checkAndSetActiveAccount() {
    let activeAccount = this.msalService.instance.getActiveAccount();
    if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
      activeAccount = this.msalService.instance.getAllAccounts()[0];
      this.msalService.instance.setActiveAccount(activeAccount);
    }
  }

  isLoggedIn(): boolean {
    try { return this.msalService.instance.getAllAccounts().length > 0; }
    catch (e) { return false; }
  }

  getActiveAccount(): AccountInfo | null {
    try { return this.msalService.instance.getActiveAccount(); }
    catch (e) { return null; }
  }

  login(): void { this.msalService.loginRedirect(); }
  logout(): void { this.msalService.logoutRedirect(); }
}