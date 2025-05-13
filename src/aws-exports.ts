const officeCognitoConfig: Record<string, any> = {
  default: {
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
  asean: {
    region: "eu-central-1",
    userPoolId: "eu-central-1_aIn5Yy5c5",
    clientId: "2i1omm37jqd6pqke1l4brv2r0a",
    authority: "auth.iims.ipobs.dev.web1.wipo.int",
    redirectUrl: "https://localhost:4200/asean/fr",
    postLogoutRedirectUri: "https://localhost:4200",
    scope: "email im-api/im-access openid phone",
    responseType: "code",
  },
  // Add more offices as needed
};

export function getCognitoConfig(officeCode: string) {
  return officeCognitoConfig[officeCode] || officeCognitoConfig.default;
}
