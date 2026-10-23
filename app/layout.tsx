import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudBrowser",
  description: "A mobile-friendly remote browser powered by Hyperbeam",
  applicationName: "CloudBrowser",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "CloudBrowser" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#090b10"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
