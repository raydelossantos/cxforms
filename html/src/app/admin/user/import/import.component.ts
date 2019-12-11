import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { type } from 'os';

@Component({
  selector: 'app-import',
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
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  public loading = false;
  userSyncSubscription  = new Subscription;
  selectedFile: File = null;

  constructor(private userService: UserService,
              private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle('Connext Forms - Import User Accounts');

    this.userSyncSubscription = this.userService.userPostImport.subscribe(
      (imporFile: any) => {
        if (typeof(imporFile) !== 'undefined' && imporFile.success) {
          this.loading = false;
          swal('User Import Done', 'Successfully imported user records.', 'success');
          this.selectedFile = null;
        } else if (typeof(imporFile) !== 'undefined' && imporFile.success === false) {
          this.loading = false;
          swal(
            'Failed Importing users',
            'Something went wrong while importing user records. Error below. <br><br>' + imporFile.message,
            'error'
          )
        }
      }
    );

  }

  onFileSelected(event: any) {

    if (event.target.files.length == 0) {
      return;
    }

    console.log(event.target.files[0].type);

    if (event.target.files[0].type == 'application/vnd.ms-excel' || event.target.files[0].type == 'application/csv' || event.target.files[0].type == 'text/csv' || event.target.files[0].type == 'text/comma-separated-values' || event.target.files[0].type == 'application/vnd.msexcel') {
      this.selectedFile = event.target.files[0];
    } else {
      swal('Invalid file type', 'You have selected a non-supported file type. Please choose CSV.', 'error');
      event.target.value = null;
    }

  }

  startImport() {

    this.loading = true;
    const fd = new FormData();
  
    if (this.selectedFile) {
      fd.append('file', this.selectedFile, this.selectedFile.name)
    }

    this.userService.httpPostImport(fd);
  }

}
