/**
 * Age Calculator Logic
 * Calculates exact chronological age, next birthday countdown, and lifetime milestones.
 */

export interface AgeCalculationResult {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  dayOfWeekBorn: string;
  zodiacSign: string;
  nextBirthday: {
    dateIso: string;
    daysRemaining: number;
    dayOfWeek: string;
    turnsAge: number;
  };
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getZodiacSign(month: number, day: number): string {
  // month is 1-12, day is 1-31
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

export function calculateAge(
  birthDateInput: string | Date,
  targetDateInput: string | Date = new Date()
): AgeCalculationResult {
  const birth = new Date(birthDateInput);
  const target = new Date(targetDateInput);

  if (isNaN(birth.getTime()) || isNaN(target.getTime())) {
    throw new Error("Invalid date input");
  }

  if (birth > target) {
    throw new Error("Birth date cannot be after the comparison date");
  }

  const birthYear = birth.getFullYear();
  const birthMonth = birth.getMonth(); // 0-11
  const birthDay = birth.getDate();

  const targetYear = target.getFullYear();
  const targetMonth = target.getMonth();
  const targetDay = target.getDate();

  let years = targetYear - birthYear;
  let months = targetMonth - birthMonth;
  let days = targetDay - birthDay;

  if (days < 0) {
    // Borrow days from previous month
    months -= 1;
    // Days in previous month of target
    const prevMonthLastDay = new Date(targetYear, targetMonth, 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffMs = target.getTime() - birth.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;

  // Next birthday calculation
  let nextBdayYear = targetYear;
  const currentYearBday = new Date(nextBdayYear, birthMonth, birthDay);

  if (currentYearBday < target) {
    nextBdayYear += 1;
  }

  const nextBdayDate = new Date(nextBdayYear, birthMonth, birthDay);
  const msToNext = nextBdayDate.getTime() - target.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msToNext / (1000 * 60 * 60 * 24)));

  return {
    years,
    months,
    days,
    totalMonths,
    totalWeeks,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    dayOfWeekBorn: DAYS_OF_WEEK[birth.getDay()] ?? "Sunday",
    zodiacSign: getZodiacSign(birthMonth + 1, birthDay),
    nextBirthday: {
      dateIso: nextBdayDate.toISOString().split("T")[0] ?? "",
      daysRemaining,
      dayOfWeek: DAYS_OF_WEEK[nextBdayDate.getDay()] ?? "Sunday",
      turnsAge: nextBdayYear - birthYear,
    },
  };
}
