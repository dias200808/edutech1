import { MessagesWorkspace } from "@/components/messages/messages-workspace";
import { PageHeader } from "@/components/shared/page-header";

export default function MessagesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Messages"
        description="Keep communication safe, organized, and role-aware with searchable threads and real-time context."
      />
      <MessagesWorkspace />
    </div>
  );
}
