//ANGULAR CORE
import { Injectable, PLATFORM_ID, inject } from "@angular/core";

//ANGULAR COMMON - HELPER
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: 'root'
})

export class UtilityService {

  //PROPERTY DECLARATION
  private platformId = inject(PLATFORM_ID);

  findPixelRatio(): number { return isPlatformBrowser(this.platformId)? (window.devicePixelRatio * 4) : 4; }
}