// The starting point of the app: every feature, grouped by what the person wants to do.
// `label` is the button name. `hint` is the line under it. `action` is the screen it opens.
export const HOME_SECTIONS = [
  {
    id: 'help',
    title: 'Get help',
    items: [
      {
        action: 'requestHelp',
        label: 'Request In-Person Help',
        hint: 'A volunteer walks with you to your destination',
        primary: true,
      },
      {
        action: 'requestStatus',
        label: 'My Help Request Status',
        hint: 'See how your request is going',
      },
    ],
  },
  {
    id: 'navigate',
    title: 'Find your way',
    items: [
      {
        action: 'getDirections',
        label: 'Get Step-by-Step Directions',
        hint: 'Walking directions with a map',
      },
      {
        action: 'searchLocation',
        label: 'Search Location',
        hint: 'Find a place by name',
      },
      {
        action: 'facilities',
        label: 'Find Accessible Facilities',
        hint: 'Elevators, accessible washrooms and more',
      },
      {
        action: 'features',
        label: 'Check Destination Accessibility',
        hint: 'See what a place offers before you go',
      },
    ],
  },
  {
    id: 'report',
    title: 'Report a problem',
    items: [
      {
        action: 'reportBarrier',
        label: 'Report Barrier',
        hint: 'A broken elevator or a blocked path, with its location',
      },
    ],
  },
  {
    id: 'staff',
    title: 'Volunteers and staff',
    items: [
      {
        action: 'openRequests',
        label: 'View Open Requests (Volunteer)',
        hint: 'Accept a request from someone near you',
      },
      {
        action: 'admin',
        label: 'Administrator',
        hint: 'Review barrier reports',
      },
    ],
  },
];

export const HOME_ITEMS = HOME_SECTIONS.flatMap((section) => section.items);
export const HOME_ACTIONS = HOME_ITEMS.map((item) => item.action);
