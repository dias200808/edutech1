import { withApiAuth, parseBody } from "@/lib/api";
import { announcementSchema } from "@/lib/validators";
import { updateAnnouncement } from "@/features/announcements/service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, announcementSchema.partial());
    const { id } = await params;
    return updateAnnouncement(user, id, payload);
  });
}
