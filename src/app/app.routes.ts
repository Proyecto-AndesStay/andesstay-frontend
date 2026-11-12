import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Routes, CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MsalGuard, MsalService } from '@azure/msal-angular';
import { AdminMqComponent } from './pages/admin-mq/admin-mq.component';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const msalService = inject(MsalService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const accounts = msalService.instance.getAllAccounts();
  if (accounts.length === 0) {
    msalService.loginRedirect();
    return false;
  }

  const activeAccount = msalService.instance.getActiveAccount() || accounts[0];
  const expectedRoles = (route.data?.['roles'] as string[]) || [];

  if (expectedRoles.length === 0) {
    return true;
  }

  const claims = (activeAccount?.idTokenClaims as { roles?: string[]; extension_Roles?: string }) || {};
  let userRoles: string[] = [];

  if (Array.isArray(claims.roles)) {
    userRoles = claims.roles;
  } else if (typeof claims.extension_Roles === 'string') {
    userRoles = claims.extension_Roles.split(',');
  }

  const normalizedUserRoles = userRoles.map(r => r.toUpperCase());
  const hasAccess = expectedRoles.some(role => normalizedUserRoles.includes(role.toUpperCase()));

  if (!hasAccess) {
    console.warn('Acceso denegado. Se requiere el rol:', expectedRoles);
    return router.createUrlTree(['/']);
  }

  return true;
};

export const routes: Routes = [
  {
    path: 'admin-mq',
    component: AdminMqComponent,
    canActivate: [MsalGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  }
];