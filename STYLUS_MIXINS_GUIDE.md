# Stylus Mixins Guide

This guide explains how to use the mixins added to `styles.styl` to reduce code
duplication and improve maintainability.

## Overview

Mixins have been added to `styles.styl` (starting at line 244) to consolidate
common CSS patterns. These mixins can significantly reduce the number of lines
in your stylesheet while making it more maintainable.

## Available Mixins

### Flexbox Mixins

#### `flex-center()`

Centers content both horizontally and vertically using flexbox.

```stylus
// Before:
display: flex
align-items: center
justify-content: center

// After:
flex-center()
```

#### `flex-between()`

Creates a flex container with space-between justification.

```stylus
// Before:
display: flex
align-items: center
justify-content: space-between

// After:
flex-between()
```

#### `flex-start()`

Creates a flex container with flex-start justification.

```stylus
// Before:
display: flex
align-items: center
justify-content: flex-start

// After:
flex-start()
```

#### `flex-end()`

Creates a flex container with flex-end justification.

```stylus
flex-end()
```

#### `flex-column()`

Creates a vertical flex container.

```stylus
// Before:
display: flex
flex-direction: column

// After:
flex-column()
```

#### `flex-row()`

Creates a horizontal flex container.

```stylus
flex-row()
```

#### `flex-center-column()`

Centers content in a vertical flex container.

```stylus
flex-center-column()
```

#### `flex-between-column()`

Space-between in a vertical flex container.

```stylus
flex-between-column()
```

### Positioning Mixins

#### `absolute-center()`

Centers an absolutely positioned element.

```stylus
// Before:
position: absolute
top: 50%
left: 50%
transform: translate(-50%, -50%)

// After:
absolute-center()
```

#### `absolute-full()`

Makes an element fill its parent (absolute positioning).

```stylus
absolute-full()
```

#### `fixed-full()`

Makes an element fill the viewport (fixed positioning).

```stylus
// Before:
position: fixed
top: 0
left: 0
right: 0
bottom: 0

// After:
fixed-full()
```

### Spacing Mixins

#### `spacing(vertical, horizontal)`

Sets padding with vertical and horizontal values.

```stylus
// Before:
padding: 1rem 1.5rem

// After:
spacing(1rem, 1.5rem)

// Single value:
spacing(1rem)  // padding: 1rem
```

#### `margin-center()`

Centers an element horizontally with auto margins.

```stylus
// Before:
margin: 0 auto

// After:
margin-center()
```

### Border Mixins

#### `border-radius(radius)`

Sets border radius with a default value.

```stylus
// Before:
border-radius: 4px

// After:
border-radius(4px)
// or use default:
border-radius()  // uses $theme-radius-md
```

#### `border-circle()`

Creates a circular border radius.

```stylus
// Before:
border-radius: 50%

// After:
border-circle()
```

#### `border-full()`

Creates a fully rounded border (9999px).

```stylus
border-full()
```

#### `border-theme(width, color)`

Creates a border with theme defaults.

```stylus
border-theme()  // uses defaults
border-theme(2px, $theme-color-primary)
```

### Transition Mixins

#### `transition-fast(property)`

Fast transition (0.2s).

```stylus
// Before:
transition: background-color 0.2s ease

// After:
transition-fast(background-color)
// or for all properties:
transition-fast()
```

#### `transition-base(property)`

Base transition (0.3s).

```stylus
transition-base(margin-left)
```

#### `transition-slow(property)`

Slow transition (0.7s).

```stylus
transition-slow()
```

#### `transition-bg()`

Transitions background-color specifically.

```stylus
// Before:
transition: background-color 0.2s ease

// After:
transition-bg()
```

#### `transition-color()`

Transitions color specifically.

```stylus
transition-color()
```

### Component Pattern Mixins

#### `card-style(padding, radius, shadow)`

Creates a card-style component.

```stylus
// Before:
padding: 1.5rem
border-radius: 4px
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
background-color: $theme-bg-primary

// After:
card-style($theme-spacing-2xl, 4px, 0 1px 3px rgba(0, 0, 0, 0.1))
```

#### `button-base(padding, radius)`

Base button styles.

```stylus
button-base()
```

#### `hover-bg(bg-color)`

Adds hover background color.

```stylus
// Before:
&:hover
  background-color: $theme-bg-hover

// After:
hover-bg()
// or with custom color:
hover-bg($sidebar-item-hover-bg)
```

#### `hover-color(color)`

Adds hover text color.

```stylus
hover-color()
hover-color($theme-color-primary)
```

### Text Mixins

#### `text-ellipsis()`

Truncates text with ellipsis.

```stylus
// Before:
overflow: hidden
text-overflow: ellipsis
white-space: nowrap

// After:
text-ellipsis()
```

#### `text-center()`

Centers text.

```stylus
text-center()
```

### Size Mixins

#### `size(width, height)`

Sets width and height (height defaults to width).

```stylus
// Before:
width: 2rem
height: 2rem

// After:
size(2rem)
// or different dimensions:
size(2rem, 3rem)
```

#### `square(size)`

Creates a square element.

```stylus
// Before:
width: 24px
height: 24px

// After:
square(24px)
```

### Overflow Mixins

#### `scrollable(direction)`

Makes an element scrollable.

```stylus
// Before:
overflow-y: auto

// After:
scrollable(y)
// or:
scrollable(x)  // overflow-x: auto
scrollable()   // overflow: auto
```

### Z-Index Mixins

#### `z-layer(layer)`

Sets z-index based on theme layers.

```stylus
// Before:
z-index: 999

// After:
z-layer(navbar)  // uses $theme-z-navbar

// Available layers:
z-layer(base)      // 1
z-layer(dropdown)  // 100
z-layer(sticky)    // 200
z-layer(fixed)     // 300
z-layer(modal)    // 500
z-layer(navbar)   // 999
z-layer(sidebar)  // 99
```

## Examples of Refactored Code

### Example 1: Navbar Component

```stylus
// Before (6 lines):
.navbar-start
  display: flex
  align-items: center

// After (1 line):
.navbar-start
  flex-start()
```

### Example 2: User Avatar

```stylus
// Before (8 lines):
.user-avatar
  width: 2rem
  height: 2rem
  background-color: var(--p-primary-color)
  color: $theme-color-white
  border-radius: $theme-radius-circle
  display: flex
  align-items: center
  justify-content: center

// After (5 lines):
.user-avatar
  square(2rem)
  background-color: var(--p-primary-color)
  color: $theme-color-white
  border-circle()
  flex-center()
```

### Example 3: Notification Item

```stylus
// Before (7 lines):
.notification-item
  padding: $theme-spacing-lg
  border-radius: $theme-radius-px-4
  margin-bottom: $theme-spacing-md
  transition: background-color $theme-transition-fast
  &:hover
    background-color: $theme-bg-hover

// After (4 lines):
.notification-item
  padding: $theme-spacing-lg
  border-radius($theme-radius-px-4)
  margin-bottom: $theme-spacing-md
  transition-bg()
  hover-bg()
```

### Example 4: Loading Overlay

```stylus
// Before (8 lines):
.loading-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background-color: rgba(0, 0, 0, 0.5)
  z-index: 9999
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center

// After (4 lines):
.loading-overlay
  fixed-full()
  background-color: rgba(0, 0, 0, 0.5)
  z-index: 9999
  flex-center-column()
```

## Benefits

1. **Reduced Code**: Each mixin replaces 2-8 lines of CSS
2. **Consistency**: Ensures consistent styling across components
3. **Maintainability**: Changes to common patterns only need to be made in one
   place
4. **Readability**: Mixin names are self-documenting
5. **Type Safety**: Using theme variables ensures consistency

## How to Continue Refactoring

1. Search for common patterns like:

   - `display: flex` + `align-items: center` + `justify-content: center`
   - `border-radius: 50%`
   - `transition: background-color 0.2s ease`
   - `overflow-y: auto`
   - `position: fixed` + `top: 0` + `left: 0` + `right: 0` + `bottom: 0`

2. Replace them with the appropriate mixins

3. Test to ensure styles remain the same

4. Continue iterating through the file

## Estimated Line Reduction

Based on the patterns found:

- ~49 instances of `display: flex` + `align-items: center` patterns → ~200 lines
  saved
- ~29 instances of `border-radius` → ~30 lines saved
- ~48 instances of `justify-content` patterns → ~100 lines saved
- Multiple transition patterns → ~50 lines saved
- Various other patterns → ~100 lines saved

**Total estimated reduction: ~480 lines** (from ~9100 to ~8620 lines)





