#!/bin/bash

# Script to create all 30 GitHub issues for the Bento Dashboard repository
# Run this after pushing the repository to GitHub

set -e

echo "Creating GitHub labels..."

# Difficulty labels
gh label create "good-first-issue" --color "7057ff" --description "Good for newcomers (15-30 min)" 2>/dev/null || true
gh label create "intermediate" --color "fbca04" --description "Moderate difficulty (1-2 hours)" 2>/dev/null || true
gh label create "advanced" --color "d93f0b" --description "Complex challenge (3-6 hours)" 2>/dev/null || true

# Type labels
gh label create "bug" --color "d73a4a" --description "Something is not working" 2>/dev/null || true
gh label create "documentation" --color "0075ca" --description "Improvements to docs" 2>/dev/null || true
gh label create "tests" --color "a2eeef" --description "Related to testing" 2>/dev/null || true
gh label create "enhancement" --color "a2eeef" --description "New feature or request" 2>/dev/null || true
gh label create "security" --color "ff0000" --description "Security vulnerability" 2>/dev/null || true
gh label create "performance" --color "ffcc00" --description "Performance optimization" 2>/dev/null || true
gh label create "refactoring" --color "fbca04" --description "Code quality improvements" 2>/dev/null || true
gh label create "accessibility" --color "5319e7" --description "Accessibility improvements" 2>/dev/null || true

echo "Creating EASY issues (1-10)..."

# Issue 1: Typo in README
gh issue create \
  --title "docs: Fix typo in README.md Quick Start section" \
  --body "$(cat <<'EOF'
## Problem Description
There is a typo in the README.md file in the Quick Start section. The word "verification" should be "verification".

## Context
This typo appears in the Verification section of the README. While it is a small issue, fixing it helps maintain documentation quality and shows new contributors how to make their first open source contribution.

## Steps to Reproduce
1. Open README.md
2. Navigate to the Verification section
3. Notice the typo

## Expected Behavior
The section header should read "Verification" with correct spelling.

## Actual Behavior
The section may contain typos that need to be identified and fixed.

## Files to Investigate
- `README.md` - Check the Verification section and other sections for typos

## Acceptance Criteria
- [ ] All typos in README.md are identified and fixed
- [ ] Spelling is verified with a spell checker
- [ ] No other content is changed

## Difficulty: Easy
**Estimated time**: 15-30 minutes
**Prerequisites**: Basic English, ability to edit markdown files
**Learning outcomes**: Learn the contribution workflow, practice making a pull request

## Helpful Resources
- [GitHub's guide to editing files](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files)
EOF
)" \
  --label "good-first-issue,documentation"

# Issue 2: Missing alt text
gh issue create \
  --title "a11y: Add missing alt text for images in application" \
  --body "$(cat <<'EOF'
## Problem Description
Some images and icons in the application may be missing appropriate alt text or aria-labels, making the application less accessible to screen reader users.

## Context
Accessibility is crucial for making web applications usable by everyone. The ClockWidget and other components use SVG icons that need proper aria-labels.

## Steps to Reproduce
1. Run a screen reader on the application
2. Navigate through the widgets
3. Notice that some icons are announced generically or not at all

## Expected Behavior
All interactive elements and icons should have descriptive aria-labels that convey their purpose.

## Actual Behavior
Some icons may lack descriptive labels.

## Files to Investigate
- `src/components/widgets/ClockWidget.tsx` - Check SVG icons
- `src/components/widgets/PomodoroWidget.tsx` - Check button icons
- `src/components/Dashboard.tsx` - Check header icons

## Acceptance Criteria
- [ ] All SVG icons have appropriate aria-hidden or aria-label attributes
- [ ] All icon-only buttons have aria-labels
- [ ] Accessibility is verified with a screen reader or accessibility tool

## Difficulty: Easy
**Estimated time**: 20-30 minutes
**Prerequisites**: Basic understanding of HTML accessibility
**Learning outcomes**: Learn about web accessibility, aria-labels, and screen reader support

## Helpful Resources
- [MDN: ARIA labels](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label)
- [W3C WAI-ARIA best practices](https://www.w3.org/WAI/ARIA/apg/)
EOF
)" \
  --label "good-first-issue,accessibility"

# Issue 3: Hardcoded colors
gh issue create \
  --title "refactor: Extract hardcoded colors to CSS custom properties" \
  --body "$(cat <<'EOF'
## Problem Description
There are hardcoded color values in the component files that should be extracted to CSS custom properties for better maintainability and theme consistency.

## Context
Using CSS custom properties makes it easier to maintain consistent colors across the application and simplifies theme changes. Some components may have inline color values instead of using the theme variables.

## Steps to Reproduce
1. Search for hardcoded color values in component files
2. Identify colors that should use theme variables

## Expected Behavior
All colors should use CSS custom properties defined in index.css.

## Actual Behavior
Some components may have hardcoded hex color values.

## Files to Investigate
- `src/components/widgets/NotesWidget.tsx` - NOTE_COLORS array
- `src/index.css` - Check theme variable definitions

## Acceptance Criteria
- [ ] Hardcoded colors are replaced with CSS custom properties where appropriate
- [ ] Colors that must remain in JS (like note colors) are documented
- [ ] Application still renders correctly after changes

## Difficulty: Easy
**Estimated time**: 30-45 minutes
**Prerequisites**: Basic CSS knowledge
**Learning outcomes**: Learn about CSS custom properties and theme management

## Helpful Resources
- [MDN: CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
EOF
)" \
  --label "good-first-issue,refactoring"

# Issue 4: Missing input validation
gh issue create \
  --title "fix: Add input validation for task title in TasksWidget" \
  --body "$(cat <<'EOF'
## Problem Description
The task title input in TasksWidget should validate that the input is not just whitespace and has a reasonable maximum length.

## Context
Currently, users can add tasks with very long titles or titles that are just whitespace. Adding validation improves the user experience and prevents potential issues.

## Steps to Reproduce
1. Open the application
2. Try to add a task with only spaces
3. Try to add a task with a very long title (500+ characters)

## Expected Behavior
- Tasks with only whitespace should be rejected
- Tasks with titles longer than 200 characters should show a warning or be truncated
- Clear error message should be shown to the user

## Actual Behavior
Currently, empty or very long task titles may be accepted without validation.

## Files to Investigate
- `src/components/widgets/TasksWidget.tsx` - handleAddTask function around line 50
- `src/store/dashboardStore.ts` - addTask action

## Acceptance Criteria
- [ ] Whitespace-only titles are rejected with clear error message
- [ ] Maximum title length is enforced
- [ ] Error messages are user-friendly
- [ ] Existing tests still pass

## Difficulty: Easy
**Estimated time**: 30-45 minutes
**Prerequisites**: Basic React and TypeScript knowledge
**Learning outcomes**: Learn form validation patterns in React

## Helpful Resources
- [React Form Validation](https://react.dev/learn/forms)
EOF
)" \
  --label "good-first-issue,bug"

# Issue 5: Dead code
gh issue create \
  --title "refactor: Remove unused imports and dead code" \
  --body "$(cat <<'EOF'
## Problem Description
There are unused imports in several test files and potentially dead code that should be removed for better code quality.

## Context
The linter has identified unused imports that should be cleaned up. This improves code maintainability and reduces bundle size.

## Steps to Reproduce
1. Run `npm run lint`
2. Observe warnings about unused variables
3. Check for unused imports in test files

## Expected Behavior
No unused imports or variables should remain in the codebase.

## Actual Behavior
Some files have unused imports that trigger linter warnings.

## Files to Investigate
- `tests/TasksWidget.test.tsx` - Check for unused imports
- `src/components/widgets/` - Check for unused variables
- Run `npm run lint` to see all issues

## Acceptance Criteria
- [ ] All unused imports are removed
- [ ] `npm run lint` passes with no errors
- [ ] All tests still pass

## Difficulty: Easy
**Estimated time**: 20-30 minutes
**Prerequisites**: Ability to run npm commands
**Learning outcomes**: Learn about linting and code quality

## Helpful Resources
- [ESLint Documentation](https://eslint.org/docs/latest/)
EOF
)" \
  --label "good-first-issue,refactoring"

# Issue 6: Missing JSDoc comments
gh issue create \
  --title "docs: Add JSDoc comments to utility functions" \
  --body "$(cat <<'EOF'
## Problem Description
Several utility functions and store actions lack JSDoc comments, making it harder for new contributors to understand the codebase.

## Context
Good documentation helps contributors understand the purpose and usage of functions. Adding JSDoc comments improves the development experience with IDE tooltips.

## Steps to Reproduce
1. Open the store file or widget components
2. Hover over functions in your IDE
3. Notice that some lack documentation

## Expected Behavior
All exported functions should have JSDoc comments explaining their purpose, parameters, and return values.

## Actual Behavior
Many functions lack documentation comments.

## Files to Investigate
- `src/store/dashboardStore.ts` - Add JSDoc to store actions
- `src/components/WidgetRegistry.ts` - Document exported functions
- `src/utils/` - Document any utility functions

## Acceptance Criteria
- [ ] All exported functions have JSDoc comments
- [ ] Parameters are documented with @param tags
- [ ] Return values are documented with @returns tags
- [ ] Comments follow JSDoc format

## Difficulty: Easy
**Estimated time**: 30-45 minutes
**Prerequisites**: Basic TypeScript knowledge
**Learning outcomes**: Learn JSDoc documentation standards

## Helpful Resources
- [JSDoc Documentation](https://jsdoc.app/)
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
EOF
)" \
  --label "good-first-issue,documentation"

# Issue 7: Incomplete README
gh issue create \
  --title "docs: Add troubleshooting section to README" \
  --body "$(cat <<'EOF'
## Problem Description
The README.md lacks a troubleshooting section for common issues users might encounter when setting up or running the application.

## Context
New contributors often face similar issues. A troubleshooting section helps them resolve problems independently and reduces support burden.

## Steps to Reproduce
1. Read through README.md
2. Notice that common error scenarios are not documented

## Expected Behavior
README should include a Troubleshooting section covering:
- Node version issues
- Dependency installation problems
- Build errors
- Port already in use errors

## Actual Behavior
No troubleshooting documentation exists.

## Files to Investigate
- `README.md` - Add new section

## Acceptance Criteria
- [ ] Troubleshooting section added to README
- [ ] At least 4 common issues documented
- [ ] Each issue includes cause and solution
- [ ] Section follows existing README format

## Difficulty: Easy
**Estimated time**: 30-45 minutes
**Prerequisites**: Markdown knowledge, basic troubleshooting skills
**Learning outcomes**: Learn technical writing and documentation

## Helpful Resources
- [GitHub README Best Practices](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
EOF
)" \
  --label "good-first-issue,documentation"

# Issue 8: Missing test for WeatherWidget
gh issue create \
  --title "test: Add unit tests for WeatherWidget" \
  --body "$(cat <<'EOF'
## Problem Description
The WeatherWidget component lacks unit tests, reducing test coverage and making it harder to catch regressions.

## Context
Comprehensive tests ensure components work correctly and make refactoring safer. WeatherWidget is a key feature that should be tested.

## Steps to Reproduce
1. Check the tests directory
2. Notice there is no WeatherWidget.test.tsx

## Expected Behavior
WeatherWidget should have tests covering:
- Initial render with mock data
- Search form submission
- Loading state
- Error handling when API fails

## Actual Behavior
No tests exist for WeatherWidget.

## Files to Investigate
- `src/components/widgets/WeatherWidget.tsx` - Understand component behavior
- `tests/` - Create new test file following existing patterns

## Acceptance Criteria
- [ ] WeatherWidget.test.tsx created
- [ ] Tests cover render, search, loading, and error states
- [ ] All tests pass
- [ ] Test file follows existing patterns

## Difficulty: Easy
**Estimated time**: 30-45 minutes
**Prerequisites**: React Testing Library basics
**Learning outcomes**: Learn unit testing with Vitest and Testing Library

## Helpful Resources
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
EOF
)" \
  --label "good-first-issue,tests"

# Issue 9: CSS styling issue
gh issue create \
  --title "fix: Improve responsive layout for mobile devices" \
  --body "$(cat <<'EOF'
## Problem Description
The dashboard layout may not display optimally on mobile devices, with widgets potentially overlapping or not being touch-friendly.

## Context
Many users access web applications on mobile devices. Ensuring the dashboard works well on small screens improves accessibility and user experience.

## Steps to Reproduce
1. Open the application in a browser
2. Open developer tools and switch to mobile view
3. Observe layout issues on screens smaller than 640px

## Expected Behavior
- Widgets stack vertically on mobile
- Touch targets are at least 44px
- Text is readable without zooming
- No horizontal scrolling needed

## Actual Behavior
Layout may not be optimal for mobile viewports.

## Files to Investigate
- `src/components/Dashboard.tsx` - Check grid classes
- `src/index.css` - Check responsive styles
- `src/components/widgets/*.tsx` - Check individual widget layouts

## Acceptance Criteria
- [ ] Layout works on screens from 320px to 640px width
- [ ] All touch targets meet minimum size requirements
- [ ] No horizontal scroll on mobile
- [ ] Verified on at least 2 mobile viewport sizes

## Difficulty: Easy
**Estimated time**: 30-45 minutes
**Prerequisites**: CSS knowledge, responsive design basics
**Learning outcomes**: Learn responsive design with Tailwind CSS

## Helpful Resources
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
EOF
)" \
  --label "good-first-issue,bug"

# Issue 10: Missing type export
gh issue create \
  --title "refactor: Export all types from types/index.ts" \
  --body "$(cat <<'EOF'
## Problem Description
Some types defined in component files should be moved to the central types file for better organization and reusability.

## Context
Centralized type definitions make the codebase easier to maintain and help with IDE autocompletion. Currently, some types may be defined inline in component files.

## Steps to Reproduce
1. Search for `interface` or `type` definitions in component files
2. Identify types that should be centralized

## Expected Behavior
All shared types should be defined in `src/types/index.ts` and imported where needed.

## Actual Behavior
Some types may be duplicated or defined inline.

## Files to Investigate
- `src/types/index.ts` - Check for missing types
- `src/components/**/*.tsx` - Look for inline type definitions

## Acceptance Criteria
- [ ] All shared types moved to types/index.ts
- [ ] No duplicate type definitions
- [ ] All imports updated
- [ ] TypeScript compilation passes

## Difficulty: Easy
**Estimated time**: 20-30 minutes
**Prerequisites**: TypeScript basics
**Learning outcomes**: Learn TypeScript project organization

## Helpful Resources
- [TypeScript Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
EOF
)" \
  --label "good-first-issue,refactoring"

echo "Creating MEDIUM issues (11-20)..."

# Issue 11: useEffect dependency warning
gh issue create \
  --title "fix: Resolve React Hook dependency warning in WeatherWidget" \
  --body "$(cat <<'EOF'
## Problem Description
The WeatherWidget has a React Hook dependency warning that indicates potential stale closure issues or unnecessary re-renders.

## Context
React's exhaustive-deps ESLint rule warns when useEffect dependencies might be missing. This can lead to bugs where effects use stale values.

## Steps to Reproduce
1. Run `npm run lint`
2. Observe warning in WeatherWidget.tsx about missing dependencies

## Expected Behavior
The useEffect hook should have all necessary dependencies, or the code should be refactored to avoid the warning without breaking functionality.

## Actual Behavior
ESLint warning: "React Hook useEffect has missing dependencies: 'fetchWeather', 'location', and 'weather'."

## Files to Investigate
- `src/components/widgets/WeatherWidget.tsx` - Lines 68-72, the useEffect hook
- Check the fetchWeather useCallback dependencies

## Acceptance Criteria
- [ ] ESLint warning is resolved
- [ ] Weather fetching still works correctly
- [ ] No infinite re-renders introduced
- [ ] All tests pass

## Difficulty: Medium
**Estimated time**: 45-60 minutes
**Prerequisites**: Understanding of React hooks and dependencies
**Learning outcomes**: Learn proper React hook dependency management

## Suggested Approach
Consider using useCallback with proper dependencies, or refactor the useEffect to include all necessary dependencies.

## Helpful Resources
- [React useEffect Dependencies](https://react.dev/reference/react/useEffect#specifying-reactive-dependencies)
- [Why ESLint exhaustive-deps rule matters](https://overreacted.io/a-complete-guide-to-useeffect/)
EOF
)" \
  --label "intermediate,bug"

# Issue 12: Missing error boundary
gh issue create \
  --title "feat: Add error boundary for widget failures" \
  --body "$(cat <<'EOF'
## Problem Description
When a widget fails to render (e.g., due to API errors or unexpected data), the entire dashboard can crash. An error boundary would prevent this.

## Context
React Error Boundaries catch JavaScript errors anywhere in the child component tree, log those errors, and display a fallback UI instead of crashing.

## Steps to Reproduce
1. Modify a widget to throw an error
2. Observe that the entire dashboard may become unusable
3. No graceful error handling is shown

## Expected Behavior
- If a single widget fails, it should show an error state
- Other widgets should continue to function
- User should be able to retry or remove the failed widget

## Actual Behavior
Widget errors may cause the entire application to crash or show a blank screen.

## Files to Investigate
- `src/components/Dashboard.tsx` - Wrap widgets in error boundary
- Create new `src/components/ErrorBoundary.tsx` component

## Acceptance Criteria
- [ ] ErrorBoundary component created
- [ ] Each widget wrapped in ErrorBoundary
- [ ] Failed widgets show error message with retry option
- [ ] Other widgets continue to work when one fails
- [ ] ErrorBoundary tested with unit tests

## Difficulty: Medium
**Estimated time**: 1-2 hours
**Prerequisites**: React class components (for error boundaries), error handling
**Learning outcomes**: Learn React Error Boundaries pattern

## Suggested Approach
Create a class component that implements componentDidCatch. Wrap each WidgetWrapper in the error boundary.

## Helpful Resources
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
EOF
)" \
  --label "intermediate,enhancement"

# Issue 13: Race condition in weather fetching
gh issue create \
  --title "fix: Handle race condition when searching locations rapidly" \
  --body "$(cat <<'EOF'
## Problem Description
When a user rapidly searches for different locations in the WeatherWidget, race conditions can occur where an older request's response overwrites a newer one.

## Context
This is a common async issue where multiple concurrent requests can return in any order. The last request to complete should be the one displayed.

## Steps to Reproduce
1. Open WeatherWidget
2. Quickly type and search for multiple different cities
3. Observe that weather may show results from a previous search

## Expected Behavior
Only the most recent search request should update the weather display. Previous requests should be cancelled or ignored.

## Actual Behavior
Race conditions can cause stale data to be displayed if older requests complete after newer ones.

## Files to Investigate
- `src/components/widgets/WeatherWidget.tsx` - fetchWeather function
- Consider using AbortController or request cancellation

## Acceptance Criteria
- [ ] Race condition is prevented using AbortController or similar
- [ ] Only latest request results are displayed
- [ ] Loading state correctly managed during rapid searches
- [ ] Unit test added for race condition handling

## Difficulty: Medium
**Estimated time**: 1-2 hours
**Prerequisites**: Understanding of async/await and race conditions
**Learning outcomes**: Learn async request management and AbortController

## Suggested Approach
Use AbortController to cancel previous fetch requests when a new search is initiated.

## Helpful Resources
- [AbortController MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [React Query race conditions](https://tkdodo.eu/blog/avoiding-race-conditions-with-react-query)
EOF
)" \
  --label "intermediate,bug"

# Issue 14: Missing debounce for search
gh issue create \
  --title "feat: Add debounce to search input in SearchWidget" \
  --body "$(cat <<'EOF'
## Problem Description
The SearchWidget triggers search on every keystroke when showing suggestions, which could be optimized with debouncing.

## Context
Debouncing prevents excessive function calls during rapid user input. This is especially important for search functionality.

## Steps to Reproduce
1. Open SearchWidget
2. Type quickly in the search input
3. Notice suggestions update on every keystroke immediately

## Expected Behavior
- Search suggestions should be debounced (300ms delay)
- User experience should feel responsive
- Fewer unnecessary computations

## Actual Behavior
Suggestions may update immediately on every keystroke without optimization.

## Files to Investigate
- `src/components/widgets/SearchWidget.tsx` - onChange handler
- Consider creating a useDebounce hook in `src/hooks/`

## Acceptance Criteria
- [ ] Debounce implemented for suggestion filtering
- [ ] 300ms delay is appropriate for good UX
- [ ] Search submission (Enter key) is not debounced
- [ ] Custom hook created for reusability

## Difficulty: Medium
**Estimated time**: 45-60 minutes
**Prerequisites**: React hooks knowledge
**Learning outcomes**: Learn debouncing patterns in React

## Suggested Approach
Create a useDebounce hook that can be reused across the application.

## Helpful Resources
- [Debouncing in React](https://dmitripavlutin.com/react-throttle-debounce/)
EOF
)" \
  --label "intermediate,enhancement,performance"

# Issue 15: State persistence issue
gh issue create \
  --title "fix: Handle localStorage quota exceeded errors" \
  --body "$(cat <<'EOF'
## Problem Description
When localStorage is full or disabled, the application may crash when trying to persist state. This should be handled gracefully.

## Context
Browsers have limits on localStorage (typically 5-10MB). When exceeded, writes fail with an error. Some users also disable localStorage.

## Steps to Reproduce
1. Fill localStorage with data
2. Try to add many notes or tasks
3. Application may crash when storage limit is reached

## Expected Behavior
- Application should catch localStorage errors
- User should be notified when storage is full
- Application should continue to work in-memory mode
- Graceful degradation, not crash

## Actual Behavior
Application may crash or behave unexpectedly when localStorage is full.

## Files to Investigate
- `src/store/dashboardStore.ts` - persist middleware configuration
- Add error handling to storage operations

## Acceptance Criteria
- [ ] localStorage errors are caught and handled
- [ ] User notification shown when storage is full
- [ ] Application continues working without persistence
- [ ] Error handling tested

## Difficulty: Medium
**Estimated time**: 1-2 hours
**Prerequisites**: Understanding of browser storage APIs
**Learning outcomes**: Learn error handling for browser storage

## Suggested Approach
Wrap storage operations in try-catch blocks and show user-friendly error messages.

## Helpful Resources
- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
EOF
)" \
  --label "intermediate,bug"

# Issue 16: Pomodoro timer inaccuracy
gh issue create \
  --title "fix: Improve Pomodoro timer accuracy using requestAnimationFrame" \
  --body "$(cat <<'EOF'
## Problem Description
The Pomodoro timer uses setInterval which can drift over time, leading to inaccurate timing. This should be improved for better accuracy.

## Context
setInterval is not guaranteed to execute at exact intervals, especially when the browser tab is inactive. Using requestAnimationFrame or the Performance API provides better accuracy.

## Steps to Reproduce
1. Start Pomodoro timer
2. Switch to another browser tab for 25 minutes
3. Return and observe timer may be inaccurate

## Expected Behavior
Timer should maintain reasonable accuracy even when:
- Tab is inactive
- Computer is under heavy load
- User returns after extended time

## Actual Behavior
Timer may drift significantly when tab is inactive due to browser throttling of setInterval.

## Files to Investigate
- `src/components/widgets/PomodoroWidget.tsx` - interval logic
- Consider using Date-based timing or requestAnimationFrame

## Acceptance Criteria
- [ ] Timer accuracy improved using Date comparison
- [ ] Handles tab visibility changes correctly
- [ ] Timer still works correctly in all scenarios
- [ ] No memory leaks introduced

## Difficulty: Medium
**Estimated time**: 1-2 hours
**Prerequisites**: Understanding of browser timing APIs
**Learning outcomes**: Learn about browser timing, visibility API

## Suggested Approach
Store the target end time and calculate remaining time on each tick using Date.now(). Handle visibility change events.

## Helpful Resources
- [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [Accurate timers in JavaScript](https://stackoverflow.com/questions/29971898/how-to-create-an-accurate-timer-in-javascript)
EOF
)" \
  --label "intermediate,bug,performance"

# Issue 17: Missing keyboard navigation
gh issue create \
  --title "feat: Add keyboard navigation for dashboard widgets" \
  --body "$(cat <<'EOF'
## Problem Description
Users should be able to navigate between widgets using keyboard, which improves accessibility and power-user experience.

## Context
Keyboard navigation is essential for accessibility and improves the user experience for power users. Currently, users may need to tab through many elements to navigate.

## Steps to Reproduce
1. Load the dashboard
2. Try to navigate using only keyboard
3. Notice there is no efficient way to move between widgets

## Expected Behavior
- Arrow keys should navigate between widgets
- Enter should activate focused widget
- Escape should close modals/dropdowns
- Focus indicators should be visible

## Actual Behavior
Navigation requires tabbing through many elements, no widget-level navigation.

## Files to Investigate
- `src/components/Dashboard.tsx` - Add keyboard event handlers
- `src/components/WidgetRegistry.ts` - May need focus management

## Acceptance Criteria
- [ ] Arrow keys navigate between widgets
- [ ] Focus is visually indicated
- [ ] All interactive elements are keyboard accessible
- [ ] Keyboard shortcuts documented in UI
- [ ] Works with screen readers

## Difficulty: Medium
**Estimated time**: 1-2 hours
**Prerequisites**: Accessibility knowledge, keyboard event handling
**Learning outcomes**: Learn keyboard navigation patterns, accessibility

## Suggested Approach
Implement a roving tabindex pattern or use a focus management library.

## Helpful Resources
- [WAI-ARIA keyboard navigation](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
EOF
)" \
  --label "intermediate,enhancement,accessibility"

# Issue 18: Task sorting bug
gh issue create \
  --title "fix: Correct task sorting when due dates are equal" \
  --body "$(cat <<'EOF'
## Problem Description
When multiple tasks have the same due date or no due date, the sorting is inconsistent and may not follow the expected priority order.

## Context
Tasks should be sorted by: completion status, then priority, then due date. When dates are equal, secondary sort criteria should apply.

## Steps to Reproduce
1. Create multiple tasks with the same due date
2. Observe that sorting between them may be inconsistent
3. Create tasks without due dates
4. Notice sorting may vary between renders

## Expected Behavior
Tasks should always have a consistent sort order:
1. Incomplete tasks first
2. Within incomplete: by priority (high > medium > low)
3. Within same priority: by due date (earliest first)
4. Tasks without dates sorted after dated tasks
5. Finally, by creation date

## Actual Behavior
Sorting may be inconsistent when comparing tasks with equal values.

## Files to Investigate
- `src/components/widgets/TasksWidget.tsx` - sortedTasks logic
- The sort comparison function needs improvement

## Acceptance Criteria
- [ ] Sorting is consistent across renders
- [ ] All sort criteria properly implemented
- [ ] Edge cases handled (no due date, same values)
- [ ] Unit tests added for sorting logic

## Difficulty: Medium
**Estimated time**: 45-60 minutes
**Prerequisites**: JavaScript array sorting
**Learning outcomes**: Learn complex sorting algorithms

## Suggested Approach
Rewrite the sort function to handle all criteria and return consistent results using a stable comparison.

## Helpful Resources
- [JavaScript Array sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
EOF
)" \
  --label "intermediate,bug"

# Issue 19: Notes widget XSS prevention
gh issue create \
  --title "security: Sanitize HTML in notes content" \
  --body "$(cat <<'EOF'
## Problem Description
The NotesWidget allows users to input any text, but should sanitize the content to prevent potential XSS attacks when displaying user input.

## Context
While React escapes content by default, it is good practice to sanitize user input, especially for content that might be stored and displayed later.

## Steps to Reproduce
1. Create a note with HTML or script content
2. Observe how it is rendered
3. Consider potential security implications

## Expected Behavior
- User input should be sanitized before storage/display
- No HTML should be rendered as actual HTML
- Script injection should be prevented
- Safe characters preserved

## Actual Behavior
Content is displayed as-is (though React escapes by default).

## Files to Investigate
- `src/components/widgets/NotesWidget.tsx` - Note display
- `src/store/dashboardStore.ts` - Note storage
- Consider adding a sanitize utility

## Acceptance Criteria
- [ ] Input sanitization implemented
- [ ] XSS prevention tested
- [ ] Legitimate content preserved
- [ ] Documentation updated with security note

## Difficulty: Medium
**Estimated time**: 1-2 hours
**Prerequisites**: Understanding of XSS, security basics
**Learning outcomes**: Learn about XSS prevention and input sanitization

## Suggested Approach
Add a sanitize utility function that strips or escapes HTML tags while preserving text content.

## Helpful Resources
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
EOF
)" \
  --label "intermediate,security"

# Issue 20: Calendar widget bug
gh issue create \
  --title "fix: Calendar widget incorrectly shows wrong month days" \
  --body "$(cat <<'EOF'
## Problem Description
The CalendarWidget may not correctly handle months where the first day is not Sunday, leading to misaligned day numbers.

## Context
Different months start on different days of the week. The calendar grid must correctly offset the first day based on the month's starting day.

## Steps to Reproduce
1. Open Calendar widget
2. Navigate to a month that starts on a day other than Sunday
3. Compare the calendar display with a reference calendar
4. Note any misalignment

## Expected Behavior
- Days should align with correct day-of-week columns
- First day of month should be in correct column
- All days of month should be displayed

## Actual Behavior
Days may appear in wrong columns for certain months.

## Files to Investigate
- `src/components/widgets/CalendarWidget.tsx` - Day rendering logic
- Check how emptyDays are calculated

## Acceptance Criteria
- [ ] All months display correctly
- [ ] Days align with proper day-of-week
- [ ] First day in correct column
- [ ] Verified against multiple months

## Difficulty: Medium
**Estimated time**: 45-60 minutes
**Prerequisites**: Date handling in JavaScript
**Learning outcomes**: Learn date manipulation with date-fns

## Suggested Approach
Review the calculation of startDay and emptyDays, compare with date-fns documentation.

## Helpful Resources
- [date-fns documentation](https://date-fns.org/docs/Getting-Started)
EOF
)" \
  --label "intermediate,bug"

echo "Creating HARD issues (21-30)..."

# Issue 21: Widget drag-and-drop
gh issue create \
  --title "feat: Implement drag-and-drop widget reordering" \
  --body "$(cat <<'EOF'
## Problem Description
Users should be able to reorder widgets by dragging and dropping them. This requires implementing a complete drag-and-drop system.

## Context
Drag-and-drop is a complex feature involving mouse/touch event handling, visual feedback, and state updates. This is a significant feature addition.

## Steps to Reproduce
1. Open the dashboard
2. Try to drag a widget to reposition it
3. Note that drag-and-drop is not implemented

## Expected Behavior
- Users can drag widgets to new positions
- Visual feedback shows where widget will drop
- Position updates persist in state
- Works on both mouse and touch devices
- Accessible alternative (keyboard reordering) included

## Actual Behavior
Widgets cannot be repositioned by dragging.

## Files to Investigate
- `src/components/Dashboard.tsx` - Main container
- `src/components/WidgetWrapper` - Add drag handlers
- May need to create drag-and-drop utilities

## Acceptance Criteria
- [ ] Drag-and-drop fully implemented
- [ ] Visual feedback during drag
- [ ] Position updates persist to state
- [ ] Works on mobile (touch events)
- [ ] Keyboard alternative for accessibility
- [ ] Unit and integration tests added

## Difficulty: Hard
**Estimated time**: 4-6 hours
**Prerequisites**: Complex state management, DOM manipulation, accessibility
**Learning outcomes**: Learn drag-and-drop implementation, touch events

## Suggested Approach
Consider using the HTML5 Drag and Drop API or a library like dnd-kit. Implement mobile support with touch events.

## Helpful Resources
- [MDN: HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [dnd-kit library](https://dndkit.com/)
EOF
)" \
  --label "advanced,enhancement"

# Issue 22: Widget communication
gh issue create \
  --title "feat: Implement widget inter-communication system" \
  --body "$(cat <<'EOF'
## Problem Description
Widgets should be able to communicate with each other. For example, clicking a calendar date should filter tasks by due date.

## Context
Implementing a widget communication system requires architectural decisions about event handling and state sharing.

## Steps to Reproduce
1. Click on a date in the Calendar widget
2. Expect Tasks widget to filter to that date
3. Note that no communication exists between widgets

## Expected Behavior
- Calendar widget emits date selection events
- Tasks widget can subscribe to date events
- Quote widget could sync with Pomodoro breaks
- System is extensible for future widget types

## Actual Behavior
Each widget operates independently with no inter-widget communication.

## Files to Investigate
- `src/store/dashboardStore.ts` - Add event/subscription system
- Consider implementing a pub/sub pattern
- Update relevant widgets to emit/subscribe to events

## Acceptance Criteria
- [ ] Event system designed and implemented
- [ ] Calendar -> Tasks date filtering works
- [ ] System is generic and extensible
- [ ] No memory leaks from subscriptions
- [ ] Documentation for widget communication added
- [ ] Unit tests for event system

## Difficulty: Hard
**Estimated time**: 3-4 hours
**Prerequisites**: Software architecture, design patterns
**Learning outcomes**: Learn pub/sub patterns, event-driven architecture

## Suggested Approach
Implement a simple event emitter in the store or create a separate event bus. Use React context or Zustand subscriptions.

## Helpful Resources
- [Event-driven architecture](https://martinfowler.com/articles/201701-event-driven.html)
EOF
)" \
  --label "advanced,enhancement"

# Issue 23: Performance optimization
gh issue create \
  --title "perf: Implement virtual rendering for large task lists" \
  --body "$(cat <<'EOF'
## Problem Description
When users have many tasks (100+), the TasksWidget may have performance issues. Virtual rendering should be implemented to only render visible items.

## Context
Virtual rendering (or virtualization) only renders items currently in view, dramatically improving performance for large lists.

## Steps to Reproduce
1. Add 100+ tasks to the TasksWidget
2. Observe potential performance degradation
3. Note scroll and interaction lag

## Expected Behavior
- Smooth scrolling with 100+ tasks
- Memory usage remains low
- All tasks remain accessible
- No visible list items outside viewport are rendered

## Actual Behavior
Performance may degrade with large task counts.

## Files to Investigate
- `src/components/widgets/TasksWidget.tsx` - Task list rendering
- Consider using react-window or react-virtualized
- May need custom implementation for specific needs

## Acceptance Criteria
- [ ] Virtual rendering implemented
- [ ] Handles 100+ tasks smoothly
- [ ] Memory usage profiled and improved
- [ ] Works with existing sorting/filtering
- [ ] Accessibility maintained
- [ ] Performance benchmarks documented

## Difficulty: Hard
**Estimated time**: 3-4 hours
**Prerequisites**: Performance optimization, virtual DOM understanding
**Learning outcomes**: Learn virtualization, performance profiling

## Suggested Approach
Implement virtualization using react-window or a similar library. Ensure it works with the existing sorting and filtering logic.

## Helpful Resources
- [react-window library](https://github.com/bvaughn/react-window)
- [Virtual rendering explained](https://web.dev/virtualize-long-lists-react-window/)
EOF
)" \
  --label "advanced,performance"

# Issue 24: Offline support
gh issue create \
  --title "feat: Add Progressive Web App offline support" \
  --body "$(cat <<'EOF'
## Problem Description
The application should work offline with a service worker and proper caching strategy. This requires PWA implementation.

## Context
PWAs allow web applications to work offline and be installed on devices. This involves service workers, caching strategies, and manifest configuration.

## Steps to Reproduce
1. Load the application
2. Disconnect from internet
3. Try to use the dashboard
4. Note that it may not work correctly offline

## Expected Behavior
- Application loads offline after first visit
- Widgets that don't need network work offline
- Weather widget shows last cached data
- Clear indication when offline
- User can install as PWA

## Actual Behavior
Application requires network connection for full functionality.

## Files to Investigate
- Create service worker configuration
- Add manifest.json
- Configure Vite PWA plugin
- Update widgets for offline awareness

## Acceptance Criteria
- [ ] Service worker caches necessary assets
- [ ] Manifest.json configured for PWA
- [ ] Offline indicator in UI
- [ ] Cached API responses used offline
- [ ] PWA installable
- [ ] Offline functionality documented

## Difficulty: Hard
**Estimated time**: 4-6 hours
**Prerequisites**: Service workers, caching strategies, PWA concepts
**Learning outcomes**: Learn PWA implementation, service workers

## Suggested Approach
Use vite-plugin-pwa for service worker generation. Implement cache-first strategy for static assets, network-first for API calls.

## Helpful Resources
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
EOF
)" \
  --label "advanced,enhancement"

# Issue 25: Memory leak in timer
gh issue create \
  --title "fix: Prevent memory leak from Pomodoro timer interval" \
  --body "$(cat <<'EOF'
## Problem Description
The Pomodoro timer's interval may not be properly cleaned up in all scenarios, potentially causing memory leaks when the component is unmounted.

## Context
React components with intervals must clean up on unmount. If the user navigates away while timer is running, the interval should be cleared.

## Steps to Reproduce
1. Start Pomodoro timer
2. Remove the Pomodoro widget from dashboard
3. Check browser console for potential errors
4. Profile memory usage in DevTools

## Expected Behavior
- Intervals are always cleared on unmount
- No memory leaks from orphaned intervals
- No errors in console after widget removal
- Clean component lifecycle

## Actual Behavior
Potential memory leak from running interval after component unmount.

## Files to Investigate
- `src/components/widgets/PomodoroWidget.tsx` - useEffect cleanup
- Ensure intervalRef is properly handled
- Check all useEffect hooks for proper cleanup

## Acceptance Criteria
- [ ] Interval properly cleared on unmount
- [ ] No memory leaks detected in profiling
- [ ] No console errors after widget removal
- [ ] Unit test for cleanup behavior added
- [ ] Documentation of cleanup pattern

## Difficulty: Hard
**Estimated time**: 2-3 hours
**Prerequisites**: React lifecycle understanding, memory profiling
**Learning outcomes**: Learn React cleanup patterns, memory debugging

## Suggested Approach
Review all useEffect hooks and ensure cleanup functions are provided. Test with React DevTools profiler.

## Helpful Resources
- [React useEffect cleanup](https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed)
- [Finding memory leaks](https://developer.chrome.com/docs/devtools/memory-problems/)
EOF
)" \
  --label "advanced,bug,performance"

# Issue 26: Undo/redo functionality
gh issue create \
  --title "feat: Implement undo/redo for note and task operations" \
  --body "$(cat <<'EOF'
## Problem Description
Users should be able to undo and redo operations like creating, editing, and deleting notes and tasks. This requires implementing command pattern.

## Context
Undo/redo is a complex feature requiring state history management, action tracking, and careful UX design.

## Steps to Reproduce
1. Delete a note by mistake
2. Try to undo the deletion
3. Note that undo functionality does not exist

## Expected Behavior
- Undo/redo for last 10 operations
- Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- Clear visual feedback for undo/redo
- Undo stack persisted with state

## Actual Behavior
No undo/redo capability exists.

## Files to Investigate
- `src/store/dashboardStore.ts` - Add history middleware
- Consider using Zustand's temporal middleware
- Update all mutation actions for history tracking

## Acceptance Criteria
- [ ] Undo/redo works for notes
- [ ] Undo/redo works for tasks
- [ ] Keyboard shortcuts implemented
- [ ] Undo/redo buttons in UI
- [ ] History limited to prevent memory issues
- [ ] Unit tests for all scenarios

## Difficulty: Hard
**Estimated time**: 4-5 hours
**Prerequisites**: State management patterns, command pattern
**Learning outcomes**: Learn undo/redo implementation, state history

## Suggested Approach
Implement using Zustand's temporal middleware or create a custom history tracking system.

## Helpful Resources
- [Zustand temporal middleware](https://zustand.docs.pmnd.rs/middlewares/temporal)
- [Command pattern](https://refactoring.guru/design-patterns/command)
EOF
)" \
  --label "advanced,enhancement"

# Issue 27: Real-time sync
gh issue create \
  --title "feat: Add real-time synchronization across browser tabs" \
  --body "$(cat <<'EOF'
## Problem Description
When the user has multiple tabs open with the dashboard, changes in one tab should sync to others in real-time using the Broadcast Channel API.

## Context
Multi-tab synchronization improves user experience when users work across multiple windows. The Broadcast Channel API enables cross-tab communication.

## Steps to Reproduce
1. Open dashboard in two browser tabs
2. Add a task in one tab
3. Observe the other tab does not update
4. Changes are only visible after page refresh

## Expected Behavior
- Changes in one tab immediately visible in others
- Sync works for all state (notes, tasks, widgets)
- No duplicate updates
- Handles tab close/reopen correctly

## Actual Behavior
Each tab maintains its own state copy, no real-time sync.

## Files to Investigate
- `src/store/dashboardStore.ts` - Add sync middleware
- Implement Broadcast Channel API
- Handle storage events as fallback

## Acceptance Criteria
- [ ] Cross-tab sync implemented
- [ ] Works with Broadcast Channel API
- [ ] Falls back to storage events for older browsers
- [ ] All state types sync correctly
- [ ] No infinite sync loops
- [ ] Unit tests with mocked broadcast

## Difficulty: Hard
**Estimated time**: 3-4 hours
**Prerequisites**: Browser APIs, real-time concepts
**Learning outcomes**: Learn Broadcast Channel API, cross-tab communication

## Suggested Approach
Create a sync middleware that broadcasts state changes and listens for changes from other tabs.

## Helpful Resources
- [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
EOF
)" \
  --label "advanced,enhancement"

# Issue 28: Export/import data
gh issue create \
  --title "feat: Add data export and import functionality" \
  --body "$(cat <<'EOF'
## Problem Description
Users should be able to export all their data (notes, tasks, preferences) and import it later or on another device. This requires implementing data serialization.

## Context
Data portability is important for user trust and data ownership. Export/import allows users to backup and transfer their data.

## Steps to Reproduce
1. Add notes, tasks, and configure preferences
2. Try to export the data
3. Note there is no export functionality

## Expected Behavior
- Export all data as JSON file
- Import data from previously exported file
- Merge or replace options on import
- Validation of imported data
- Clear error messages for invalid imports

## Actual Behavior
No export/import functionality exists.

## Files to Investigate
- Create `src/utils/export.ts` for export logic
- Create `src/utils/import.ts` for import logic
- Add UI controls in settings panel
- Validate imported data schema

## Acceptance Criteria
- [ ] Export creates valid JSON file
- [ ] Import reads JSON file correctly
- [ ] Data validation on import
- [ ] User-friendly error handling
- [ ] Progress indication for large exports
- [ ] Export includes all user data
- [ ] Unit tests for export/import

## Difficulty: Hard
**Estimated time**: 3-4 hours
**Prerequisites**: File handling, data validation
**Learning outcomes**: Learn file APIs, data serialization

## Suggested Approach
Use Blob API for file creation, FileReader for import. Implement JSON schema validation.

## Helpful Resources
- [File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [Blob API](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
EOF
)" \
  --label "advanced,enhancement"

# Issue 29: Custom themes
gh issue create \
  --title "feat: Allow users to create custom color themes" \
  --body "$(cat <<'EOF'
## Problem Description
Users should be able to create and save custom color themes beyond the default light/dark options. This requires a theme editor UI and persistent theme storage.

## Context
Custom themes allow users to personalize their dashboard experience. This involves complex state management and CSS variable manipulation.

## Steps to Reproduce
1. Open settings
2. Try to customize colors
3. Note only predefined theme options exist

## Expected Behavior
- Color picker for primary/accent colors
- Preview of custom theme
- Save multiple custom themes
- Delete custom themes
- Theme preview in selection dropdown

## Actual Behavior
Only light, dark, and system themes are available.

## Files to Investigate
- `src/store/dashboardStore.ts` - Add custom theme storage
- `src/components/ThemeToggle.tsx` - Add custom theme selector
- Create `src/components/ThemeEditor.tsx`
- `src/index.css` - Make CSS variables dynamic

## Acceptance Criteria
- [ ] Color pickers for all themeable colors
- [ ] Real-time preview of changes
- [ ] Custom themes persist in storage
- [ ] Multiple custom themes supported
- [ ] Export/import themes
- [ ] Accessibility maintained (contrast checking)
- [ ] Unit tests for theme logic

## Difficulty: Hard
**Estimated time**: 4-5 hours
**Prerequisites**: CSS custom properties, color theory basics
**Learning outcomes**: Learn dynamic theming, color picker implementation

## Suggested Approach
Store custom themes as color values in localStorage. Apply theme colors by updating CSS custom properties on the root element.

## Helpful Resources
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Color accessibility](https://web.dev/color-contrast/)
EOF
)" \
  --label "advanced,enhancement"

# Issue 30: Notification system
gh issue create \
  --title "feat: Implement notification system for Pomodoro and tasks" \
  --body "$(cat <<'EOF'
## Problem Description
Users should receive browser notifications for Pomodoro timer completion and task reminders. This requires implementing the Notifications API.

## Context
Browser notifications help users stay productive by alerting them when timer sessions end or tasks are due. This requires permission handling and notification scheduling.

## Steps to Reproduce
1. Complete a Pomodoro session
2. Note there is no notification
3. Set a task with a due time
4. Note there is no reminder notification

## Expected Behavior
- Request notification permission
- Notify when Pomodoro session completes
- Notify when break ends
- Remind about due tasks
- Customizable notification settings
- Works when tab is in background

## Actual Behavior
No notification system exists.

## Files to Investigate
- `src/components/widgets/PomodoroWidget.tsx` - Add notification on complete
- `src/components/widgets/TasksWidget.tsx` - Add task reminders
- Create `src/utils/notifications.ts` for notification logic
- Add permission request UI

## Acceptance Criteria
- [ ] Notification permission requested politely
- [ ] Pomodoro completion notifications
- [ ] Task due reminders
- [ ] Settings to enable/disable notifications
- [ ] Works with tab in background
- [ ] Graceful fallback if permission denied
- [ ] Unit tests for notification logic

## Difficulty: Hard
**Estimated time**: 3-4 hours
**Prerequisites**: Browser APIs, permission handling
**Learning outcomes**: Learn Notifications API, permission UX

## Suggested Approach
Create a notification utility module that handles permissions and scheduling. Use the Notifications API with fallbacks.

## Helpful Resources
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Permission UX best practices](https://developers.google.com/web/fundamentals/push-notifications/permission-ux)
EOF
)" \
  --label "advanced,enhancement"

echo "All 30 issues created successfully!"
echo "Summary:"
echo "- 10 Easy (good-first-issue)"
echo "- 10 Medium (intermediate)"
echo "- 10 Hard (advanced)"
