import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GoogleComponent } from './google/google.component';
import { UnblockComponent } from './unblock/unblock.component';
import { PublicFormComponent } from './public-form/public-form.component';
import { PublicErrorComponent } from './public-error/public-error.component';
import { PublicLoginComponent } from './public-login/public-login.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'login/unblock/:username/:hash', component: UnblockComponent },
  { path: 'google/:jwt/:exp', component: GoogleComponent },
  { path: 'public/error', component: PublicErrorComponent },
  { path: 'public/login/:hash/:jwt/:exp', component: PublicLoginComponent },
  { path: 'public/form/:form_id/:hash', component: PublicFormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
