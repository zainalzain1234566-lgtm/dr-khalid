import ar from "@/messages/ar.json";
import enJson from "@/messages/en.json";

export type Messages = typeof ar;

// Typed against ar.json so a missing or renamed key in en.json fails the build.
export const en: Messages = enJson;
export { ar };
