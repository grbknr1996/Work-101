import { Response } from 'express';

export interface Bucket {
  val: string | number; // "Registered" , "RHUM RARE, RARE RHUM, RUM RARE, RARE RUM"
  count: number;
  count2?: number;
}

export interface ResponeData {
  isArray?: boolean;
  payload?: [];
}

/*

	 ╦╦ ╦╔╦╗
	 ║║║║ ║ 
	╚╝╚╩╝ ╩ 

*/

enum Scope {
  Openid = 'openid',
  Profile = 'profile',
  Email = 'email',
}
export interface DecodedJwt {
  sub: string;
  cts: string;
  auth_level: number;
  auditTrackingId: string;
  iss: string;
  tokenName: string;
  token_type: string;
  authGrantId: string;
  nonce: string;
  aud: string;
  nbf: number;
  grant_type: string;
  scope: [Scope];
  auth_time: number;
  realm: string;
  exp: number;
  iat: number;
  expires_in: number;
  jti: string;
  loa: string;
}

/*

	╔═╗╦ ╦╔═╗  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗
	╠═╣║║║╚═╗  ║║║║ ║ ║╣ ╠╦╝╠╣ ╠═╣║  ║╣ ╚═╗
	╩ ╩╚╩╝╚═╝  ╩╝╚╝ ╩ ╚═╝╩╚═╚  ╩ ╩╚═╝╚═╝╚═╝


*/

export interface LambdaResponse {
  statusCode: number;
  headers: {
    'Access-Control-Allow-Headers': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Methods': string;
  };
  body: string | object;
  isBase64Encoded: boolean;
}

export interface QueryStringParameters {
  [key: string]: string;
}

export interface HttpHeaders {
  [key: string]: string;
}

export interface ApiGatewayEvent {
  resource: string;
  path: string;
  httpMethod: string;
  headers: HttpHeaders;
  multiValueHeaders: any;
  queryStringParameters: any;
  multiValueQueryStringParameters: QueryStringParameters;
  pathParameters: string;
  stageVariables: string;
  requestContext: any;
  body: string;
  isBase64Encoded: boolean;
}
export interface ModulePermission {
  moduleId: string;
  moduleName: string;
  moduleIcon: string;
  moduleRoute: string;
  requiredPermissions: string[];
  permissionSetId: string;
  subModules?: ModulePermission[];
}

export interface DashboardWidget {
  id: string;
  title: string;
  icon: string;
  requiredPermissions: string[];
  items: DashboardWidgetItem[];
  showBadge?: boolean;
  badge?: string;
}
export interface DashboardWidgetItem {
  icon: string;
  label: string;
  link: string;
  requiredPermissions: string[];
}

// Data Exchange Configuration Interfaces
export interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface ExclusionRule {
  recipientClientId: string;
  recipientCode: string;
  recipientName: string;
  ipCategory: string;
  originatingOfficeCode: string;
  originatingOfficeName: string;
  unpublishedApplication: boolean;
  documentList: string[];
  eventCodes: string[];
  updatedOn: string;
}

export interface DataExchangeResponse {
  message: string;
  data: ExclusionRule[];
}

export interface ExclusionRuleFilters {
  Recipient_ClientID?: string;
  ipCategory?: string;
  originatingOfficeCode?: string;
}
