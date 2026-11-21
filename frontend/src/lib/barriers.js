// Barrier types a Campus User can report, in the order they are listed on the form.
export const BARRIER_TYPES = [
  { value: 'broken-elevator', label: 'Broken Elevator', hint: 'An elevator that is out of service' },
  { value: 'blocked-entrance', label: 'Blocked Entrance', hint: 'A door or entrance that cannot be used' },
  { value: 'construction-closure', label: 'Construction Closure', hint: 'A hallway or area closed for work' },
  { value: 'broken-door', label: 'Broken Door', hint: 'An automatic or heavy door that does not open' },
  { value: 'blocked-ramp', label: 'Blocked Ramp', hint: 'A ramp that is blocked or unsafe' },
  { value: 'other', label: 'Other', hint: 'Describe the barrier below' },
];

// Who is reporting. Faculty Staff report a barrier near their classroom.
export const REPORTER_ROLES = [
  { value: 'campus-user', label: 'Campus User', hint: 'A barrier you found on campus' },
  { value: 'faculty-staff', label: 'Faculty Staff', hint: 'A barrier near your classroom' },
];

export const MISSING_LOCATION_MESSAGE =
  'A report without a location is not accepted. Tell us where the barrier is.';
export const MISSING_CLASSROOM_MESSAGE =
  'A report without a classroom is not accepted. Tell us which classroom the barrier is near.';
export const MISSING_ROLE_MESSAGE = 'Choose who is reporting.';
export const LOCATION_LIMIT = 120;
export const LOCATION_TOO_LONG_MESSAGE = `Keep the location to ${LOCATION_LIMIT} characters or fewer.`;
export const MISSING_TYPE_MESSAGE = 'Choose a barrier type.';
export const DESCRIPTION_LIMIT = 300;
export const PHOTO_LIMIT_MB = 5;
export const PHOTO_TOO_BIG_MESSAGE = `That photo is larger than ${PHOTO_LIMIT_MB} MB. Choose a smaller one.`;
export const PHOTO_NOT_IMAGE_MESSAGE = 'Choose an image file for the photo.';

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

// Checks the form. `errors` has a message for each field that needs fixing.
export function validateBarrierReport({ role = 'campus-user', type, location, description } = {}) {
  const errors = {};

  if (!REPORTER_ROLES.some((entry) => entry.value === role)) {
    errors.role = MISSING_ROLE_MESSAGE;
  }

  if (!BARRIER_TYPES.some((entry) => entry.value === type)) {
    errors.type = MISSING_TYPE_MESSAGE;
  }
  if (clean(location) === '') {
    errors.location = role === 'faculty-staff' ? MISSING_CLASSROOM_MESSAGE : MISSING_LOCATION_MESSAGE;
  } else if (clean(location).length > LOCATION_LIMIT) {
    errors.location = LOCATION_TOO_LONG_MESSAGE;
  }
  if (clean(description).length > DESCRIPTION_LIMIT) {
    errors.description = `Keep the description to ${DESCRIPTION_LIMIT} characters or fewer.`;
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

// Checks an optional photo. A file is fine when it is an image under the size limit.
export function validatePhoto(file) {
  if (!file) return { ok: true };
  if (!/^image\//.test(file.type)) return { ok: false, error: PHOTO_NOT_IMAGE_MESSAGE };
  if (file.size > PHOTO_LIMIT_MB * 1024 * 1024) return { ok: false, error: PHOTO_TOO_BIG_MESSAGE };
  return { ok: true };
}

// "R-003" for the third report. Numbers go up for each new report.
export function reportNumber(count) {
  return `R-${String(count + 1).padStart(3, '0')}`;
}

// The report as it is sent. Returns the validation errors instead when the form is not valid.
export function buildBarrierReport(fields, existingCount = 0, photoName = '') {
  const check = validateBarrierReport(fields);
  if (!check.ok) return check;

  const type = BARRIER_TYPES.find((entry) => entry.value === fields.type);
  const role = REPORTER_ROLES.find((entry) => entry.value === (fields.role ?? 'campus-user'));
  return {
    ok: true,
    report: {
      id: reportNumber(existingCount),
      status: 'Pending',
      role: role.value,
      roleLabel: role.label,
      type: type.value,
      typeLabel: type.label,
      location: clean(fields.location),
      description: clean(fields.description),
      photoName,
    },
  };
}
