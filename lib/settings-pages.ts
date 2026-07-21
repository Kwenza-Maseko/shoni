
export const SETTINGS_PAGES = [
    { path: "/settings", label: "Settings" },
    { path: "/loanees", label: "Loanees" },
    { path: "/transaction", label: "Transactions" },
    { path: "/categories", label: "Categories" },
] as const;

export type SettingsPagePath = (typeof SETTINGS_PAGES)[number]["path"];

export const isKnownSettingsPage = (path: string): path is SettingsPagePath =>
    SETTINGS_PAGES.some((p) => p.path === path);

export const UNLOCK_COOKIE_NAME = "unlocked_page";

export const UNLOCK_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 1;
