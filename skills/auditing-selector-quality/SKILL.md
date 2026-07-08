---
name: auditing-selector-quality
description: Use when reviewing or debugging flaky selectors. Audits selector priority, stability, and resilience against component changes.
---

# Auditing Selector Quality

## Selector Priority Strategy

| Priority | Method                          | Notes                           |
| -------- | ------------------------------- | ------------------------------- |
| 1        | `getByTestId(testId)`           | Most stable, immune to refactor |
| 2        | `getByRole(role, { name })`     | Accessible, resilient           |
| 3        | `locator('input[name="..."]')`  | Stable despite copy changes     |
| 4        | `getByLabel(label)`             | Vulnerable to locale changes    |
| 5        | `getByPlaceholder(placeholder)` | Fragile                         |
| 6        | `locator(css)`                  | Last resort                     |
| 7        | `locator(xpath)`                | FORBIDDEN                       |

## Common Selector Bugs

| Symptom                     | Root Cause                       | Fix                            |
| --------------------------- | -------------------------------- | ------------------------------ |
| `getByRole('button')` fails | Element has `role="radio"`       | Use correct role               |
| Multiple matches            | `.or()` returns 2+ elements      | Use `.first()` or `radiogroup` |
| Element not found           | Component conditionally rendered | Check loading/error state      |
| Flaky in CI                 | CSS class changes                | Use testid instead             |

## Audit Checklist

- [ ] Selector uses highest available priority
- [ ] Accessible name matches current component text
- [ ] No duplicate matches (strict mode)
- [ ] Component actually renders the element (read source)
