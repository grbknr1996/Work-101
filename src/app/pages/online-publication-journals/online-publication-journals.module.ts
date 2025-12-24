import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlinePublicationJournalsComponentRoutingModule } from './online-publication-journals-routing.module';
import { OnlinePublicationJournalService } from 'src/app/_services/online-publication-journal.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OnlinePublicationJournalsComponentRoutingModule
  ],
  providers: [
    OnlinePublicationJournalService
  ]
})
export class OnlinePublicationJournalsModule { }
