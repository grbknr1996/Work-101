import { Response } from "express"

export interface Bucket {
	val: string | number;    // "Registered" , "RHUM RARE, RARE RHUM, RUM RARE, RARE RUM"
	count: number;
	count2?: number;
}

export interface ResponeData{
	isArray?: boolean,
	payload?: []
}

/*

	 ╦╦ ╦╔╦╗
	 ║║║║ ║ 
	╚╝╚╩╝ ╩ 

*/



enum Scope {
	Openid = 'openid',
	Profile = 'profile',
	Email = 'email'
}
export interface DecodedJwt {
	sub: string;
	cts: string;
	auth_level: number;
	auditTrackingId: string;
	iss: string;
	tokenName: string;
	token_type: string
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
	expires_in: number,
	jti: string,
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
		'Access-Control-Allow-Headers': string,
		'Access-Control-Allow-Origin': string,
		'Access-Control-Allow-Methods': string
	}
	body: string | object;
	isBase64Encoded: boolean;
}

export interface QueryStringParameters {
	[key: string]: string
}

export interface HttpHeaders {
	[key: string]: string
}

export interface ApiGatewayEvent {
	resource: string,
	path: string,
	httpMethod: string,
	headers: HttpHeaders,
	multiValueHeaders: any,
	queryStringParameters: any,
	multiValueQueryStringParameters: QueryStringParameters,
	pathParameters: string,
	stageVariables: string,
	requestContext: any,
	body: string,
	isBase64Encoded: boolean
}
