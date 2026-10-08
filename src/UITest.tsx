import React from "react";
import { AbsoluteFill } from "remotion";
import { AppShell } from "./ui/AppShell";
import { HomeScreen, ResultsScreen, ReaderScreen, CategoriesScreen, DownloadsScreen } from "./ui/screens";
import { ExportDialog, FiltersDialog, ReaderOptions, Toast, BookSearchDialog, SelectMenu, ReaderMenu, CategoryDownloadDialog, SettingsDialog, AuthorsDialog } from "./ui/dialogs";
import { loadFonts } from "./lib/fonts";
import demo from "./data/demo.json";

loadFonts();

export const UITest: React.FC<{ screen: string }> = ({ screen }) => {
  const ui = { mode: "content" as const, scope: "all" as const, query: demo.query };
  let page: React.ReactNode = null;
  let overlay: React.ReactNode = null;
  let theme: "light" | "dark" = "light";
  let nav: any = "home";
  const reader = { mode: "split" as const, split: 0.5, textSize: 20, tashkeel: true, night: 0, query: "إنما الأعمال بالنيات", matchIndex: 0, matchCount: 1, bookmarked: false, availability: "متاح عبر الإنترنت", page: 29, textScroll: 210, pdfScroll: 330 };
  switch (screen) {
    case "home": page = <HomeScreen ui={{ ...ui, mode: "books", query: "" }} />; break;
    case "home-recent": page = <HomeScreen ui={{ ...ui, mode: "books", query: "" }} recent={{ fraction: 29 / 541 }} />; break;
    case "results": page = <ResultsScreen ui={ui} count="1,000 نتيجة · كل المكتبة" hits={demo.allHits} marks={demo.query.split(" ")} />; overlay = <SelectMenu x={854} y={184} items={["عناوين الكتب", "نصوص الكتب"]} selected={1} hover={1} appear={1} />; break;
    case "filters": page = <ResultsScreen ui={ui} count="1,000 نتيجة · كل المكتبة" hits={demo.allHits} marks={demo.query.split(" ")} />; overlay = <FiltersDialog appear={1} author="ابو زكريا محي الدين يحيى بن شرف بن حزم النووي" />; break;
    case "authors": page = <ResultsScreen ui={ui} count="1,000 نتيجة · كل المكتبة" hits={demo.allHits} marks={demo.query.split(" ")} />; overlay = <AuthorsDialog appear={1} query="بن حزم النووي" caret results={1} hover={0} />; break;
    case "filtered": page = <ResultsScreen ui={{ ...ui, filterCount: 1 }} count="425 نتيجة · كل المكتبة" chips={["ابو زكريا محي الدين يحيى بن شرف…"]} hits={demo.authorHits} marks={demo.query.split(" ")} />; break;
    case "reader": nav = null; page = <ReaderScreen {...reader} />; break;
    case "reader-options": nav = null; page = <ReaderScreen {...reader} textSize={24} />; overlay = <ReaderOptions appear={1} textSize={24} tashkeel={1} appearance="night" split={0.5} />; break;
    case "reader-night": nav = null; page = <ReaderScreen {...reader} night={1} tashkeel={false} />; break;
    case "reader-menu": nav = null; page = <ReaderScreen {...reader} />; overlay = <ReaderMenu appear={1} hover={1} />; break;
    case "export": nav = null; page = <ReaderScreen {...reader} />; overlay = <><ExportDialog appear={1} download={0.6} feedback="احفظ نسخة بصيغة PDF أو نص أو Word." glow={{ pdf: 1 }} /><Toast appear={1} message="جاهز للقراءة والبحث دون اتصال" detail={demo.riyad.title} action="فتح الكتاب" inReader /></>; break;
    case "book-search": nav = null; page = <ReaderScreen {...reader} />; overlay = <BookSearchDialog appear={1} query="الأعمال" results={1} />; break;
    case "categories": nav = "categories"; page = <CategoriesScreen filter="ابن القيم" caret focused />; overlay = <CategoryDownloadDialog appear={1} scanned={45} total={45} />; break;
    case "downloads": nav = "downloads"; page = <DownloadsScreen done={7} total={45} fraction={0.4} current="جارٍ تنزيل الكتاب…" paused={false} ready={8} />; break;
    case "dark": theme = "dark"; nav = null; page = <ReaderScreen {...reader} night={0} />; overlay = <SettingsDialog appear={1} highlight={1} />; break;
  }
  return (
    <AbsoluteFill style={{ background: "#ccc" }}>
      <AppShell theme={theme} nav={nav} status={{ online: screen !== "downloads", activity: screen === "downloads" ? { label: "جارٍ التنزيل · 40%", fraction: 0.4 } : null }} overlay={overlay}>
        {page}
      </AppShell>
    </AbsoluteFill>
  );
};
