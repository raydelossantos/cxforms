import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';
import { NgSelectModule, NG_SELECT_DEFAULT_CONFIG } from '@ng-select/ng-select';
import { CKEditorModule } from 'ngx-ckeditor';

import { AppComponent } from './app.component';
import { FrontModule } from './front/front.module';
import { AppRoutingModule } from './app-routing.module';
import { GlobalService } from './services/global.service';
import { AuthService } from './services/auth.service';
import { ClientService } from './services/client.service';
import { LoginService } from './services/login.service';
import { AuthGuard } from './services/auth-guard.service';
import { AuthInterceptor } from './services/auth.interceptor';
import { APP_CONFIG, AppConfig } from './app.config';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { MDBBootstrapModule } from 'angular-bootstrap-md';

import { AdminModule } from './admin/admin.module';
import { FormService } from './services/form.service';
import { LOBService } from './services/lob.service';
import { FieldService } from './services/field.service';
import { DefaultTableService } from './services/dafault.table.service';
import { UserService } from './services/user.service';
import { TeamService } from './services/team.service';
import { MemberService } from './services/member.service';
import { SortablejsModule } from 'angular-sortablejs/dist';
import { CommonService } from './services/common.service.1';
import { PermissionService } from './services/permission.service';
import { GoogleComponent } from './google/google.component';
import { NotificationService } from './services/notification.service';
import { LogService } from './services/log.service';
import { UnblockComponent } from './unblock/unblock.component';
import { UtilitiesService } from './services/utilities.service';
import { AllPipesModule } from './pipes/all.pipe';

import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE, OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { PublicFormComponent } from './public-form/public-form.component';
import { PublicErrorComponent } from './public-error/public-error.component';
import { PublicLoginComponent } from './public-login/public-login.component';

export const MY_CUSTOM_FORMATS = {
    parseInput: 'YYYY-MM-DD HH:mm:00',
    fullPickerInput: 'YYYY-MM-DD HH:mm:00',
    datePickerInput: 'YYYY-MM-DD',
    timePickerInput: 'LT',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    GoogleComponent,
    UnblockComponent,
    PublicFormComponent,
    PublicErrorComponent,
    PublicLoginComponent,
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.chasingDots,
      backdropBackgroundColour: '#f9f7f7',
      primaryColour: '#000',
      secondaryColour: '#000',
      tertiaryColour: '#000'
    }),
    MDBBootstrapModule.forRoot(),
    NgbModule.forRoot(),
    FrontModule,
    HttpClientModule,
    ReactiveFormsModule,
    AdminModule,
    DataTablesModule,
    NgSelectModule,
    CKEditorModule,
    AllPipesModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,

    SortablejsModule.forRoot({ animation: 150}),
  ],
  providers: [
    GlobalService,
    AuthService,
    ClientService,
    LoginService,
    AuthGuard,
    AuthInterceptor,
    FormService,
    LOBService,
    FieldService,
    UserService,
    DefaultTableService,
    TeamService,
    MemberService,
    CommonService,
    PermissionService,
    NotificationService,
    LogService,
    UtilitiesService,
    {provide: APP_CONFIG, useValue: AppConfig},
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: NG_SELECT_DEFAULT_CONFIG, useValue: { notFoundText: 'No records found.'}},
    {provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE]},
    {provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
