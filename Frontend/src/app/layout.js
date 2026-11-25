import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "ParkEase - Smart Parking Management System",
  description: "Next-gen intelligent parking reservation dashboard with dynamic surge pricing and real-time concurrency controls.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#0B1222] text-[#F8FAFC] antialiased selection:bg-[#F5B21B] selection:text-[#0B1222]">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  );
}
