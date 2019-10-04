import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  _menu = [
    {
      id: 0,
      section: 'Admin Panel',
      icon: 'fa-cogs',
      subsections: [
        { name: 'Dashboard', link: '/admin', icon: 'fa-tachometer' }
      ]
    },
    {
      id: 1,
      section: 'Users',
      icon: 'fa-users',
      subsections: [
        { name: 'User Accounts', link: 'user/list', icon: 'fa-user' },
        { name: 'Sync Employees from API', link: 'user/sync', icon: 'fa-refresh' },
        { name: 'Import Users', link: 'user/import', icon: 'fa-upload' },
        { name: 'Blocked/Invalid Logins', link: 'user/blocked', icon: 'fa-lock' },
        { name: 'Disabled Accounts', link: 'user/disabled', icon: 'fa-ban' },
        { name: 'System Administrators', link: 'sysadmin/list', icon: 'fa-user-md' }
      ]
    },{
      id: 2,
      section: 'Clients',
      icon: 'fa-vcard',
      subsections: [
        { name: 'Manage Clients', link: 'client/list', icon: 'fa-folder-open' },
        { name: 'Lines of Business', link: 'client/business', icon: 'fa-building' },
        { name: 'Archived Clients', link: 'client/archived', icon: 'fa-archive' },
        { name: 'Archived Lines of Business', link: 'client/archivedlob', icon: 'fa-archive' },
        { name: 'Archived Forms', link: 'client/archivedform', icon: 'fa-archive' }
      ]
    },{
      id: 3,
      section: 'Teams',
      icon: 'fa-sitemap',
      subsections: [
        { name: 'Manage Teams', link: 'team/list', icon: 'fa-cubes' },
        { name: 'Manage Team Members', link: 'team/member', icon: 'fa-male' },
        { name: 'Archived Teams', link: 'team/archived', icon: 'fa-archive' }
      ]
    },{
      id: 4,
      section: 'Logs',
      icon: 'fa-history',
      subsections: [
        { name: 'Mail Logs', link: 'log/mail', icon: 'fa-envelope' },
        { name: 'User Logs', link: 'log/user', icon: 'fa-user' }
      ]
    }
  ]

  constructor() { }

  ngOnInit() {
  }

}
