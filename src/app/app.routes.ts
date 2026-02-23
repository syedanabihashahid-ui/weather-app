import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WeatherComponent } from './pages/weather/app.component';

export const routes: Routes = [
  {
    path: 'weather',
    component: WeatherComponent,
  },
  {
    path: '',
    redirectTo: 'weather',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
