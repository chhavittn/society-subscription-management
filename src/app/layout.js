import "./globals.css";
import LayoutContent from "./layoutContent";
import ReduxProvider from "./components/providers/ReduxProvider";
import SessionWrapper from "./components/providers/SessionWrapper";
import OneSignalProvider from "./components/OneSignalProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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