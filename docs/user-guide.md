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

A Campus User or Faculty Staff member can report a barrier. The confirmation explains that an administrator will review it before any routes change. Barrier reports do not currently change routes automatically.

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

Reloading clears the current administrator list. This does not mean the submitted reports were deleted from the database; the current list does not reload them from the server.

### Examples

- **No reports sent during this visit.** Open **Review Barrier Reports**. The **Pending** tab says "No reports are waiting." and shows **Pending (0)**.
- **A Campus User sends a report.** On **Home**, choose **Report Barrier**, select **Campus User**, choose **Broken Elevator**, enter `Near room B230, Block B`, and choose **Submit for review**. After the successful confirmation, return Home and choose **Administrator**, then **Review Barrier Reports**. The report appears on **Pending** with its saved ID and location. **View Details** shows **Status: Pending**.
- **Two reports wait.** Starting with no reports during the current visit, submit two reports successfully. The Pending tab says "2 reports are waiting for review, oldest first". **Report [first report ID]** is listed before **Report [second report ID]**.
- **An approved report.** A report with status **Approved** belongs on **Approved** and is not counted under **Pending**.
- **A rejected report.** A report with status **Rejected** belongs on **Closed** and is not counted under **Pending**.

## Mark a barrier as resolved

Only a report with status **Approved** can be marked resolved.

The current app does not provide an approval action, so a newly submitted pending report cannot reach this step through the current interface. The following steps apply when an approved report is available in the list.

1. On **Home**, choose **Administrator**, then **Review Barrier Reports**.
2. Open **Approved** and choose **View Details** on the report.
3. Choose **Mark as Resolved**.
4. The screen asks "Mark Report [report ID] · Broken Elevator as resolved?" using the selected report's title.
5. Read the explanation: "The barrier is cleared. It moves to Closed and no longer counts as an open barrier. You cannot undo this here."
6. Choose **Yes, mark resolved**, or choose **Cancel** to leave the report unchanged.
7. After success, the screen says "Report [report ID] · Broken Elevator was marked resolved. It is now listed under Closed." using the selected report's title.
8. **Status** shows **Resolved**, and **Mark as Resolved** is gone. Choose **Back to reports** to view the updated counts.

Resolution currently changes the report in the current app visit. It is not saved back to the server.

### Examples

- **An approved barrier is resolved.** With one approved report and no other reports, the tabs read **Pending (0)**, **Approved (1)**, and **Closed (0)**. Resolve that report. The tabs become **Pending (0)**, **Approved (0)**, and **Closed (1)**.
- **Cancel.** On the confirmation question, choose **Cancel**. **Status** remains **Approved**, and **Mark as Resolved** remains available.
- **A pending barrier.** Open a pending report. **Mark as Resolved** is disabled, and the screen says "Only approved barriers can be marked resolved."
- **An already resolved barrier.** A resolved report has no **Mark as Resolved** button, so it cannot be resolved twice.
- **Resolution fails.** An error message appears instead of the success message. Review the message and return to the report list if necessary.

Routes are not changed by resolving a barrier. The app does not currently block a route because of a barrier report.

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

### If the status cannot be loaded

If no request is selected, the page says "No request selected."

If the request cannot be found, the page says "Request not found."

If the request has no status, the page says "Current Status: Unavailable" and "Status information unavailable. Please check again shortly."

Choose **Back to Dashboard** to return to Home.