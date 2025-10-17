import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Necessário para usar HttpClient nos serviços e componentes standalone
    provideHttpClient(),

    // ✅ Use apenas o provideRouter — NÃO use RouterModule.forRoot() em lugar nenhum
    provideRouter(routes),
  ],
};
