import type { SiteContentSettings } from "@/db/schema";

const FIELDS = ["heroBadge","heroTitle","heroLead","heroCta","heroDesktopImage","heroMobileImage",
  "giftingBadge","giftingTitle","giftingDescription","giftingImage","hotlineDisplay","hotlineTel",
  "zaloUrl","addressDisplay","serviceHoursDisplay","noticeBanner","aboutHeadline","aboutLead","aboutDiffBanner"] as const;

export function parseSiteSettings(value: unknown): Partial<SiteContentSettings> {
  if(!value || typeof value!=="object" || Array.isArray(value)) throw new Error("Cấu hình giao diện không hợp lệ.");
  const input=value as Record<string,unknown>,result:Partial<SiteContentSettings>={};
  for(const key of FIELDS) {
    if(!(key in input)) continue;
    if(typeof input[key]!=="string" || input[key].length>4000) throw new Error(`Nội dung ${key} không hợp lệ (tối đa 4.000 ký tự).`);
    const text=input[key].trim();
    if(["heroDesktopImage","heroMobileImage","giftingImage","zaloUrl"].includes(key) && text) {
      const localImage=key!=="zaloUrl" && /^\/(?!\/)[^\\\s]*$/.test(text);
      let https=false;
      try {const url=new URL(text);https=url.protocol==="https:" && !url.username && !url.password;} catch {}
      if(!localImage && !https) throw new Error("Ảnh và liên kết phải dùng HTTPS hoặc đường dẫn ảnh nội bộ.");
    }
    if(key==="hotlineTel" && text && !/^\+?[\d\s().-]{7,25}$/.test(text)) throw new Error("Số điện thoại quay số không hợp lệ.");
    result[key]=text;
  }
  return result;
}
