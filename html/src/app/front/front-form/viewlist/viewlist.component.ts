import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { DefaultTableService } from '../../../services/dafault.table.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldService } from '../../../services/field.service';
import { FormService } from '../../../services/form.service';
import swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { Title } from '@angular/platform-browser';
import { MemberService } from '../../../services/member.service';
import { PermissionService } from '../../../services/permission.service';
import { APP_CONFIG } from '../../../app.config';
import { trigger, transition, style, animate } from '@angular/animations';
import { UtilitiesService } from '../../../services/utilities.service';
import { GlobalService } from '../../../services/global.service';

declare var $: any;

@Component({
  selector: 'app-viewlist',
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
  templateUrl: './viewlist.component.html',
  styleUrls: ['./viewlist.component.scss']
})
export class ViewlistComponent implements OnInit, OnDestroy {

  datatable:                    any;
  public loading                = false;
  public loading2               = false;
  public loading_tags           = false;

  _form_records:                any = [];
  _fields:                      any = [];
  _form_id:                     any;
  _form_title:                  any;
  _records:                     any = [];
  _record:                      any = null;
  _all_fields:                  any;
  _all_fields_default:          any;
  _selected_member:             any;
  form_field_name:              any;
  _form:                        any;
  record_id:                    any;

  dropdown:                     any = [];
  dropdown_display:             any = [];

  visibility_dependency:        any = [];

  _del_rec:                     any = {
                                  _id: ''
                                };

  no_record_message:            string = 'No records found.';

  recordGetAllSubscription:     Subscription;
  recordDeleteSubscription:     Subscription;
  recordGetSubscription:        Subscription;
  recordPutSubscription:        Subscription;
  recordTagGetSubscription:     Subscription;

  fieldGetAllSubscription:      Subscription;
  formGetSubscription:          Subscription;
  memberGetAllSubscription:     Subscription;

  attachmentDeleteSubscription: Subscription;

  recordTagDeleteSubscription:  Subscription;

  members:                      any;

  formPermissionSubscription:   Subscription;
  formPermissions:              any;
  _user_id:                     any;
  _api_endpoint:                any;

  selectedFile:                 File = null;
  record_attachments:           any;

  /** Determine what type of input to be displayed */
  isInputField:                 any = ['String', 'Monetary Amount', 'Timer'];
  isSelectField:                any = ['Dropdown'];
  isTextareaField:              any = ['Multiline'];
  isDateField:                  any = ['Date'];
  isDateTimeField:              any = ['Date and Time'];
  isCheckboxField:              any = ['Checkbox'];
  isEmployeeLookupField:        any = ['Employee Lookup'];
  isLookupField:                any = ['Lookup']
  isTimerField:                 any = ['Timer'];
  isUserTagField:               any = ['User Tag'];
  isDescTimeStampField:         any = ['Description Time Stamp']
  _attachment_id:               any = null;

  record_tags:                  any = [];
  tag_id :                      any;
  _custom_filters:              any = [{
                                        id: 0
                                      }];

  _export_filter_row:           number = 0;
  _user_tag_present:            boolean = false;

  _default_fields: any = [
    { id: '-1', form_field_name: 'id',                       label: 'ID'                       },
    { id: '-1', form_field_name: 'date_created',             label: 'Date Created'             },
    { id: '-1', form_field_name: 'created_by_userid',        label: 'Created By User ID'       },
    { id: '-1', form_field_name: 'created_by_username',      label: 'Created By Username'      },
    { id: '-1', form_field_name: 'last_modified_by_userid',  label: 'Last Modified By User ID' },
    { id: '-1', form_field_name: 'date_last_modified',       label: 'Date Last Modified'       },
    { id: '-1', form_field_name: 'assigned_to_userid',       label: 'Assigned To User ID'      },
    { id: '-1', form_field_name: 'assigned_to_role',         label: 'Assigned To Role'         },
    { id: '-1', form_field_name: 'date_assigned',            label: 'Date Assigned'            },
  ];  

  _filter_operators = [
    { id: 0, value: '=',        label: 'Equal to'                 },
    { id: 1, value: 'like',     label: 'Like'                     },
    { id: 2, value: '<>',       label: 'Not equal to'             },
    { id: 3, value: '<',        label: 'Less than'                },
    { id: 4, value: '>',        label: 'Greater than'             },
    { id: 5, value: '<=',       label: 'Less than or equal to'    },
    { id: 5, value: '>=',       label: 'Greater than or equal to' },
  ];

  constructor(@Inject(APP_CONFIG) private appConfig,
              private globalService:        GlobalService,
              private fieldService:         FieldService,
              private authService:          AuthService,
              private defaultTableService:  DefaultTableService,
              private router:               Router,
              private route:                ActivatedRoute,
              private formService:          FormService,
              private memberService:        MemberService,
              private permissionService:    PermissionService,
              private titleService:         Title,
              private utilitiesService:     UtilitiesService) { }

  ngOnInit() {

    this.loading = true;
    $('#viewlist-table').hide();

    this._api_endpoint = this.appConfig.API_ENDPOINT;

    const $this = this;
    const _url = this.router.url.split("/");
    const _form_id = _url[2];
    this._form_id = _form_id;
    this._user_id = this.authService.auth.user.user.id;
    let _client = this.globalService.getClientCookie();

    if (_form_id !== 'new') {

      this.formService.httpGetFormViewById(this._form_id);
      this.formGetSubscription = this.formService.formGetView.subscribe(
        (form: any) => {
          if (typeof(form) !== 'undefined' && form.success) {
            this._form_title = form.data.form_name;

            this._form = form.data;

            this.titleService.setTitle('Connext Forms - ' + form.data.form_name + ' - View List');

            this.formPermissions = this.formService.formAcl;

            this.formPermissionSubscription = this.formService.formGetPermissions.subscribe(
              (permissions: any) => {
                if (typeof(permissions) !== 'undefined') {
                  this.formPermissions = permissions;
                } else if (typeof(permissions) !== 'undefined') {
                  swal('Error', 'Unable to fetch form permission. <br><br>', 'error');
                }
              }
            );

            // process form contents
            if (form.data.fields.length > 0) {
              /** split string to array */
              form.data.fields.map(field => {
                if (field.field_type == 'Dropdown') {
                  field.selection_options = field.selection_options.split("\n");
                }
              });

              /** if with dependency, split again into array */
              form.data.fields.forEach(field => {
                this.visibility_dependency[field.form_field_name] = null;

                var _selection_options: any = [];

                if (field.field_type == 'Dropdown') {

                  /** set a new property where default is false [no dependency for dropdown] */
                  field.dependency = false;

                  if (field.selection_options.length > 0) {

                    field.selection_options.map(_option => {

                      const regExp = /\[(.*) = (.*)] (.*)/;
                      const matches = _option.split(regExp);

                      if (matches && matches.length > 1) {

                        const parent_dropdown: any = matches[1];
                        const child_dropdown: any = matches[2];
                        const value_dropdown: any = matches[3];

                        /** add to array all dropdown texts */
                        if  (this.dropdown[parent_dropdown] !== void 0) {
                          if (this.dropdown[parent_dropdown][child_dropdown] !== void 0) {
                            this.dropdown[parent_dropdown][child_dropdown].push(value_dropdown);
                          } else {
                            this.dropdown[parent_dropdown][child_dropdown] = [value_dropdown];
                          }
                        } else {
                          this.dropdown[parent_dropdown] = [];
                          this.dropdown_display[parent_dropdown] = [];
                          if (this.dropdown[parent_dropdown][child_dropdown] !== void 0) {
                            this.dropdown[parent_dropdown][child_dropdown].push(value_dropdown);
                          } else {
                            this.dropdown[parent_dropdown][child_dropdown] = [value_dropdown];
                          }
                        }

                        /** set dependency here */
                        field.dependency = parent_dropdown;
                        _selection_options.push([parent_dropdown, child_dropdown, value_dropdown]);
                      }
                    });

                    if  (_selection_options.length > 0) {
                      field.selection_options = _selection_options;
                    }
                  }
                }

                field.visibility_column = "";
                field.visibility_value = "";

                if (field.visibility !== '') {
                  const regExp = /\[(.*) = (.*)]/;
                  const matches = field.visibility.split(regExp);

                  if (matches && matches.length > 1) {
                    field.visibility_column = matches[1];
                    field.visibility_value = (matches[2] === 'false') ? false : (matches[2] === 'true') ? true : matches[2];
                  }
                }

              });

            }

            this._all_fields = form.data.fields.sort(
              function (a, b) {
                return a.sort - b.sort;
              }
            );

            this._fields = [];
            form.data.fields.forEach(
              (field: any) => {
              if (field.show_this_field_on_default_table_view) {
                this._fields.push(field);
              }

              if (field.field_type == 'User Tag') {
                this._user_tag_present = true;
              }
            });

            this._all_fields_default = form.data.fields; // [...this._default_fields, ...form.data.fields];


            // this.fieldService.httpGetAllField({form_id: _form_id}, this._form_id);
            this.defaultTableService.httpGetAllRecords(parseInt(_form_id));

          } else if (typeof(form) !== 'undefined' && form.success == false) {

            swal('Unauthorized access', 'You are trying to access a resource that either doesn\'t exist or you dont have an access privilege. <br /><br /> You were redirected.', 'warning')
            
            if (_client) {
              this.router.navigate(['/home/' + _client.id]);
            } else {
              this.router.navigate(['/home']);
            }

          }
        }
      );

      this.recordGetAllSubscription = this.defaultTableService.recordGetAll.subscribe(
        (records: any) => {
          if (typeof(records) !== 'undefined' && records.success) {
            this._records = records.data;
            $('#viewlist-table').hide();

            $('#btnCloseFilterRecord').click();

            if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
              $("#viewlist-table").dataTable().fnDestroy();
            }

            if (records.data.length > 0) {
              setTimeout(() => {
                $this.datatable = $('#viewlist-table').dataTable({
                  dom: "lpftrip",
                  order: [[ 0, "desc" ]]
                });
                this.loading = false;
                $('#viewlist-table').fadeIn();
              }, 500);
            } else {
              this.loading = false;
              $('#viewlist-table').hide();
            }
          } else if (typeof(records) !== 'undefined' && records.success === false) {
            swal('Connection error', 'Unable to fecth records. <br><br>' + records.message, 'error');
            this.no_record_message = 'No records found. ' + records.message;
            this.loading = false;
            $('#viewlist-table').hide();

          }
        }
      );

      this.recordGetSubscription = this.defaultTableService.recordGet.subscribe(
        (record: any) => {
          if (typeof(record) !== 'undefined' && record.success) {
            this._record = record.data;
            $('#btnEditRecord').click();

            this.loading2 = true;
            setTimeout(() => {

              this._all_fields.forEach(field => {
                if (field.field_type === 'Employee Lookup' || field.field_type === 'User Tag') {
                  $('#' + field.form_field_name).val(record.data[field.form_field_name]);
                  $('#selected_' + field.form_field_name).text(record.data[field.form_field_name]);
                } else if (field.field_type === 'Dropdown') {
                  var event: any = [];
                  event.target = [];
                  event.target.value = record.data[field.form_field_name];
                  $.when(this.onChangeDropdown(field.form_field_name, event)).then(
                    function () {
                      $('#' + field.form_field_name).val(record.data[field.form_field_name]);
                    }
                  );
                } else if (field.field_type === 'Checkbox') {
                  $('#' + field.form_field_name).prop('checked', record.data[field.form_field_name]);
                } else {
                  $('#' + field.form_field_name).val(record.data[field.form_field_name]);
                }
              });

              this.record_attachments = record.data.attachment;

              this.loading2 = false;
            }, 1000);

          } else if (typeof(record) !== 'undefined' && record.success === false) {
            this.loading2 = false;
            swal('Error editing', 'Unable to update record. <br><br>' + record.message, 'error');
          }
        }
      );

      this.fieldGetAllSubscription = this.fieldService.fieldGetAll.subscribe(
        (fields: any) => {
          if (typeof(fields) !== 'undefined' && fields.success) {

            fields.data.map(field => {
              if (field.field_type == 'Dropdown') {
                field.dependency = false;
                field.selection_options = field.selection_options.split("\n");
              }
            });

            this._all_fields = fields.data.sort(
              function (a, b) {
                return a.sort - b.sort;
              }
            );

            this._fields = [];
            fields.data.forEach(
              (field: any) => {
              if (field.show_this_field_on_default_table_view) {
                this._fields.push(field);
              }
            });

          } else if (typeof(fields) !== 'undefined' && fields.success === false) {
            // fields not found or connection error
          }
        }
      );

      this.recordDeleteSubscription = this.defaultTableService.recordDelete.subscribe(
        (record: any) => {
          if (typeof(record) !== 'undefined' && record.success) {
           swal('Deleted', 'Record has been successfully deleted.', 'success');

           // delete row from datatable
            const table = $('#viewlist-table').DataTable();
            table.row($('#' + this._del_rec._id)).remove().draw();

          } else if (typeof(record) !== 'undefined' && record.success === false) {
            swal('Failed to delete', 'Unable to delete the record. <br><br>' + record.message, 'error');
          }
        }
      );

      this.recordPutSubscription = this.defaultTableService.recordPut.subscribe(
        (record: any) => {
          if (typeof (record) !== 'undefined' && record.success) {
            swal('Updated', 'Record has been successfully updated.', 'success');

            this._fields.forEach(
              (fld: any) => {
                if (fld.field_type == 'Checkbox') {
                  $('#' + this.record_id + '_' + fld.form_field_name).text($('#' + fld.form_field_name).is(':checked') ? 'Yes' : 'No');
                } else if (fld.field_type == 'User Tag') {
                  const explodeUserTag = $('#' + fld.form_field_name).val().split('|');

                  $('#' + this.record_id + '_' + fld.form_field_name).text(explodeUserTag[0]);
                } else {
                  $('#' + this.record_id + '_' + fld.form_field_name).text($('#' + fld.form_field_name).val());
                }
              }
            );

            this.loading2 = false;
            $('#btnCloseEdit').click();
          } else if (typeof (record) !== 'undefined' && record.success === false) {
            swal('Failed to update', 'Unable to update the record. <br><br>' + record.message, 'error');
            this.loading2 = false;
          }
        }
      );

      this.memberGetAllSubscription = this.memberService.memberGetAll.subscribe(
        (members: any) => {
          if (typeof(members)!== 'undefined' && members.success) {
            this.members = members.data;
            members.data.map(
              (member: any) => {
                member.full_name = member.user_info.last_name + ', ' + member.user_info.first_name + ' ' + member.user_info.middle_name  + ' (' + member.user_info.username + ')';
                return member;
              }
            )
            this.loading = false;
            this.loading2 = false;
          } else if (typeof(members)!== 'undefined' && members.success === false) {
            this.loading = false;
            this.loading2 = false;
          }
        }
      );

      this.attachmentDeleteSubscription = this.defaultTableService.attachmentDelete.subscribe(
        (attachment: any) => {
          if (typeof(attachment) !== 'undefined' && attachment.success) {

            // swal('Deleted', 'Attachment has been successfully deleted.', 'success');
            $('#attachment_' + this._attachment_id).fadeOut();
            this._attachment_id = null;
            this.loading = false;

          } else if (typeof(attachment) !== 'undefined' && attachment.success === false) {
            swal('Failed to delete', 'Unable to  delete attachment. <br><br>' + attachment.message, 'error');
            this.loading = false;
          }
        }
      );

      this.recordTagGetSubscription = this.defaultTableService.recordTagGetAll.subscribe(
        (tags: any) => {
          if (typeof(tags)!== 'undefined' && tags.success) {
            this.record_tags = tags.data;
            $('#btnRecordTag').click();
            this.loading_tags = false;
          } else if (typeof(tags)!== 'undefined' && tags.success === false) {
            swal('Failed to fetch', 'Unable to fetch tagged users for this record.<br><br>' + tags.message, 'error');
            this.loading_tags = false;
          }
        }
      );

      this.recordTagDeleteSubscription = this.defaultTableService.recordTagDelete.subscribe(
        (tag: any) => {
          if (typeof(tag)!== 'undefined' && tag.success) {
            $('#tr_tag_' + this.tag_id).fadeOut();
            this.loading_tags = false;
          } else if (typeof(tag)!== 'undefined' && tag.success === false) {
            swal('Failed to delete', 'Unable to delete tagged user for this record.<br><br>' + tag.message, 'error');
            this.loading_tags = false;
          }
        }
      );

    } else {
      this.router.navigate(['/home']);
    }
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    if ($.fn.DataTable.isDataTable(this.datatable)) {
      $("#viewlist-table").dataTable().fnDestroy();
    }

    // Do not forget to unsubscribe the event
    if (this.recordGetAllSubscription)     this.recordGetAllSubscription.unsubscribe();
    if (this.recordDeleteSubscription)     this.recordDeleteSubscription.unsubscribe();
    if (this.recordGetSubscription)        this.recordGetSubscription.unsubscribe();
    if (this.recordPutSubscription)        this.recordPutSubscription.unsubscribe();
    if (this.fieldGetAllSubscription)      this.fieldGetAllSubscription.unsubscribe();
    if (this.formGetSubscription)          this.formGetSubscription.unsubscribe();
    if (this.memberGetAllSubscription)     this.memberGetAllSubscription.unsubscribe();
    if (this.attachmentDeleteSubscription) this.attachmentDeleteSubscription.unsubscribe();
    if (this.formPermissionSubscription)   this.formPermissionSubscription.unsubscribe();
  }

  onDelRecord(id: any) {
    const that = this;
    this._del_rec._id = id;

    swal({
      title: 'Are you sure?',
      text: "It will permanently be deleted!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(function(result) {
      if (result.value) {
        that.defaultTableService.httpDeleteRecord(parseInt(that._form_id), that._del_rec._id);
      }
    });

  }

  onDeleteRecord(id: any) {
    this.defaultTableService.httpDeleteRecord(parseInt(this._form_id), this._del_rec._id);
  }

  onDeleteAttachment(rec_id: any, a_id: any) {

    const that = this;

    swal({
      title: 'Are you sure?',
      text: "It will permanently be deleted!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(function(result) {
      if (result.value) {
        that._attachment_id = a_id;
        that.defaultTableService.httpDeleteAttachment(parseInt(that._form_id), rec_id, a_id);
      }
    });

  }

  onRefreshList() {
    $('#viewlist-table').hide();

    this.defaultTableService.httpGetAllRecords(parseInt(this._form_id));
    this.loading = true;
  }

  onDeleteTag(record_id: any, tag_id: any) {

    const that = this;

    swal({
      title: 'Are you sure?',
      text: "It will permanently be deleted! User will no longer see this in notification panel and will not be able to open this record for edit.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(function(result) {
      if (result.value) {
        that.loading_tags = true;
        that.tag_id = tag_id;
        that.defaultTableService.httpDeleteTag(that._form_id, record_id, tag_id);
      }
    });

    
  }

  onEditRecord(id: any) {
    this._record = null;
    this.selectedFile = null;

    // reset the visibility_dependcy contents (models)
    this.visibility_dependency.forEach(
      function(v) {
        return v = null;
      }
    );

    this.defaultTableService.httpGetRecord(this._form_id, id);
    this.record_id = id;
  }

  onChangeDropdown(field_name, event) {
    if (this.dropdown[field_name] !== void 0) {
      if (this.dropdown[field_name][event.target.value] !== void 0){
        this.dropdown_display[field_name] = this.dropdown[field_name][event.target.value];
      } else {
        this.dropdown_display[field_name] = [];
      }
    }
  }

  onUpdateRecord(record_id: any) {
    const form_id = parseInt(this._form_id);
    var formValues = new Object();
    this.loading2 = true;

    // get inputs from Form, include in POST
    this._all_fields.forEach(field => {

      if ($('#' + field.form_field_name).prop('type') == 'checkbox') {
        formValues[field.form_field_name] = $('#' + field.form_field_name).is(':checked') ? 1 : 0;
      } else if ( this.isDateTimeField.indexOf(field.field_type) !== -1 ){
        formValues[field.form_field_name] = $('#' + field.form_field_name).val() === null ? '' : this.utilitiesService.convertDateTimeToQAGoldFormatIfValid( $('#' + field.form_field_name).val() );
      } else {
        formValues[field.form_field_name] = $('#' + field.form_field_name).val();
      }

    });

    /** run form validation first */
    const valid = this.validateForm(formValues);

    if (valid.success) {

      var postValues = new FormData();

      // get inputs from Form, include in POST
      this._all_fields.forEach(field => {
        if ($('#' + field.form_field_name).prop('type') == 'checkbox') {
          const val: any =  $('#' + field.form_field_name).is(':checked') ? 1 : 0;
          postValues.append(field.form_field_name, val);
        } else if ( this.isDateTimeField.indexOf(field.field_type) !== -1 ){
          const val: any =  $('#' + field.form_field_name).val() === null ? '' : this.utilitiesService.convertDateTimeToQAGoldFormatIfValid( $('#' + field.form_field_name).val() );
          postValues.append(field.form_field_name, val);
        } else {
          const val: any =  $('#' + field.form_field_name).val() === null ? '' : $('#' + field.form_field_name).val();
          postValues.append(field.form_field_name, val)
        }
      });

      if (this.selectedFile) {
        postValues.append('file', this.selectedFile, this.selectedFile.name);
      }

      postValues.append('last_modified_by_userid', this.authService.auth.user.user.id);

      this.defaultTableService.httpPutRecord(form_id, record_id, postValues);

      this.selectedFile = null;

    } else {

      swal('Invalid', valid.message, 'error' );
      this.loading2 = false;

    }

  }

  onFileSelected(event) {

    if (event.target.files.length == 0) {
      return;
    }

    if (event.target.files[0]) {
      this.selectedFile = event.target.files[0];
    } else {
      swal('Invalid file type', 'You have selected a non-supported file type. Please choose JPEG, GIF or PNG.', 'error');
      event.target.value = null;
    }

  }

  onLoadEmployeeLookup(team_id: any, form_field_name: any) {
    // show modal form
    $('#btnEmployeeLookup').click();

    // show loading spinner
    this.loading2 = true;

    // get all dropdown select list from team members
    this.memberService.httpGetAllMembers({team_id: team_id});

    // form_field_name - assign the calling field to input
    this.form_field_name = form_field_name;

  }

  onLoadUserTag(team_id: any, form_field_name: any) {
    // show modal form
    $('#btnUserTag').click();

    // show loading spinner
    this.loading2 = true;

    // get all dropdown select list from team members
    this.memberService.httpGetAllMembers({team_id: team_id});

    // form_field_name - assign the calling field to input
    this.form_field_name = form_field_name;

  }

  onUserTagSelect() {

    if (!this._selected_member) {
      swal('No employee selected','Please select user before proceeding or cancel.', 'error')
      return;
    }

    const name = this._selected_member.user_info.last_name + ', ' + this._selected_member.user_info.first_name + ' ' + this._selected_member.user_info.middle_name;
    const name_email = this._selected_member.user_info.last_name + ', ' + this._selected_member.user_info.first_name + ' ' + this._selected_member.user_info.middle_name + '|' + this._selected_member.user_info.email;

    $('#' + this.form_field_name).val(name_email);

    $('#selected_'+ this.form_field_name).text(name);

    this.visibility_dependency[this.form_field_name] = name;

    this._selected_member = null;

  }

  onUserTagClose() {
    this._selected_member= null;
  }

  onRecordTagListOpen(record_id: any) {
    this.loading_tags = true;
    this.record_id = record_id;
    this.defaultTableService.httpGetTagList(this._form_id, record_id);
  }

  onLookupSelect() {

    if (!this._selected_member) {
      swal('No employee selected','Please select employee before proceeding or cancel.', 'error')
      return;
    }

    const name = this._selected_member.user_info.last_name + ', ' + this._selected_member.user_info.first_name + ' ' + this._selected_member.user_info.middle_name;

    $('#' + this.form_field_name).val(name);

    $('#selected_'+ this.form_field_name).text(name);

    this.visibility_dependency[this.form_field_name] = name;

    this._selected_member = null;

  }

  onLookUpClose() {
    this._selected_member= null;
  }

  validateForm(form_data: any) {
    const _msg_required_title: string = '<span class="fa fa-fw fa-exclamation"></span>Required: ';
    const _msg_size_title: string = '<span class="fa fa-fw fa-exclamation"></span>Invalid text size: ';
    var _msg_required: string = '';
    var _msg_size: string = '';
    var _msg: string = '';
    var result: any = {
      message: '',
      success: true
    };

    for (var key in form_data) {
      const _fld = this._all_fields.find(field => field.form_field_name === key);

      if (_fld.required && (form_data[key] == '' || !form_data[key])) {
        _msg_required += _fld.label + ', ';
      }

      if (_fld.size != 0 && (form_data[key].length > _fld.size)) {
        _msg_size += _fld.label + ' [allowed size: ' + _fld.size + '], '
      }
    }

    if (_msg_required !== '') {
      result.success = false;
      _msg += _msg_required_title + _msg_required;
    }

    if (_msg_size !== '') {
      result.success = false;
      _msg += '<br /><br />' + _msg_size_title + _msg_size;
    }
    result.message = _msg;
    return result;
  }

  onFilterRecords() {
    var custom_filter: any = [];

    if (this._custom_filters.length > 0) {
      $("#custom_filter li").each(
        function () {
          var column = $(this).find('.filter_column').val();
          if (column !== '' && column !== null) {
            custom_filter.push({
              column: $(this).find('.filter_column').val(),
              option: $(this).find('.filter_operator').val(),
              text:   $(this).find('.filter_text').val()
            });
          }
        }
      );

      if (custom_filter.length > 0) {
        const data = {
          filter: custom_filter
        };
  
        this.loading = true;
        this.defaultTableService.httpPostSearch(this._form_id, data); 
        // return;
      } else {
        swal('Invalid filter', 'Kindly select and set filters properly before proceeding.', 'error');
      }

    }
  }

  onAddFilter() {
    this._export_filter_row++;
    this._custom_filters.push({
      id: this._export_filter_row
    });
  }

  onRemoveFilter(filter_id) {
    var index = -1;
    var filters = eval( this._custom_filters );
    for( var i = 0; i < filters.length; i++ ) {
      if( filters[i].id === filter_id) {
        index = i;
        break;
      }
    }
    if( index === -1 ) {
      swal('Error', 'Something went wrong.', 'error');
    }
    this._custom_filters.splice( index, 1 );
  }

}
