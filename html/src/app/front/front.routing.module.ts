import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FrontComponent } from './front.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FrontFormComponent } from './front-form/front-form.component';
import { AddformComponent } from './front-form/addform/addform.component';
import { AddfieldComponent } from './front-form/addform/addfield/addfield.component';
import { ViewlistComponent } from './front-form/viewlist/viewlist.component';
import { AddnewComponent } from './front-form/addnew/addnew.component';
import { PermissionComponent } from './front-form/permission/permission.component';
import { ExportComponent } from './front-form/export/export.component';
import { ViewformComponent } from './front-form/viewform/viewform.component';
import { TemplateComponent } from './front-form/template/template.component';
import { DeleteComponent } from './front-form/delete/delete.component';
import { ForminfoComponent } from './front-form/addform/forminfo/forminfo.component';
import { AuthGuard } from '../services/auth-guard.service';
import { FormDashboardComponent } from './front-form/form-dashboard/form-dashboard.component';
import { AddformDashboardComponent } from './front-form/addform/addform-dashboard/addform-dashboard.component';
import { ArrangeComponent } from './front-form/addform/arrange/arrange.component';
import { ArchiveComponent } from './front-form/addform/archive/archive.component';
import { ViewRecordComponent } from './front-form/view-record/view-record.component';
import { ClientsComponent } from './dashboard/clients/clients.component';
import { FormsComponent } from './dashboard/forms/forms.component';

const frontRoutes: Routes = [
    { path: '', component: FrontComponent, canActivate: [AuthGuard], children: [
        { path: 'home', component: DashboardComponent, children: [
            { path: '', component: ClientsComponent },
            { path: ':client_id', component: FormsComponent },
        ] },
        { path: 'form', component: FrontFormComponent, children: [
            { path: ':id', component: FormDashboardComponent, children: [
                { path: 'settings', component: AddformComponent, children: [
                    { path: 'details', component: ForminfoComponent },
                    { path: 'arrange', component: ArrangeComponent },
                    { path: 'archive', component: ArchiveComponent},
                    { path: 'field/:id', component: AddfieldComponent }
                ] },
                { path: 'settings/:id', component: AddformComponent, children: [
                    { path: '', component: AddformDashboardComponent },
                    { path: 'details', component: ForminfoComponent },
                    { path: 'field/:id', component: AddfieldComponent }
                ] },
                { path: 'view_list', component: ViewlistComponent },
                { path: 'view/:recid/:hash', component: ViewRecordComponent },
                { path: 'add_new', component: AddnewComponent },
                { path: 'permission', component: PermissionComponent },
                { path: 'export', component: ExportComponent },
                { path: 'template', component: TemplateComponent },
                { path: 'upload_delete', component: DeleteComponent },
                { path: '', component: ViewformComponent },
                // { path: 'view/:id/:hash', component: ViewRecordComponent }
            ] },
        ] }
    ] }
];

@NgModule({
    imports: [RouterModule.forChild(frontRoutes)],
    exports: [RouterModule]
})
export class FrontRouteModule {}
