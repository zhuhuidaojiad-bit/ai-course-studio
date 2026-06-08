export function getAiDailyLimit() {
  const value = Number(process.env.AI_DAILY_LIMIT ?? "12");
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 12;
}

export function getAppTimezone() {
  return process.env.APP_TIMEZONE ?? "Asia/Shanghai";
}
