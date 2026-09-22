import t from "@/messages/ar.json";

// TODO(clinic): replace with the real numbers. Both are placeholders from the design.
export const PHONE_DISPLAY = "07XX XXX XXXX";
const PHONE_E164 = "+964XXXXXXXXXX";
const WHATSAPP_NUMBER = "964XXXXXXXXXX";

export const INSTAGRAM_HANDLE = "@dr.khalid_al_attar";
export const INSTAGRAM_URL = "https://www.instagram.com/dr.khalid_al_attar/";

export const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.contact.whatsappMessage)}`;
export const phoneHref = `tel:${PHONE_E164}`;
