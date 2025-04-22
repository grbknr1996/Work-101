// ANGULAR CORE

import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { providePrimeNG } from "primeng/config";
import Material from "@primeng/themes/material";

import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
  HttpBackend,
} from "@angular/common/http";

import { ButtonModule } from "primeng/button";
import { MenubarModule } from "primeng/menubar";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { BlockUIModule } from "primeng/blockui";
import { SelectModule } from "primeng/select";

// ENVIRONMENT

import { environment } from "../environments/environment";
import { instanceType } from "./utils";

// CACHE BUSTING

import cacheBusting from "../../assets-cache-busting.json";

// TRANSLATION

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { MultiTranslateHttpLoader } from "ngx-translate-multi-http-loader";

// https://github.com/ngx-translate/core
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpBackend) {
  return new MultiTranslateHttpLoader(http, [
    {
      prefix: "./assets" + "/i18n/" + instanceType() + "/",
      suffix: ".json?_=" + cacheBusting["i18n"],
      optional: true,
    },
    {
      prefix: "./assets" + "/i18n/" + "default" + "/",
      suffix: ".json?_=" + cacheBusting["i18n"],
    },
  ]);
}

import { NgxEchartsModule } from "ngx-echarts";
// import echarts core
import * as echarts from "echarts/core";
// import necessary echarts components
import { MapChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
echarts.use([MapChart, GridComponent, CanvasRenderer]);
import { TableModule } from "primeng/table";
import { CompMenuBar } from "./components/comp-nav-bar/comp-nav-bar.component";

import { NbFromater } from "./_pipes/nbformater.pipe";

// PAGES COMPONENTS

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";

import { PageRedirectComponent } from "./pages/page-redirect/page-redirect.component";
import { PageNotfoundComponent } from "./pages/page-notfound/page-notfound.component";

import { PageAboutComponent } from "./pages/page-about/page-about.component";

import { DataViewModule } from "primeng/dataview";
import { AddHeaderInterceptor } from "./_services/http-client";
import { definePreset } from "@primeng/themes";
import Aura from "@primeng/themes/aura";
import { AppSidebarComponent } from "./components/app-sidebar/app-sidebar.component";
import { AppNavbarComponent } from "./components/app-navbar/app-navbar.component";
import { AppLayoutComponent } from "./components/app-layout/app-layout.component";
import { TableComponent } from "./components/table/table.component";
import { BreadcrumbsComponent } from "./components/breadcrumbs/breadcrumbs.component";

const WipoThemePreset = definePreset(Aura, {
  primitive: {
    // Adding font family
    fontFamily: '"Montserrat", "Segoe UI", Roboto, Arial, sans-serif',
    fontSize: "14px",
  },
  semantic: {
    primary: {
      50: "#e6f0f9",
      100: "#cce0f3",
      200: "#99c2e6",
      300: "#66a3da",
      400: "#3385cd",
      500: "#0067c0", // WIPO blue
      600: "#0052a3",
      700: "#003e87",
      800: "#00296a",
      900: "#00154e",
      950: "#000a32",
    },

    text: {
      fontWeight: "400",
      lineHeight: "1.5",
      // You can add more typography settings here
    },
    heading: {
      fontWeight: "600",
      lineHeight: "1.2",
      color: "#0067c0",
    },
  },
});
@NgModule({
  declarations: [
    CompMenuBar,
    AppComponent,
    PageRedirectComponent,
    PageNotfoundComponent,
    PageAboutComponent,
    NbFromater,
  ],
  imports: [
    AppLayoutComponent,
    TableComponent,
    AppNavbarComponent,
    AppSidebarComponent,
    BrowserModule,
    BrowserAnimationsModule,
    ButtonModule,
    BlockUIModule,
    ProgressSpinnerModule,
    MenubarModule,
    SelectModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    DataViewModule,
    TableModule,
    BreadcrumbsComponent,
    // https://github.com/ngx-translate/core
    TranslateModule.forRoot({
      defaultLanguage: "en",
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpBackend],
      },
    }),
    NgxEchartsModule.forRoot({ echarts }),
  ],
  providers: [
    /*{
			provide: HTTP_INTERCEPTORS,
			useClass: AwsInterceptInterceptor,
			multi: true // false completely breaks the app, for some reason
		},*/
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AddHeaderInterceptor,
      multi: true,
    },
    providePrimeNG({
      theme: {
        preset: WipoThemePreset,
        options: {
          prefix: "p",
          darkModeSelector: ".app-dark",
        },
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
