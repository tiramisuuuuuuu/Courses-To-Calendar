'use client'

import "@/app/ui/globals.css";
import Header from "@/app/ui/header";
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children, }: 
  Readonly<{ children: React.ReactNode; }>) {
  return (
    <SessionProvider>
      <html lang="en">
        <head>
        </head>
        <body className="min-h-screen">
          <Header />
          <body>{children}</body>
        </body>
      </html></SessionProvider>
  );
}
