import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FrontComponent } from './front.component';
import { FrontRouteModule } from './front.routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FrontFormComponent } from './front-form/front-form.component';
import { AddformComponent } from './front-form/addform/addform.component';
import { ExportComponent } from './front-form/export/export.component';
import { PermissionComponent } from './front-form/permission/permission.component';
import { AddfieldComponent } from './front-form/addform/addfield/addfield.component';
import { AddnewComponent } from './front-form/addnew/addnew.component';
import { ViewlistComponent } from './front-form/viewlist/viewlist.component';
import { ViewformComponent } from './front-form/viewform/viewform.component';
import { TemplateComponent } from './front-form/template/template.component';
import { DeleteComponent } from './front-form/delete/delete.component';
import { ForminfoComponent } from './front-form/addform/forminfo/forminfo.component';
import { FormDashboardComponent } from './front-form/form-dashboard/form-dashboard.component';
import { AddformDashboardComponent } from './front-form/addform/addform-dashboard/addform-dashboard.component';
import { ArchiveComponent } from './front-form/addform/archive/archive.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoadingModule } from 'ngx-loading';
import { NgSelectModule, NG_SELECT_DEFAULT_CONFIG } from '@ng-select/ng-select';
import { CKEditorModule } from 'ngx-ckeditor';
import { ArrangeComponent } from './front-form/addform/arrange/arrange.component';
import { SortablejsModule } from 'angular-sortablejs';
import { ViewRecordComponent } from './front-form/view-record/view-record.component';
import { FormsComponent } from './dashboard/forms/forms.component';
import { ClientsComponent } from './dashboard/clients/clients.component';
import { AllPipesModule } from '../pipes/all.pipe';

@NgModule({
    declarations: [
        FrontComponent,
        DashboardComponent,
        SidebarComponent,
        FrontFormComponent,
        AddformComponent,
        ExportComponent,
        PermissionComponent,
        AddfieldComponent,
        AddnewComponent,
        ViewlistComponent,
        ViewformComponent,
        TemplateComponent,
        DeleteComponent,
        ForminfoComponent,
        FormDashboardComponent,
        AddformDashboardComponent,
        ArrangeComponent,
        ViewRecordComponent,
        FormsComponent,
        ClientsComponent,
        ArchiveComponent,
    ],
    schemas: [ NO_ERRORS_SCHEMA ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FrontRouteModule,
        BrowserModule,
        MDBBootstrapModule.forRoot(),
        NgbModule,
        LoadingModule,
        NgSelectModule,
        CKEditorModule,
        SortablejsModule,
        AllPipesModule

    ],
    providers: [
        {provide: NG_SELECT_DEFAULT_CONFIG, useValue: { notFoundText: 'Custom not found'}}
    ]
})
export class FrontModule { }
