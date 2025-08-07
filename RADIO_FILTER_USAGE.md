# Radio Filter Usage Guide

The configurable filter component now supports radio button filters. This allows users to select one option from a predefined list of choices.

## How to Use Radio Filters

### 1. Basic Configuration

Add a radio filter to your `FilterConfig[]` array:

```typescript
filterConfigs: FilterConfig[] = [
  {
    key: "userType",
    label: "User Type",
    type: "radio",
    options: [
      { label: "All Users", value: "all" },
      { label: "Administrators", value: "admin" },
      { label: "Regular Users", value: "regular" },
      { label: "Guest Users", value: "guest" }
    ],
    defaultValue: "all",
    section: "USER TYPE",
  }
];
```

### 2. Configuration Properties

- **key**: Unique identifier for the filter
- **label**: Display label for the filter group
- **type**: Must be `"radio"`
- **options**: Array of options with `label` and `value` properties
- **defaultValue**: The default selected value (optional)
- **section**: Group the filter belongs to (optional)

### 3. Example Implementations

#### User Management Example

```typescript
{
  key: "userType",
  label: "User Type",
  type: "radio",
  options: [
    { label: "All Users", value: "all" },
    { label: "Administrators", value: "admin" },
    { label: "Regular Users", value: "regular" },
    { label: "Guest Users", value: "guest" }
  ],
  defaultValue: "all",
  section: "USER TYPE",
}
```

#### Groups Management Example

```typescript
{
  key: "groupCategory",
  label: "Group Category",
  type: "radio",
  options: [
    { label: "All Categories", value: "all" },
    { label: "System Groups", value: "system" },
    { label: "Custom Groups", value: "custom" },
    { label: "Department Groups", value: "department" }
  ],
  defaultValue: "all",
  section: "GROUP CATEGORY",
}
```

### 4. Handling Filter Values

The radio filter will emit a `FilterValue` object with:

- `key`: The filter key
- `value`: The selected option value
- `type`: "radio"

Example filter value:

```typescript
{
  key: "userType",
  value: "admin",
  type: "radio"
}
```

### 5. Display in Filter Chips

Radio filters will display in filter chips showing the selected option label. For example:

- "User Type: Administrators"
- "Group Category: System Groups"

### 6. Styling

Radio filters are styled consistently with other filter types and include:

- Proper spacing and alignment
- Hover effects
- Accessible labels
- Responsive design

### 7. Best Practices

1. **Always provide a default value** to ensure the filter has a valid state
2. **Use descriptive labels** that clearly indicate what each option represents
3. **Group related radio filters** in the same section for better organization
4. **Keep options concise** - radio filters work best with 2-6 options
5. **Use meaningful values** that can be easily processed in your filter logic

### 8. Integration with Existing Filters

Radio filters work seamlessly with all other filter types:

- Checkboxes
- Multi-select dropdowns
- Single dropdowns
- Text inputs
- Number inputs
- Date inputs
- Date ranges

The filter component will handle the combination of different filter types automatically.
