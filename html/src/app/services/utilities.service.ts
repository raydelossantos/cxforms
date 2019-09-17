import { Injectable } from '@angular/core';

@Injectable()
export class UtilitiesService {

  constructor() { }

  convertDateTimeToQAGoldFormatIfValid(dateString: any): string {
    let datePieces: any[] = [];
    let datePieces2: string[] = [];
    let qaGoldDateTimeFormat = '';
    let timePieces: any [] = [];

    if( this.isValidQAGoldDateTimeFormat(0, false, dateString) ){
      if(dateString.length == 0) {
        qaGoldDateTimeFormat = '';
      } else {
        datePieces  = dateString.split(' ');
        datePieces[0] = (datePieces[0]).replace(/\//g, '-');
        datePieces[0] = datePieces[0].replace(',', '');
        datePieces2 = datePieces[0].split('-');
        datePieces[0] = '';
        datePieces[0] += datePieces2[2] + '-';
        datePieces[0] += datePieces2[0] + '-';
        datePieces[0] += datePieces2[1];
        datePieces[0] += 'T'; // 11-29-2018T
        timePieces = datePieces[1].split(':');
  
        if(datePieces[2] === 'PM') {
          let hour = parseInt(timePieces[0]);
          (hour == 12) ? hour = 12 : hour += 12;
          qaGoldDateTimeFormat = datePieces[0] + (hour).toString() + ':' + timePieces[1];
        } else {
          if(timePieces[0] == 12) {
            timePieces[0] = '00';
          }

          qaGoldDateTimeFormat = datePieces[0] + timePieces[0] + ':' + timePieces[1];
        }
      }
    } else {
      qaGoldDateTimeFormat = dateString;
    }

    return qaGoldDateTimeFormat;
  }

  /**
   * @param mode 0 = QAGold DateTimeOnly Format: "12/6/2018, 11:45 AM", the one that the owl datepicker puts as value right after picking date and time
   *             1 = QAGold Converted DateTime Format: "2018-12-6T11:45", the current QAGold format when inserting into the database
   * @param dateTime 
   */
  isValidQAGoldDateTimeFormat(mode: number, required: boolean, dateTime: string): boolean {
    let result = false;
    let dateTimeRegExp: RegExp;
    let validDateFormat = [];

    switch(mode) {
      case 1: // QAGold Converted DateTime Format: "2018-12-6T11:45"
        if(required) {
          dateTimeRegExp = /(^(\d{4})-([1-9]|1[0-2])-([1-9]|1[0-9]|2[0-9]|3[0-1])T(0[0-9]|[1-9]|1[0-9]|2[0-3]):(0[1-9]|[1-5][0-9]))/g;
        } else {
          dateTimeRegExp = /(^$)|(^(\d{4})-([1-9]|1[0-2])-([1-9]|1[0-9]|2[0-9]|3[0-1])T(0[0-9]|[1-9]|1[0-9]|2[0-3]):(0[1-9]|[1-5][0-9]))/g;
        }
        break;
      default: // QAGold DateTimeOnly Format: "12/6/2018, 11:45 AM"
        if(required) {
          dateTimeRegExp = /(^([1-9]|1[0-2])\/([1-9]|1[0-9]|2[0-9]|3[0-1])\/(\d{4}),\s([1-9]|0[1-9]|1[0-2]):(0[1-9]|[1-9]|[1-5][0-9])\s(AM|PM))/g;
        } else {
          dateTimeRegExp = /(^$)|(^([1-9]|1[0-2])\/([1-9]|1[0-9]|2[0-9]|3[0-1])\/(\d{4}),\s([1-9]|0[1-9]|1[0-2]):(0[1-9]|[1-9]|[1-5][0-9])\s(AM|PM))/g;
        }
        break;
    }

    validDateFormat = dateTime.match(dateTimeRegExp);

    if(validDateFormat != null && validDateFormat.length == 1)
      result = true;

    return result;
  }
}
