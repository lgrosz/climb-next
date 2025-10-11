import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Climb Next",
  description: "NextJS climbing website",
};

export default function RootLayout({
  breadcrumb,
  children,
  modal,
}: Readonly<{
  breadcrumb: React.ReactNode;
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 min-h-screen bg-gray-50 text-gray-900`}>
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Climb Next</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {breadcrumb}
          {children}
          {modal}
        </main>
      </body>
    </html>
  );
}
