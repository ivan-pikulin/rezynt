# Header Component Changelog

## Builder Mode Support (November 2025)

### Breaking Changes
- **Default Step 2 Changed**: "Generate" (/chat) has been replaced with "Builder" (/builder) in default steps
- All pages now navigate to `/builder` instead of `/chat` for step 1

### New Features
- **Custom Steps Support**: Added `customSteps` prop to allow pages to display their own step labels instead of default resume creation steps
- **Navigation Arrows Control**: Added `hideNavigationArrows` prop to hide the < > navigation arrows when not needed
- **Builder Integration**: Builder now appears as default step 2 in main navigation flow

### New Props
```typescript
customSteps?: string[];           // Custom step labels (e.g., for builder)
hideNavigationArrows?: boolean;   // Hide < > navigation arrows
```

### Default Steps Update
**Old:**
1. Start
2. Generate (chat)
3. Refine
4. Export

**New:**
1. Start
2. Builder
3. Refine
4. Export

### Usage Example
```typescript
<Header 
  activeStep={currentStepIndex}
  customSteps={['Get Started', 'Contact Info', 'Work Experience', 'Education', 'Skills', 'Summary']}
  onStepClick={handleStepClick}
  allowFirstStepClick={true}
  hideNavigationArrows={true}
  showBackButton={false}
  showNextButton={false}
/>
```

### Changes
1. Default steps now use `builder` instead of `generate` for step 2
2. `getPreviousStepName()` updated to return "Builder" for step 2
3. Steps displayed = `customSteps || defaultSteps`
4. Navigation arrows respect `hideNavigationArrows` flag

### Affected Pages
- **StartPage**: Step click for index 1 navigates to `/builder`
- **RefinePage**: Step click for index 1 navigates to `/builder`, back button goes to `/builder`
- **ExportPage**: Step click for index 1 navigates to `/builder`
- **BuilderPage**: Uses custom 6-step navigation in header

### Use Cases
- **Resume Builder**: Display 6-step builder process with direct step navigation
- **Main Flow**: Builder replaces chat in main resume creation workflow
- **Custom Workflows**: Any multi-step process can use Header with custom steps
- **Flexible Navigation**: Control which navigation elements are shown

