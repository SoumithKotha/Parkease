import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "ParkEase - Smart Parking Management System",
  description: "A web-based platform for finding, reserving and managing parking spaces",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
