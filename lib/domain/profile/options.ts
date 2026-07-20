const FALLBACK_TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

export function getTimezoneOptions(): readonly string[] {
  try {
    return Array.from(new Set(["UTC", ...Intl.supportedValuesOf("timeZone")]));
  } catch {
    return FALLBACK_TIMEZONES;
  }
}

export const LOCATION_SUGGESTIONS = [
  "Los Angeles, California, United States",
  "New York, New York, United States",
  "San Francisco, California, United States",
  "Seattle, Washington, United States",
  "Toronto, Ontario, Canada",
  "Vancouver, British Columbia, Canada",
  "London, England, United Kingdom",
  "Paris, France",
  "Berlin, Germany",
  "Amsterdam, Netherlands",
  "Bengaluru, Karnataka, India",
  "Mumbai, Maharashtra, India",
  "New Delhi, Delhi, India",
  "Singapore",
  "Tokyo, Japan",
  "Sydney, New South Wales, Australia",
] as const;
