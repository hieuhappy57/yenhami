import { cache } from "react";
import { getSiteContentSettings, syncDbFromCloud } from "@/db";

// Share one authoritative read across the layout and page in each request.
export const loadSiteContent = cache(async () => {
  await syncDbFromCloud(true);
  return getSiteContentSettings();
});
