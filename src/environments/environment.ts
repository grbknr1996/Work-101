export const environment = {
  installedInstances: ["default", "asean", "kh", "kh-moc", "jp", "sg", "bt"],
  env: "localhost",
  appUrl: "http://localhost:4200",
  backendUrl: "https://api.wipopublish-webapp-dev.ipobs.dev.web1.wipo.int",
};

export interface CognitoConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  authority: string;
  redirectUrl: string;
  postLogoutRedirectUri: string;
  scope: string;
  responseType: string;
}

export const configuration = {
  default: {
    name: "WIPO IPAS Central",
    officeCode: "default",
    logo: "/assets/images/wipo-logo.png",
    availableLangs: ["ar", "en", "fr", "id", "jp", "kh", "ms", "vi"],
    defaultLanguage: "en",
    defaultLandingModule: "dashboard",
    cognito: {
      region: "eu-central-1",
      userPoolId: "eu-central-1_aIn5Yy5c5",
      clientId: "7vp4nvcrpsttatcg8lf7cds7g4",
      authority: "auth.iims.ipobs.dev.web1.wipo.int",
      redirectUrl: "https://localhost:4200/default/en/dashboard",
      postLogoutRedirectUri: "https://localhost:4200",
      scope:
        "aws.cognito.signin.user.admin email im-api/im-access openid profile",
      responseType: "code",
    },
  },
  asean: {
    name: "ASEAN",
    officeCode: "asean",
    logo: "/assets/images/asean-logo.png",
    availableLangs: ["ar", "en", "fr", "id", "jp", "kh", "ms", "vi"],
    defaultLanguage: "fr",
    defaultLandingModule: "dashboard",
    // cognito: {
    //   region: 'eu-central-1',
    //   userPoolId: 'eu-central-1_aIn5Yy5c5',
    //   clientId: '2i1omm37jqd6pqke1l4brv2r0a',
    //   authority: 'auth.iims.ipobs.dev.web1.wipo.int',
    //   redirectUrl: 'https://localhost:4200/asean/fr',
    //   postLogoutRedirectUri: 'https://localhost:4200',
    //   scope:
    //     'aws.cognito.signin.user.admin email im-api/im-access openid profile',
    //   responseType: 'code',
    // },
    cognito: {
      region: "eu-central-1",
      userPoolId: "eu-central-1_eHUXOp3ra",
      clientId: "1dh7vob23eetq87sbeapsc8g4m",
      authority: "eu-central-1ehuxop3ra.auth.eu-central-1.amazoncognito.com",
      redirectUrl: "https://localhost:4200/asean/fr",
      postLogoutRedirectUri: "https://localhost:4200",
      scope: "aws.cognito.signin.user.admin email openid profile",
      responseType: "code",
    },
  },
  "kh-moc": {
    name: "KH MOC",
    officeCode: "kh-moc",
    logo: "/assets/images/kh-moc-logo.png",
    availableLangs: ["ar", "en", "fr", "id", "jp", "kh", "ms", "vi"],
    defaultLanguage: "fr",
    defaultLandingModule: "dashboard",
  },
  kh: {
    name: "KH",
    officeCode: "kh",
    logo: "/assets/images/kh-logo.png",
    availableLangs: ["ar", "en", "fr", "id", "jp", "kh", "ms", "vi"],
    defaultLanguage: "fr",
    defaultLandingModule: "dashboard",
    cognito: {
      region: "eu-central-1",
      userPoolId: "eu-central-1_eHUXOp3ra",
      clientId: "67ja72pqjths4dlltkgfglt0rr",
      authority: "eu-central-1ehuxop3ra.auth.eu-central-1.amazoncognito.com",
      redirectUrl: "https://localhost:4200/kh/fr",
      postLogoutRedirectUri: "https://localhost:4200/kh/fr/logged-out",
      scope: "aws.cognito.signin.user.admin email openid profile",
      responseType: "code",
    },
  },
  bt: {
    name: "Ministry of Industry,<br/> Commerce and Employment <br/> (MoICE)",
    officeCode: "bt",
    logo: "/assets/images/bt-logo.jpeg",
    availableLangs: ["ar", "en", "fr", "id", "jp", "kh", "ms", "vi"],
    defaultLanguage: "en",
    defaultLandingModule: "dashboard",
    cognito: {
      region: "eu-central-1",
      userPoolId: "eu-central-1_aIn5Yy5c5",
      clientId: "4do4levt2p1nt7lamebp96u0gp",
      authority: "auth.iims.ipobs.dev.web1.wipo.int",
      redirectUrl: "https://localhost:4200/bt/en",
      postLogoutRedirectUri: "https://localhost:4200",
      scope:
        "aws.cognito.signin.user.admin email im-api/im-access openid profile",
      responseType: "code",
    },
  },
  // Additional WIPO offices
  au: {
    name: "IP Australia",
    officeCode: "au",
    logo: "/assets/images/au-logo.png",
    availableLangs: ["en"],
    defaultLanguage: "en",
    defaultLandingModule: "dashboard",
  },
  br: {
    name: "INPI Brazil",
    officeCode: "br",
    logo: "/assets/images/br-logo.png",
    availableLangs: ["en", "pt"],
    defaultLanguage: "pt",
    defaultLandingModule: "dashboard",
  },
  ca: {
    name: "CIPO Canada",
    officeCode: "ca",
    logo: "/assets/images/ca-logo.png",
    availableLangs: ["en", "fr"],
    defaultLanguage: "en",
    defaultLandingModule: "dashboard",
  },
  cn: {
    name: "CNIPA China",
    logo: "/assets/images/cn-logo.png",
    availableLangs: ["en", "zh"],
    defaultLanguage: "zh",
    defaultLandingModule: "dashboard",
  },

  jp: {
    name: "JPO Japan",
    officeCode: "jp",
    logo: "/assets/images/jp-logo.png",
    availableLangs: ["en", "jp"],
    defaultLanguage: "jp",
    defaultLandingModule: "dashboard",
  },

  sg: {
    name: "IPOS Singapore",
    officeCode: "sg",
    logo: "/assets/images/sg-logo.png",
    availableLangs: ["en", "zh", "ms", "ta"],
    defaultLanguage: "en",
    defaultLandingModule: "dashboard",
  },
  th: {
    name: "DIP Thailand",
    officeCode: "th",
    logo: "/assets/images/th-logo.png",
    availableLangs: ["en", "th"],
    defaultLanguage: "th",
    defaultLandingModule: "dashboard",
  },

  vn: {
    name: "IP Vietnam",
    officeCode: "vn",
    logo: "/assets/images/vn-logo.png",
    availableLangs: ["en", "vi"],
    defaultLanguage: "vi",
    defaultLandingModule: "dashboard",
  },

  sa: {
    name: "SAIP Saudi Arabia",
    officeCode: "sa",
    logo: "/assets/images/sa-logo.png",
    availableLangs: ["en", "ar"],
    defaultLanguage: "ar",
    defaultLandingModule: "dashboard",
  },

  vc: {
    name: "CIPO St. Vincent & Grenadines",
    officeCode: "vc",
    logo: "/assets/images/vc-logo.png",
    availableLangs: ["en"],
    defaultLanguage: "en",
    defaultLandingModule: "dashboard",
  },
};
