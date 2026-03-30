"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bot, MessageSquareText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AssistantWorkspaceProps = {
  role: "ADMIN" | "TEACHER" | "PARENT" | "STUDENT";
  studentOptions: Array<{ id: string; label: string }>;
  initialStudentId?: string;
};

type AssistantAction = {
  key: string;
  label: string;
  requiresStudent: boolean;
};

type AssistantUiConfig = {
  panelTitle: string;
  panelDescription: string;
  studentLabel: string;
  askLabel: string;
  askPlaceholder: string;
  quickQuestions: string[];
  responseTitle: string;
};

const uiByRole: Record<AssistantWorkspaceProps["role"], AssistantUiConfig> = {
  STUDENT: {
    panelTitle: "Study help",
    panelDescription: "Ask about your work, your risks, or what to do next. Every answer is grounded in your live school data.",
    studentLabel: "Student context",
    askLabel: "Ask about my school day",
    askPlaceholder: "Example: What should I do first today?",
    quickQuestions: [
      "What should I do first today?",
      "Which homework is most urgent?",
      "What subject should I focus on this week?",
    ],
    responseTitle: "Grounded AI response",
  },
  PARENT: {
    panelTitle: "Simple family help",
    panelDescription: "Short, clear answers for parents. The assistant highlights the main things without school jargon.",
    studentLabel: "Child context",
    askLabel: "Ask in simple words",
    askPlaceholder: "Example: Is anything urgent for my child this week?",
    quickQuestions: [
      "What is most important this week?",
      "Is my child doing okay?",
      "What should we practice at home?",
    ],
    responseTitle: "Family AI response",
  },
  TEACHER: {
    panelTitle: "Teaching assistant",
    panelDescription: "Use grounded AI for class overview, student support, study planning, parent communication, and next teaching actions.",
    studentLabel: "Student context",
    askLabel: "Ask about my classes or a student",
    askPlaceholder: "Example: Which students need extra support this week?",
    quickQuestions: [
      "Which students need extra support this week?",
      "What homework should I review first?",
      "How is this selected student doing?",
    ],
    responseTitle: "Teacher AI response",
  },
  ADMIN: {
    panelTitle: "School assistant",
    panelDescription: "Grounded summaries for school operations, student follow-up, and admin visibility.",
    studentLabel: "Student context",
    askLabel: "Ask about school activity",
    askPlaceholder: "Example: What should I watch this week?",
    quickQuestions: [
      "What should I watch this week?",
      "Which student needs attention?",
      "What is urgent today?",
    ],
    responseTitle: "Grounded AI response",
  },
};

const actionsByRole: Record<AssistantWorkspaceProps["role"], AssistantAction[]> = {
  STUDENT: [
    { key: "day-summary", label: "What should I do today?", requiresStudent: false },
    { key: "week-summary", label: "Summarize this week", requiresStudent: false },
    { key: "risk-analysis", label: "Show risk indicators", requiresStudent: false },
    { key: "study-plan", label: "Build my study plan", requiresStudent: false },
  ],
  PARENT: [
    { key: "day-summary", label: "Main things today", requiresStudent: true },
    { key: "week-summary", label: "What matters this week?", requiresStudent: true },
    { key: "risk-analysis", label: "Is my child doing okay?", requiresStudent: true },
    { key: "study-plan", label: "Build a simple study plan", requiresStudent: true },
  ],
  TEACHER: [
    { key: "teacher-summary", label: "Summarize my classes", requiresStudent: false },
    { key: "day-summary", label: "What should this student do today?", requiresStudent: true },
    { key: "week-summary", label: "Summarize this student week", requiresStudent: true },
    { key: "risk-analysis", label: "Analyze this student risk", requiresStudent: true },
    { key: "study-plan", label: "Build a study plan for this student", requiresStudent: true },
  ],
  ADMIN: [
    { key: "day-summary", label: "Student day summary", requiresStudent: true },
    { key: "week-summary", label: "Student week summary", requiresStudent: true },
    { key: "risk-analysis", label: "Student risk indicators", requiresStudent: true },
    { key: "study-plan", label: "Student study plan", requiresStudent: true },
  ],
};

export function AssistantWorkspace({
  role,
  studentOptions,
  initialStudentId,
}: AssistantWorkspaceProps) {
  const [topic, setTopic] = useState("");
  const [draftPrompt, setDraftPrompt] = useState("");
  const [question, setQuestion] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(
    role === "PARENT" ? initialStudentId ?? studentOptions[0]?.id ?? "" : "",
  );
  const [response, setResponse] = useState<string>(
    role === "PARENT"
      ? "Choose a child, tap a simple action, or ask a question in your own words. I will show only the main school facts that matter."
      : "Pick an action or ask a question to generate a grounded response from real school data.",
  );

  const ui = uiByRole[role];
  const actions = actionsByRole[role];
  const needsStudentContext = role !== "STUDENT" && studentOptions.length > 0;

  const mutation = useMutation({
    mutationFn: async ({
      path,
      body,
    }: {
      path: string;
      body?: Record<string, string>;
    }) => {
      const result = await fetch(`/api/ai/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const json = await result.json();
      if (!result.ok) throw new Error(json.error || "AI request failed");
      return json.data as { title: string; content: string };
    },
    onSuccess: (data) => setResponse(`${data.title}\n\n${data.content}`),
    onError: (error: Error) => toast.error(error.message),
  });

  const ensureStudentSelection = (requiresStudent: boolean) => {
    if (requiresStudent && !selectedStudentId) {
      toast.error("Select a student first");
      return false;
    }
    return true;
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>{ui.panelTitle}</CardTitle>
          <p className="text-sm leading-6 text-[var(--muted)]">{ui.panelDescription}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {needsStudentContext ? (
            <div className="space-y-3 rounded-2xl border bg-white/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{ui.studentLabel}</p>
              <select
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
                className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none"
              >
                {studentOptions.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-3">
            {actions.map((action) => (
              <Button
                key={action.key}
                variant="outline"
                className="w-full justify-start text-left"
                type="button"
                onClick={() => {
                  if (!ensureStudentSelection(action.requiresStudent)) {
                    return;
                  }

                  mutation.mutate({
                    path: action.key,
                    body: action.requiresStudent ? { studentId: selectedStudentId } : {},
                  });
                }}
              >
                <Sparkles className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>

          <div className="space-y-3 rounded-2xl border bg-[linear-gradient(180deg,rgba(20,86,194,0.05),rgba(15,23,42,0.02))] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MessageSquareText className="h-4 w-4 text-[var(--primary)]" />
              {ui.askLabel}
            </div>
            <Textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={ui.askPlaceholder}
              className="min-h-28"
            />
            <div className="flex flex-wrap gap-2">
              {ui.quickQuestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuestion(item)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  {item}
                </button>
              ))}
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={mutation.isPending}
              onClick={() => {
                if (!question.trim()) {
                  toast.error("Enter a question first");
                  return;
                }

                const body: Record<string, string> = { question: question.trim() };
                if (role !== "STUDENT" && selectedStudentId) {
                  body.studentId = selectedStudentId;
                }

                mutation.mutate({ path: "assistant", body });
              }}
            >
              {mutation.isPending ? "Thinking..." : "Ask assistant"}
            </Button>
          </div>

          <div className="space-y-3 rounded-2xl border bg-white/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Explain a topic or homework task</p>
            <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Enter a topic, test, or assignment" />
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => mutation.mutate({ path: "explain-topic", body: { topic } })}
            >
              Explain topic
            </Button>
          </div>

          <div className="space-y-3 rounded-2xl border bg-white/70 p-4">
            <p className="text-sm font-semibold text-slate-900">
              {role === "TEACHER" ? "Draft a parent or student message" : "Draft a message"}
            </p>
            <Textarea value={draftPrompt} onChange={(event) => setDraftPrompt(event.target.value)} placeholder="Describe the message you need..." />
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => mutation.mutate({ path: "message-draft", body: { message: draftPrompt } })}
            >
              Draft reply
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-[var(--primary)]" />
            {ui.responseTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-3xl border bg-[linear-gradient(180deg,rgba(20,86,194,0.06),rgba(15,118,110,0.03))] p-6 shadow-sm">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-800">{response}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


