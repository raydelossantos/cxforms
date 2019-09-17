import { NgModule } from '@angular/core';
import { FilterPipe } from './filter.pipe';
import { UtcLocalPipe } from './utc.local.pipe';
import { TimeAgoPipe } from './time.ago';
import { SantizeHtmlPipe } from './sanitize.html.pipe';

@NgModule({
    declarations: [ 
        FilterPipe,
        UtcLocalPipe,
        TimeAgoPipe,
        SantizeHtmlPipe
     ],
    exports: [ 
        FilterPipe,
        UtcLocalPipe,
        TimeAgoPipe,
        SantizeHtmlPipe
     ]
})
export class AllPipesModule {}