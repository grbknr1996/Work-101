# Data Exchange Configuration Service

This service provides functionality to authenticate with the data exchange API
and retrieve exclusion rules for data distribution.

## Features

- **Authentication**: Automatically handles Basic Auth to obtain access tokens
- **Token Management**: Caches access tokens and provides methods to clear them
- **Exclusion Rules**: Retrieves distribution exclusion rules with optional
  filtering
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Service Methods

### Authentication

#### `getAuthToken(): Observable<string>`

- **Private method** that handles Basic Auth authentication
- Uses credentials from environment configuration
- Returns an Observable with the access token
- Automatically stores the token in the service

#### `getAccessToken(): Observable<string>`

- **Private method** that returns cached token or authenticates if needed
- Returns cached token if available, otherwise calls `getAuthToken()`

#### `clearAccessToken(): void`

- Clears the stored access token
- Useful for logout or token refresh scenarios

### Exclusion Rules

#### `getExclusionRules(filters?: ExclusionRuleFilters): Observable<ExclusionRule[]>`

- Retrieves exclusion rules with optional filtering
- Automatically handles authentication
- Returns an Observable with an array of exclusion rules

#### `getExclusionRulesByFilters(recipientClientId: string, ipCategory: string, originatingOfficeCode: string): Observable<ExclusionRule[]>`

- Convenience method for getting exclusion rules with specific filters
- Parameters:
  - `recipientClientId`: The recipient client identifier
  - `ipCategory`: IP category (e.g., 'patent', 'trademark')
  - `originatingOfficeCode`: Office code (e.g., 'JP', 'US')

#### `getAllExclusionRules(): Observable<ExclusionRule[]>`

- Retrieves all exclusion rules without any filters
- Useful for getting a complete overview

### Legacy Methods (Backward Compatibility)

#### `getDataExchangeData(requesterClientId: string, ipCategory: string, originatingOfficeCode: string): Observable<ExclusionRule[]>`

- Legacy method that now uses the new service implementation
- Returns the same data as `getExclusionRulesByFilters`

## Data Interfaces

### `AuthTokenResponse`

```typescript
interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}
```

### `ExclusionRule`

```typescript
interface ExclusionRule {
  IP_RIGHTS_GRANTED: boolean;
  RECIPIENT_NAME: string;
  SK: string;
  PUBLISH_DOCUMENTS: boolean;
  ORIGINATING_OFFICE_CODE: string;
  APPLICATION_PUBLISHED: boolean;
  PK: string;
  IP_CATEGORY: string;
  DOCUMENT_LIST: any[];
  ORIGINATING_OFFICE_NAME: string;
}
```

### `ExclusionRuleFilters`

```typescript
interface ExclusionRuleFilters {
  Recipient_ClientID?: string;
  ipCategory?: string;
  originatingOfficeCode?: string;
}
```

## Usage Examples

### Basic Usage in Component

```typescript
import { Component, OnInit } from '@angular/core';
import { DataExchangeConfigService } from '../_services/data-exchange-config.service';
import { ExclusionRule } from '../interfaces';

@Component({
  selector: 'app-example',
  template: '<div>Rules: {{ rules.length }}</div>',
})
export class ExampleComponent implements OnInit {
  rules: ExclusionRule[] = [];

  constructor(private dataExchangeService: DataExchangeConfigService) {}

  ngOnInit(): void {
    // Get all exclusion rules
    this.dataExchangeService.getAllExclusionRules().subscribe({
      next: rules => {
        this.rules = rules;
        console.log('Loaded rules:', rules);
      },
      error: error => {
        console.error('Error loading rules:', error);
      },
    });
  }
}
```

### Using Filters

```typescript
// Get rules with specific filters
this.dataExchangeService
  .getExclusionRulesByFilters(
    '7bnv35u5b6j6mk5pnfb65jqqe6', // Recipient Client ID
    'patent', // IP Category
    'JP' // Originating Office Code
  )
  .subscribe({
    next: rules => {
      console.log('Filtered rules:', rules);
    },
    error: error => {
      console.error('Error:', error);
    },
  });
```

### Custom Filters Object

```typescript
const filters = {
  Recipient_ClientID: '7bnv35u5b6j6mk5pnfb65jqqe6',
  ipCategory: 'patent',
  originatingOfficeCode: 'JP',
};

this.dataExchangeService.getExclusionRules(filters).subscribe({
  next: rules => {
    console.log('Custom filtered rules:', rules);
  },
});
```

### Token Management

```typescript
// Subscribe to token changes
this.dataExchangeService.accessToken$.subscribe(token => {
  if (token) {
    console.log('Token available:', token.substring(0, 20) + '...');
  } else {
    console.log('No token available');
  }
});

// Clear token (e.g., on logout)
this.dataExchangeService.clearAccessToken();
```

## Configuration

The service uses the following environment variables:

```typescript
// src/environments/environment.ts
export const environment = {
  authApiUsername: 'your-username',
  authApiPassword: 'your-password',
  authApi: '/auth/',
  dataServicesApi: '/data-services/',
  // ... other config
};
```

## Proxy Configuration

The service works with the proxy configuration in `proxy.conf.json`:

```json
{
  "/auth": {
    "target": "https://auth.iims.ipobs.dev.web1.wipo.int/oauth2/token",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/data-services": {
    "target": "https://v0wm0dexcf.execute-api.eu-central-1.amazonaws.com/dev",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## Error Handling

The service includes comprehensive error handling:

- **Authentication errors**: Logged and re-thrown with user-friendly messages
- **API errors**: Logged and re-thrown with context
- **Network errors**: Handled gracefully with appropriate error messages

## Security Notes

- Access tokens are stored in memory only (BehaviorSubject)
- Credentials are encoded using Base64 for Basic Auth
- No sensitive data is logged to console
- Tokens are automatically included in subsequent API calls

## Testing

The service includes a demo component (`DataExchangeDemoComponent`) that
demonstrates:

- Authentication status display
- Token management (clear/refresh)
- Filtered and unfiltered rule retrieval
- Error handling and loading states
- Real-time UI updates

To use the demo component, add it to your routing or include it in another
component.





