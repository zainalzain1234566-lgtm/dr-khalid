export const PHONE_DISPLAY = "0773 390 0003";
const PHONE_E164 = "+9647733900003";

export const INSTAGRAM_HANDLE = "@dr.khalid_al_attar";
export const INSTAGRAM_URL = "https://www.instagram.com/dr.khalid_al_attar/";

// WhatsApp Business short link (carries its own prefilled message).
export const whatsappHref = "https://api.whatsapp.com/message/MXKLCGGYRDMHP1?autoload=1&app_absent=0";

export const MAPS_URL = "https://share.google/iUGmlGKr4hE5uiy8z";
export const MAPS_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent("العيادة الدكتور خالد العطار البصرة")}&output=embed`;
export const phoneHref = `tel:${PHONE_E164}`;

// Public domain; set NEXT_PUBLIC_SITE_URL in production env.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dr-khalid.zainalabdinmuneam.workers.dev";

// Uploaded photos are served by a route, not static assets, so next/image can't optimize them (they're webp already).
export const isUploaded = (src: string) => src.startsWith("/files/");

// Applies the saved theme (see ThemeToggle) before paint on every page, avoiding a flash.
export const themeScript = `try{if(localStorage.getItem("theme")==="coral")document.documentElement.dataset.theme="coral"}catch(e){}`;
