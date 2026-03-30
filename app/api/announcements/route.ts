import { withApiAuth, parseBody } from "@/lib/api";
import { announcementSchema } from "@/lib/validators";
import { createAnnouncement, listAnnouncements } from "@/features/announcements/service";

export async function GET(request: Request) {
  return withApiAuth(async (user) => {
    const studentId = new URL(request.url).searchParams.get("studentId") ?? undefined;
    return listAnnouncements(user, studentId);
  });
}

export async function POST(request: Request) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, announcementSchema);
    return createAnnouncement(user, payload);
  });
}
