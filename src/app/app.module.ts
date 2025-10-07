// ANGULAR CORE

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import { PlatformInterceptor } from './_interceptors/platform.interceptor';

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  HTTP_INTERCEPTORS,
  HttpBackend,
  HttpClientModule,
} from '@angular/common/http';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DividerModule } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DataViewModule } from 'primeng/dataview';
import { CalendarModule } from 'primeng/calendar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ChipModule } from 'primeng/chip';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabViewModule } from 'primeng/tabview';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { AccordionModule } from 'primeng/accordion';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TreeModule } from 'primeng/tree';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PopoverModule } from 'primeng/popover';
import { ToolbarModule } from 'primeng/toolbar';
import { ScrollTopModule } from 'primeng/scrolltop';
import { EditorModule } from 'primeng/editor';
import { Listbox } from 'primeng/listbox';

import * as echarts from 'echarts/core';

// ENVIRONMENT

import { environment } from '../environments/environment';
import { instanceType } from './utils';

// CACHE BUSTING

import cacheBusting from '../../assets-cache-busting.json';

// TRANSLATION

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
//Global Loader

// https://github.com/ngx-translate/core
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpBackend) {
  return new MultiTranslateHttpLoader(http, [
    {
      prefix: './assets' + '/i18n/' + instanceType() + '/',
      suffix: '.json?_=' + cacheBusting['i18n'],
      optional: true,
    },
    {
      prefix: './assets' + '/i18n/' + 'default' + '/',
      suffix: '.json?_=' + cacheBusting['i18n'],
    },
  ]);
}

import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

import { NbFormatter } from './_pipes/nbformater.pipe';
import { CapitalizeWordsPipe } from 'src/app/_pipes/capitalize-words.pipe';

// PAGES COMPONENTS

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppWidgetComponent } from './components/app-widget/app-widget.component';
import { ToastComponent } from './components/toast/toast.component';
import { ScrollerComponent } from './components/scroller/scroller.component';

import { AddHeaderInterceptor } from './_services/http-client';
import { PackageStatsComponent } from './components/package-stats/package-stats.component';
import { TableCardComponent } from './components/table-card/table-card.component';
import { UserStatsComponent } from './components/user-stats/user-stats.component';
import { ConfigurableFilterComponent } from './components/configurable-filter/configurable-filter.component';
import { FilterChipsComponent } from './components/filter-chips/filter-chips.component';

import { GlobalLoaderComponent } from './components/global-loader/global-loader.component';
import { CompMenuBar } from './components/comp-nav-bar/comp-nav-bar.component';
import { AppSidebarComponent } from './components/app-sidebar/app-sidebar.component';
import { AppNavbarComponent } from './components/app-navbar/app-navbar.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { TableComponent } from './components/table/table.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { LoadingInterceptor } from './_interceptors/loading.interceptor';
import { ConfigurableFilterBarComponent } from './components/configurable-filter-bar/configurable-filter-bar.component';
import { ConfigurableStepperComponent } from './components/configurable-stepper/configurable-stepper.component';
import { GroupAssignmentComponent } from './components/group-assignment/group-assignment.component';
import { ValidationErrorsComponent } from './components/validation-errors/validation-errors.component';
import { PanelHeaderIconsComponent } from './components/panels-header/panel-header-icons.component';
import { MultipleStatsComponent } from './components/multiple-stats/multiple-stats.component';

import { UnitsTreeComponent } from './pages/user-management/units/units-tree/units-tree.component';
import { UnitDetailsComponent } from './pages/user-management/units/units-details/units-details.component';
import { UserSelectionDialogComponent } from './pages/user-management/units/user-selection-dialog/user-selection-dialog.component';
import { UnitActionsAssignmentComponent } from './pages/user-management/units/units-actions-asssignment/unit-actions-assignment.component';

import { PlatformSelectionComponent } from './pages/platform-selection/platform-selection.component';
import { PageRedirectComponent } from './pages/page-redirect/page-redirect.component';
import { PageNotfoundComponent } from './pages/page-notfound/page-notfound.component';
import { AcknowledgeNotificationsComponent } from './pages/acknowledge-notifications/acknowledge-notifications.component';
import { AripoNotificationsComponent } from './pages/aripo-notifications/aripo-notifications.component';
import { HagueNotificationsComponent } from './pages/aripo-notifications/hague-notifications.component';
import { MadridNotificationsComponent } from './pages/aripo-notifications/madrid-notifications.component';
import { OfficeNotificationsComponent } from './pages/aripo-notifications/office-notifications.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserAccountsComponent } from './pages/user-management/user-accounts/user-accounts.component';
import { UnitsPageComponent } from './pages/user-management/units/units-page.component';
import { CreateUnitComponent } from './pages/user-management/units/create-unit/create-unit.component';
import { GroupsComponent } from './pages/user-management/groups/groups.component';
import { GroupFormComponent } from './pages/user-management/groups/group-form/group-form.component';
import { BasicInfoFormComponent } from './pages/user-management/basic-info-form/basic-info-form.component';
import { ReviewStepComponent } from './pages/user-management/review-step/review-step.component';
import { CreateUserAccountComponent } from './pages/user-management/create-user-account/create-user-account.component';
import { WorkMonitorComponent } from './pages/task-management/work-monitor/work-monitor.component';
import { ViewBiblioGraphicData } from './pages/task-management/work-monitor/view-content/biblio-data/view-biblio-graphic-data';
import { RecordActionComponent } from './pages/task-management/work-monitor/view-content/record-action/record-action.component';
import { TaskHistoryComponent } from './pages/task-management/work-monitor/view-content/history/task-history.component';
import { ViewContentComponent } from './pages/task-management/work-monitor/view-content/view-content.component';
import { TasksDistributionComponent } from './pages/task-management/work-monitor/tasks-distribution/tasks-distribution.component';
import { AssignTasksComponent } from './pages/task-management/work-monitor/assign-tasks/assign-tasks.component';
import { MyPendingTasksComponent } from './pages/task-management/my-tasks/my-tasks.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { ChartNavbarComponent } from './pages/statistics/chart-navbar/chart-navbar.component';
import { TrendsComponent } from './pages/statistics/trends/trends.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { OriginsComponent } from './pages/statistics/origins/origins.component';
import { RenewalReminderComponent } from './pages/renewal-reminder/renewal-reminder.component';
import { JournalPublicationComponent } from './pages/journal-publication/journal-publication.component';
import { OnlinePublicationJournalComponent } from './pages/online-publication-journal/online-publication-journal.component';
import { FeeConfigComponent } from './pages/fee-config/fee-config.component';
import { CurrencyPipe } from '@angular/common';
import { FeeCalculatorComponent } from './pages/fee-calculator/fee-calculator.component';
import { SelectOfficeComponent } from './pages/data-packages/select-office/select-office.component';
import { DataPackagesComponent } from './pages/data-packages/data-packages.component';
import { AuthorityFilesComponent } from './pages/data-packages/authority-files/authority-files.component';
import { RecipientSystemsComponent } from './pages/data-exchange-config/recipient-systems/recipient-systems.component';
import { OriginatingOfficesComponent } from './pages/data-exchange-config/originating-offices/originating-offices.component';
import { DistributionRulesComponent } from './pages/data-exchange-config/distribution-rules/distribution-rules.component';
import { DataExchangeConfigComponent } from './pages/data-exchange-config/data-exchange-config.component';
import { AddExclusionRuleComponent } from './pages/data-exchange-config/add-exclusion-rule/add-exclusion-rule.component';
import { DataCaptureComponent } from './pages/data-capture/data-capture.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { PermissionDirective } from './_directives/permission.directive';
import { ModalComponent } from './components/modal/modal.component';
import { SignupComponent } from './pages/signup/signup.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { AuthCallbackComponent } from './pages/auth-callback/auth-callback.component';
import { AuthSignoutComponent } from './pages/auth-signout/auth-signout.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ForceChangePasswordComponent } from './pages/force-change-password/force-change-password.component';
import { ProcessActionsComponent } from './components/process-actions/process-actions.component';

const WipoThemePreset = definePreset(Aura, {
  primitive: {
    fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
    fontSize: '14px',
  },
  semantic: {
    primary: {
      50: '#e6f0f9',
      100: '#cce0f3',
      200: '#99c2e6',
      300: '#66a3da',
      400: '#3385cd',
      500: '#0067c0', // WIPO blue
      600: '#0052a3',
      700: '#003e87',
      800: '#00296a',
      900: '#00154e',
      950: '#000a32',
    },
    text: {
      fontWeight: '400',
      lineHeight: '1.5',
    },
    heading: {
      fontWeight: '600',
      lineHeight: '1.2',
      color: '#0067c0',
    },
  },
});

@NgModule({
  declarations: [
    PackageStatsComponent,
    CapitalizeWordsPipe,
    GlobalLoaderComponent,
    CompMenuBar,
    FilterChipsComponent,
    AppComponent,
    PageRedirectComponent,
    PageNotfoundComponent,
    NbFormatter,
    AuthCallbackComponent,
    AuthSignoutComponent,
    AppLayoutComponent,
    ToastComponent,
    ScrollerComponent,
    AppNavbarComponent,
    AppSidebarComponent,
    PlatformSelectionComponent,
    BreadcrumbsComponent,
    TableComponent,
    ConfigurableFilterBarComponent,
    AppWidgetComponent,
    UserStatsComponent,
    ConfigurableFilterComponent,
    TableCardComponent,
    AcknowledgeNotificationsComponent,
    AripoNotificationsComponent,
    HagueNotificationsComponent,
    MadridNotificationsComponent,
    OfficeNotificationsComponent,
    DashboardComponent,
    UserAccountsComponent,
    ProcessActionsComponent,
    UnitsTreeComponent,
    UnitDetailsComponent,
    UnitsPageComponent,
    UserSelectionDialogComponent,
    UnitActionsAssignmentComponent,
    CreateUnitComponent,
    GroupsComponent,
    ConfigurableStepperComponent,
    GroupFormComponent,
    GroupAssignmentComponent,
    BasicInfoFormComponent,
    ValidationErrorsComponent,
    ReviewStepComponent,
    CreateUserAccountComponent,
    WorkMonitorComponent,
    PanelHeaderIconsComponent,
    ViewBiblioGraphicData,
    RecordActionComponent,
    TaskHistoryComponent,
    ViewContentComponent,
    TasksDistributionComponent,
    AssignTasksComponent,
    MyPendingTasksComponent,
    ChartNavbarComponent,
    TrendsComponent,
    StatisticsComponent,
    OriginsComponent,
    MultipleStatsComponent,
    RenewalReminderComponent,
    JournalPublicationComponent,
    OnlinePublicationJournalComponent,
    FeeConfigComponent,
    FeeCalculatorComponent,
    SelectOfficeComponent,
    DataPackagesComponent,
    AuthorityFilesComponent,
    RecipientSystemsComponent,
    OriginatingOfficesComponent,
    DistributionRulesComponent,
    DataExchangeConfigComponent,
    AddExclusionRuleComponent,
    DataCaptureComponent,
    SignInComponent,
    PermissionDirective,
    ModalComponent,
    SignupComponent,
    UnauthorizedComponent,
    ForgotPasswordComponent,
    ForceChangePasswordComponent,
  ],
  imports: [
    Listbox,
    CurrencyPipe,
    EditorModule,
    ScrollTopModule,
    ToolbarModule,
    PopoverModule,
    ToggleSwitchModule,
    TreeModule,
    ScrollPanelModule,
    AccordionModule,
    ButtonGroupModule,
    TabViewModule,
    ProgressBarModule,
    PaginatorModule,
    RadioButtonModule,
    CheckboxModule,
    InputNumberModule,
    DatePickerModule,
    MultiSelectModule,
    CardModule,
    DropdownModule,
    BrowserModule,
    BrowserAnimationsModule,
    BlockUIModule,
    ProgressSpinnerModule,
    MenubarModule,
    SelectModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DataViewModule,
    TableModule,
    SidebarModule,
    MenuModule,
    ToastModule,
    BadgeModule,
    BreadcrumbModule,
    DividerModule,
    OverlayPanelModule,
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    TabsModule,
    DialogModule,
    ConfirmDialogModule,
    InputTextModule,
    TooltipModule,
    TagModule,
    AvatarModule,
    ChipModule,
    CalendarModule,

    HttpClientModule,
    // https://github.com/ngx-translate/core
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpBackend],
      },
    }),
    NgxEchartsModule.forRoot({ echarts }),
  ],
  providers: [
    /*
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AwsInterceptInterceptor,
      multi: true // false completely breaks the app, for some reason
    },
    */
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AddHeaderInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PlatformInterceptor,
      multi: true,
    },
    providePrimeNG({
      theme: {
        preset: WipoThemePreset,
        options: {
          prefix: 'p',
          darkModeSelector: '.app-dark',
        },
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
