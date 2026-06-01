# Conditional Access Baseline — Evidence Notes (2026)

## 1. Policy Inventory Validation
| Policy | Mode | Result |
|--------|------|---------|
| Require MFA | On | Enforced |
| Block Legacy Auth | On | Blocked attempts |
| Require Compliant Device | Report-only | Evaluated |
| Admin Protection | On | Enforced |

## 2. Sign-In Log Evidence
User: jfontenot
Policy: Require MFA
Result: MFA Required → Success

Code

## 3. Legacy Auth Block Evidence
Attempt: IMAP login
Result: Blocked by CA-02

Code
