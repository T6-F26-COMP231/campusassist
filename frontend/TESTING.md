# Testing the CampusAssist UI/UX

Start with `npm run dev`, open <http://localhost:5173>, and use menu → **Reset demo data** before each section.
Section 2 uses **two tabs**. Each tab has its own sign-in, but both share the same data.
Section 6 is an exploratory pass over responsive layout, accessibility and error states.

Quick key: ✅ = expected result from the report's acceptance test.

---

## 1. Single-tab walkthroughs

### Campus User (sign in as `student@campus.test`)

| Story | Do this | ✅ Expected |
|---|---|---|
| 1 Home | Open Home. Tap each of the 5 rows | All 5 features reachable, each opens in one tap |
| 2 Search by name | Search → type `Bookstore` | Campus Bookstore and Bookstore Annex listed |
| 2 | Type `zzz` | "No results found" message |
| 3 Filter | Tap **Elevators** chip | Only places flagged with an elevator are listed |
| 3 | Tap **Clear filters** | All places shown again |
| 4 Details | Open *Student HUB* | Elevator listed with a ✓ |
| 4 | Open *Room B210* | Shows "No accessible washroom" with ✗ |
| 5 QR start | Student HUB → Get Directions → **Scan campus QR code** → `Student HUB` / `CA-HUB-01` | Starting point set to Student HUB |
| 5 | Scan an invalid code | Error appears; **Choose manually** closes the dialog and the dropdown still works |
| 6 Directions | From *Campus Bookstore* to *Student HUB* | Ordered steps ending at "Arrive at Student HUB"; includes the bridge |
| 6 | **Start Navigation** → Next step / Previous / Refresh route | Guided mode with the "progress is not tracked" note |
| 7 Step-free | Tick **Step-free route** (Bookstore → Room A318) | No stairs in any step, "Step-free" badge |
| 7 | Do step 25 below first (approve the Block A elevator), then repeat | "No step-free route is available" with options to see the standard route or request help |
| 12 Report barrier | Report Barrier → fill location + description → Submit | "Report R-003 saved for administrator review" |
| 12 | Submit with an empty location | Error, report is not accepted |
| 13 Plan arrival | From *Student HUB*, class room *Room A210*, today, a time later than now, Save | "Leave by" time earlier than class time (7 min buffer), plan saved |
| 13 | Use a time earlier than now | "That class time is in the past" error |
| 14 Faculty office | Directory → Colleagues → search `Vaughan` | Office (Room A318) shown; **Show on Map** opens details |
| 14 | Search `zzz` | "No results found" |
| 15 Resource office | Directory → Resource Offices → open each row | Each shows a location and opens on the map |

### Authorized Helper (sign in as `alex@campus.test`)

| Story | Do this | ✅ Expected |
|---|---|---|
| 16 Sign in | Sign in with the right password | Open requests screen |
| 16 | Wrong password | "Sign-in refused" |
| 17 Open requests | See Section 2 (needs a user request) | |
| 29 | Deactivated helper (see admin section) | Sign-in refused and no requests shown |

### Administrator (sign in as `admin@campus.test`)

| Story | Do this | ✅ Expected |
|---|---|---|
| 23 Sign in | Sign in as admin | Admin Home with pending-count badge |
| 23 | Sign in as `alex@campus.test` on the Administrator page | Sign-in refused (not an administrator account) |
| 23 | Signed in as a helper, open `/#/admin` in the address bar | "Access refused" screen |
| 24 Pending | Barrier Reports → Pending tab | R-001 and R-002 listed (plus any new reports) |
| 25 Approve | Open R-001 → note the suggested feature **Elevator – Block A** → Approve Report | Green confirmation; report moves to the Approved tab |
| 25 | Before approving, check routes in another tab | No change while pending |
| 26 Reject | Open R-002 → add a reason → Reject Report | No route changes; leaves Pending |
| 27 Resolve | Open the approved R-001 → Mark Resolved | Routes use the elevator again |
| 27 | Open a pending report → Mark Resolved | Error: cannot be marked resolved |
| 28 Add helper | Helper Accounts → name + new email → Add Helper | Success note with temp password `welcome123`; that helper can sign in |
| 28 | Add `alex@campus.test` again | Account refused (duplicate) |
| 29 Deactivate | Deactivate *Bea Okafor* | Status shows Deactivated; she can no longer sign in |
| 30 Directory | Directory Entries → *Bookstore* → change location → Save | New location shows in the Directory immediately |
| 30 | Clear the location and Save | "An entry without a location cannot be saved" |

### Visitor (landing → Visitor, no sign-in)

| Story | Do this | ✅ Expected |
|---|---|---|
| 31 No account | Search `Hub` and open a place → Get Directions | Works without an account |
| 31 | On Visitor Home tap **Sign In** (messaging card) | Asked to sign in |
| 32 Event room | Find an event → `Career Fair` → Get Directions | Room B230 shown; directions start (after a start point) |
| 33 Entrances | Find an accessible entrance → pick *Block B Concourse* | Nearest accessible entrance first; the stairs-only North Entrance is never listed |
| 33 | Approve a barrier on the Block A Main Entrance (admin tab) | That entrance disappears with a "hidden because of a verified barrier" note |
| 34 Guest help | Request in-person help → choose a location → Send | Redirects to a status page with no sign-in |
| 34 | Send without a location | Request not sent, asked for a location |

### Faculty Staff (sign in as `staff@campus.test`)

| Story | Do this | ✅ Expected |
|---|---|---|
| 35 | Staff Home → Directory, then Report a Barrier | Each opens in one tap |
| 36 | Directory → search `Smith` | Dr. Jane Smith, Room B210 |
| 37 | Resource Offices → Accessibility Services | Room A120, Block A |
| 38 | Report a barrier with / without a location | Saved for review / not accepted |

---

## 2. Two-tab flows (the real-time ones)

Open a second tab at the same address. Use a private/incognito window if you want to stay signed in as different roles; separate normal tabs also work because sign-in is stored per tab.

### A. Help request → helper → chat → complete (stories 8–11, 17–22, 9)

1. **Tab 1** (student): Request Help → pick *Room B101* as the location → note "Lost, need to get to Block C" → Send.
   ✅ Status page shows *Pending* and the timeline.
2. **Tab 2** (alex): the request appears under Open Requests Nearby with a distance. Change **My location** and the distance updates.
   ✅ Story 17.
3. In **Tab 1**, tap *Message helper* and send a message before anyone has accepted.
   ✅ "The message cannot be sent: no helper has been assigned yet" (story 11 test 2).
4. **Tab 2**: Accept Request.
   ✅ Tab 1 flips to *Accepted* instantly (story 10). Two-helper check: sign in as `bea@campus.test` in a third tab before accepting. After Alex accepts, Bea's accept shows "Another helper has already accepted" (story 18 test 2).
5. **Tab 2**: Directions to user.
   ✅ Same step format as a Campus User's directions (story 19).
6. **Tab 2**: pick **On the way**, then **Arrived**, pressing Update Status each time.
   ✅ Tab 1 updates to "On the way", then "Arrived" (story 20).
7. Chat from both tabs.
   ✅ Messages appear live on the other side (stories 11 and 21).
8. **Tab 2**: Mark complete → confirm. Try messaging again.
   ✅ Request closes and the helper can accept a new one (story 22). Messaging is refused after completion.
9. Cancel flows (story 9): send a new request and cancel it before acceptance, so it leaves the helper's list. Send another, have a helper accept, then cancel from the student tab.
   ✅ The helper sees a "cancelled by the user" notice.

### B. Barrier approval → reroute (stories 12, 24–27)

1. **Tab 1** (student): Navigate *Campus Bookstore → Student HUB* with **Step-free** on. Note the route uses the Block A elevator.
2. **Tab 2** (admin): Barrier Reports → R-001 (Broken Elevator, Block A) → Approve.
3. **Tab 1** (no refresh):
   ✅ Route changes immediately (outdoor walkway → Block B east ramp → Block B elevator), and a "Rerouted around a verified barrier" notice appears. The map shows the barrier in red.
   (Report target of 30 seconds; here it is effectively instant.)
4. **Tab 1**: Navigate *Campus Bookstore → Room A318* with step-free on.
   ✅ "No step-free route is available". The standard route (stairs) still works.
5. **Tab 2**: open R-001 → Mark Resolved. ✅ Step-free routes are restored.

---

## 3. Responsive checks

1. In Chrome/Edge press F12, then the device toolbar (Ctrl+Shift+M).
2. Try 360×740 (phone), 820×1180 (tablet) and a desktop width.
   ✅ Single readable column, no horizontal scrolling, bottom tab bar on phone for Campus Users and Visitors, all buttons at least 44 px tall.
3. Optional on-device test: `npm run dev` prints a *Network* URL; open it from your phone on the same Wi-Fi.

## 4. Accessibility checks

- **Keyboard only:** Tab through any form. A thick charcoal outline with a lime halo marks the focused control. Dialogs close on Esc and return focus.
- **Colour contrast:** DevTools → Elements → pick any text → contrast ratio should be ≥ 4.5:1 (try the muted grey, lime badges, error notices). Also test with the OS dark theme.
- **Screen reader:** result counts, request status, chat and error notices are `aria-live` / `role="alert"` regions; map graphics have text alternatives and the steps are an ordered list.
- **Automated:** run Lighthouse (Accessibility) or the axe DevTools extension on these pages: Landing, Search, Directions, Request Help, Admin Report Details. The report targets zero errors.

## 5. Automated tests

`npm test` runs the route-engine checks that back the acceptance tests for stories 6, 7 and 25: ordered steps ending at the destination, the bridge is used between blocks, step-free routes contain no stairs, a blocked elevator yields "no step-free route", and approved barriers cause a detour. Routing also has a speed check against the 3-second target.

## 6. Known prototype gaps (by design)

- QR scanning, indoor location and photo review are simulated or minimal.
- Helpers' "near me" uses the walking distance from a location they pick, not live GPS.
- Core Feature 4 (scheduled helper) is available as a checkbox on **Plan Arrival**. The report's wireframes only cover the route-planning half, so this is an addition.
