// Certificates per doctor, keyed by the slug of the doctor's portrait in messages/*.json (dr-khalid.webp → "dr-khalid").
import blur from "./certificate-blur.json";

// blur: 16px preview shown while the full image loads (lib/certificate-blur.json, regenerate when images change).
export type Certificate = { src: string; blur: string; w: number; h: number; title: string; issuer: string; year: string };

const c = (file: string, w: number, h: number, title: string, issuer: string, year: string): Certificate => ({
  src: `/certificates/${file}.webp`,
  blur: blur[file as keyof typeof blur],
  w,
  h,
  title,
  issuer,
  year,
});

export const certificates: Record<string, Certificate[]> = {
  "dr-khalid": [
    c("khalid-6", 955, 1303, "إجازة فتح عيادة خاصة ومزاولة المهنة", "نقابة أطباء الأسنان في العراق", "2026"),
    c("khalid-9", 1243, 858, "دورة الترميم المباشر للأسنان الخلفية", "Style Italiano · البصرة", ""),
    c("khalid-10", 1167, 861, "دورة الترميم المباشر للأسنان الأمامية والخلفية", "Style Italiano · البصرة", ""),
    c("khalid-7", 1159, 816, "دورة علاج الجذور الحديث (4 وحدات)", "Style Italiano · IDA البصرة", ""),
    c("khalid-2", 1600, 1142, "شهادة تقدير — دورة Anterior Layering التجميلية", "GC Dental Middle East", "2018"),
    c("khalid-3", 1036, 1600, "دورة التيجان والجسور المكثّفة", "J.B.S.D.C · IDA", "2018"),
    c("khalid-4", 1319, 837, "Advanced Microendodontics — المؤتمر العلمي الدولي 12", "الجمعية اللبنانية لعلاج الجذور · بيروت", "2017"),
    c("khalid-8", 1135, 809, "مؤتمر النجف الدولي الرابع", "IDM · نقابة أطباء الأسنان", "2017"),
    c("khalid-1", 1600, 1035, "مؤتمر النجف الدولي الثالث", "IDM · نقابة أطباء الأسنان", "2016"),
    c("khalid-5", 992, 1303, "MAP System — Master MTA", "PD Swiss", ""),
  ],
  "dr-karrar": [
    c("karrar-4", 931, 1302, "الدورة المهنية الشاملة في تقويم الأسنان (سنتان)", "Basra Orthodontic Course · IDA", "2025"),
    c("karrar-3", 1600, 1110, "المؤتمر العراقي الدولي الرابع للتقويم وندوة التقويم الشفاف", "الجمعية العراقية لتقويم الأسنان", "2024"),
    c("karrar-1", 1600, 1175, "دورة الترميم غير المباشر (12 ساعة CME)", "Braiha Dental Clinic · IDA البصرة", "2024"),
    c("karrar-5", 1600, 1141, "دورة التقويم الشفاف Clear Aligner", "نقابة أطباء الأسنان العراقية", "2024"),
    c("karrar-2", 1545, 1073, "تدريب Graphy Shape Memory Aligner", "Graphy · Vanest", "2024"),
  ],
  "dr-ali": [
    c("ali-3", 1600, 1089, "المؤتمر الدولي الأول لزراعة الأسنان وأمراض اللثة", "بغداد", "2024"),
    c("ali-1", 1600, 1039, "دورة الإطباق وإعادة التأهيل الكامل للفم", "Alarabi Dental Care", "2024"),
    c("ali-2", 1049, 1600, "مؤتمر البصرة الدولي لطب الأسنان", "نقابة أطباء الأسنان البصرة · Style Italiano", "2024"),
    c("ali-4", 1452, 1083, "مؤتمر النجف الدولي الرابع", "IDM · نقابة أطباء الأسنان", "2017"),
  ],
};

export const slugOf = (img: string) => img.split("/").pop()!.replace(".webp", "");
