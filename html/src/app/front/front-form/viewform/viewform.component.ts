import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Field } from '../../../models/field.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { FormService } from '../../../services/form.service';
import * as $ from 'jquery';
import { DefaultTableService } from '../../../services/dafault.table.service';
import swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { MemberService } from '../../../services/member.service';
import { Title } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { PermissionService } from '../../../services/permission.service';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'app-viewform',
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ],
  templateUrl: './viewform.component.html',
  styleUrls: ['./viewform.component.scss']
})
export class ViewformComponent implements OnInit, OnDestroy, AfterViewInit {

  public loading: boolean = false;
  public loading2: boolean = false;
  public loading3: boolean = false;

  fields: Field[];
  noFields: boolean = true;

  dropdown: any = [];
  dropdown_display: any = [];

  visibility_dependency: any = [];

  members: any = [];

  user: any = {
    username: '',
    user_id: '',
    full_name: '',
    email: ''
  }

  /** Determine what type of input to be displayed */
  isInputField: any = ['String', 'Monetary Amount', 'Timer'];
  isSelectField: any = ['Dropdown'];
  isTextareaField: any = ['Multiline'];
  isDateField: any = ['Date'];
  isDateTimeField: any = ['Date and Time'];
  isCheckboxField: any = ['Checkbox'];
  isEmployeeLookupField: any = ['Employee Lookup'];
  isLookupField: any = ['Lookup']
  isTimerField: any = ['Timer'];
  isUserTagField: any = ['User Tag'];
  isDescTimeStampField: any = ['Description Time Stamp'];

  form_title: any = '';
  form_id: any;
  form: any = null;
  form_field_name: any;

  formGetSubscription: Subscription;
  recordPostSubscription: Subscription;
  memberGetAllSubscription: Subscription;

  formPermissionSubscription: Subscription;
  formPermissions: any;

  _selected_member: any;
  url: string;

  selectedFile: File = null;

  constructor(private authService: AuthService,
    private memberService: MemberService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private formService: FormService,
    private permissionService: PermissionService,
    private defaultTableService: DefaultTableService,
    private utilitiesService: UtilitiesService) { }

  ngOnInit() {

    this.user = {
      username: this.authService.auth.user.user.username,
      user_id: this.authService.auth.user.user.id,
      full_name: this.authService.auth.user.user_info.first_name + ' ' + this.authService.auth.user.user_info.last_name,
      email: this.authService.auth.user.user_info.email
    };

    this.route.params.subscribe(
      (params: Params) => {

        this.url = this.router.url;
        this.visibility_dependency = [];
        this.dropdown_display = [];
        this.dropdown = [];

        this.form_id = params['id'];
        if (Number(params['id'])) {
          this.loading = true;
          this.formService.httpGetFormById(this.form_id);
        } else {
          this.router.navigate(['/home']);
        }
      }
    );

    this.memberGetAllSubscription = this.memberService.memberGetAll.subscribe(
      (members: any) => {
        if (typeof (members) !== 'undefined' && members.success) {
          this.members = members.data;

          members.data.map(
            (member: any) => {
              member.full_name = member.user_info.last_name + ', ' + member.user_info.first_name + ' ' + member.user_info.middle_name + ' (' + member.user_info.username + ')';
              return member;
            }
          )

          this.loading = false;
          this.loading2 = false;

        } else if (typeof (members) !== 'undefined' && members.success === false) {
          this.loading = false;
          this.loading2 = false;
        }
      }
    );

    this.formGetSubscription = this.formService.formGet.subscribe(
      (form: any) => {
        this.dropdown_display = [];
        this.dropdown = [];

        if (typeof (form) !== 'undefined' && form.success) {

          this.form = form.data;
          this.form_title = form.data['form_name'];

          // set page title
          this.titleService.setTitle('Connext Forms - ' + form.data.form_name);

          this.formPermissions = this.formService.formAcl;

          this.formPermissionSubscription = this.formService.formGetPermissions.subscribe(
            (permissions: any) => {
              if (typeof (permissions) !== 'undefined') {
                this.formPermissions = permissions;
              } else if (typeof (permissions) !== 'undefined') {
                swal('Error', 'Unable to fetch form permission. <br><br>', 'error');
              }
            }
          );

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

              /** populate dynamic dropdowns */
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
                      if (this.dropdown[parent_dropdown] !== void 0) {
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

                  if (_selection_options.length > 0) {
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

            this.fields = form.data.fields.sort(
              function (a, b) {
                return a.sort - b.sort;
              }
            );

            this.noFields = false;

          } else {
            this.fields = [];
            this.noFields = true;
          }

          this.loading = false;

        } else if (typeof (form) !== 'undefined' && form.success === false) {
          this.loading = false;
          swal('Unauthorized access', 'You are trying to access a resource that either doesn\'t exist or you dont have an access privilege. <br /><br /> You were redirected.', 'warning')
          this.router.navigate(['/home']);
        }
      }
    );

    this.recordPostSubscription = this.defaultTableService.recordPost.subscribe(
      (record: any) => {
        if (typeof (record) !== 'undefined' && record.success) {
          swal('Record saved', 'Successfully created a new record for ' + this.form.form_name + '!', 'success');
          if (this.form.stay_after_submit) {
            $('#btnClearForm').click();
          }
          this.loading = false;
        } else if (typeof (record) !== 'undefined' && record.success === false) {
          swal('Record not saved', 'Unable to save record. <br><br>' + record.message, 'error');
          this.loading = false;
        }
      }
    );

  }

  onSaveRecord() {
    this.loading = true;
    const form_id = parseInt(this.form_id);
    var formValues = new Object();

    this.fields.forEach(field => {
      if ($('#' + field.form_field_name).prop('type') == 'checkbox') {
        formValues[field.form_field_name] = $('#' + field.form_field_name).is(':checked') ? true : false;
      } else {
        formValues[field.form_field_name] = $('#' + field.form_field_name).val() === null ? '' : $('#' + field.form_field_name).val();
      }
    });

    /** run form validation first */
    const valid = this.validateForm(formValues);

    if (valid.success) {

      var postValues = new FormData();

      // get inputs from Form, include in POST
      this.fields.forEach(field => {
        if ($('#' + field.form_field_name).prop('type') == 'checkbox') {
          const val: any = $('#' + field.form_field_name).is(':checked') ? 1 : 0;
          postValues.append(field.form_field_name, val);
        } else {
          const val: any = $('#' + field.form_field_name).val() === null ? '' : $('#' + field.form_field_name).val();
          postValues.append(field.form_field_name, val)
        }
      });

      if (this.selectedFile) {
        postValues.append('file', this.selectedFile, this.selectedFile.name);
      }

      postValues.append('created_by_userid', this.authService.auth.user.user.id);
      postValues.append('created_by_username', this.authService.auth.user.user.username);

      this.defaultTableService.httpPostRecord(form_id, postValues);

    } else {

      swal('Invalid', valid.message, 'error');
      this.loading = false;

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
      const _fld = this.fields.find(field => field.form_field_name === key);

      if (_fld.required && (form_data[key] == '' || !form_data[key])) {
        _msg_required += _fld.label + ', ';
      }

      if (_fld.size != 0 && (form_data[key].length > _fld.size)) {
        _msg_size += _fld.label + ' [allowed size: ' + _fld.size + '], '
      }
    }

    if (_msg_required !== '') {
      result.success = false;
      _msg += _msg_required_title + _msg_required.slice(0, -2);
    }

    if (_msg_size !== '') {
      result.success = false;
      _msg += '<br /><br />' + _msg_size_title + _msg_size.slice(0, -2);
    }

    result.message = _msg;
    return result;
  }

  ngOnDestroy() {
    if (this.formGetSubscription) this.formGetSubscription.unsubscribe();
    if (this.recordPostSubscription) this.recordPostSubscription.unsubscribe();
    if (this.memberGetAllSubscription) this.memberGetAllSubscription.unsubscribe();
  }

  onChangeDropdown(field_name, event) {

    if (this.dropdown[field_name] !== void 0) {
      if (this.dropdown[field_name][event.target.value] !== void 0) {
        this.dropdown_display[field_name] = this.dropdown[field_name][event.target.value];
      } else {
        this.dropdown_display[field_name] = [];
      }
    }

  }

  onLoadEmployeeLookup(team_id: any, form_field_name: any) {
    // show modal form
    $('#btnEmployeeLookup').click();

    // show loading spinner
    this.loading2 = true;

    // get all dropdown select list from team members
    this.memberService.httpGetAllMembers({ team_id: team_id });

    // form_field_name - assign the calling field to input
    this.form_field_name = form_field_name;

  }

  onLoadUserTag(team_id: any, form_field_name: any) {
    // show modal form
    $('#btnUserTag').click();

    // show loading spinner
    this.loading2 = true;

    // get all dropdown select list from team members
    this.memberService.httpGetAllMembers({ team_id: team_id });

    // form_field_name - assign the calling field to input
    this.form_field_name = form_field_name;

  }

  onLookupSelect() {

    if (!this._selected_member) {
      swal('No employee selected', 'Please select employee before proceeding or cancel.', 'error')
      return;
    }

    const name = this._selected_member.user_info.last_name + ', ' + this._selected_member.user_info.first_name + ' ' + this._selected_member.user_info.middle_name;
    $('#' + this.form_field_name).val(name);
    $('#selected_' + this.form_field_name).text(name);

    this.visibility_dependency[this.form_field_name] = name;

    this._selected_member = null;
  }

  onLookUpClose() {
    this._selected_member = null;
  }

  onUserTagSelect() {

    if (!this._selected_member) {
      swal('No employee selected', 'Please select employee before proceeding or cancel.', 'error')
      return;
    }

    // const name = this._selected_member.user_info.email;
    const name = this._selected_member.user_info.last_name + ', ' + this._selected_member.user_info.first_name + ' ' + this._selected_member.user_info.middle_name;
    const name_email = this._selected_member.user_info.last_name + ', ' + this._selected_member.user_info.first_name + ' ' + this._selected_member.user_info.middle_name + '|' + this._selected_member.user_info.email;

    this.visibility_dependency[this.form_field_name] = name;

    $('#' + this.form_field_name).val(name_email);

    $('#selected_' + this.form_field_name).text(name);

    this._selected_member = null;
  }

  onUserTagClose() {
    this._selected_member = null;
  }


  // Reset form, remove display for employee lookup span
  onResetForm() {
    $('.lookup-selected').text('');

    $("input[type='hidden']").each(function () {
      $(this).val('');
    });
  }

  logout() {

    this.loading3 = true;

    const $this = this;
    this.authService.deleteAuthCookie();

    setTimeout(function () {
      $this.authService.setRedirectCookie($this.url);

      $this.router.navigate(['/login'], {
        queryParams: {
          return: $this.url
        }
      }
      );

      $this.loading3 = false;

    }, 1000);

  };

  ngAfterViewInit() {

  }


}
