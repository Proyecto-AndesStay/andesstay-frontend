import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { APP_INITIALIZER, inject } from '@angular/core';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalInterceptor,
  MsalGuard,
  MsalService,
  MsalBroadcastService,
} from '@azure/msal-angular';
import { firstValueFrom } from 'rxjs';

import { AppComponent } from './app/app.component';
import {
  msalInstanceFactory,
  msalGuardConfigFactory,
  msalInterceptorConfigFactory,
} from './config/msal.config';

const routes: Routes = [
  { path: '', component: AppComponent },
  { path: '**', redirectTo: '' },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: MSAL_INSTANCE, useFactory: msalInstanceFactory },
    { provide: MSAL_GUARD_CONFIG, useFactory: msalGuardConfigFactory },
    { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: msalInterceptorConfigFactory },
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const msalService = inject(MsalService);
        return () => firstValueFrom(msalService.initialize());
      },
      multi: true,
    },
    MsalGuard,
    MsalService,
    MsalBroadcastService,
  ],
}).catch((err) => console.error('Error al iniciar aplicacion:', err));
