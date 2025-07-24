# Project Structure Guidelines

This project follows a feature-first architecture approach while maintaining shared resources.

## Directory Structure

```
src/
├── features/            # Feature-based modules
│   ├── auth/            # Authentication feature
│   │   ├── components/  # Components specific to auth
│   │   ├── hooks/       # Hooks specific to auth
│   │   ├── pages/       # Auth-related pages
│   │   └── services/    # Auth-related services
│   └── familyTree/      # Family tree feature
│       ├── components/  # Components specific to family tree
│       ├── hooks/       # Hooks specific to family tree
│       └── pages/       # Family tree pages
├── shared/              # Shared resources across features
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Shared custom hooks
│   ├── services/        # Shared services
│   ├── types/           # Shared TypeScript types
│   ├── theme/           # Application theming
│   ├── i18n/            # Internationalization
│   └── context/         # Shared React contexts
└── App.tsx              # Application entry point
```

## Guidelines

1. **Feature-First Organization:**
   - Group related functionality by feature
   - Each feature contains its own components, hooks, services, etc.
   - Features should be self-contained as much as possible

2. **Shared Resources:**
   - Place truly reusable components in `shared/components`
   - Only create shared resources when they're used by multiple features
   - Avoid circular dependencies between features

3. **Importing Rules:**
   - Features can import from `shared/*`
   - Features should not import from other features directly
   - Shared resources should not import from features

4. **API Calls:**
   - Make all API calls via service modules
   - Use services/api.ts for API communication

5. **Internationalization:**
   - Store all text in i18n folder
   - Use translation keys in components

## When to Create a New Feature

Create a new feature when:
- It represents a major application capability
- It contains multiple related components, pages, and/or services
- It can be conceptually separated from other features 