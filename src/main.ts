/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { Amplify } from "@aws-amplify/core";
import awsconfig from "./aws-exports";
import { AppModule } from "./app/app.module";

Amplify.configure(awsconfig);

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
