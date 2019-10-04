import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AdminRouteModule } from './admin.routing.module';
import { AdminComponent } from './admin.component';
import { TeamComponent } from './team/team.component';
import { MemberComponent } from './team/member/member.component';
import { ClientComponent } from './client/client.component';
import { SysadminComponent } from './sysadmin/sysadmin.component';
import { UserComponent } from './user/user.component';
import { SyncComponent } from './user/sync/sync.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PrivilegeComponent } from './sysadmin/privilege/privilege.component';
import { BusinessComponent } from './client/business/business.component';
import { SysadminListComponent } from './sysadmin/sysadmin-list/sysadmin-list.component';
import { ClientListComponent } from './client/client-list/client-list.component';
import { TeamListComponent } from './team/team-list/team-list.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { DisabledUsersComponent } from './user/disabled-users/disabled-users.component';
import { AdminAccessTypePipe } from '../pipes/admin.access.type.pipe';
import { ArchivedClientComponent } from './client/archived-client/archived-client.component';
import { DeletedTeamComponent } from './team/deleted-team/deleted-team.component';
import { BlockedUsersComponent } from './user/blocked-users/blocked-users.component';
import { LoadingModule } from 'ngx-loading';
import { NgSelectModule, NG_SELECT_DEFAULT_CONFIG } from '@ng-select/ng-select';
import { ArchivedLobComponent } from './client/archived-lob/archived-lob.component';
import { ArchivedFormsComponent } from './client/archived-forms/archived-forms.component';
import { ManageComponent } from './client/manage/manage.component';
import { LogComponent } from './log/log.component';
import { MailComponent } from './log/mail/mail.component';
import { UserLogComponent } from './log/user-log/user-log.component';
import { AllPipesModule } from '../pipes/all.pipe';
import { ImportComponent } from './user/import/import.component';

@NgModule({
    declarations: [
        AdminComponent,
        SidebarComponent,
        TeamComponent,
        MemberComponent,
        ClientComponent,
        SysadminComponent,
        UserComponent,
        SysadminListComponent,
        SyncComponent,
        AdminDashboardComponent,
        TeamListComponent,
        PrivilegeComponent,
        ClientListComponent,
        BusinessComponent,
        UserListComponent,
        DisabledUsersComponent,
        AdminAccessTypePipe,
        ArchivedClientComponent,
        DeletedTeamComponent,
        BlockedUsersComponent,
        ArchivedLobComponent,
        ArchivedFormsComponent,
        ManageComponent,
        LogComponent,
        MailComponent,
        UserLogComponent,
        ImportComponent
    ],
    schemas: [ NO_ERRORS_SCHEMA ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AdminRouteModule,
        MDBBootstrapModule.forRoot(),
        LoadingModule,
        NgSelectModule,
        AllPipesModule
    ],
    providers: [
        {provide: NG_SELECT_DEFAULT_CONFIG, useValue: { notFoundText: 'Custom not found'}}
    ]
})
export class AdminModule { }
