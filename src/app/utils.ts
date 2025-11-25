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
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
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
  mechanicalService: MechanicsService
): Observable<never> => {
  // Prefer server-provided i18n key if available
  const serverKey: string | undefined =
    error?.error?.i18nKey || error?.error?.messageKey;

  // Title keys by status
  let titleKey = 'common.components.modal.information';
  if (error?.status === 403) {
    titleKey = 'unauthorized.title'; // Access Denied
  }
  let messageKeyOrText: string = '';

  if (serverKey) {
    messageKeyOrText = serverKey;
  } else if (error?.status === 403) {
    messageKeyOrText = 'error.response.code.message.403';
  } else if (error?.status === 404) {
    messageKeyOrText = 'error.response.code.message.404';
  } else if (error?.status === 0) {
    // No direct key in en.json; keep readable text, still pass through translate()
    messageKeyOrText = 'error.response.code.message.0';
  } else if (error?.status >= 500) {
    messageKeyOrText = 'error.response.code.message.500';
  } else if (error?.status === 401) {
    messageKeyOrText = 'error.response.code.message.401';
  } else {
    messageKeyOrText =
      error?.error?.message || error?.message || 'Unknown error occurred';
  }

  const translatedTitle =
    mechanicalService.translate(titleKey) || 'Information';
  const translatedMessage = mechanicalService.translate(messageKeyOrText);

  toastService.showError(translatedTitle, translatedMessage);

  console.error(`${operation} failed:`, error);
  return throwError(() => new Error(translatedMessage));
};

/**
 * Get the authorization headers with Bearer token
 */

const WipoThemePreset = definePreset(Aura, {
  primitive: {
    fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
    fontSize: '12px',
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
export function getOfficeThemePreset(officeCode: string) {
  console.log('🎨 Theme Preset Selection:', {
    detectedOfficeCode: officeCode,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
  });

  const officePresets: { [key: string]: any } = {
    // ---------------- BN – Brunei (Royal Blue + Gold)
    bn: definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#eef5ff',
          100: '#d9e7ff',
          200: '#b0ceff',
          300: '#7ab0ff',
          400: '#3a8cff',
          500: '#0057B8', // Brunei Royal Blue
          600: '#004699',
          700: '#003374',
          800: '#002350',
          900: '#001226',
          950: '#000915',
        },
        heading: { fontWeight: '600', lineHeight: '1.2', color: '#0057B8' },
        text: { fontWeight: '400', lineHeight: '1.5' },
      },
    }),

    // ---------------- BR – Brazil INPI (Brazil Blue)
    br: definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#e7f3ff',
          100: '#cfe7ff',
          200: '#9fcfff',
          300: '#6fb6ff',
          400: '#3f9aff',
          500: '#0072CE', // INPI Blue
          600: '#0059a3',
          700: '#00417a',
          800: '#002a52',
          900: '#00152a',
          950: '#000a16',
        },
        heading: { color: '#0072CE', fontWeight: '600', lineHeight: '1.2' },
        text: { fontWeight: '400', lineHeight: '1.5' },
      },
    }),

    // ---------------- BT – Bhutan (Existing)
    bt: definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#e6f0f9',
          100: '#cce0f3',
          200: '#99c2e6',
          300: '#66a3da',
          400: '#3385cd',
          500: '#0038A8',
          600: '#002a7a',
          700: '#001f5c',
          800: '#00153d',
          900: '#000a1f',
          950: '#000510',
        },
        heading: { color: '#0038A8', fontWeight: '600', lineHeight: '1.2' },
        text: { fontWeight: '400', lineHeight: '1.5' },
      },
    }),

    // ---------------- CV – Cabo Verde (CV Flag Blue)
    cv: definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#eff4ff',
          100: '#d6e4ff',
          200: '#adc9ff',
          300: '#7eacff',
          400: '#4b8bff',
          500: '#003DA5', // CV Blue
          600: '#002f84',
          700: '#002162',
          800: '#00153f',
          900: '#000a21',
          950: '#000511',
        },
        heading: { color: '#003DA5', fontWeight: '600' },
        text: { fontWeight: '400', lineHeight: '1.5' },
      },
    }),

    // ---------------- IN – India IPO Blue
    in: definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#ecf6ff',
          100: '#d1e9ff',
          200: '#a3d3ff',
          300: '#75bcff',
          400: '#479eff',
          500: '#005CA9', // IPO India Blue
          600: '#004a86',
          700: '#003663',
          800: '#002340',
          900: '#001020',
          950: '#000810',
        },
        heading: { color: '#005CA9', fontWeight: '600' },
        text: { fontWeight: '400', lineHeight: '1.5' },
      },
    }),

    // ---------------- KH-MOC – Cambodia (Existing KH Blue)
    'kh-moc': definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#e6ebf4',
          100: '#ccd7e9',
          200: '#99afd3',
          300: '#6687bd',
          400: '#335fa7',
          500: '#032E82',
          600: '#022568',
          700: '#021c4e',
          800: '#011234',
          900: '#01091a',
          950: '#00040d',
        },
        heading: { color: '#032E82', fontWeight: '600' },
        text: { fontWeight: '400', lineHeight: '1.5' },
      },
    }),

    // ---------------- LA – Laos (Laos Flag Blue)
    la: definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#ecf2ff',
          100: '#d1e0ff',
          200: '#a4c2ff',
          300: '#78a3ff',
          400: '#4b82ff',
          500: '#002F6C', // Laos Navy Blue
          600: '#002453',
          700: '#001a3d',
          800: '#001125',
          900: '#000813',
          950: '#00040a',
        },
        heading: { color: '#002F6C', fontWeight: '600' },
        text: { fontWeight: '400', lineHeight: '1.5' },
      },
    }),

    // ---------------- MY – Malaysia (Malaysian Blue)
    my: definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#eef5ff',
          100: '#d8e8ff',
          200: '#b2d1ff',
          300: '#85b7ff',
          400: '#5698ff',
          500: '#0033A0', // Malaysia Royal Blue
          600: '#00277f',
          700: '#001d5e',
          800: '#00123c',
          900: '#00091f',
          950: '#00040e',
        },
        heading: { color: '#0033A0' },
        text: { fontWeight: '400', lineHeight: '1.5' },
      },
    }),

    // ---------------- PH – Philippines (Existing)
    ph: definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#e6edf7',
          100: '#ccdbf0',
          200: '#99b7e1',
          300: '#6693d2',
          400: '#336fc3',
          500: '#0038A8',
          600: '#002a7a',
          700: '#001f5c',
          800: '#00153d',
          900: '#000a1f',
          950: '#000510',
        },
        heading: { color: 'black' },
        text: { fontWeight: '400' },
      },
    }),

    // ---------------- SG – Singapore (Teal Green)
    sg: definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#e6f7f4',
          100: '#ccf0ea',
          200: '#99e0d5',
          300: '#66d1c0',
          400: '#33c2ab',
          500: '#00998C', // IPOS Teal
          600: '#007a70',
          700: '#005c54',
          800: '#003d38',
          900: '#001f1c',
          950: '#000f0e',
        },
        heading: { color: '#00998C' },
        text: { fontWeight: '400' },
      },
    }),

    // ---------------- TH – Thailand (Thai Blue)
    th: definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#eef4ff',
          100: '#d9e7ff',
          200: '#b4ceff',
          300: '#88b2ff',
          400: '#5a94ff',
          500: '#00247D', // Thai Royal Blue
          600: '#001d63',
          700: '#001447',
          800: '#000c2d',
          900: '#000616',
          950: '#00030b',
        },
        heading: { color: '#00247D' },
        text: { fontWeight: '400' },
      },
    }),

    // ---------------- VC – St. Vincent (Existing)
    vc: definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#e8ecf5',
          100: '#d1d9eb',
          200: '#a3b3d7',
          300: '#758dc3',
          400: '#4767af',
          500: '#0067c0',
          600: '#182e6e',
          700: '#122252',
          800: '#0c1636',
          900: '#060a1a',
          950: '#03050d',
        },
        heading: { color: '#0067c0', fontWeight: '600' },
      },
    }),

    // ---------------- VN – Vietnam (Vietnam Red)
    vn: definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#ffecec',
          100: '#ffd8d8',
          200: '#ffb1b1',
          300: '#ff8a8a',
          400: '#ff5959',
          500: '#DA251D', // Vietnam Red
          600: '#b51f18',
          700: '#8c1812',
          800: '#5c100c',
          900: '#2f0806',
          950: '#150303',
        },
        heading: { color: '#DA251D' },
        text: { fontWeight: '400' },
      },
    }),

    // ---------------- XX – WIPO (WIPO Blue)
    xx: definePreset(Aura, {
      primitive: {
        fontFamily: '"Noto Sans", "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '12px',
      },
      semantic: {
        primary: {
          50: '#e7f3ff',
          100: '#d0e7ff',
          200: '#a1ceff',
          300: '#72b6ff',
          400: '#4099ff',
          500: '#005C9E', // WIPO Label Blue
          600: '#00497c',
          700: '#00365b',
          800: '#00243c',
          900: '#00111d',
          950: '#00090f',
        },
        heading: { color: '#005C9E' },
        text: { fontWeight: '400' },
      },
    }),
  };

  const selectedPreset = officePresets[officeCode] || WipoThemePreset;
  console.log('officecode########^^^', officeCode);
  const presetName = officePresets[officeCode]
    ? officeCode.toUpperCase()
    : 'WIPO (default)';

  // Extract color values for logging (accessing the preset definition)
  const presetDef = officePresets[officeCode] || {
    semantic: {
      primary: { 500: '#0067c0' },
      heading: { color: '#0067c0' },
    },
  };
  const primaryColor = (presetDef as any)?.semantic?.primary?.[500] || 'N/A';
  const headingColor = (presetDef as any)?.semantic?.heading?.color || 'N/A';

  console.log('✅ Theme Preset Applied:', {
    officeCode: officeCode,
    presetName: presetName,
    primaryColor: primaryColor,
    headingColor: headingColor,
    isCustomPreset: !!officePresets[officeCode],
    availableOffices: Object.keys(officePresets).join(', '),
  });

  return selectedPreset;
}
