import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DayPulse — Daily Task & Smart Reminder",
  description: "A clean, modern daily task tracker with instant audio reminders and browser notifications.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
