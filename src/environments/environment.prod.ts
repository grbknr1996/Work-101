export const environment = {
  production: true,
  installedInstances: ["default", "asean"],
  env: "prod",
  appUrl: "https://wipopublish-webapp.ipobs.dev.web1.wipo.int",
  backendUrl: "https://api.wipopublish-webapp.ipobs.dev.web1.wipo.int",
  officeConfigs: {
    default: {
      name: "WIPO IP Portal",
      theme: {
        preset: "Aura",
        primary: "blue",
        surface: "slate",
        darkTheme: false,
      },
      availableLanguages: ["en", "fr"],
      defaultLanguage: "en",
      logo: "https://wipopublish-webapp.ipobs.dev.web1.wipo.int/assets/images/wipo-logo.png",
    },
    asean: {
      name: "ASEAN IP Portal",
      theme: {
        preset: "Lara",
        primary: "green",
        surface: "gray",
        darkTheme: false,
      },
      availableLanguages: ["en", "id", "ms", "vi", "th", "kh"],
      defaultLanguage: "en",
      logo: "https://wipopublish-webapp.ipobs.dev.web1.wipo.int/assets/images/asean-logo.png",
    },
  },
};
