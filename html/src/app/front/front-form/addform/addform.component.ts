import { Component, OnInit, OnDestroy } from '@angular/core';
import { FieldService } from '../../../services/field.service';
import { Subscription } from 'rxjs';
import { GlobalService } from '../../../services/global.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormService } from '../../../services/form.service';
import swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-addform',
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
  templateUrl: './addform.component.html',
  styleUrls: ['./addform.component.scss']
})
export class AddformComponent implements OnInit, OnDestroy {

  public loading = false;

  fields:                     any;
  formPermissions:            any;
  form:                       any;
  new_form:                   boolean = true;
  form_title:                 any = {
                                name: '',
                                description: ''
                              };
  form_id:                    any;

  fieldGetAllSubscription:    Subscription;
  formGetSubscription:        Subscription;
  formPermissionSubscription: Subscription;


  constructor(private fieldService: FieldService,
              private formService: FormService,
              private titleService: Title,
              private globalService: GlobalService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {

    // Get FORM ID from URL
    const _url = this.router.url.split("/");
    const _form_id = _url[2];

    if (_form_id !== 'new') {
      this.loading = true;
      this.new_form = false;
      this.form_id = _form_id;
      
      let _client = this.globalService.getClientCookie();

      // display form info
      this.formService.httpGetFormSettingsById(_form_id);

      this.formGetSubscription = this.formService.formGetSettings.subscribe(
        (form: any) => {
          if (typeof(form) !== 'undefined' && form.success) {
            this.form = form.data;

            this.fields = form.data.fields.sort(function (a, b) {
              return a.sort - b.sort;
            });

            this.form_title = {
              name:  form.data.form_name,
              description: ''
            };

            // set page title
            this.titleService.setTitle('Connext Forms - ' + form.data.form_name + ' - Settings');

            this.loading = false;

          } else if (typeof(form) !== 'undefined' && form.success == false) {

            swal('Unauthorized access', 'You are trying to access a resource that either doesn\'t exist or you dont have an access privilege. <br /><br /> You were redirected to homepage.', 'warning')
            
            if (_client) {
              this.router.navigate(['/home/' + _client.id]);
            } else {
              this.router.navigate(['/home']);
            }
          }
        }
      );

      // this.fieldService.httpGetAllField({'form_id': _form_id}, this.form_id);
      this.fieldGetAllSubscription = this.fieldService.fieldGetAll.subscribe(
        (fields: any) => {
          if (typeof(fields) !== 'undefined' && fields.success) {
            this.fields = fields.data.sort(function (a, b) {
              return a.sort - b.sort;
            });
          }
        }

      );



    } else {

      // display form info
      this.form_title = {
        name:  'New Form',
        description: '[ Create a new form ]'
      };

      this.new_form = true;

    }

  }

  ngOnDestroy() {  
    if (this.fieldGetAllSubscription) this.fieldGetAllSubscription.unsubscribe();    
    if (this.formGetSubscription) this.formGetSubscription.unsubscribe();
    if (this.formPermissionSubscription) this.formPermissionSubscription.unsubscribe();
  }

}
