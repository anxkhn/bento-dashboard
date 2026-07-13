# Contributing to Bento Dashboard

Thank you for your interest in contributing! This guide will help you make your first contribution.

## Project Goal

This is an educational repository designed to help developers learn React 19, Vite 6, Tailwind CSS v4, and Zustand by fixing real bugs and implementing features. Every issue is crafted to teach specific concepts.

## Before You Start

### For Complete Beginners

Never contributed to open source? Perfect! Here's what you need:

1. GitHub account (free)
2. Git installed on your computer
3. Node.js 20 or higher
4. 20 minutes to read this guide

### Choosing Your First Issue

Issues are labeled by difficulty:

| Label | Time Estimate | Best For |
|-------|---------------|----------|
| `good-first-issue` | 15-30 min | First-time contributors, learning basics |
| `intermediate` | 1-2 hours | Developers familiar with React |
| `advanced` | 3-6 hours | Experienced developers seeking challenges |

Start with `good-first-issue` if you're new to React or open source.

## Development Workflow

### Step 1: Fork and Clone

```bash
# Click "Fork" button on GitHub, then:
git clone https://github.com/YOUR_USERNAME/bento-dashboard.git
cd bento-dashboard

# Add upstream remote
git remote add upstream https://github.com/anxkhn/bento-dashboard.git
```

### Step 2: Set Up Environment

```bash
# Install dependencies
npm install

# Verify setup
npm run dev
```

### Step 3: Create a Branch

```bash
# Create feature branch (use descriptive names)
git checkout -b fix/issue-number-short-description

# Examples:
# git checkout -b fix/42-typo-in-readme
# git checkout -b feat/87-add-validation
# git checkout -b refactor/65-improve-performance
```

### Step 4: Make Your Changes

1. Read the issue carefully - understand the problem
2. Find the files mentioned in "Files to Investigate"
3. Make targeted changes - fix only what the issue describes
4. Test your fix:

```bash
npm run test
npm run lint
npm run typecheck
```

5. Update documentation if needed

### Step 5: Commit Your Changes

We use Conventional Commits:

```bash
# Format: type(scope): description
# Types: fix, feat, docs, test, refactor, style, chore

git add .
git commit -m "fix(auth): add input validation for email field"

# More examples:
# git commit -m "docs: fix typo in installation section"
# git commit -m "test: add test case for empty request body"
# git commit -m "feat: implement user statistics widget"
```

### Step 6: Push and Create PR

```bash
# Push to your fork
git push origin fix/issue-number-short-description

# Create Pull Request on GitHub
# Title format: same as commit message
# Description: Mention "Fixes #IssueNumber"
```

### Step 7: PR Template

Your PR description should include:

```
## Related Issue
Fixes #[issue number]

## Changes Made
- [Change 1]
- [Change 2]

## Checklist
- [ ] Tests pass locally
- [ ] Code follows style guide
- [ ] Documentation updated (if needed)
- [ ] Self-reviewed my code
- [ ] Added tests for new functionality

## Testing Steps
1. [How to test your changes]
2. [Expected results]
```

## Code Style Guide

### React Conventions

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for type safety
- Follow existing naming patterns

### TypeScript Guidelines

- Define types in `src/types/index.ts`
- Use interfaces for object shapes
- Avoid `any` type - use `unknown` when type is uncertain
- Document complex types with comments

### Component Structure

```tsx
// 1. Imports
import { useState } from 'react'

// 2. Types
interface ComponentProps {
  title: string
  onClick?: () => void
}

// 3. Component
export function Component({ title, onClick }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState('')
  
  // 5. Handlers
  const handleClick = () => {
    onClick?.()
  }
  
  // 6. Render
  return (
    <div>
      {/* content */}
    </div>
  )
}
```

### Linting and Formatting

```bash
# Check code style
npm run lint

# Auto-fix formatting issues
npm run lint:fix

# Type check
npm run typecheck
```

## Testing Requirements

### Writing Tests

- Every bug fix should include a test that catches the bug
- Every new feature should include tests for happy path + edge cases
- Test file naming: `ComponentName.test.tsx`
- Use Testing Library's `userEvent` for interactions

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test
npx vitest run tests/ClockWidget.test.tsx

# Run with coverage (aim for 80%+)
npm run test:coverage
```

### Test Structure

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Component } from './Component'

describe('Component', () => {
  beforeEach(() => {
    // Setup
  })

  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByText('Expected text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    render(<Component />)
    const button = screen.getByRole('button')
    await userEvent.click(button)
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

## Common Mistakes to Avoid

Don't:

- Fix multiple unrelated issues in one PR
- Change code style without fixing functionality
- Remove tests to make them "pass"
- Add unnecessary dependencies
- Change files not mentioned in the issue

Do:

- Keep PRs focused on one issue
- Add tests for your fixes
- Ask questions if stuck (comment on the issue)
- Follow existing code patterns
- Update documentation

## Getting Help

### Stuck on an Issue?

1. Read the issue's "Suggested Approach" section carefully
2. Check "Helpful Resources" links in the issue
3. Comment on the issue with:
   - What you've tried
   - What's not working
   - Specific error messages

### Questions About Contributing?

- Create an issue with the `question` label
- Tag maintainers in issue comments

## After Your PR is Merged

### What Happens Next?

1. Your contribution appears in commit history
2. Issue is automatically closed
3. You can move on to more challenging issues

### Level Up Your Contributions

After your first PR:

- Try an intermediate issue
- Help review others' PRs
- Suggest new issues
- Improve documentation

## Contribution Recognition

### Contributor Levels

- Newcomer: 1-2 merged PRs
- Regular: 3-5 merged PRs
- Core: 6+ merged PRs, helps review others

## Code of Conduct

Be respectful, inclusive, and helpful. We're all here to learn!

## Thank You

Every contribution makes this project better for the next learner. Happy coding!

---

Ready? [Pick your first issue](https://github.com/anxkhn/bento-dashboard/issues)