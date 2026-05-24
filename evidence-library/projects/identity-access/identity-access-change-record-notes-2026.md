# Change Record: AD OU Restructure Planning

- **Change ID:** CHG-2026-001
- **Date:** 2026-05-07
- **Owner:** Jeremy Fontenot
- **Environment:** Sanitized lab planning record for Active Directory-style administration.
- **Objective:** Document an OU structure that separates users, computers, and service accounts so policy targeting, delegation, troubleshooting, and rollback planning are easier to review.
- **Technical areas:** Active Directory fundamentals, OU design, Group Policy scope, change control, backup awareness, rollback planning, and validation documentation.

## Implementation Notes

- Define top-level OUs for Users, Computers, and Service Accounts.
- Document intended GPO scope before moving objects.
- Export or record the current OU layout before any controlled lab change.
- Move only a small lab test set first, then review policy application behavior.
- Keep service accounts isolated from standard user policy assumptions.

## Validation Criteria

- Confirm the test objects appear in the intended OU.
- Confirm expected GPO scope using a lab-safe policy review method such as `gpresult` or Group Policy Results.
- Confirm no unintended policy applies to service accounts.
- Confirm rollback steps are documented before broader changes.

## Rollback Plan

- Restore the prior OU layout from the recorded export or lab snapshot.
- Move test objects back to their original OU if policy behavior is unexpected.
- Preserve notes showing what changed, what was validated, and what remains planned.
