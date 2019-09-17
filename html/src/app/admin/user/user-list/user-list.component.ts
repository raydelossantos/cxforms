import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GlobalService } from '../../../services/global.service';
import swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-user-list',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [   // :enter is alias to 'void => *'
          style({opacity:0}),
          animate(500, style({opacity:1})) 
        ]),
        transition(':leave', [   // :leave is alias to '* => void'
          animate(500, style({opacity:0})) 
        ])
      ])
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy, AfterViewInit {

  public loading = false;
  
  datatable: any;
  _users: any = [];
  _user: any;
  _del_rec: any = { 
    _username: '',
    _user_id: '',
    _name: '',
    _row_id: null
  };

  isAddedManually: boolean = false;

  no_record_message: string = 'No records found.';

  userGetAllSubscription: Subscription;
  userPostSubscription: Subscription;
  userGetSubscription: Subscription;
  userPutSubscription: Subscription;
  userDeleteSubscription: Subscription;

  userForm: FormGroup;

  constructor(private userService: UserService,
              private titleService: Title,
              private globalService: GlobalService) { }

  ngOnInit() {

    // set page title
    this.titleService.setTitle('Connext Forms - User Accounts');

    const $this = this;
    this.userService.httpGetAllUser();

    this.loading = true;
    $('#viewlist-table').hide();

    this.userGetAllSubscription = this.userService.userGetAll.subscribe(
      (records: any) => {
        if (typeof(records) !== 'undefined' && records.success && records.count > 0) {
          this._users = records.data;

          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }

          if (records.count > 0) {
            setTimeout(() => {
              $this.datatable = $('#viewlist-table').dataTable({
                lengthMenu: [ [10, 25, 50, 100, -1], [10, 25, 50, 100, 'All'] ],
                dom: "lBpftrip",
                buttons: [
                  {
                    extend: 'excelHtml5',
                    text:   '<i class="fa fa-fw fa-download"></i> Excel',
                    exportOptions: {
                      columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
                    }
                  },
                  {
                    extend: 'pdfHtml5',
                    text:   '<i class="fa fa-fw fa-download"></i> PDF',
                    orientation: 'landscape',
                    pageSize: 'LEGAL',
                    exportOptions: {
                      columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
                    }
                  },
                  {
                    extend: 'csvHtml5',
                    text:   '<i class="fa fa-fw fa-download"></i> CSV',
                    exportOptions: {
                      columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
                    }
                  }
                ]
              });
              this.loading = false;
              $('#viewlist-table').fadeIn();
            }, 500);
          } else {
            this.loading = false;            
          }

        } else if (typeof(records) !== 'undefined' && records.success === false) {
          swal('Error', 'Unable to fetch records. <br><br>' + records.message, 'error');
          this.no_record_message = 'No records found. ' + records.message;
          this.loading = false;
        }
      }
    );

    this.userPostSubscription = this.userService.userPost.subscribe(
      (record: any) => {
        if (typeof(record) !== 'undefined' && record.success) {
          swal('Created new user', 'Successfully created a new user.', 'success');
          $('#btnCloseAdd').click();
          this.initUserForm();
        } else if(typeof(record) !== 'undefined'  && record.success === false) {
          swal('Failed creating user', 'Unable to create user. <br><br>' + record.message, 'error');
        }
      }
    );

    this.userGetSubscription = this.userService.userGet.subscribe(
      (user: any) => {
        if (typeof(user) !== 'undefined' && user.success) {
          // this._user = user.data;

          $('#edit_id').val(user.data.id);
          $('#edit_employee_id').val(user.data.user_info.employee_id === '0' ? 'Not available' : user.data.user_info.employee_id);
          $('#edit_username').val(user.data.username);
          $('#edit_first_name').val(user.data.user_info.first_name);
          $('#edit_last_name').val(user.data.user_info.last_name);
          $('#edit_middle_name').val(user.data.user_info.middle_name);

          $('#edit_email').val(user.data.user_info.email);
          $('#edit_email').prop('disabled', user.data.user_info.user_origin);
          this.isAddedManually = user.data.user_info.user_origin === 0 ? true : false;

          $('#edit_user_origin').val((user.data.user_info.user_origin === 0) ? 'Manual' : 'Synced from API');


          var creator = 'Synced from API';
          if (user.data.creator !== null) {
            creator = user.data.creator.first_name + ' ' + user.data.creator.last_name;
          }
          $('#edit_created_by').val(creator);

          // show modal form for edit
          $("#btnEditRecord").click();
        } else if (typeof(user) !== 'undefined' && user.success === false) {
          swal('Update failed', 'Unable to fetch user record. <br><br>' + user.message, 'error');
        }
      }
    );

    this.userPutSubscription = this.userService.userPut.subscribe(
      (user: any) => {
        if (typeof(user) !== 'undefined' && user.success) {
          swal('Updated user', 'Successfully updated user record.', 'success');
          $("#btnCloseEdit").click();
        } else if (typeof(user) !== 'undefined' && user.success === false) {
          swal('Update failed', 'Unable to update user record.<br><br>' + user.message, 'error');
        } 
      }
    );

    this.userDeleteSubscription = this.userService.userDelete.subscribe(
      (user: any) => {
        if (typeof(user) !== 'undefined' && user.success) {
          swal('Disabled record', 'User record has been disabled successfully.', 'success');
          $("#btnCloseDelete").click();

          // delete row from datatable
          const table = $('#viewlist-table').DataTable();
          table.row($('#' + this._del_rec._row_id)).remove().draw();

        } else if (typeof(user) !== 'undefined' && user.success === false) {
          swal('Disable failed', 'Unable to disable user. <br><br>' + user.message, 'error');
        }
      }
    );

    this.initUserForm();

  }

  initUserForm() {
    const username = '';
    const first_name = '';
    const last_name = '';
    const middle_name = '';
    const email = '';

    this.userForm = new FormGroup({
      'username': new FormControl(username, Validators.required),
      'first_name': new FormControl(first_name, Validators.required),
      'last_name': new FormControl(last_name, Validators.required),
      'middle_name': new FormControl(middle_name, Validators.required),
      'email': new FormControl(email, Validators.required)
    });
  }

  onSaveUser() {
    let formValues = this.userForm.value;
    formValues['created_by'] = this.globalService.authService.auth.user.user.id;

    if (!this.validateUsername(formValues['username'])) {
      swal('Invalid username', 'Username is incorrect. Accepts letters, cannot be blank.', 'error');
      return;
    }

    if (!this.validateName(formValues['first_name'], 'first_name')) {
      swal('Invalid first name', 'First name is incorrect. Accepts only letters, spaces, dash.', 'error');
      return;
    }

    if (!this.validateName(formValues['middle_name'], 'middle_name')) {
      swal('Invalid middle name', 'Middle name is incorrect. Accepts only letters, spaces, dash.', 'error');
      return;
    }

    if (!this.validateName(formValues['last_name'], 'last_name')) {
      swal('Invalid last name', 'Last name is incorrect. Accepts only letters, spaces, dash.', 'error');
      return;
    }

    if (!this.validateEmail(formValues['email'])) {
      swal('Invalid email', 'Email is incorrect. Please provide a valid email. Format should be username@domain.tld', 'error');
      return;
    }

    if (this.userForm.valid) {

      formValues['username'] = formValues['username'].trim();
      formValues['email'] = formValues['email'].trim();
      formValues['last_name'] = formValues['last_name'].trim();
      formValues['first_name'] = formValues['first_name'].trim();
      formValues['middle_name'] = formValues['middle_name'].trim();

      this.userService.httpPostCreateUser(formValues);

    } else {

      swal('Missing fields', 'Please check all required fields.', 'error');

    }
  }

  onRefreshRecords() {
    $('#viewlist-table').hide();
    this.userService.httpGetAllUser();
    this.loading = true;
  }

  onEditRecord(id) {
    // get details of the selected item from API
    this.userService.httpGetUserById(id);
  }

  onUpdateRecord() {
    const id = $('#edit_id').val();
    const fd = {
      'username': $('#edit_username').val().trim(),
      'id': id,
      'first_name': $('#edit_first_name').val().trim(),
      'last_name': $('#edit_last_name').val().trim(),
      'middle_name': $('#edit_middle_name').val().trim()
    }

    if (!this.validateUsername(fd['username'])) {
      swal('Invalid username', 'Username is incorrect. Only letters accepted and cannot be blank.', 'error');
      return;
    }

    if (!this.validateName(fd['first_name'], 'first_name')) {
      swal('Invalid first name', 'First name is incorrect. Only letters accepted with dash & space.', 'error');
      return;
    }

    if (!this.validateName(fd['middle_name'], 'middle_name')) {
      swal('Invalid middle name', 'Middle name is incorrect. Only letters accepted with dash & space.', 'error');
      return;
    }

    if (!this.validateName(fd['last_name'], 'last_name')) {
      swal('Invalid last name', 'Last name is incorrect. Only letters accepted with dash & space.', 'error');
      return;
    }

    if (this.isAddedManually) {

      const email = $('#edit_email').val();

      if (!this.validateEmail(email)) {
        swal('Invalid email', 'Email is incorrect.', 'error');
        return;
      }

      fd['email'] = email.trim();
    }

    fd['first_name'] = fd['first_name'].trim();
    fd['username'] = fd['username'].trim();
    fd['last_name'] = fd['last_name'].trim();
    fd['middle_name'] = fd['middle_name'].trim();
    
    this.userService.httpPutUser(id, fd);
  }

  validateEmail(email): boolean {
    const regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regExp.test(email.trim());
  }

  validateUsername(username): boolean {
    const regExp = /^[A-Za-z]+([A-Za-z]+)*$/;
    return regExp.test(username.trim());
  }

  validateName(name: string, type: string): boolean {
    if (name === '' && type === 'middle_name') {
      return true;
    }

    const regExp = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;    // allow spaces in between names, allow dash
    return regExp.test(name.trim());
  }
  

  onDelRecord(username, id, first_name, last_name, row_id) {
    this._del_rec = {
      _username: username,
      _user_id: id,
      _name: first_name + ' ' + last_name,
      _row_id: row_id
    };
    // show modal form for delete
    $("#btnDeleteRecord").click();
    // console.log(this._del_rec.row_id)
  }

  onDeleteRecord() {
    this.userService.httpDeleteUser(this._del_rec._user_id);
  }

  ngOnDestroy() {
    this.userDeleteSubscription.unsubscribe();
    this.userGetAllSubscription.unsubscribe();
    this.userGetSubscription.unsubscribe();
    this.userPutSubscription.unsubscribe();
    this.userPostSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    
  }

}
