import { Component, OnInit, OnDestroy } from '@angular/core';
import { FieldService } from '../../../../services/field.service';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { FormService } from '../../../../services/form.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-arrange',
  templateUrl: './arrange.component.html',
  styleUrls: ['./arrange.component.scss']
})
export class ArrangeComponent implements OnInit, OnDestroy {

  public loading = false;

  form_id: any;
  options: any;
  fields: any;
  _sorted_fields: any;
  formGetSubscription: Subscription;
  fieldPostSortSubscription: Subscription;

  constructor(private fieldService: FieldService,
              private formService: FormService,
              private router: Router) {}


  ngOnInit() {

    const _url = this.router.url.split("/");
    const _form_id = _url[2];

    if (_form_id !== 'new') {
      this.form_id = _form_id;
      this.loading = true;
      this.formService.httpGetFormById(_form_id);

      this.formGetSubscription = this.formService.formGet.subscribe(
        (form: any) => {
          if (typeof(form) !== 'undefined' && form.success) {

            this.fields = form.data.fields.sort(function (a, b) {
              return a.sort - b.sort;
            });

            this.loading = false;

          } else if (typeof(form) !== 'undefined' && form.success == false) {

            swal('Unauthorized access', 'You are trying to access a resource that either doesn\'t exist or you dont have an access privilege. <br /><br /> You were redirected.', 'warning')

            this.loading = false;
            this.router.navigate(['/home']);

          }
        }
      );

      this.fieldPostSortSubscription = this.fieldService.fieldPostSort.subscribe(
        (sort: any) => {
          if (typeof(sort) !== 'undefined' && sort.success) {
            swal('Sorting updated', 'Sorting of fields has been successful.', 'success');
            this.fieldService.httpGetAllField({'form_id': _form_id}, this.form_id);
          } else if (typeof(sort) !== 'undefined' && sort.success === false) {
            swal('Sorting failed', 'Unable to sort fields. <br><br>' + sort.message, 'error');
          }
          this.loading = false;
        }
      );

    } else {
      swal('Unauthorized access', 'You are trying to access a resource that either doesn\'t exist or you dont have an access privilege. <br /><br /> You were redirected.', 'warning')
      this.router.navigate(['/home']);
      this.loading = false;
    }

  }

  onSaveChanges() {
    this.loading = true;

    const ul = $('.sort-item');

    var new_sorting = [];
    var i = 1;

    ul.each(function(idx, li) {
      new_sorting.push({
        id: $(li).attr('value'),
        sort: i
      });

      i += 1;
    });

    this.fieldService.httpPostSorting(new_sorting, this.form_id);
  }

  ngOnDestroy() {
    if (this.fieldPostSortSubscription) this.fieldPostSortSubscription.unsubscribe();
    if (this.formGetSubscription) this.formGetSubscription.unsubscribe();
  }

}
