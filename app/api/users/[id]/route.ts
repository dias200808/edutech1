import { Role } from "@prisma/client";
import { withApiAuth, parseBody, ApiError } from "@/lib/api";
import { db } from "@/lib/db";
import { userUpdateSchema } from "@/lib/validators";
import { deleteUser, updateUser } from "@/features/admin/service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    if (user.role !== Role.ADMIN) throw new ApiError(403, "Admin only");
    const { id } = await params;
    const record = await db.user.findUnique({
      where: { id },
      include: {
        studentProfile: { include: { schoolClass: true } },
        teacherProfile: true,
        parentProfile: true,
      },
    });
    if (!record) throw new ApiError(404, "User not found");
    return record;
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, userUpdateSchema);
    const { id } = await params;
    return updateUser(user, id, payload);
  });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const { id } = await params;
    return deleteUser(user, id);
  });
}
