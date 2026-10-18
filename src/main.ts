import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { msalInstanceFactory } from './config/msal.config';

// Obtenemos la instancia global y la inicializamos ANTES de arrancar Angular
const msalApp = msalInstanceFactory();

msalApp.initialize().then(() => {
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
}).catch(err => {
  console.error("Error crítico al inicializar MSAL en main.ts:", err);
});