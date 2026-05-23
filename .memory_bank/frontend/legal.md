# Legal

Privacy and terms pages linked from the public landing footers.

## Routes

- `/privacy`
- `/terms`
- `/privacy-policy.html`
- `/terms-of-service.html`

## Key file

- `frontend/src/features/legal/LegalPage.tsx`
- `frontend/src/features/legal/LegalPage.css`
- `frontend/src/shared/i18n/ru.json`
- `frontend/src/shared/i18n/en.json`

## Behavior

- `LegalPage` renders the `privacy` or `terms` variant through a `kind` prop.
- The pages use a restrained document layout with the Rezynt logo header, section dividers, and readable legal typography.
- The legal header is sticky and uses a compact close control in the upper-right corner; closing links back to `/`.
- Legal sections support `body`, `paragraphs`, and `items` arrays from i18n.
- Both legal variants render the same footer pattern as the public landing: logo/copyright row, divider, support email, privacy link, and terms link.
- These pages are shared by both the public landing and the experimental landing concept.

## Content notes

- Privacy is written as a Russian personal-data processing policy for the current resume-builder flow: landing form, automatic account creation, resume data, template selection, paid access, export, YooKassa payment identifiers, Yandex Metrica analytics, processors, cross-border transfer posture, retention, user rights, security, and updates.
- The operator is Ivan Sergeevich Pikulin, self-employed payer of professional income tax, taxpayer ID 504030510176, Moscow Region, Russia; contact email is `team@rezynt.com`.
- The current legal text does not describe AI processing. If AI resume analysis or generation returns to the active flow, update both the policy and terms before release.
- Terms cover public-offer acceptance, account/access rules, resume-content responsibility, templates/export, one-time `149 ₽` payment for 5 days through YooKassa, no auto-renewal, no general refund, acceptable use, intellectual property, personal data, liability limits, termination, changes, governing law, and operator details.
- Age wording is soft: users should have legal capacity; users under 18 must use the service with legal representative consent. There is no hard 18+ ban in the current Rezynt documents.

*Последнее обновление: 2026-05-23*
