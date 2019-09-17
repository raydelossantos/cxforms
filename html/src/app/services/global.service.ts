import { Injectable, Inject } from '@angular/core';
import { AuthService } from './auth.service';
import { ClientService } from './client.service';
import { Subject } from 'rxjs';
import { FieldService } from './field.service';

@Injectable()
export class GlobalService {

  clientChange = new Subject<any>();
  formChange = new Subject<any>();

  constructor(public authService: AuthService, 
              public clientService: ClientService,
              public fieldService: FieldService) {}


  /** 
   * CLIENT COOKIE SETTER
   */
  setClientCookie(_client: any) {

    localStorage.setItem('_client', btoa(JSON.stringify(_client)));
    this.clientChange.next(_client);

  }

  /**
   * CLIENT COOKIE GETTER
   */
  getClientCookie() {

    if (localStorage.getItem('_client') !== null) {
      const _client =  JSON.parse(atob(localStorage.getItem('_client')));
      return _client;
    } else {
      return null;
    }

  }

    /**
   * CLIENT DELETE COOKIE
   */
  deleteClientCookie() {
    if (localStorage['_client']) localStorage.removeItem('_client');
    this.clientChange.next(null);
  }

  /**
   * SET CURRENT LOB COOKIE
   */
  setLOBCookie(_lob: any) {

    localStorage.setItem('_lob', btoa(JSON.stringify(_lob)));

  }

  /**
   * GET LOB COOKE
   */
  getLOBCookie() {

    const _lob = JSON.parse(atob(localStorage.getItem('_lob')));
    return _lob;

  }

  /**
 * SET CURRENT FORM COOKIE
 */
  setFormCookie(_form: any) {

    localStorage.setItem('_form', btoa(_form));
    this.clientChange.next(_form);

    if (_form == '') {
      this.fieldService.clearFields();
    }

  }

  /**
   * GET FORM COOKE
   */
  getFormCookie() {

    if (localStorage.getItem('_form') === null || localStorage.getItem('_form') == '') {
      return;
    }

    const _form = JSON.parse(atob(localStorage.getItem('_form')));
    return _form;

  }

}
