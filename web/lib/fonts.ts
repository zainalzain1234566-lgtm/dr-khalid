import { IBM_Plex_Sans_Arabic, Readex_Pro } from "next/font/google";

const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
});

const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
});

export const fontVars = `${readex.variable} ${plex.variable} antialiased`;
