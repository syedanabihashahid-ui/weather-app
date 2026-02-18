import { AppComponent } from './app/pages/weather/app.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { provideHttpClient, withFetch } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()), 
    ...appConfig.providers 
  ]
})
.catch((err) => console.error(err));


