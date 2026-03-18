import "./globals.css";
import LayoutContent from "./layoutContent";
import ReduxProvider from "./components/providers/ReduxProvider";
import SessionWrapper from "./components/providers/SessionWrapper";
import OneSignalProvider from "./components/OneSignalProvider";
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
            <head>
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <SessionWrapper>
          <ReduxProvider>
            <LayoutContent>
              <OneSignalProvider />
              {children}
            </LayoutContent>
          </ReduxProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}