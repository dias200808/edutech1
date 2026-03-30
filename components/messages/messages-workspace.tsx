"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";

async function fetcher<T>(url: string) {
  const response = await fetch(url);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed");
  return result.data as T;
}

type ThreadListItem = {
  id: string;
  title: string | null;
  unreadCount: number;
  participants: Array<{
    userId: string;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
  messages: Array<{
    id: string;
    content: string;
    senderId: string;
  }>;
};

type ThreadMessage = {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    firstName: string;
    lastName: string;
  };
};

type ThreadDetail = {
  id: string;
  title: string | null;
  messages: ThreadMessage[];
};

export function MessagesWorkspace() {
  const queryClient = useQueryClient();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const threadsQuery = useQuery({
    queryKey: ["threads"],
    queryFn: () => fetcher<ThreadListItem[]>("/api/threads"),
  });

  const selectedThreadId = activeThreadId ?? threadsQuery.data?.[0]?.id ?? null;

  const messagesQuery = useQuery({
    queryKey: ["thread", selectedThreadId],
    queryFn: () => fetcher<ThreadDetail>(`/api/threads/${selectedThreadId}/messages`),
    enabled: Boolean(selectedThreadId),
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: selectedThreadId, content: message }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send message");
      return result.data;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.invalidateQueries({ queryKey: ["thread", selectedThreadId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Threads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {threadsQuery.data?.map((thread) => {
            const active = thread.id === selectedThreadId;
            const counterpart = thread.participants[0];
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${active ? "border-blue-300 bg-blue-50/70" : "bg-white/80 hover:bg-slate-50"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{thread.title || counterpart?.user?.firstName || "Conversation"}</p>
                  {thread.unreadCount ? <span className="rounded-full bg-[var(--primary)] px-2 py-1 text-xs font-semibold text-white">{thread.unreadCount}</span> : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{thread.messages[0]?.content || "No messages yet"}</p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[560px] flex-col">
          <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto pr-2">
            {messagesQuery.data?.messages?.map((item) => (
              <div key={item.id} className="rounded-2xl border bg-white/85 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">
                    {item.sender.firstName} {item.sender.lastName}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{timeAgo(item.createdAt)}</p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message..." />
            <Button
              type="button"
              size="icon"
              disabled={!message.trim() || sendMutation.isPending}
              onClick={() => sendMutation.mutate()}
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
