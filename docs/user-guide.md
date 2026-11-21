# CampusAssist user guide

This guide is for someone using CampusAssist, not for setting up the project. Each story adds its own section.

## Request in-person help

A signed-in Campus User can ask an authorized helper to come to their current location and guide them. This is for non-emergency navigation help. In an emergency, contact campus security or call 911.

### Send a request

1. Open CampusAssist and choose **Campus User**.
2. Sign in. The demo account is `student@campus.test` / `student123`.
3. On **Home**, choose **Request Help**.
4. Under **Your location (required)**, choose where you are now from the map list, or use **Scan campus QR code**.
5. Optionally describe where you are headed in **Destination / description**.
6. Choose an assistance type: **Standard Guiding**, **Mobility Assistance**, or **Other**.
7. Choose **Send Help Request**.

The app opens **My Help Request**. The status is **Pending**, your location is shown, and the timeline starts at **Request Submitted**. Helpers can then see the request in their open list.

### If you do not choose a location

The request is not sent. The form stays open and shows: "The request was not sent: choose your current location first." Choose a location, then send again.

## Filter accessible facilities

A signed-in Campus User can limit the place list to facilities they can use, such as elevators and accessible washrooms.

1. Open CampusAssist and choose **Campus User**.
2. Sign in. The demo account is `student@campus.test` / `student123`.
3. On **Home**, choose **Search Location**.
4. Under **Accessible facilities**, choose one or more of **Elevators**, **Accessible washrooms**, **Ramps**, and **Auto doors**.
5. The list shows only places that have every facility you chose. Each result names the place, its block and floor, and the facilities it has.
6. Choose **Clear filters** to show every place again.

Choosing **Elevators** leaves only places with an elevator. If a search and the filters match nothing, the list says no results were found and tells you to try another name or clear the filters.

## Report a barrier

A signed-in Campus User can report a broken elevator, a blocked entrance, or another obstacle. An administrator reviews the report before any routes change.

1. Open CampusAssist and choose **Campus User**.
2. Sign in. The demo account is `student@campus.test` / `student123`.
3. On **Home**, choose **Report Barrier**.
4. Choose a **Barrier type**: **Broken Elevator**, **Blocked Entrance**, **Construction Closure**, **Broken Door**, **Blocked Ramp**, or **Other**.
5. Enter **Location (required)**. You can type a place, such as `Near room B230, Block B`.
6. Optionally describe what is blocked, and optionally add a photo.
7. Choose **Submit for review**.

The app opens **Report sent** and shows: "Report R-003 was saved. An administrator reviews it before any routes change." The number goes up for each new report. Routes stay the same until an administrator approves the report.

### If you leave the location empty

The report is not accepted. The form stays open and shows: "A report without a location is not accepted. Tell us where the barrier is." Enter a location, then submit again.

## See pending barrier reports

An administrator uses this list so a barrier report is not missed. Only reports that are still waiting for review appear on the **Pending** tab. Only reports sent from the app are listed. There are no sample reports.

1. Open CampusAssist. On **Home**, choose **Administrator**.
2. **Admin Home** says "Check the reports that need your review." Choose **Review Barrier Reports**.
3. When no report is waiting, the row says "No reports are waiting" and there is no badge. When reports are waiting, the row says "1 report is pending" or "2 reports are pending", and a badge shows that count.
4. **Barrier Reports** opens with the **Pending** tab selected. The tabs show a count, such as **Pending (0)**, **Approved (0)**, and **Closed (0)**.
5. When the **Pending** tab has no reports, it says "No reports are waiting."
6. Choose **View Details** to open one report. It shows **Status**, **Type**, **Location**, and **Details**. **Details** says "No description" when the report has none. **Reported by** and **Photo** appear when the report has them. Choose **Back to reports** to return to the list.

A submitted report appears in **Pending** with **Status** **Pending**. The list shows its title, **Location**, and **Description**. One waiting report makes the tab say "1 report is waiting for review, oldest first". The oldest waiting report stays first.

An approved report leaves **Pending** and appears on **Approved**. A rejected report leaves **Pending** and appears on **Closed**. Neither one is counted in the Pending badge. The screen says "Reports sent from the app appear here until the app is reloaded."

### Examples

- **No reports sent yet.** Open **Review Barrier Reports**. The row says "No reports are waiting" with no badge. The **Pending** tab says "No reports are waiting." and shows **Pending (0)**.
- **A Campus User sends a report.** On **Home**, choose **Report Barrier**, choose **Broken Elevator**, enter the location `Near room B230, Block B`, and choose **Submit for review**. The app shows **Report sent**: "Your barrier report was saved successfully and is Pending review. An administrator will review it before any routes change." Go to **Administrator**, then **Review Barrier Reports**. The row says "1 report is pending" with a badge of 1. The **Pending** tab says "1 report is waiting for review, oldest first" and lists **Report 001 · Broken Elevator**, Location: Near room B230, Block B. **View Details** shows **Status** **Pending**.
- **Two reports wait.** After a second report is sent, the badge shows 2 and the Pending tab says "2 reports are waiting for review, oldest first". **Report 001** is listed first, then **Report 002**.
- **An approved report leaves Pending.** It is no longer in the **Pending** list or the badge. It appears on **Approved**.
- **A rejected report leaves Pending.** It is no longer in the **Pending** list or the badge. It appears on **Closed**.


## Approve a barrier report

An administrator approves a barrier report after checking it. An approved report leaves **Pending** and appears on **Approved**.

1. On **Home**, choose **Administrator**, then **Review Barrier Reports**.
2. On the **Pending** tab, choose **View Details** on the report.
3. Choose **Approve**. The screen asks: "Approve Report 001 · Broken Elevator?" It explains: "The report moves to Approved and no longer counts as pending. Only an approved barrier can be marked resolved later."
4. Choose **Yes, approve**. To keep the report as it was, choose **Cancel**.
5. The screen shows "Report 001 · Broken Elevator was approved. It is now listed under Approved." The **Status** is **Approved** and **Approve** is gone. Choose **Back to reports**: the **Pending** count goes down by one, the **Approved** count goes up by one, and the badge on **Admin Home** counts one fewer report.

An approved report can then be marked resolved. See "Mark a barrier as resolved".

### Examples

- **A pending report is approved.** The **Pending** tab says "1 report is waiting for review, oldest first" and lists **Report 001 · Broken Elevator**. Choose **View Details**, **Approve**, then **Yes, approve**. The screen shows "Report 001 · Broken Elevator was approved. It is now listed under Approved." The tabs now read **Pending (0)**, **Approved (1)** and **Closed (0)**. The **Pending** tab says "No reports are waiting." and the badge on **Admin Home** is gone.
- **Cancel.** On the question "Approve Report 001 · Broken Elevator?", choose **Cancel**. The **Status** is still **Pending** and **Approve** is still there.
- **Two reports wait.** Approve **Report 001**. The **Pending** tab now says "1 report is waiting for review, oldest first" and lists **Report 002**. The badge shows 1.
- **A report that is not pending.** A report that is already approved, rejected, or resolved has no **Approve** button, so it cannot be approved twice.
- **Resolve it later.** After a report is approved, **Mark as Resolved** is available on it. Before that, it is not, and the screen says "Only approved barriers can be marked resolved."

Routes are not changed by approving a report yet. The app does not block a route because of a barrier report.


## Reject a false barrier report

An administrator rejects a barrier report that is false or a mistake, so the barriers on record stay accurate. A rejected report leaves **Pending** and appears on **Closed**.

1. On **Home**, choose **Administrator**, then **Review Barrier Reports**.
2. On the **Pending** tab, choose **View Details** on the report.
3. Choose **Reject**. The screen asks: "Reject Report 001 · Blocked Entrance?" It explains: "Use this for a report that is false or a mistake. It moves to Closed and no longer counts as pending. You cannot undo this here."
4. Choose **Yes, reject**. To keep the report as it was, choose **Cancel**.
5. The screen shows "Report 001 · Blocked Entrance was rejected. It is now listed under Closed." The **Status** is **Rejected** and **Approve**, **Reject**, and **Mark as Resolved** are gone. Choose **Back to reports**: the **Pending** count goes down by one, the **Closed** count goes up by one, and the badge on **Admin Home** counts one fewer report.

### Examples

- **A false report is rejected.** Two reports wait, so the row on **Admin Home** says "2 reports are pending" with a badge of 2. Open **Report 001 · Blocked Entrance**, choose **Reject**, then **Yes, reject**. The screen shows "Report 001 · Blocked Entrance was rejected. It is now listed under Closed." The tabs now read **Pending (1)**, **Approved (0)** and **Closed (1)**. The **Pending** tab lists only **Report 002**, and the badge shows 1.
- **Cancel.** On the question "Reject Report 001 · Blocked Entrance?", choose **Cancel**. The **Status** is still **Pending**, and **Approve** and **Reject** are still there.
- **A rejected report stays out of Pending.** A rejected report is not in the **Pending** list and does not count in the badge. It is on **Closed**.
- **A report that is not pending.** A report that is already approved, rejected, or resolved has no **Reject** button, so it cannot be rejected twice. An approved report is not rejected here. It can be marked resolved.
- **A rejected report is final.** It has no **Approve**, **Reject**, or **Mark as Resolved** button.

Routes are not changed by rejecting a report. The app does not block a route because of a barrier report, so a rejected report never affected a route.


## Mark a barrier as resolved

An administrator can mark an approved barrier as resolved after the obstruction has been cleared.

### Resolve an approved barrier

1. On **Home**, choose **Administrator**, then **Review Barrier Reports**.
2. Open the **Approved** tab and choose **View Details** on the relevant report.
3. Confirm that the location and details identify the barrier that has been cleared.
4. Choose **Mark as Resolved**.
5. The screen asks "Mark [report title] as resolved?" and explains: "The barrier is cleared. It moves to Closed and no longer counts as an open barrier. You cannot undo this here."
6. Choose **Yes, mark resolved** to confirm, or **Cancel** to leave the report unchanged.
7. After success, **Status** shows **Resolved**. The message says "[report title] was marked resolved. It is now listed under Closed."
8. Choose **Back to reports**, then **Closed**, to find the resolved report. The Approved count decreases by one and the Closed count increases by one.

The placeholder [report title] means the actual title displayed for your selected report.

### If the report is still Pending

Only approved barriers can be resolved. A pending report shows a disabled **Mark as Resolved** button and:

"Only approved barriers can be marked resolved."

If the report is valid, choose **Approve**, then **Yes, approve**. Once its status is **Approved**, it can be resolved after the barrier has been cleared.

### If resolution fails

The page displays an error instead of the success confirmation. Do not assume the barrier was marked resolved. Read the error and check its displayed **Status**.

### Examples

- **Resolve an approved report.** Open an approved report and choose **Mark as Resolved**, then **Yes, mark resolved**. Its status becomes **Resolved**, and it appears under **Closed**.
- **Cancel the confirmation.** Choose **Cancel**. The report stays **Approved** and can still be resolved later.
- **Try a pending report.** **Mark as Resolved** is disabled, and the page explains that only approved barriers can be resolved.
- **Open a resolved or rejected report.** The **Mark as Resolved** button is not shown.

### Current limitations

Marking a report resolved updates the current app list. This action does not currently reopen or recalculate walking routes.


## See open help requests

An Authorized Helper can see the open help requests for a campus block and choose one to take. Only requests that are still waiting for a helper appear in the list.

1. On  **Home** , choose  **View Open Requests (Volunteer)** .
2. Under  **Select Campus Block** , choose  **A Block** ,  **B Block** , or  **C Block** . The page opens on A Block, and the list changes to show that block's requests.
3. The page title is  **Open Requests Nearby** . Each card shows the request number,  **Location** ,  **Problem** , and  **Assistance Type** . **Problem** appears when the person described what they need.
4. Choose **Accept Request** on a card to open that request.
5. Choose **Message User** to contact the person. For now, the app shows: "Messaging is coming soon."

### Accept a help request

An Authorized Helper can accept one open request so the campus user sees that help is assigned.

1. On **Home**, choose **View Open Requests (Volunteer)**.
2. Choose **Accept Request** on a waiting request.
3. On **Accept this request**, review **Location**, **Needs**, and **Status**. **Status** starts as **Pending**. **Details** appears when the person described what they need.
4. Choose **Accept Request**. While it is saving, the button says **Accepting…**.

When the request is saved, the button says **Accepted**, **Status** shows **Accepted**, and the page says "Help request accepted successfully."

Choose **Back to open requests** to return to the list. That request no longer appears there.

### What the campus user sees

On **Home**, choose **My Help Request Status**. **Current Status** shows **Accepted**, and the page says "A helper has accepted your request." **Assigned Helper** no longer says **Not assigned yet**.

### If another helper already accepted it

The page says "Request is unavailable or already accepted." **Status** stays **Pending** on that screen, and the button stays **Accept Request**. Choose **Back to open requests**.

If this device has no helper account set up, the page says "This device has no helper account set up, so a request cannot be accepted."

### If a block has no open requests

The page shows "No open requests in Block A right now."  Choose another block to look for requests there.

Accepted or cancelled requests do not appear in the list.

## Get directions to the user

An Authorized Helper can open walking directions to the location saved on a help request. The directions end at that location.

1. On **Home**, choose **View Open Requests (Volunteer)**.
2. Choose **Accept Request** on the request you are taking.
3. On **Accept this request**, choose **Directions to this user**.
4. The page title is **Directions to the user**. While the location is loading, the page says "Loading the user's location..."
5. Read **User's Current Location**. If the person also named a place they want to reach, that place is shown as **Requested Destination**. The walk still goes to the current location.
6. Choose **Find Walking Directions**.

The directions are a numbered list:

1. Start from your current position.
2. Walk toward the user's current location.
3. Arrive at that location.

Before you choose the button, the page says "Select Find Walking Directions." After the steps, it says "These are general directions based on the request. A physical walking route has not been automatically verified."

If the location is a room on the Progress Campus floor plan, the page also shows **Destination on Floor Plan** and that room code.

### A request at Room B210

When **User's Current Location** is **Room B210**, the steps are:

1. Start from your current position.
2. Walk toward Room B210.
3. Arrive at Room B210.

The last step is the location in the request. If **Requested Destination** is **Student HUB**, the steps still end at Room B210.

### If the request has no location

The page says "This request has no location to walk to." **Find Walking Directions** stays unavailable.

### If the location cannot be loaded

The page says "Unable to load the user's location." If no request was opened, it says "No request selected."

### Avoid stairs

Turn on **Avoid stairs**, then choose **Find Walking Directions**. The page says "Routes containing recorded stair connections will be excluded. Other accessibility conditions have not yet been verified."

For **Bookstore**, the steps are:

1. Start from your current position.
2. Take the elevator to the second floor.
3. Arrive at the Bookstore.

Those steps do not mention stairs. For a location with no recorded step-free route, such as **Room B210**, the page says "No step-free route is available."

## Check destination accessibility

A Campus User can check a destination's accessibility features before going there.

1. On **Home**, choose **Check Destination Accessibility**.
2. On **Check a Destination**, open the **Destination** dropdown.
3. Choose your destination.
4. Review the destination name and the number of accessibility features available.
5. Read the feature list. Each feature shows **Available** with a check mark or **Not available** with a cross.
6. Choose another destination from the dropdown to check a different place.

### Missing accessibility features

The page lists missing features under **Missing at this destination**. If an accessible washroom is unavailable, it also says: "This destination has no accessible washroom."

If every feature is available, the page says: "Nothing is missing. This destination has every accessibility feature."

### Before choosing a destination

The page shows: "Pick a destination to see what it offers." Choose a destination to display its accessibility information.

### Destination examples

- Choose **Student HUB** from the **Destination** dropdown. Its feature list shows **Elevators** as **Available**.
- Choose **Room B210** from the **Destination** dropdown. Its accessible washroom shows **Not available**, and the page says: "This destination has no accessible washroom."

## Find a step-free route

A Campus User can use CampusAssist to find walking directions that avoid stairs. When step-free routing is selected, the app uses recorded walkable corridors and elevators instead of stairs.

### Get step-free directions

1. Open CampusAssist.
2. On **Home**, choose **Get Step-by-Step Directions**.
3. On the **Get Directions** page, select your current location under **I am at**.
4. Under **I am going to**, select your destination.
5. Turn **Step-free route** to **On**.
6. Choose **Show step-free route**.

If a step-free route is available, CampusAssist displays walking instructions that avoid recorded stairs. The route may use elevators to travel between floors.

The page also displays the route on the campus map, the approximate walking distance, and the estimated walking time. If the step-free route is longer than the usual route, the additional distance is displayed.

### If no step-free route is available

When the selected locations cannot be connected without stairs, the app displays:

"No step-free route is available between these two places."

If a route using stairs exists, the page also displays:

"A route with stairs does exist."

Choose **Show route with stairs** to view that alternative. Only choose this option if using stairs is suitable for your needs.

### If no walking route is available

If the campus map contains no connected walking route between the selected places, the app displays:

"The map shows no walkable route between these two places."

Choose different locations or seek assistance.

### Remembering your preference

CampusAssist remembers your Step-free route setting on your device when browser storage is available. You can turn the option on or off at any time.

**Note:** Step-free routing avoids stairs recorded in the campus routing data. It does not guarantee that every corridor, elevator, doorway, or other part of the route is currently accessible. Actual conditions may change because of maintenance, construction, or temporary barriers.

## Search for a location by name

A Campus User can search for a named place and see its location.

1. On **Home**, choose **Search Location**.
2. In **Location name**, enter a place name, such as **Bookstore**.
3. Choose **Search** or press **Enter**.
4. Review the matching results. Each result shows the place name and its location.
5. Change the name and search again to find another place.

Search ignores capital letters and accepts part of a name.

### Search examples

- Search for **Bookstore**. The result shows **Bookstore** and **Second floor**.
- Search for **bookstore**. The same result appears.
- Search for **Student**. The results include **Student HUB** on the **Second floor** and **Student Centre** at **Progress Campus**.

### If the search is empty

An empty search or one containing only spaces shows: "Enter a location name to search." Enter a place name and choose **Search** again.

### If no places match

The page shows: "No results were found." Check the spelling or try part of a place name.

The current search list contains **Bookstore**, **Student HUB**, **Student Centre**, and **Transit Hub**.

## Get step-by-step directions

A Campus User can use CampusAssist to find walking directions between campus locations. The instructions are displayed in walking order to help users reach their destination.

### Find directions

1. Open CampusAssist.
2. On **Home**, choose **Get Step-by-Step Directions**.
3. On the **Get Directions** page, select your starting location under **I am at**.
4. Under **I am going to**, select your destination.
5. Leave **Step-free route** turned **Off** for regular walking directions.
6. Select **Show directions**.

CampusAssist displays the starting location, destination, and step-by-step walking instructions. The page also shows the route under **Route on the map**, with the walking distance and the estimated time on foot.

### Bookstore to Student Hub

1. Under **I am at**, select **Bookstore (B2-02) (Floor 2)**.
2. Under **I am going to**, select **Student Hub (Floor 2)**.
3. Leave **Step-free route** turned **Off**.
4. Select **Show directions**.

The walk stays inside the B, C, D & E Blocks, so it does not cross the bridge. The steps are:

1. Start at Bookstore (B2-02) on Floor 2
2. Walk 65 m north-east to Student Hub
3. Arrive at Student Hub

The last step is "Arrive at Student Hub".

### A walk between two blocks

1. Under **I am at**, select **A2-65A (Floor 2)**.
2. Under **I am going to**, select **Bookstore (B2-02) (Floor 2)**.
3. Leave **Step-free route** turned **Off**.
4. Select **Show directions**.

This walk crosses the bridge. The steps include "Cross the bridge from Block A to the B, C, D & E Blocks", and the last step is "Arrive at Bookstore (B2-02)". The return walk includes "Cross the bridge from the B, C, D & E Blocks to Block A."

### If a route is unavailable

If no connected walking route exists between the selected locations, the app displays:

"The map shows no walkable route between these two places."

Choose another starting location or destination and try again.

If both selected locations are the same, the app displays:

"You are already at your destination."

### Change your route

To find a different route, change either location using the dropdown menus and select **Show directions** again.

If you need a route that avoids stairs, turn **Step-free route** to **On**, then select **Show step-free route**. See the *Find a step-free route* section for more information.

**Note:** CampusAssist calculates directions using its recorded campus walking data. Temporary barriers, construction, and maintenance may affect actual route accessibility.

## Check your help request status

A Campus User can check the progress of a submitted help request to see when help is coming.

1. Submit a request using **Request In-Person Help**.
2. On **Home**, choose **My Help Request Status**.
3. Review your assistance type, current location, destination or description, and assigned helper.
4. Read **Current Status** and the progress timeline.

If no helper has been assigned, **Assigned Helper** shows **Not assigned yet**. If no destination or description was entered, it shows **Not specified**.

### What each status means

- **Pending**: Your request has been received.
- **Accepted**: A helper has accepted your request.
- **On the Way**: Your helper is on the way.
- **Arrived**: Your helper has arrived.
- **Completed**: Your assistance has been completed.
- **Cancelled**: Your request was cancelled.

The timeline shows **Request Submitted**, **Accepted**, **On the Way**, **Arrived**, and **Completed**. A cancelled request shows a cancellation message instead of the timeline.

### Check for updates

While the request is active, the page checks for updates automatically every 10 seconds. Choose **Check now** to check immediately. The last checked time shows when the most recent successful check occurred.

Automatic checks stop when the request is completed or cancelled.

If a background check fails, the page keeps showing the last known status. An unchanged status does not necessarily mean a new check succeeded; check the last checked time.

### If the status cannot be loaded

If the request cannot be found, the page says "Request not found."

If the request has no status, the page says "Current Status: Unavailable" and "Status information unavailable. Please check again shortly."

Choose **Back to Dashboard** to return to Home.