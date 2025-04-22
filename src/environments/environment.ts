// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  installedInstances: ["default", "asean"],
  env: "localhost",
  appUrl: "http://localhost:4200",
  backendUrl: "https://api.wipopublish-webapp-dev.ipobs.dev.web1.wipo.int",
};

export const configuration = {
  default: {
    name: "WIPO IPAS Central",
    logo: "/assets/images/wipo-logo.png",
    module: {
      edms: true,
      patents: true,
      designs: true,
      trademarks: true,
      datacoverage: true,
      gidatabase: true,
      portfolios: true,
    },
    order: ["patents", "designs", "trademarks", "gidatabase", "portfolios"],
    availableLangs: ["ar", "en", "fr", "id", "jp", "kh", "ms", "vi"],
    defaultLanguage: "en",
    defaultLandingModule: "about",
  },
  asean: {
    name: "ASEAN",
    logo: "/assets/images/asean-logo.png",
    module: {
      edms: true,
      patents: true,
      designs: true,
      trademarks: true,
      datacoverage: true,
      gidatabase: true,
      portfolios: true,
    },
    order: ["patents", "designs", "trademarks", "gidatabase", "portfolios"],
    availableLangs: ["ar", "en", "fr", "id", "jp", "kh", "ms", "vi"],
    defaultLanguage: "fr",
    defaultLandingModule: "about",
  },
};
