
import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { AppComponent } from './pages/weather/app.component';

const routeOption: ExtraOptions = {
  useHash: true
}
export const routes: Routes = [
  {
    path: 'weather',
    component: AppComponent,
  },
  {
    path: '',
    redirectTo: 'weather',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routeOption)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


