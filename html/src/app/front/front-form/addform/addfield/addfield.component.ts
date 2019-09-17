import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FieldService } from '../../../../services/field.service';
import swal from 'sweetalert2';
import { GlobalService } from '../../../../services/global.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import * as $ from 'jquery';
import { TeamService } from '../../../../services/team.service';

@Component({
  selector: 'app-addfield',
  templateUrl: './addfield.component.html',
  styleUrls: ['./addfield.component.scss']
})
export class AddfieldComponent implements OnInit, OnDestroy {

  public loading = false;
  loading_message: string = 'Fetching information . . .';

  fieldPostSubscription: Subscription;
  fieldPutSubscription: Subscription;
  fieldGetSubscription: Subscription;
  fieldDeleteSubscription: Subscription;

  fields: any;
  field_id: any;
  form_id: any;
  selected_field_type: any = '';
  _selectedTeam: any = [];
  selected_teams: any = [];

  _del_rec: any = {
    _id: '',
    _field_name: ''
  };

  fieldForm: FormGroup;

  field_types: any = [
    { id: 1, name: 'String' },
    { id: 2, name: 'Multiline' },
    { id: 3, name: 'Date' },
    { id: 4, name: 'Date and Time' },
    { id: 5, name: 'Dropdown' },
    { id: 6, name: 'Checkbox' },
    // { id: 7, name: 'Monetary Amount' },
    // { id: 8, name: 'Lookup' },
    // { id: 7, name: 'Employee Lookup [Employee ID]' },
    // { id: 8, name: 'Employee Lookup [Employee Name]' },
    { id: 9, name: 'Employee Lookup' },
    // { id: 10, name: 'Timer' },
    { id: 11, name: 'User Tag' },
    // { id: 12, name: 'Description Time Stamp' }
  ];

  // lookup_scopes: any = [
  //   { id: 1, name: 'Everybody' },
  //   { id: 2, name: 'System Admin' },
  //   { id: 3, name: 'Team A' },
  // ];

  teamGetSubscription: Subscription;

  lookup_scopes: any = [{
                  id: 0,
                  team_name: 'No Team Available',
                  team_code: 'No team code',
                  client_id: 0,
                  location: 'No location',
                  description: ''
                }];

  constructor(private fieldService: FieldService,
              private globalService: GlobalService,
              private route: ActivatedRoute,
              private teamService: TeamService,
              private router: Router) { }

  ngOnInit() {
    const $this = this;
    this.initFieldForm();

    this.onFieldTypeChange();

    this.teamService.httpGetAllTeams();

    const _url = this.router.url.split("/");
    this.form_id = _url[2];

    this.route.params.subscribe(
      (params: Params) => {
        this.field_id = params['id'];

        if (params['id'] == 'new') {
          this.selected_field_type = '';
          $('#form_field_name').prop('disabled', false);
          $('#field_type').prop('disabled', false);
          // $('#short_id').prop('disabled', false);
          // $('#short_id').prop('disabled', false);

          // $('#form_field_name').replaceWith("<input formControlName='form_field_name' type='text' id='form_field_name'>");
          // $('#short_id').replaceWith("<input formControlName='short_id' type='text' id='short_id'>");

          this.initFieldForm();
          this.onFieldTypeChange();
        } else {
          this.loading = true;
          this.fieldService.httpGetField(this.field_id, this.form_id);
        }
      }
    );

    this.fieldPostSubscription = this.fieldService.fieldPost.subscribe(
      (fields: any) => {
        if (typeof(fields) !== 'undefined' && fields.success) {
          swal('Created', 'Field was saved successfully.', 'success');
          this.initFieldForm();
          this.fields = fields;
          this.fieldService.httpGetAllField({'form_id': this.form_id}, this.form_id);
          $('#btn_close').click();
          this.loading = false;
        } else if (typeof(fields) !== 'undefined' && fields.success === false) {
          swal('Failed to create field', 'Unable to create new field. <br><br>' + fields.message, 'error');
          this.loading = false;
        }
      }
    );

    this.fieldPutSubscription = this.fieldService.fieldPut.subscribe(
      (field: any) => {
        if (typeof (field) !== 'undefined' && field.success) {
          swal('Updated', 'Field was updated successfully.', 'success');
          this.fields = field;
          this.loading = false;
        } else if (typeof (field) !== 'undefined' && field.success === false) {
          swal('Failed to update', 'Unable to update field. <br><br>' + field.message, 'error');
          this.loading = false;
        }
      }
    );

    this.fieldGetSubscription = this.fieldService.fieldGet.subscribe(
      (field: any) => {
        if (typeof(field) !== 'undefined' && field.success) {

          this._del_rec = {
            _id: field.data.id,
            _field_name: field.data.label
          };

          this.fieldForm.patchValue(field.data);

          this.selected_teams = JSON.parse(field.data.lookup_scope_id);

          this.teamService.httpGetAllTeams();

          this.onFieldTypeChange();

          $('#form_field_name').prop('disabled', true);
          $('#field_type').prop('disabled', true);
          // $('#short_id').prop('disabled', true);

          // $('#form_field_name').replaceWith("<label class='disabled-label' id='form_field_name'>"+field.data.form_field_name+"</label>");
          // $('#short_id').replaceWith("<label class='disabled-label' id='short_id'>"+field.data.short_id+"</label>");

          this.loading = false;
        }
      }
    );

    this.fieldDeleteSubscription = this.fieldService.fieldDelete.subscribe(
      (fields: any) => {
        if (typeof(fields) !== 'undefined' && fields.success) {
          swal('Deleted', 'Field was deleted successfully.', 'success');
          $('#btnCloseDelete').click();
          // this.initFieldForm();
          this.fieldService.httpGetAllField({'form_id': this.form_id}, this.form_id);
          this.router.navigate(['/form/' + this.form_id + '/settings/details']);
        } else if (typeof(fields) !== 'undefined' && fields.success === false) {
          swal('Failed to delete field', 'Unable to delete field. <br><br>' + fields.message, 'error');
        }
      }
    );



    this.teamGetSubscription = this.teamService.teamGetAll.subscribe(
      (teams: any) => {
        if (typeof(teams) !== 'undefined' && teams.success) {
          if (teams.data.length > 0) {

            var _selectedTeam = [];
            this.lookup_scopes = teams.data;

            if(this.selected_teams) {
              this.selected_teams.forEach(_id => {
                this.lookup_scopes.map(x => {
                  if (x.id === _id) {
                  _selectedTeam.push(x.id);
                  }
                });
              });
            }
            this._selectedTeam = _selectedTeam;
          }
        } else if (typeof(teams) !== 'undefined' && teams.success === false) {
        }
      }
    );

  }

  selectAll() {
    this._selectedTeam = this.lookup_scopes.map(x => x.id);
  }

  unselectAll() {
      this._selectedTeam = [];
  }

  initFieldForm() {
    const label = '';
    const description = '';
    const form_field_name = '';
    // const short_id = '';
    const field_type = '';
    const size = '100';
    const validation_mask = '';
    const dropdown_name = '';
    const selection_options = '';
    const lookup_scope_id = '';
    const lookup_dependencies = '';
    const lookup_source_field = '';
    const timer_duration = '';
    const timer_auto_start = false;
    const timer_reset_action = '';
    const tag_button_text = '';
    const required = false;
    const readonly = false;
    const visibility = '';
    const role_restrictions_id = '';
    const group_name = '';
    const first_day_active = '0000-00-00';
    const last_day_active = '0000-00-00';
    const show_this_field_on_default_table_view = true;
    const url_timer_reset = '';
    const maximum_display_characters = '';
    // const delete_this_column = false;

    this.fieldForm = new FormGroup({
      'label': new FormControl(label, Validators.required),
      'description': new FormControl(description),
      'form_field_name': new FormControl(form_field_name, Validators.required),
      // 'short_id': new FormControl(short_id, Validators.required),
      'field_type': new FormControl(field_type, Validators.required),
      'size': new FormControl(size),
      'validation_mask': new FormControl(validation_mask),
      'dropdown_name': new FormControl(dropdown_name),
      'selection_options': new FormControl(selection_options),
      'lookup_scope_id': new FormControl(lookup_scope_id),
      'lookup_dependencies': new FormControl(lookup_dependencies),
      'lookup_source_field': new FormControl(lookup_source_field),
      'timer_duration': new FormControl(timer_duration),
      'timer_auto_start': new FormControl(timer_auto_start),
      'timer_reset_action': new FormControl(timer_reset_action),
      'tag_button_text': new FormControl(tag_button_text),
      'required': new FormControl(required),
      'readonly': new FormControl(readonly),
      'visibility': new FormControl(visibility),
      'role_restrictions_id': new FormControl(role_restrictions_id),
      'group_name': new FormControl(group_name),
      'first_day_active': new FormControl(first_day_active),
      'last_day_active': new FormControl(last_day_active),
      'show_this_field_on_default_table_view': new FormControl(show_this_field_on_default_table_view),
      'url_timer_reset': new FormControl(url_timer_reset),
      'maximum_display_characters': new FormControl(maximum_display_characters),
      // 'delete_this_column': new FormControl(delete_this_column)
    });

    $('#label').focus();
  }

  onSaveField() {

    let form_id = 0;
    const formValues = this.fieldForm.value;

    if (!this.fieldForm.valid) {
      swal ('Error', 'Required fields are missing.', 'error')
      this.loading = false;
      return;
    }

    if (formValues['field_type'] === 'Dropdown') {
      formValues['size'] = 255;
    }

    if (formValues['field_type'] !== 'String' && formValues['field_type'] !== 'Multiline') {
      formValues['maximum_display_characters'] = 0;
    }

    if (formValues['field_type'] === 'Employee Lookup') {
      if (formValues['lookup_scope_id'] === '' || formValues['lookup_scope_id'] === 0) {
        swal('Required field', 'Lookup Scope is required for Employee Lookup field type.', 'error');
        return;
      }
    }

    const regExp = /^[a-z](?:_?[a-z0-9]+)*$/i;
    var isFieldNameValid = regExp.test(formValues['form_field_name'])

    if (!isFieldNameValid) {
      swal('Invalid table name', 'Field name does not conform with the rules. Please try again.', 'error');
      this.loading = false;
      return;
    }

    /** get form id from url */
    const _url = this.router.url.split("/");
    const _form_id = _url[2];

    if (_form_id !== 'new') {

      this.loading = true;
      this.loading_message = 'Saving . . .';

      form_id = parseInt(_form_id);
      formValues['form_id'] = form_id;

      /** get field id */
      if (this.field_id === 'new') {
        this.fieldService.httpPostField(formValues, form_id);
      } else {
        this.fieldService.httpPutField(this.field_id, formValues, form_id);
      }

    } else {
      swal('Error', 'Form must be created first before adding field to it.', 'error');
      this.loading = false;
    }
  }

  onFieldTypeChange() {

    const field_type = $('#field_type').val();

    const size =                $('#div_size');
    const validation_mask =     $('#div_validation_mask');
    const dropdown_name =       $('#div_dropdown_name');
    const selection_options =   $('#div_selection_options');
    const role_restrictions =   $('#div_role_restrictions_id');
    const timer_duration =      $('#div_timer_duration');
    const timer_reset_action =  $('#div_timer_reset_action');
    const timer_auto_start =    $('#div_timer_auto_start');
    const tag_button_text =     $('#div_tag_button_text');
    const lookup_scope_id =     $('#div_lookup_scope_id');
    const required =            $('#div_required');
    const readonly =            $('#div_readonly');
    const visibility =          $('#div_visibility');
    const group_name =          $('#div_group_name');
    const first_day_active =    $('#div_first_day_active');
    const last_day_active =     $('#div_last_day_active');
    const url_timer_reset =     $('#div_url_timer_reset');
    const show_this_field_on_default_table_view = $('#div_show_this_field_on_default_table_view');
    const maximum_display_characters =     $('#div_maximum_display_characters');

    // const delete_this_column =  $('#div_delete_this_column');

    // hide elements which are optional
    size.fadeOut();
    validation_mask.fadeOut();
    dropdown_name.fadeOut();
    selection_options.fadeOut();
    role_restrictions.fadeOut();
    timer_duration.fadeOut();
    timer_reset_action.fadeOut();
    timer_auto_start.fadeOut();
    tag_button_text.fadeOut();
    lookup_scope_id.fadeOut();
    required.fadeOut();
    readonly.fadeOut();
    visibility.fadeOut();
    group_name.fadeOut();
    first_day_active.fadeOut();
    last_day_active.fadeOut();
    url_timer_reset.fadeOut();
    show_this_field_on_default_table_view.fadeOut();
    maximum_display_characters.fadeOut();
    // delete_this_column.fadeOut();

    if (this.selected_field_type == 'String') {
      size.fadeIn();
      validation_mask.fadeIn();
      required.fadeIn();
      url_timer_reset.fadeIn();
      maximum_display_characters.fadeIn();
    } else if (this.selected_field_type == 'Date' || this.selected_field_type == 'Date and Time') {
      required.fadeIn();
    } else if (this.selected_field_type == 'Checkbox') {
    } else if (this.selected_field_type == 'Multiline') {
      size.fadeIn();
      required.fadeIn();
      maximum_display_characters.fadeIn();
    } else if (this.selected_field_type == 'Employee Lookup') {
      lookup_scope_id.fadeIn();
      required.fadeIn();
    } else if (this.selected_field_type == 'Timer') {
      timer_duration.fadeIn();
      timer_auto_start.fadeIn();
      timer_reset_action.fadeIn();
    } else if (this.selected_field_type == 'User Tag') {
      lookup_scope_id.fadeIn();
      required.fadeIn();
    } else if (this.selected_field_type == 'Description Time Stamp') {
    } else if (this.selected_field_type == 'Dropdown') {
      dropdown_name.fadeIn();
      selection_options.fadeIn();
      required.fadeIn();
    }

    if (this.selected_field_type !== '' && this.selected_field_type !== null) {
      group_name.fadeIn();
      role_restrictions.fadeIn();
      visibility.fadeIn();
      readonly.fadeIn();
      url_timer_reset.fadeIn();
      show_this_field_on_default_table_view.fadeIn();
      // delete_this_column.fadeIn();
    }
  }

  onDelRecord() {
    $("#btnDeleteRecord").click();
  }

  onDeleteRecord(id: any) {
    this.fieldService.httpDeleteField(id, this.form_id);
  }

  ngOnDestroy() {
    this.fieldPostSubscription.unsubscribe();
    this.fieldPutSubscription.unsubscribe();
    this.fieldGetSubscription.unsubscribe();
  }

}
