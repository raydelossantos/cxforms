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
        { name: 'Dashboard', link: '/admin', icon: 'fa-tachometer', color: 'green' },
      ]
    },
    {
      id: 1,
      section: 'Users',
      icon: 'fa-users',
      subsections: [
        { name: 'User Accounts', link: 'user/list', icon: 'fa-user', color: 'green' },
        { name: 'Sync Employees from API', link: 'user/sync', icon: 'fa-refresh', color: 'red' },
        { name: 'Import Users', link: 'user/import', icon: 'fa-upload', color: 'blue' },
        { name: 'Blocked/Invalid Logins', link: 'user/blocked', icon: 'fa-lock', color: 'orange' },
        { name: 'Disabled Accounts', link: 'user/disabled', icon: 'fa-ban', color: 'gray' },
        { name: 'System Administrators', link: 'sysadmin/list', icon: 'fa-user-md', color: 'red' }
      ]
    },{
      id: 2,
      section: 'Clients',
      icon: 'fa-vcard',
      subsections: [
        { name: 'Manage Clients', link: 'client/list', icon: 'fa-folder-open', color: 'blue' },
        { name: 'Lines of Business', link: 'client/business', icon: 'fa-building', color: 'orange' },
        { name: 'Archived Clients', link: 'client/archived', icon: 'fa-archive', color: 'gray' },
        { name: 'Archived Lines of Business', link: 'client/archivedlob', icon: 'fa-archive', color: 'gray' },
        { name: 'Archived Forms', link: 'client/archivedform', icon: 'fa-archive', color: 'gray' },
      ]
    },{
      id: 3,
      section: 'Teams',
      icon: 'fa-sitemap',
      subsections: [
        { name: 'Manage Teams', link: 'team/list', icon: 'fa-cubes', color: 'green' },
        { name: 'Manage Team Members', link: 'team/member', icon: 'fa-male', color: 'purple' },
        { name: 'Archived Teams', link: 'team/archived', icon: 'fa-archive', color: 'gray' },
      ]
    },{
      id: 4,
      section: 'Logs',
      icon: 'fa-history',
      subsections: [
        { name: 'Mail Logs', link: 'log/mail', icon: 'fa-envelope', color: 'blue' },
        { name: 'User Logs', link: 'log/user', icon: 'fa-user', color: 'green' },
      ]
    }
  ]

  constructor() { }

  ngOnInit() {
  }

}
