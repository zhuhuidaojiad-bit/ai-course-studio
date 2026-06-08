import { createClient } from "@/lib/supabase/server";
import { getAppTimezone } from "@/lib/app-config";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export type SiteWindowSettings = {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
};

export type SiteWindowStatus = SiteWindowSettings & {
  currentTimeLabel: string;
  isOpen: boolean;
  message: string;
};

const DEFAULT_SETTINGS: SiteWindowSettings = {
  enabled: false,
  start: "09:00",
  end: "22:00",
  timezone: "Asia/Shanghai",
};

function parseBoolean(value: string | null | undefined) {
  return value === "true";
}

function isTimeFormat(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function parseTimeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function formatNowForTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: timezone,
  }).formatToParts(new Date());

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}

function isWithinWindow(currentMinutes: number, startMinutes: number, endMinutes: number) {
  if (startMinutes === endMinutes) {
    return true;
  }

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

export async function getSiteWindowSettings(): Promise<SiteWindowSettings> {
  const timezone = getAppTimezone();

  if (!hasSupabaseEnv()) {
    return {
      ...DEFAULT_SETTINGS,
      timezone,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["access_window_enabled", "access_window_start", "access_window_end"]);

  if (error) {
    if (error.code === "42P01") {
      return {
        ...DEFAULT_SETTINGS,
        timezone,
      };
    }

    throw new Error(error.message);
  }

  const map = new Map((data ?? []).map((item) => [item.key, item.value]));
  const start = map.get("access_window_start") ?? DEFAULT_SETTINGS.start;
  const end = map.get("access_window_end") ?? DEFAULT_SETTINGS.end;

  return {
    enabled: parseBoolean(map.get("access_window_enabled")),
    start: isTimeFormat(start) ? start : DEFAULT_SETTINGS.start,
    end: isTimeFormat(end) ? end : DEFAULT_SETTINGS.end,
    timezone,
  };
}

export async function getSiteWindowStatus(): Promise<SiteWindowStatus> {
  const settings = await getSiteWindowSettings();
  const currentTimeLabel = formatNowForTimezone(settings.timezone);

  if (!settings.enabled) {
    return {
      ...settings,
      currentTimeLabel,
      isOpen: true,
      message: "当前未限制使用时间，学员可全天访问。",
    };
  }

  const currentMinutes = parseTimeToMinutes(currentTimeLabel);
  const startMinutes = parseTimeToMinutes(settings.start);
  const endMinutes = parseTimeToMinutes(settings.end);
  const isOpen = isWithinWindow(currentMinutes, startMinutes, endMinutes);

  return {
    ...settings,
    currentTimeLabel,
    isOpen,
    message: isOpen
      ? `当前在开放时段内，可用时间为 ${settings.start} - ${settings.end}。`
      : `当前不在开放时段内。可用时间为 ${settings.start} - ${settings.end}。`,
  };
}
