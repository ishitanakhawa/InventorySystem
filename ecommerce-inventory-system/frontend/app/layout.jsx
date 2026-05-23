import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "E-Commerce Inventory System",
  description: "Inventory, forecasting, supply chain & dynamic pricing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
