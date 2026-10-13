import { NextResponse } from "next/server";
import { getDurableStorageReport, getCloudBackupHealth, syncDbFromCloud } from "@/db";
import { getAuthenticatedStaff, privateJsonHeaders, staffCan } from "@/lib/staff-auth";

export async function GET(request:Request) {
  try {
    const staff = await getAuthenticatedStaff(request);
    if (!staff || !staffCan(staff,"settings.sensitive")) return NextResponse.json({ok:false,errorMessage:"Yêu cầu quyền chủ sở hữu."},{status:staff ? 403 : 401,headers:privateJsonHeaders()});
    await syncDbFromCloud(true);
    return NextResponse.json({ok:true,...getDurableStorageReport(),backup:await getCloudBackupHealth()},{headers:privateJsonHeaders()});
  } catch (error) {
    return NextResponse.json({ok:false,errorMessage:error instanceof Error ? error.message : "Chưa kiểm chứng được dữ liệu."},{status:503,headers:privateJsonHeaders()});
  }
}
