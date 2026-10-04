export interface CronPreset {
  label: string;
  cron: string;
  description: string;
}

export const PRESETS: CronPreset[] = [
  { label: "Every 5 Minutes", cron: "*/5 * * * *", description: "Runs every 5 minutes" },
  { label: "Every 15 Minutes", cron: "*/15 * * * *", description: "Runs every 15 minutes" },
  { label: "Hourly at Minute 0", cron: "0 * * * *", description: "Runs every hour at the top of the hour" },
  { label: "Daily at Midnight", cron: "0 0 * * *", description: "Runs every night at 00:00 UTC/Local" },
  { label: "Daily at 08:00 AM", cron: "0 8 * * *", description: "Runs once per day at 8:00 AM" },
  { label: "Weekdays (Mon-Fri) at 09:00", cron: "0 9 * * 1-5", description: "Runs Monday through Friday at 9:00 AM" },
  { label: "Every Sunday at 02:00 AM", cron: "0 2 * * 0", description: "Weekly maintenance backup every Sunday night" },
  { label: "1st of Month at Midnight", cron: "0 0 1 * *", description: "Monthly report generation on day 1" },
];

export interface CronParts {
  minute: string;
  hour: string;
  dom: string;
  month: string;
  dow: string;
  isValid: boolean;
}

export function parseCron(cronExpression: string): CronParts {
  const tokens = cronExpression.trim().split(/\s+/).filter(Boolean);
  return {
    minute: tokens[0] || "*",
    hour: tokens[1] || "*",
    dom: tokens[2] || "*",
    month: tokens[3] || "*",
    dow: tokens[4] || "*",
    isValid: tokens.length === 5,
  };
}

export function explainCron(parts: CronParts): string {
  if (!parts.isValid) {
    return "Invalid cron expression (must contain exactly 5 space-separated parts).";
  }

  const { minute, hour, dom, month, dow } = parts;

  let timeDesc = "";
  if (minute === "*" && hour === "*") {
    timeDesc = "every minute";
  } else if (minute.startsWith("*/")) {
    timeDesc = `every ${minute.replace("*/", "")} minutes`;
  } else if (minute === "0" && hour === "*") {
    timeDesc = "every hour on the hour";
  } else if (hour !== "*" && minute !== "*") {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (!isNaN(h) && !isNaN(m)) {
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayM = m < 10 ? `0${m}` : m;
      timeDesc = `at ${displayH}:${displayM} ${ampm}`;
    } else {
      timeDesc = `at minute ${minute} of hour ${hour}`;
    }
  } else if (hour === "*") {
    timeDesc = `at minute ${minute} of every hour`;
  } else {
    timeDesc = `during hour ${hour}`;
  }

  let dayDesc = "";
  if (dow === "*" && dom === "*") {
    dayDesc = "every day";
  } else if (dow === "1-5") {
    dayDesc = "on every weekday (Monday through Friday)";
  } else if (dow === "0,6" || dow === "6,0") {
    dayDesc = "on weekends (Saturday & Sunday)";
  } else if (dow !== "*") {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dIndex = parseInt(dow, 10);
    if (!isNaN(dIndex) && dIndex >= 0 && dIndex <= 6) {
      dayDesc = `every ${dayNames[dIndex]}`;
    } else {
      dayDesc = `on day-of-week ${dow}`;
    }
  }

  if (dom !== "*") {
    dayDesc += ` on day ${dom} of the month`;
  }

  let monthDesc = "";
  if (month !== "*") {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mIndex = parseInt(month, 10) - 1;
    monthDesc = ` in ${monthNames[mIndex] || `month ${month}`}`;
  }

  return `Runs ${timeDesc} ${dayDesc}${monthDesc}.`;
}
