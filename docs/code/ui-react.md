UI Development Coding Guidelines

1. Technology Stack Overview
	•	Framework & Language:
Use React for the UI framework paired with TypeScript for type safety. TypeScript minimizes runtime errors and enhances code maintainability.
	•	Bundling & Tooling:
Use a tool such as Webpack or Vite for module bundling. Configure Babel (if necessary) for transpiling modern JavaScript features.
	•	Styling:
Adopt a CSS-in-JS solution (e.g., styled-components or Emotion) or CSS Modules to scope styles locally and avoid naming collisions.
	•	State Management:
For simple state needs, leverage React’s Context API; for more complex state flows, consider Redux or Zustand.
	•	Testing:
Use Jest for unit testing and React Testing Library for component integration tests.
	•	Linting & Formatting:
Set up ESLint for code quality and Prettier for code formatting to enforce consistency.

2. Project Structure & Organization
	•	Modular Directory Layout:
Organize the project by feature rather than by type. For instance:

/src
  /components
  /features
    /UserProfile
      UserProfile.tsx
      userProfileSlice.ts
      UserProfile.test.tsx
  /hooks
  /services    // For API calls, authentication, etc.
  /styles
  /utils
  /types


	•	Separation of Concerns:
Separate UI components from business logic. Keep presentational components (dumb components) isolated from container components (smart components that handle data fetching and state management).
	•	Consistent Naming Conventions:
	•	Use PascalCase for React component filenames (e.g., Header.tsx).
	•	Use camelCase for utility functions and variables.
	•	Follow consistent naming for CSS classes and styled components.

3. Component Design & Patterns
	•	Reusable Components:
Build components that are reusable and customizable. Create atomic design layers: atoms, molecules, organisms, and templates.
	•	Functional Components & Hooks:
Favor functional components with hooks over class-based components. Use hooks like useState, useEffect, and custom hooks to encapsulate logic.
	•	Prop Validation & Defaults:
Leverage TypeScript interfaces to define prop types. Provide sensible default props where applicable.
	•	Composition Over Inheritance:
Design components to accept children or render props to enhance reusability and composability.

4. Styling and Theming
	•	Scoped Styles:
Use CSS Modules or CSS-in-JS to ensure styles are scoped to their respective components.
	•	Theming:
Implement a theming solution to standardize colors, typography, and spacing. Use a theme provider (e.g., ThemeProvider from styled-components) to allow dynamic theme switching if required.
	•	Responsive Design:
Write responsive styles using media queries or a CSS framework that supports responsive design. Follow mobile-first principles.

5. API Integration & State Management
	•	RESTful API Consumption:
Design API service layers that abstract HTTP requests. Create a dedicated folder (e.g., /services/api.ts) to handle API endpoints, error handling, and data transformations.
	•	Error Handling:
Implement robust error handling for API calls. Display user-friendly error messages and consider a global error boundary for unhandled exceptions.
	•	Data Caching & Optimistic Updates:
Use libraries like React Query or SWR for efficient data fetching and caching. This will improve performance and offer built-in support for optimistic UI updates.
	•	Consistent Data Contracts:
Ensure that the UI expects data structures matching the Express.js API. Use TypeScript interfaces to model API responses, reducing runtime errors and mismatches.

6. Accessibility (A11y)
	•	Semantic HTML:
Use appropriate HTML tags (e.g., <header>, <main>, <nav>, <footer>) to enhance accessibility and SEO.
	•	ARIA Attributes:
Implement ARIA attributes where necessary to provide additional context to assistive technologies.
	•	Keyboard Navigation:
Ensure all interactive elements are accessible via keyboard and test for focus management.
	•	Color Contrast & Responsive Text:
Validate color contrast ratios and ensure text sizes are legible on different devices. Use tools like Lighthouse to audit accessibility.

7. Performance Optimization
	•	Lazy Loading & Code Splitting:
Use React.lazy and Suspense to load components on demand. This minimizes the initial bundle size and speeds up load times.
	•	Memoization:
Utilize React.memo, useMemo, and useCallback to optimize expensive re-renders, especially in lists or complex UIs.
	•	Optimized Asset Loading:
Compress images and use modern image formats (like WebP). Utilize lazy loading for images not immediately in the viewport.
	•	Minimize Re-renders:
Keep state local where possible. Avoid unnecessary prop drilling by utilizing context or state management libraries appropriately.

8. Security Considerations
	•	Input Validation & Sanitization:
Validate and sanitize user input in forms to prevent XSS attacks. Use libraries such as DOMPurify if necessary.
	•	Secure API Communication:
Always use HTTPS for API calls and handle sensitive data cautiously. Store API keys and tokens securely, ideally in environment variables.
	•	Authentication & Authorization:
Integrate robust authentication flows (e.g., JWT) and protect routes/components that require authenticated access.
	•	Third-Party Dependencies:
Regularly audit dependencies for vulnerabilities using tools like npm audit or Snyk.

9. Testing & Quality Assurance
	•	Unit & Integration Tests:
Write unit tests for components and business logic using Jest and React Testing Library. Aim for high coverage on critical components and state management.
	•	End-to-End Testing:
Consider Cypress or Playwright for end-to-end testing, especially for flows that span multiple components and involve API interactions.
	•	Continuous Integration:
Integrate tests into your CI pipeline to catch regressions early. Enforce tests and linting before merging changes.
	•	Browser Compatibility:
Test UI components across multiple browsers and devices to ensure consistent behavior and appearance.

10. Documentation & Comments
	•	Code Documentation:
Write clear comments and JSDoc/TypeScript doc comments where needed to explain component logic, complex functions, and API interactions.
	•	README & Contribution Guidelines:
Maintain an updated README that includes setup instructions, coding conventions, and project architecture details. Provide guidelines for new contributors.
	•	Inline Documentation:
Use meaningful commit messages, and consider using tools like Storybook for documenting and visually testing UI components.

11. Version Control & Deployment
	•	Commit Standards:
Follow conventional commit messages to make changes understandable. Include detailed commit messages for feature additions and bug fixes.
	•	Branching Strategy:
Adopt a branching strategy (such as Git Flow) that supports feature development, hotfixes, and releases.
	•	Code Reviews:
Ensure every pull request is reviewed by peers to catch potential issues and enforce coding standards.
	•	Deployment Automation:
Automate builds and deployments with CI/CD pipelines. Ensure that each deployment triggers relevant tests and linting tasks.

12. Integration with Express.js Backend
	•	API Endpoint Consistency:
Ensure that your UI code expects and handles the JSON responses defined by the Express.js backend. Use TypeScript to define interfaces for each endpoint.
	•	Error and Status Handling:
Gracefully handle HTTP status codes (e.g., 401, 404, 500) by providing users with informative feedback and fallback UI states.
	•	CORS & Security:
Verify that CORS is properly configured on the Express.js backend. Handle any cross-origin requests securely in your API service layer.
	•	Authentication Tokens:
When communicating with the backend, store authentication tokens securely (preferably in HttpOnly cookies) and include them in API requests as needed.

13. Customer Portal + Adyen Drop-in Payment Flow

- Route structure should support short-lived portal sessions and deep links into invoices.
- Keep Adyen Drop-in isolated to a single `PaymentPanel` container to simplify state and error handling.
- Create a dedicated `portal.service.ts` for portal session, invoice, and payment session APIs.
- Ensure all payment attempts are tracked with clear UI states: `idle`, `processing`, `requires_action`, `succeeded`, `failed`.
- Expose a recovery path for expired sessions (refresh session and re-mount Drop-in).
- Provide clear receipt/download actions after successful payment and a support contact on failures.
