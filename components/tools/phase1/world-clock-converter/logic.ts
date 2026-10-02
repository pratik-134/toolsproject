export interface CityTimezone {
  id: string;
  city: string;
  country: string;
  iana: string; // e.g. "America/New_York"
  flag: string;
  utcOffset: number; // Standard approximate offset in hours
}

export const POPULAR_CITIES: CityTimezone[] = [
  { id: "utc", city: "UTC", country: "Coordinated Universal Time", iana: "UTC", flag: "UTC", utcOffset: 0 },
  { id: "london", city: "London", country: "United Kingdom", iana: "Europe/London", flag: "GB", utcOffset: 0 },
  { id: "newyork", city: "New York", country: "United States (ET)", iana: "America/New_York", flag: "US", utcOffset: -5 },
  { id: "sanfrancisco", city: "San Francisco", country: "United States (PT)", iana: "America/Los_Angeles", flag: "US", utcOffset: -8 },
  { id: "tokyo", city: "Tokyo", country: "Japan", iana: "Asia/Tokyo", flag: "JP", utcOffset: 9 },
  { id: "sydney", city: "Sydney", country: "Australia (AEST)", iana: "Australia/Sydney", flag: "AU", utcOffset: 10 },
  { id: "paris", city: "Paris", country: "France (CET)", iana: "Europe/Paris", flag: "FR", utcOffset: 1 },
  { id: "berlin", city: "Berlin", country: "Germany (CET)", iana: "Europe/Berlin", flag: "DE", utcOffset: 1 },
  { id: "newdelhi", city: "New Delhi", country: "India (IST)", iana: "Asia/Kolkata", flag: "IN", utcOffset: 5.5 },
  { id: "dubai", city: "Dubai", country: "United Arab Emirates", iana: "Asia/Dubai", flag: "AE", utcOffset: 4 },
  { id: "singapore", city: "Singapore", country: "Singapore", iana: "Asia/Singapore", flag: "SG", utcOffset: 8 },
  { id: "hongkong", city: "Hong Kong", country: "Hong Kong", iana: "Asia/Hong_Kong", flag: "HK", utcOffset: 8 },
  { id: "toronto", city: "Toronto", country: "Canada (ET)", iana: "America/Toronto", flag: "CA", utcOffset: -5 },
  { id: "saopaulo", city: "São Paulo", country: "Brazil", iana: "America/Sao_Paulo", flag: "BR", utcOffset: -3 },
];

export interface ConvertedTimeItem {
  city: CityTimezone;
  time12: string; // e.g. "04:30 PM"
  time24: string; // e.g. "16:30"
  dateFormatted: string; // e.g. "Fri, Sep 25, 2026"
  dayDelta: "Same Day" | "+1 Day" | "-1 Day";
  hoursDifference: number; // relative to source
  isBusinessHours: boolean; // 9am - 5pm
  hourValue: number; // 0-23
}

export function formatTimeInZone(
  utcDate: Date,
  timeZone: string
): { time12: string; time24: string; dateFormatted: string; hourValue: number } {
  try {
    const time12Formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const time24Formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const hourFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      hour12: false,
    });

    const time12 = time12Formatter.format(utcDate);
    const time24 = time24Formatter.format(utcDate);
    const dateFormatted = dateFormatter.format(utcDate);
    const hourValue = parseInt(hourFormatter.format(utcDate), 10) || 0;

    return { time12, time24, dateFormatted, hourValue };
  } catch {
    return {
      time12: "--:--",
      time24: "--:--",
      dateFormatted: "Unknown",
      hourValue: 12,
    };
  }
}

export function convertWorldTimes(
  baseDateIsoString: string,
  baseTimeStr: string,
  baseIana: string,
  targetCities: CityTimezone[] = POPULAR_CITIES
): ConvertedTimeItem[] {
  // Construct a base Date in the source timezone
  // For cross-platform predictability, we construct an ISO string and parse with offset or use Intl
  const [hoursStr = "12", minsStr = "00"] = baseTimeStr.split(":");
  const h = parseInt(hoursStr, 10) || 0;
  const m = parseInt(minsStr, 10) || 0;

  const dateParts = baseDateIsoString.split("-");
  const year = parseInt(dateParts[0] ?? "2026", 10);
  const month = (parseInt(dateParts[1] ?? "1", 10) || 1) - 1;
  const day = parseInt(dateParts[2] ?? "1", 10);

  // Approximate UTC timestamp using source timezone offset
  const baseCity = POPULAR_CITIES.find((c) => c.iana === baseIana);
  const baseOffset = baseCity ? baseCity.utcOffset : 0;

  // Create UTC date
  const utcMillis = Date.UTC(year, month, day, h, m) - baseOffset * 3600 * 1000;
  const utcDate = new Date(utcMillis);

  const baseResult = formatTimeInZone(utcDate, baseIana);
  const baseDateStr = baseResult.dateFormatted;

  return targetCities.map((target) => {
    const formatted = formatTimeInZone(utcDate, target.iana);
    const diffHours = Math.round((target.utcOffset - baseOffset) * 10) / 10;

    let dayDelta: ConvertedTimeItem["dayDelta"] = "Same Day";
    if (formatted.dateFormatted !== baseDateStr) {
      if (diffHours > 0) {
        dayDelta = "+1 Day";
      } else if (diffHours < 0) {
        dayDelta = "-1 Day";
      }
    }

    const isBusiness = formatted.hourValue >= 9 && formatted.hourValue < 17;

    return {
      city: target,
      time12: formatted.time12,
      time24: formatted.time24,
      dateFormatted: formatted.dateFormatted,
      dayDelta,
      hoursDifference: diffHours,
      isBusinessHours: isBusiness,
      hourValue: formatted.hourValue,
    };
  });
}
