import "@/app/ui/globals.css";
import Header from "@/app/ui/header";


export default function RootLayout({ children, }: 
  Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className="min-h-screen">
        <Header />
        <body>{children}</body>
      </body>
    </html>
  );
}
