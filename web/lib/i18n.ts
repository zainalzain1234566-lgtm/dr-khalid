import ar from "@/messages/ar.json";
import enJson from "@/messages/en.json";

export type Messages = typeof ar;

// Typed against ar.json so a missing or renamed key in en.json fails the build.
export const en: Messages = enJson;
export { ar };

// Compare by content, not identity: messages passed to a client component arrive as a copy.
export const isAr = (t: Messages) => t.header.langCode === "en";
