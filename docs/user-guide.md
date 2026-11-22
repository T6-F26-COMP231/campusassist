# CampusAssist user guide

This guide explains how to use CampusAssist.

## Request in-person help

A Campus User can request in-person navigation assistance. This is for non-emergency navigation help.

### Send a request

1. On **Home**, choose **Request In-Person Help**.
2. In **Your Location**, type your current location, such as `A Block, First Floor (A1)`.
3. Optionally enter your destination or explain what you need in **Destination / Description**.
4. Under **Select Assistance Type**, choose **Standard Guiding**, **Mobility Assistance**, or **Other**. **Standard Guiding** is selected initially.
5. Choose **Send Help Request**. While saving, the button says **Sending...**.

### After a successful submission

The page shows **Help Request Submitted Successfully** and confirms the location you entered:

"Your request from [your location] has been submitted successfully. A campus volunteer can now review your request."

Choose **View Request Status** to check your saved request, or **Back to home** to return Home.

### If the location is empty

A location that is empty or contains only spaces is not accepted. **Send Help Request** is unavailable. The form displays:

"A request without a location cannot be sent."

Enter your current location to enable the button.

### If submission fails

The form displays an error message and keeps your entered information. Check the connection, correct any reported problem, and try again.

## Filter accessible facilities

A Campus User can find facilities and narrow the results by facility type and campus location.

1. On **Home**, choose **Find Accessible Facilities**.
2. Under **Filter by facility**, select a facility type. You can select more than one to see facilities of the selected types.
3. Under **Where**, choose a campus location, or leave **All of campus** selected.
4. Review the matching facilities. Each result shows its type, name, location, and additional details when available.
5. Review the map below the results.
6. Select a chosen facility type again to remove that filter, or choose **Clear filters** to reset both the facility types and campus location.

The count shows **Showing all [total] facilities** when no filters are selected. When filtering, it shows **Showing [matches] of [total] facilities**.

### If no facilities match

The page shows:

"No facilities match these filters. Try another facility type or campus location, or clear the filters."

Change the selected facility types or **Where**, or choose **Clear filters** to show all facilities again.

Locations come from the Progress Campus map and floor plan.

## Report a barrier

A Campus User or Faculty Staff member can report a barrier. The confirmation explains that an administrator will review it before any routes change. A pending report does not change the walking route. After an administrator approves it, that barrier is kept off the walking route.

1. On **Home**, choose **Report Barrier**.
2. Under **Who is reporting?**, choose **Campus User** or **Faculty Staff**.
3. Choose a **Barrier type (required)**: **Broken Elevator**, **Blocked Entrance**, **Construction Closure**, **Broken Door**, **Blocked Ramp**, or **Other**.
4. Enter **Location (required)**. If you selected **Faculty Staff**, this field is called **Classroom (required)**.
5. Optionally fill in **Describe what is blocked (optional)**.
6. Optionally use **Add a photo (optional)**. Choose **Remove photo** to remove the selected photo.
7. Choose **Submit for review**. While saving, the button says **Submitting...**.

### Report a barrier near your classroom

1. On **Home**, choose **Report Barrier**.
2. Under **Who is reporting?**, choose **Faculty Staff**.
3. Choose the barrier type.
4. In **Classroom (required)**, enter the classroom or nearby hallway, such as `The hallway outside B230`. You can also pick a suggestion as you type.
5. Describe the obstruction, such as `Equipment is blocking the hallway outside B230`.
6. Choose **Submit for review**.

### After a successful submission

The page shows **Report sent** and:

"Your barrier report was saved successfully and is Pending review. An administrator will review it before any routes change."

The summary shows **Reported by**, **Type**, and **Classroom** for Faculty Staff, or **Location** for a Campus User. **Details** and **Photo** appear when supplied.

Choose **Back to home** to return Home. Choose **Report another barrier** to open an empty form. Select **Faculty Staff** again when reporting another classroom barrier.

The current photo feature previews the selected image and saves its filename with the report; it does not upload the image itself.

### If required information is missing

A classroom that is empty or contains only spaces is not accepted. For Faculty Staff, the form shows:

"A report without a classroom is not accepted. Tell us which classroom the barrier is near."

For a Campus User with no location, it shows:

"A report without a location is not accepted. Tell us where the barrier is."

If no barrier type is selected, it shows:

"Choose a barrier type."

Correct the listed problems and choose **Submit for review** again.

### Field and photo limits

- Location or classroom: up to 120 characters.
- Description: up to 300 characters.
- Optional photo: an image file no larger than 5 MB.

### If submission fails

The form displays an error instead of the **Report sent** confirmation. Your entered information remains on the form. Check the connection, correct any reported problem, and try again.

### Faculty reporting examples

- **A classroom barrier is submitted.** Choose **Faculty Staff**, select **Blocked Entrance**, enter `The hallway outside B230`, and describe the obstruction. After a successful submission, **Report sent** appears with **Pending review**, and the summary shows **Reported by: Faculty Staff** and the entered **Classroom**.
- **The classroom is missing.** Choose **Faculty Staff** and a barrier type, leave **Classroom** empty or enter only spaces, and choose **Submit for review**. The form stays open and displays the missing-classroom message.
- **The barrier type is missing.** Enter a classroom without selecting a barrier type and choose **Submit for review**. The form displays "Choose a barrier type."

## See pending barrier reports

An administrator can view reports submitted to CampusAssist. The Pending tab loads pending reports from the server. There are no sample reports.

1. On **Home**, choose **Administrator**.
2. Choose **Review Barrier Reports**.
3. **Barrier Reports** opens with the **Pending** tab selected. The tabs show counts, such as **Pending (0)**, **Approved (0)**, and **Closed (0)**.
4. When the **Pending** tab has no reports, it says "No reports are waiting."
5. Choose **View Details** to open a report.
6. Review **Status**, **Type**, **Location**, and **Details**. **Details** says "No description" when none was supplied. **Reported by** and **Photo** appear when available.
7. Choose **Back to reports** to return to the list.

A pending report appears with its title, **Location**, and **Description**. The summary says "1 report is waiting for review, oldest first" or the corresponding number of reports. Reports remain in submission order.

Report titles use the saved report ID, for example **Report [report ID] · Broken Elevator**. Bracketed IDs in this guide are placeholders for the actual IDs displayed by the app.

Reports with status **Approved** appear on **Approved**. Reports with status **Rejected** or **Resolved** appear on **Closed**.



The screen says:

"Reports sent from the app appear here until the app is reloaded."

The Pending tab loads the waiting reports from the server. Reloading the app loads that list again.

### Examples

- **No reports sent during this visit.** Open **Review Barrier Reports**. The **Pending** tab says "No reports are waiting." and shows **Pending (0)**.
- **A Campus User sends a report.** On **Home**, choose **Report Barrier**, select **Campus User**, choose **Broken Elevator**, enter `Near room B230, Block B`, and choose **Submit for review**. After the successful confirmation, return Home and choose **Administrator**, then **Review Barrier Reports**. The report appears on **Pending** with its saved ID and location. **View Details** shows **Status: Pending**.
- **Two reports wait.** Starting with no reports during the current visit, submit two reports successfully. The Pending tab says "2 reports are waiting for review, oldest first". **Report [first report ID]** is listed before **Report [second report ID]**.
- **An approved report.** A report with status **Approved** belongs on **Approved** and is not counted under **Pending**.
- **A rejected report.** A report with status **Rejected** belongs on **Closed** and is not counted under **Pending**.

## Approve a barrier report

An administrator approves a barrier report after checking it. An approved report leaves **Pending** and appears on **Approved**.

The report titles below are examples. Your report will show its actual saved ID.

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

Approving a barrier report causes walking routes to avoid the approved barrier.


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

**Mark as Resolved** saves the report on the server. **Status** becomes **Resolved**, and the report is listed under **Closed**.

An approved barrier is kept off the walking route. After it is marked resolved, later routes can use that place again.

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

## See open help requests

An Authorized Helper can see the open help requests for a campus block and choose one to take. Only requests that are still waiting for a helper appear in the list.

1. On **Home**, choose **View Open Requests (Volunteer)**.
2. Under **Select Campus Block**, choose **A Block**, **B Block**, or **C Block**. The page opens on A Block, and the list changes to show that block's requests.
3. The page title is **Open Requests Nearby**. Each card shows the request number, **Location**, **Problem**, and **Assistance Type**. **Problem** appears when the person described what they need.
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

The page shows "No open requests in Block A right now." Choose another block to look for requests there.

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

A Campus User can use CampusAssist to find walking directions that avoid stairs. When **Step-free** is on, the app uses recorded walkable corridors and elevators instead of stairs.

### Get step-free directions

1. Open CampusAssist.
2. On **Home**, choose **Get Step-by-Step Directions**.
3. On the **Get Directions** page, turn **Step-free** on. The line says **Avoids stairs** when it is on and **Stairs allowed** when it is off.
4. Under **From**, choose where you are. Under **To**, choose where you are going.

The directions appear as soon as both places are chosen. You do not need to press a button. If a step-free route is available, the page shows a **No stairs** label with a tick, the distance and time such as "137 m · 2 min", and the steps. The route may use elevators to travel between floors. Choose **Show map** to see the route on the campus map.

If the step-free route is longer than the usual route, the page says how much longer, such as "52 m longer than the stairs route".

### If your route uses stairs

When **Step-free** is off and the route uses stairs, the page shows a **Uses stairs** label and says "This route uses stairs." Choose **Show step-free route** to turn **Step-free** on and see a route without stairs.

### If no step-free route is available

When the selected places cannot be connected without stairs, the app displays:

"No step-free route is available between these two places."

If a route using stairs exists, the page also displays:

"A route with stairs does exist."

Choose **Show route with stairs** to turn **Step-free** off and see that route. Only choose this option if using stairs is suitable for your needs.

### If no walking route is available

If the campus map contains no connected walking route between the selected places, the app displays:

"The map shows no walkable route between these two places."

Choose different places or seek assistance.

### Remembering your preference

CampusAssist remembers your **Step-free** setting on your device when browser storage is available. You can turn the option on or off at any time.

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

A Campus User can use CampusAssist to find walking directions between campus locations. The steps are shown in walking order and end at the destination.

### Find directions

1. Open CampusAssist.
2. On **Home**, choose **Get Step-by-Step Directions**.
3. On the **Get Directions** page, under **From**, choose where you are. Each place shows its name and floor, such as "A1-51 · Floor 1".
4. Under **To**, choose where you are going.
5. Leave **Step-free** off for regular walking directions. The line says **Stairs allowed**.

The directions appear as soon as both places are chosen. The page shows the distance and time on foot, such as "85 m · 1 min", and a numbered list of steps. Choose **Show map** to see the walking path on the floor plan, and **Hide map** to close it. A route that changes floor has a button for each floor under the map, such as **Floor 1** and **Floor 5**.

Before you choose both places, the page says "Choose where you are and where you are going."

### Swap the start and the destination

Choose the swap button between **From** and **To** to change the direction of the walk. The directions update straight away.

### Bookstore to Student Hub

1. Under **From**, choose **Bookstore (B2-02) · Floor 2**.
2. Under **To**, choose **Student Hub · Floor 2**.

The walk stays inside the B, C, D & E Blocks, so it does not cross the bridge. The steps are:

1. Start at Bookstore (B2-02) on Floor 2
2. Walk 65 m north-east to Student Hub
3. Arrive at Student Hub

The last step is "Arrive at Student Hub".

### A walk between two blocks

1. Under **From**, choose **A2-65A · Floor 2**.
2. Under **To**, choose **Bookstore (B2-02) · Floor 2**.

This walk crosses the bridge. The steps include "Cross the bridge from Block A to the B, C, D & E Blocks", and the last step is "Arrive at Bookstore (B2-02)". The return walk includes "Cross the bridge from the B, C, D & E Blocks to Block A".

### If a route is unavailable

If no connected walking route exists between the selected locations, the app displays:

"The map shows no walkable route between these two places."

Choose another start or destination and try again.

If both selected locations are the same, the app displays:

"You are already at your destination."

### Change your route

To find a different route, change **From** or **To**. The directions update as soon as you choose.

If you need a route that avoids stairs, turn **Step-free** on. See the *Find a step-free route* section for more information.

**Note:** CampusAssist calculates directions using its recorded campus walking data. Temporary barriers, construction, and maintenance may affect actual route accessibility.

## Check your help request status

A Campus User can check the progress of a submitted help request to see when help is coming.

1. Submit a request using **Request In-Person Help**.
2. On **Home**, choose **My Help Request Status**, or choose **View Request Status** on the submission confirmation.
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

### Message your helper

Once a helper accepts your request, you can tell them exactly where you are. **Message your helper** is on **My Help Request Status**, below the status.

1. On **Home**, choose **My Help Request Status**.
2. In **Message your helper**, write your message in **Message to your helper**. It shows how many characters you have used, such as "0 of 300 characters".
3. To send the location from your request, choose **Share my location**. It fills the message with "I am at" and the **Current Location** on your request, for example "I am at A3-74."
4. Choose **Send message**. The screen shows "Message sent." and your message appears in the list with "You" and the time.

Your messages stay in the list while you move around the app. The screen notes: "Messages are kept on this screen until the app is reloaded."

### Examples

- **Before a helper accepts.** The status is **Pending**. **Message your helper** says "You can message your helper once a helper accepts your request." The message box, **Share my location** and **Send message** are not available.
- **After a helper accepts.** The status is **Accepted**. The list says "No messages yet. Tell your helper where you are." and the message box is available.
- **Share your location.** Your request says **Current Location** A3-74. Choose **Share my location**, then **Send message**. The screen shows "Message sent." and the list shows "I am at A3-74."
- **An empty message.** Choose **Send message** with nothing written. The screen says "Write a message before sending." and nothing is sent.
- **A message that is too long.** More than 300 characters says "Keep the message to 300 characters or fewer." and nothing is sent.
- **After the request is closed.** When the status is **Completed** or **Cancelled**, the screen says "This request is closed, so messages can no longer be sent." and you cannot send a message.

Your helper does not receive these messages yet, and a helper's replies do not appear. Sending, storing and receiving messages are not in the app yet.


### If the status cannot be loaded

If no request is selected, the page says "No request selected."

If the request cannot be found, the page says "Request not found."

If the request has no status, the page says "Current Status: Unavailable" and "Status information unavailable. Please check again shortly."

Choose **Back to Dashboard** to return to Home.