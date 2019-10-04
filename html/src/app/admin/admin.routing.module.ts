import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AdminComponent } from './admin.component';
import { AuthGuard } from '../services/auth-guard.service';
import { UserComponent } from './user/user.component';
import { SysadminComponent } from './sysadmin/sysadmin.component';
import { TeamComponent } from './team/team.component';
import { MemberComponent } from './team/member/member.component';
import { ClientComponent } from './client/client.component';
import { SyncComponent } from './user/sync/sync.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PrivilegeComponent } from './sysadmin/privilege/privilege.component';
import { BusinessComponent } from './client/business/business.component';
import { SysadminListComponent } from './sysadmin/sysadmin-list/sysadmin-list.component';
import { TeamListComponent } from './team/team-list/team-list.component';
import { ClientListComponent } from './client/client-list/client-list.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { DisabledUsersComponent } from './user/disabled-users/disabled-users.component';
import { ArchivedClientComponent } from './client/archived-client/archived-client.component';
import { DeletedTeamComponent } from './team/deleted-team/deleted-team.component';
import { BlockedUsersComponent } from './user/blocked-users/blocked-users.component';
import { ArchivedLobComponent } from './client/archived-lob/archived-lob.component';
import { ArchivedFormsComponent } from './client/archived-forms/archived-forms.component';
import { ManageComponent } from './client/manage/manage.component';
import { LogComponent } from './log/log.component';
import { UserLogComponent } from './log/user-log/user-log.component';
import { MailComponent } from './log/mail/mail.component';
import { ImportComponent } from './user/import/import.component';

const adminRoutes: Routes = [
    { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], children:
        [
            { path: '', component: AdminDashboardComponent },
            { path: 'user', component: UserComponent, children:
                [
                    { path: 'list', component: UserListComponent },
                    { path: 'sync', component: SyncComponent},
                    { path: 'import', component: ImportComponent },
                    { path: 'disabled', component: DisabledUsersComponent},
                    { path: 'blocked', component: BlockedUsersComponent},
                ]
            },
            { path: 'sysadmin', component: SysadminComponent, children:
                [
                    { path: 'list', component: SysadminListComponent},
                    { path: 'privilege', component: PrivilegeComponent},
                ]
            },
            { path: 'team', component: TeamComponent, children:
                [
                    { path: 'list', component: TeamListComponent },
                    { path: 'member', component: MemberComponent },
                    { path: 'archived', component: DeletedTeamComponent },
                ]
            },
            { path: 'client', component: ClientComponent, children: [
                { path: 'list', component: ClientListComponent },
                { path: 'list/:id', component: ManageComponent },
                { path: 'business', component: BusinessComponent },
                { path: 'archived', component: ArchivedClientComponent },
                { path: 'archivedlob', component: ArchivedLobComponent },
                { path: 'archivedform', component: ArchivedFormsComponent }

            ] },
            { path: 'log', component: LogComponent, children: [
                { path: '', component: MailComponent },
                { path: 'mail', component: MailComponent },
                { path: 'user', component: UserLogComponent }
            ] }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(adminRoutes)],
    exports: [RouterModule]
})
export class AdminRouteModule {}
