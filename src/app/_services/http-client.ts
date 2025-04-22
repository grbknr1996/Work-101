import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse,
  } from '@angular/common/http';
  import { catchError, Observable, throwError } from 'rxjs';
  import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
  

  @Injectable()
  export class AddHeaderInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // Clone the request to add the new header
      if (req.url.includes(environment.backendUrl)){
        
        const clonedRequest = req.clone({ headers: req.headers.append('HashSearch', localStorage.getItem(`hashSearches`) || "")});
      
        // Pass the cloned request instead of the original request to the next handle
        return next.handle(clonedRequest).pipe(
            catchError((error: HttpErrorResponse) => {
                // Handle the error here
              /*  if(error.status == 401 && !error.url.includes('dbinfo')){
                    localStorage.removeItem(`hashSearches`)
                    window.location.reload();
                }
                    */
                //throw error as per requirement
                return throwError(error);
              })
        
        )
      }
      else{
        return next.handle(req);
      }
    }
  }