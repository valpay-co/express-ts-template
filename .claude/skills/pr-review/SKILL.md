---
name: pr-review
description: Comprehensive PR review. Use when reviewing pull requests.
disable-model-invocation: false
---

# PR Review Checklist

When reviewing a PR, analyze these aspects:

## 1. Code Quality (1-5)
- Clean, readable code following project patterns
- Proper TypeScript typing
- No code smells or anti-patterns
- Consistent with existing architecture (DAO -> Service -> Controller)

## 2. Testing (1-5)
- Unit tests for new functionality
- Integration tests where appropriate
- Test coverage > 80%
- Edge cases handled

## 3. Security (1-5)
- No exposed secrets or credentials
- Input validation present
- Auth checks (if applicable)
- No SQL injection, XSS, or OWASP vulnerabilities
- PII handling compliant

## 4. Domain Alignment (1-5)
- Follows project plan in docs/plan/
- Aligns with requirements
- Data models match spec
- API contracts match spec

## 5. Documentation (1-5)
- Code is self-documenting
- Complex logic has comments
- API endpoints documented
- README/docs updated if needed

## 6. Performance & Scalability (1-5)
- Database queries optimized
- Proper indexing on models
- Pagination implemented for lists
- No N+1 query problems

## Output Format:

### Summary
[Brief overview of PR purpose and approach]

### Strengths
- [What's done well]

### Critical Issues (Must Fix)
- [ ] [Blocking issues]

### Warnings (Should Fix)
- [ ] [Important but not blocking]

### Suggestions (Nice to Have)
- [ ] [Optional improvements]

### Ratings
- Code Quality: X/5
- Testing: X/5
- Security: X/5
- Domain Alignment: X/5
- Documentation: X/5
- Performance: X/5

**Overall: APPROVE | APPROVE WITH CHANGES | REQUEST CHANGES**
