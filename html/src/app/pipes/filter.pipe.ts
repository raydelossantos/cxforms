import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, searchType: string): any[] {
    if(!items) return [];
    if(!searchText) return items;

    // return items.filter(
    //     (item: any) => item.client_name.toLowerCase().startsWith(searchText.toLowerCase())
    // )

    if (searchType === 'form') {
      return items.filter(
        (item: any) => item.form_name.toLowerCase().includes(searchText.toLowerCase())
      );
    } else {
      return items.filter(
        (item: any) => item.client_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

   }
}
