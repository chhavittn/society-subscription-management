import "./globals.css";
import LayoutContent from "./layoutContent";
import ReduxProvider from "./components/providers/ReduxProvider";
import SessionWrapper from "./components/providers/SessionWrapper";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionWrapper>
          <ReduxProvider>
            <LayoutContent>
              {children}
            </LayoutContent> {/* client component */}
          </ReduxProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}