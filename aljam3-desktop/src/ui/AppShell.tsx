import React from "react";
import { Img, staticFile } from "remotion";
import { Btn, Icon, IconBtn, PaletteContext, Progress, Txt, usePal } from "./kit";
import { APP_H, APP_W, DARK, LIGHT, Palette, STATUS_H, TITLE_H } from "./theme";
import { UI_FONT } from "../lib/fonts";

export type NavKey = "home" | "categories" | "authors" | "browse" | "saved" | "downloads" | null;

export type Status = {
  online: boolean;
  activity?: { label: string; fraction?: number } | null;
};

export type ShellProps = {
  theme: "light" | "dark";
  nav: NavKey;
  status: Status;
  settingsBadge?: boolean;
  pressed?: Partial<Record<string, number>>; // nav/theme/settings press amounts
  children: React.ReactNode; // the page
  overlay?: React.ReactNode; // dialogs, menus, toasts
};

const NAV: [NavKey, string, number][] = [
  ["home", "الرئيسية", 76],
  ["categories", "التصنيفات", 88],
  ["authors", "المؤلفون", 80],
  ["browse", "الكتب", 68],
];

export const NavBar: React.FC<{ nav: NavKey; theme: "light" | "dark"; settingsBadge?: boolean; pressed?: ShellProps["pressed"] }> = ({ nav, theme, settingsBadge, pressed = {} }) => {
  const pal = usePal();
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: APP_W, height: 60, background: pal.paper, borderBottom: `1px solid ${pal.line}`, boxSizing: "border-box" }}>
      <div style={{ position: "absolute", right: 20, top: 12, width: 1120, height: 36, display: "flex", flexDirection: "row", alignItems: "center", direction: "rtl" }}>
        <Img src={staticFile(theme === "dark" ? "brand/aljam3-dark.svg" : "brand/aljam3.svg")} style={{ width: 52, height: 35, marginLeft: 8, objectFit: "contain" }} />
        {NAV.map(([key, label, w]) => (
          <Btn key={label} label={label} variant="ghost" selected={nav === key} width={w} pressed={pressed[key ?? ""]} m={`nav-${key}`} />
        ))}
        <div style={{ flex: 1 }} />
        <Btn label="كتبي المحمّلة" variant="ghost" selected={nav === "saved"} width={116} pressed={pressed.saved} m="nav-saved" />
        <Btn label="التنزيلات" variant="ghost" selected={nav === "downloads"} width={90} pressed={pressed.downloads} />
        <IconBtn icon={theme === "dark" ? "sun" : "moon"} pressed={pressed.theme} m="nav-theme" />
        <div style={{ position: "relative", width: 36, height: 36 }}>
          <IconBtn icon="settings" pressed={pressed.settings} m="nav-settings" />
          {settingsBadge ? <div style={{ position: "absolute", right: 3, top: 3, width: 7, height: 7, borderRadius: 4, background: pal.primary }} /> : null}
        </div>
      </div>
    </div>
  );
};

export const StatusBar: React.FC<{ status: Status; pressed?: number }> = ({ status, pressed }) => {
  const pal = usePal();
  return (
    <div style={{ position: "absolute", left: 0, top: APP_H - STATUS_H, width: APP_W, height: STATUS_H, background: pal.surface, borderTop: `1px solid ${pal.line}`, boxSizing: "border-box" }}>
      <div style={{ position: "absolute", right: 20, top: 1, width: 1120, height: STATUS_H - 4, display: "flex", alignItems: "center", direction: "rtl" }}>
        <Txt size={13} muted style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }} m="conn">
          {status.online ? (
            "متصل بالجامع"
          ) : (
            <>
              <span>دون اتصال · كتبك المحمّلة متاحة</span>
            </>
          )}
        </Txt>
        {!status.online ? <Btn label="إعادة الاتصال" variant="ghost" width={126} height={28} size={13} pressed={pressed} m="reconnect" /> : null}
        <div style={{ width: 330, height: 28, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
          {status.activity ? (
            <>
              {status.activity.fraction !== undefined ? <Progress fraction={status.activity.fraction} height={6} style={{ width: 64 }} /> : null}
              <div style={{ display: "flex", alignItems: "center", gap: 6, width: 240, justifyContent: "flex-start", direction: "rtl" }}>
                <Icon name="download" size={14} />
                <Txt size={13}>{status.activity.label}</Txt>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

/** Desktop window chrome (title bar with traffic lights) around the app. */
export const TitleBar: React.FC<{ dark: boolean }> = ({ dark }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: APP_W,
      height: TITLE_H,
      background: dark ? "#2a2523" : "#f3efeb",
      borderBottom: `1px solid ${dark ? "#3a3432" : "#e4ddd6"}`,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div style={{ position: "absolute", left: 14, top: 11, display: "flex", gap: 8, direction: "ltr" }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.12)" }} />
      ))}
    </div>
    <div style={{ fontFamily: UI_FONT, fontSize: 13.5, color: dark ? "#cfc9c6" : "#6b5f5b", fontWeight: 600 }}>الجامع</div>
  </div>
);

export const AppShell: React.FC<ShellProps> = ({ theme, nav, status, settingsBadge, pressed, children, overlay }) => {
  const pal: Palette = theme === "dark" ? DARK : LIGHT;
  return (
    <PaletteContext.Provider value={pal}>
      <div style={{ position: "absolute", left: 0, top: 0, width: APP_W, height: APP_H + TITLE_H, background: pal.paper, overflow: "hidden", direction: "rtl", fontFamily: UI_FONT }}>
        <TitleBar dark={theme === "dark"} />
        <div style={{ position: "absolute", left: 0, top: TITLE_H, width: APP_W, height: APP_H, overflow: "hidden", background: pal.paper }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: APP_W, height: APP_H - STATUS_H, overflow: "hidden" }}>{children}</div>
          <NavBar nav={nav} theme={theme} settingsBadge={settingsBadge} pressed={pressed} />
          <StatusBar status={status} pressed={pressed?.reconnect} />
          {overlay}
        </div>
      </div>
    </PaletteContext.Provider>
  );
};
