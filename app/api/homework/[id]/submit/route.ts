import { withApiAuth, parseBody } from "@/lib/api";
import { homeworkSubmissionSchema } from "@/lib/validators";
import { submitHomework } from "@/features/homework/service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, homeworkSubmissionSchema);
    const { id } = await params;
    return submitHomework(user, id, payload);
  });
}
