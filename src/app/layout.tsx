import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "FitQuest — suba de nível na vida real",
  description:
    "O RPG onde sua evolução física real é o progresso. O seu maior adversário é você mesmo.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitQuest",
  },
};

export const viewport: Viewport = {
  themeColor: "#131009",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
