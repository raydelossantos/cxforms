import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormService } from '../../../../services/form.service';
import { Subscription } from 'rxjs';

import swal from 'sweetalert2';
import { GlobalService } from '../../../../services/global.service';
import { AuthService } from '../../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LOBService } from '../../../../services/lob.service';
import { CommonService } from '../../../../services/common.service.1';

// declare var CKEDITOR: any;

declare const window: any;

@Component({
  selector: 'app-forminfo',
  templateUrl: './forminfo.component.html',
  styleUrls: ['./forminfo.component.scss']
})
export class ForminfoComponent implements OnInit, OnDestroy {

  public loading = false;
  loading_message: string = 'Fetching information . . .';

  formPostSubscription: Subscription;
  formPutSubscription: Subscription;
  formGetSubscription: Subscription;
  formDeleteSubscription: Subscription;
  lobGetSubscription: Subscription;

  config: any;

  formForm: FormGroup;
  form: any = [];
  lob: any;
  isExistingForm: boolean = false;
  _form_id: any = null;

  
  constructor(private formService: FormService,
              private globalService: GlobalService,
              private authService: AuthService,
              private router: Router,
              private commonService: CommonService,
              private lobService: LOBService,
              private route: ActivatedRoute) { }

  ngOnInit() {

    this.config = {
      toolbarGroups: [
        {name:  "basicstyles",    groups:   ["basicstyles"]},
	      {name:  "colors" },
        {name:  "links",          groups:   ["links"]},
        {name:  "paragraph",      groups:   ["list","block"], items: ["JustifyLeft", "JustifyCenter","JustifyRight","JustifyBlock","JustifyBlock"]},
        {name:  "insert",         groups:   ["insert"]},
        {name:  "styles",         groups:   ["styles"]},
      ],
      removeButtons: "Source,Save,Templates,Find,Replace,Scayt,Image,Flash,PageBreak,IFrame",
      extraPlugins: 'divarea'
    };

    this.config = {
      toolbar: [
        { name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
        { name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat' ] },
        { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language' ] },
        { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
        { name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
        { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
        { name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
      ],
      title: false,

      extraPlugins: 'divarea',

      // Toolbar groups configuration.
      toolbarGroups: [
        { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
        { name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ] },
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
        { name: 'links' },
        { name: 'styles' },
        { name: 'colors' },
        { name: 'tools' },
      ],
      removeButtons: "Source"
    };

    this.router.events.subscribe(
      (event: any) => {
        this.initAddFormForm();
      }
    );

    const _client = this.globalService.getClientCookie();

    this.initAddFormForm();

    // Get FORM ID from URL
    const _url = this.router.url.split("/");
    const _form_id = _url[2];
    this._form_id = _form_id;

    if (_form_id !== 'new') {

      this.isExistingForm = true;
      this.loading = true;

      // display form info
      this.formService.httpGetFormById(_form_id);

      this.formGetSubscription = this.formService.formGet.subscribe(
        (form: any) => {
          if (typeof(form) !== 'undefined' && form.success) {
            this.form = form.data;

            this.formForm.patchValue(form.data);
            if (window.CKEDITOR) {
              setTimeout( 
                function(){ 
                  window.CKEDITOR.instances.description.setData(form.data.description); 
                }, 
              1000);
            }

            $('#table_name').replaceWith("<label class='disabled-label'>"+$('#table_name').val()+"</div>");
            $('#short_name').replaceWith("<label class='disabled-label'>"+$('#short_name').val()+"</div>");

            this.loading = false;
          } else if (typeof(form) !== 'undefined' && form.success == false) {

            swal('Unauthorized access', 'You are trying to access a resource that either doesn\'t exist or you dont have an access privilege. <br /><br /> You were redirected.', 'warning')
            this.router.navigate(['/home']);
            this.loading = false;
          }
        }
      );

    } else {
      // get lob info (from URL)
      this.lobService.httpGetLOBById(parseInt(_url[4]));

      this.lobGetSubscription = this.lobService.lobGet.subscribe(
        (lob: any) => {
          if (typeof(lob) !== 'undefined' && lob.success) {
            this.lob = lob.data;
          } else if (typeof(lob) !== 'undefined' && lob.success === false) {
            swal('Invalid url', 'You are trying to access an address thet either doesn\'t exist or you don\'t have an access privilege. <br /><br /> You were redirected to homepage.', 'warning');
            this.router.navigate(['/home']);
          }
        }
      )
    }

    this.formPostSubscription = this.formService.formPost.subscribe(
      (form: any) => {
        if (typeof(form) !== 'undefined' && form.success) {
          // swal('Created', 'Form has been created successfully.', 'success');
          swal({
            position: 'top-end',
            type: 'success',
            title: 'Form has been created successfully',
            showConfirmButton: false,
            timer: 1500
          });
          // redirect to the newly created form
          const form_url = '/form/' + form.form_id + '/settings/details';
          this.router.navigate([form_url]);

          if (_client) {
            this.commonService.httpGetUserForms(parseInt(_client.id));
          }
        } else if (typeof(form) !== 'undefined' && form.success === false) {
          swal('Create failed', 'Unable to create form. <br><br>' + form.message, 'error');
          this.loading = false;
        }
      }
    );

    this.formDeleteSubscription = this.formService.formDelete.subscribe(
      (form: any) => {
        if (typeof(form) !== 'undefined' && form.success) {
          // swal('Archived', 'Form has been archived successfully.', 'success');
          swal({
            position: 'top-end',
            type: 'success',
            title: 'Form archived!',
            showConfirmButton: false,
            timer: 1500
          });
          // redirect to home dashboard after archiving
          this.router.navigate(['/home']);

          if (_client) {
            this.lobService.httpGetAllLOB({'client_id': _client.id});
          }
        } else if (typeof(form) !== 'undefined' && form.success === false) {
          swal('Archive failed', 'Unable to archive form. <br><br>' + form.message, 'error');
        }
      }
    )

    this.formPutSubscription = this.formService.formPut.subscribe(
      (form: any) => {
        if (typeof(form) !== 'undefined' && form.success) {
          // swal('Form Updated', 'Form was updated successfully.', 'success');
          swal({
            position: 'top-end',
            type: 'success',
            title: 'Form updated!',
            showConfirmButton: false,
            timer: 1500
          });

          this.formService.httpGetFormById(this._form_id);

          if (_client) {
            this.lobService.httpGetAllLOB({'client_id': _client.id});
          }
        } else if (typeof(form) !== 'undefined' && form.success === false) {
          swal('Update failed', 'Unable to update form. <br><br>' + form.message, 'error');
        }
      }
    )

    if(window.CKEDITOR) {
      window.CKEDITOR.replace('description', this.config);
    }

  }

  initAddFormForm(data: any = []) {

    const form_name = '';
    const description = '';
    // const short_name = '';
    const table_name = '';
    const reports_url = '';
    const record_closed_criteria = '';
    const stay_after_submit = false;
    const show_submitters_info = false;
    const hide_values_in_email = false;
    const attachments = false;
    const max_records_in_list_view = 20;
    const wp_link = '';
    const form_type = 'Connext Forms Default';

    this.formForm = new FormGroup({
      'form_name': new FormControl(form_name, Validators.required),
      'description': new FormControl(description),
      // 'short_name': new FormControl(short_name, Validators.required),
      'table_name': new FormControl(table_name, Validators.required),
      'reports_url': new FormControl(reports_url),
      'record_closed_criteria': new FormControl(record_closed_criteria),
      'stay_after_submit': new FormControl(stay_after_submit),
      'show_submitters_info': new FormControl(show_submitters_info),
      'hide_values_in_emails': new FormControl(hide_values_in_email),
      'attachments': new FormControl(attachments),
      'max_records_in_list_view': new FormControl(max_records_in_list_view),
      'wp_link': new FormControl({value: wp_link, disabled : true}),
      'form_type': new FormControl(form_type, Validators.required)
    });

    $('#form_name').focus();

    // CKEDITOR.replace('description');

  }

  onSaveForm() {

    const formValues = this.formForm.value;
    const _url       = this.router.url.split("/");
    const _form_id   = _url[2];

    const regExp = /^[a-z](?:_?[a-z0-9]+)*$/i;
    var isTableNameValid = regExp.test(formValues['table_name'])

    if (!isTableNameValid) {
      swal('Invalid table name', 'Table name does not conform with the rules. Please try again.', 'error');
      return;
    }

    this.loading = true;
    this.loading_message = 'Saving ...';

    if (_form_id === 'new') {
      const _lob_id   = _url[4];
      formValues['description'] = window.CKEDITOR.instances.description.getData();
      formValues['created_by'] = this.authService.auth.user.user.id;
      formValues['lob_id'] = _lob_id;

      if (this.formForm.valid) {
        this.formService.httpPostCreateForm(formValues);
      } else {
        swal('Error', 'Required fields are missing.', 'error');
      }
    } else {
      formValues['description'] = window.CKEDITOR.instances.description.getData();
      formValues['modified_by'] = this.authService.auth.user.user.id;
      if (this.formForm.valid) {
        this.formService.httpPutForm(_form_id, formValues);
      } else {
        swal('Error', 'Required fields are missing.', 'error');
      }
    }
  }

  onArchiveForm(id: any) {
    // this.formService.httpDeleteForm(id);

    const that = this;
    swal({
      title: 'Achive form?',
      text: "This form will no longer be accessible. It can only be restored via Admin Panel.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, archive it!'
    }).then(function(result) {
      if (result.value) {
        that.loading = true;
        that.formService.httpDeleteForm(id);
        // that._restore = id;
      }
    });

    // swal('Archived form', 'Form ID:  ' + id, 'success')
  }

  onFetchRecord() {
    this.loading = true;
    this.formService.httpGetFormById(this._form_id);
  }

  onCopyLink() {
    if (this.form.wp_link && this.form.wp_link !== null) {
      this.copyText(this.form.wp_link);

      swal({
        position: 'top-end',
        type: 'success',
        title: 'Link has been placed to clipboard',
        showConfirmButton: false,
        timer: 1500
      })

      return;
    }
  }

  copyText(text: any){
    var textArea = document.createElement("textarea");
    textArea.style.position = 'fixed';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.log('Oops, unable to copy');
    }
    document.body.removeChild(textArea);
  }

  ngOnDestroy() {
    if (this.formPostSubscription) this.formPostSubscription.unsubscribe();
    if (this.formPutSubscription) this.formPutSubscription.unsubscribe();
    if (this.formGetSubscription) this.formGetSubscription.unsubscribe();
    if (this.formDeleteSubscription) this.formDeleteSubscription.unsubscribe();
    if (this.lobGetSubscription) this.lobGetSubscription.unsubscribe();
  }

}
