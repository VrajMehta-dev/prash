# PRASH tenant app: features in this update

Same artwork is used for Google Play and the App Store (`screenshots/play`, `screenshots/appstore-6.9`, `screenshots/appstore-6.5`). Raw captures are in `screenshots-raw/`; rebuild the framed slides with `python3 compose.py`.

| # | Feature | What the tenant gets | Screenshot |
|---|---------|----------------------|------------|
| 1 | Sign in | Email and password, or Continue with Google. Forgot password sends a 4-digit code that fills in from the clipboard. | ![](screenshots/play/01-login.png) ![](screenshots/play/13-forgot-password.png) |
| 2 | Home | Total due, pending items, one-tap pay for the next item, shortcuts to Rent, Extras, Deposit and Pay, outlet switcher. | ![](screenshots/play/02-home.png) |
| 3 | Pay in order | One screen lists everything due in the required order: security deposit, container charges, extra charges, rent. Later items are locked with a note saying what to pay first. | ![](screenshots/play/03-pay-in-order.png) |
| 4 | Review & slide to pay | Every Pay button opens a review sheet. Slide to pay, then the app waits for the bank/gateway to confirm before showing success. Failed, cancelled and still-confirming states are explained, and a pending payment blocks a second attempt for 10 minutes so nobody is charged twice. | ![](screenshots/play/04-checkout-review.png) |
| 5 | Monthly rent | Due dates, status, breakdown, invoice and receipt PDFs. | ![](screenshots/play/05-rent.png) |
| 6 | Extra charges | Each charge with breakdown, invoice and receipt. | ![](screenshots/play/06-extras.png) |
| 7 | Container charges | Pending and paid lists with Pay now, invoice and receipt. | ![](screenshots/play/07-container-charges.png) |
| 8 | Security deposit | Invoice when due, payment, receipt once paid. Other payments unlock after it is paid. | ![](screenshots/play/08-security-deposit.png) |
| 9 | Shop documents | Rental contracts and FSSAI licence with Active / Expiring / Expired labels and a View button. | ![](screenshots/play/09-shop-documents.png) |
| 10 | Notifications | Categorised, tap to open the right page, older ones load as you scroll, white PRASH icon in the status bar. | ![](screenshots/play/10-notifications.png) |
| 11 | Account | Details, bank, documents, help and sign out. | ![](screenshots/play/11-account.png) |
| 12 | More | Container charges, security deposit, shop documents and account one tap away. | ![](screenshots/play/12-more-sheet.png) |

## Also in this update (no screenshot)
- 90-day sliding sessions: stay signed in while active; sign-out or a password change ends all sessions.
- Help and support: call or email, hours 9:30 to 4:30 Mon to Sat.
- In-app update prompt (download, then Restart) and a forced-update screen for old builds.
- Festival logos on the login and home screens during major Indian festivals (not shown in store images).
- Modern toasts, directional screen transitions, haptics, new app icon.
- Security: Easebuzz payment responses are signature-verified; double payments are flagged for finance.

## Store notes
- Direct UPI (no gateway screen) is built but depends on Easebuzz enabling Seamless on the merchant account; today payments open the Easebuzz checkout.
- Google sign-in is prepared on iOS but not built or tested there yet; remove it from the iOS text if the iOS build lacks it.
