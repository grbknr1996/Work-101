declare const CryptoJS: any;
const orig_key = '8?)i_~Nk6qv0IX;2';

let l = `utils() - `;

import path from 'path';
import ObjectID from 'bson-objectid';
import { environment } from 'src/environments/environment';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { ToastService } from './_services/toast.service';
import { MechanicsService } from './_services/mechanics.service';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './_services/auth.service';

export const instanceType = (): string => {
  // Get the current URL
  const currentUrl = window.location.pathname;

  // Split the path into segments
  const pathSegments = currentUrl.split('/');

  // URL structure is /:officeCode/:langCode/...
  // Office code is at position 1 if it exists
  if (pathSegments.length >= 2 && pathSegments[1]) {
    const possibleOffice = pathSegments[1];

    // Check if the first path segment is a valid office code
    if (environment.installedInstances.includes(possibleOffice)) {
      return possibleOffice;
    }
  }

  // Default to 'default' if no match found
  return 'default';
};

export const setPrevEnpoint = (v: string): void => {
  sessionStorage.setItem(`prev_enpoint`, v);
};

export const prevEndpoint = (): string => {
  return sessionStorage.getItem(`prev_enpoint`);
};

export const deduplicateStringArray = (input: string[]): string[] =>
  input.filter((item, pos, self) => self.indexOf(item) === pos);

export const decrypt = (crypted: any): any => {
  const l = `decrypt() - `;

  if (typeof crypted !== 'string') {
    // console.log(`${l}Data to decrypt = `, crypted)
    // console.log(`${l} - Data to decrypt is not a string, skipping`)
    return crypted;
  }

  // On Localhost, the data may not be encrypted, but the ResponseType is still "string", so we'll get a stringified JSON anyway. I need to simply parse it, without decryption

  let decrypted;

  try {
    decrypted = JSON.parse(crypted);
    console.log(decrypted);
    return decrypted;
  } catch (err) {
    // console.log(`${l}Could not parse response directly as JSON, attempting to decrypt it.`)
  }

  // console.time(`${l}decryption took`)

  let originalStringified: string;

  try {
    let key = CryptoJS.enc.Utf8.parse(
      orig_key + (localStorage.getItem(`hashSearches`) || '')
    );
    const bytes: any = CryptoJS.AES.decrypt(crypted, key, {
      mode: CryptoJS.mode.ECB,
    });

    originalStringified = bytes.toString(CryptoJS.enc.Utf8);

    // console.log(`${l}originalStringified=`, originalStringified)

    decrypted = JSON.parse(originalStringified);
  } catch (err) {
    // console.log(`${l}Could not JSON.parse decrypted content. Probably not an object. Sending back decrypted string as is.`)
  }

  // console.timeEnd(`${l}decryption took`)

  return decrypted || originalStringified;
};

export const deepClone = (obj, maxArrayLength = Infinity) => {
  // https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object

  const l = `utils.deepClone() - `;
  // console.log(`${l}deepcloning : `, obj)

  if (typeof structuredClone !== 'undefined') {
    return structuredClone(obj); // Native JS method, available in Node 17+
  }

  let copy;
  // console.log(`Deepcloning (reduce ${reduce})`);

  // Handle strings
  if (typeof obj === 'string') {
    return '' + obj;
  }

  // Handle the 3 simple types, and null or undefined
  if (!obj || `object` != typeof obj) {
    // console.log(`${l}passed object is not an object! typeof(obj)='${typeof(obj)}'`)

    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];

    const maxElems: number = Math.min(maxArrayLength, obj.length);

    for (let i = 0; i < maxElems; i++) {
      copy[i] = deepClone(obj[i], maxArrayLength);
    }

    if (maxArrayLength && obj.length > maxElems)
      copy.push(`(${obj.length - maxElems} more elements)`);

    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    const totalKeysCount = Object.keys(obj).length;
    const maxKeys: number = Math.min(maxArrayLength, totalKeysCount);
    let keysCount: number = 0;

    for (let attr in obj) {
      if (obj.hasOwnProperty(attr))
        copy[attr] = deepClone(obj[attr], maxArrayLength);
      keysCount++;
      if (maxArrayLength && keysCount > maxKeys) break;
    }

    if (maxArrayLength && totalKeysCount > maxKeys)
      copy['(Unshown keys)'] = totalKeysCount - maxKeys;

    return copy;
  }

  throw new Error(`Unable to copy obj! Its type isn't supported.`);
};

export const generateId = (): string =>
  ObjectID().toHexString().substring(20, 24); // The beginning of the 24 characters don't change. Only the last letter is incremented. I'm only keeping the last few characters so as to have shorter _id in the AdvancedSearch tree.

export const getImageDimensions = (
  src: string
): Promise<{ w: number; h: number }> => {
  return new Promise((resolved, rejected) => {
    const i = new Image();
    i.onload = () => {
      resolved({ w: i.width, h: i.height });
    };
    i.onerror = rejected;
    i.onabort = rejected;
    i.src = src; // can be a URL or base64
  });
};

const resizeCanvas = document.createElement('canvas');

export const resizeImage = async (
  image: HTMLImageElement | string,
  maxSideLength: number = Infinity
): Promise<string> => {
  const l = `utils resizeImage() - `;

  /*
		Accepts an HTMLImageElement or base64 as input
		Returns base64

		Resizing is optional, you can pass an HTMLImageElement and it will simply return its base64 without resizing
	*/

  if (typeof image === 'string') {
    // Converting Base64 into HTMLImageElement

    const base64Input = '' + image;

    image = <HTMLImageElement>new Image();

    await new Promise((resolve, reject) => {
      image = image as HTMLImageElement;
      image.onload = resolve;
      image.src = base64Input;
    });
  }

  if (image.height > maxSideLength || image.width > maxSideLength) {
    // Image is too big, it needs to be resized down

    resizeCanvas.width = resizeCanvas.height = 0 + maxSideLength;

    // set size proportional to image
    if (image.width > image.height) {
      resizeCanvas.height = resizeCanvas.width * (image.height / image.width);
    } else {
      resizeCanvas.width = resizeCanvas.height * (image.height / image.width);
    }
  } else {
    // I don't want to enlarge the image. If the image is smaller than the maximum set dimension, then I reduce the resizeCanvas to match the image.
    resizeCanvas.height = image.height;
    resizeCanvas.width = image.width;
  }

  // console.log(`\nresizeCanvas dimensions for resize : width = ${resizeCanvas.width}, height=${resizeCanvas.height}`);

  const ctx = resizeCanvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, resizeCanvas.width, resizeCanvas.height);

  const resizedBase64: string = resizeCanvas.toDataURL('image/png');

  // console.log(`${l} Resized Base64 length = `, resizedBase64.length)

  return resizedBase64;
};

/**
 * Handle HTTP errors and show appropriate toast messages
 */
export const handleError = (
  error: any, 
  operation: string, 
  toastService: ToastService,
  mechanicalService: MechanicsService): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';

    if (error.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        toastService.showError('Authentication Error', errorMessage);
    } else if (error.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
        toastService.showError('Permission Denied', errorMessage);
    } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
        toastService.showError('Not Found', errorMessage);
    } else if (error.status === 0) {
        errorMessage = 'Network error. Please check your connection.';
        toastService.showError('Network Error', errorMessage);
    } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
        toastService.showError('Server Error', errorMessage);
    } else {
        errorMessage =
            error.message || error.error?.message || 'Unknown error occurred';
        toastService.showError('Error', mechanicalService.translate(errorMessage));
    }

    console.error(`${operation} failed:`, error);
    return throwError(() => new Error(mechanicalService.translate(errorMessage)));
}

/**
 * Get the authorization headers with Bearer token
 */
export const getAuthHeaders = (authService: AuthService): Observable<HttpHeaders> => {
    return authService.getEncodedTokens().pipe(
        switchMap((tokens) => {
            const officeCode = authService.getCurrentOfficeCode();
            if (tokens && tokens.accessToken) {
                const headers = new HttpHeaders({
                    Authorization: `Bearer ${tokens.accessToken}`,
                    'Content-Type': 'application/json',
                    'wipo-platform-code': officeCode,
                });
                return of(headers);
            } else {
                console.error('No access token available');
                // Return headers without authorization - this will likely result in a 401
                const headers = new HttpHeaders({
                    'Content-Type': 'application/json',
                    'wipo-platform-code': officeCode,
                });
                return of(headers);
            }
        })
    );
}