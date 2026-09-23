"use client";

import { Bookmark, Check, Link2, ThumbsDown, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleSave, vote } from "@/app/actions/learning";
import { cn, formatCount } from "./ui";

export function LessonActions({
  videoId,
  signedIn,
  initialVote,
  initialSaved,
  helpfulCount,
}: {
  videoId: string;
  signedIn: boolean;
  initialVote: 1 | -1 | 0;
  initialSaved: boolean;
  helpfulCount: number;
}) {
  const router = useRouter();
  const [myVote, setMyVote] = useState(initialVote);
  const [saved, setSaved] = useState(initialSaved);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const requireAuth = () => {
    if (!signedIn) {
      router.push(`/login?next=/watch/${videoId}`);
      return false;
    }
    return true;
  };

  const onVote = (value: 1 | -1) => {
    if (!requireAuth()) return;
    const next = myVote === value ? 0 : value;
    const prev = myVote;
    setMyVote(next);
    startTransition(async () => {
      try {
        await vote(videoId, next);
      } catch {
        setMyVote(prev);
      }
    });
  };

  const onSave = () => {
    if (!requireAuth()) return;
    const prev = saved;
    setSaved(!prev);
    startTransition(async () => {
      try {
        const res = await toggleSave(videoId);
        setSaved(res.saved);
      } catch {
        setSaved(prev);
      }
    });
  };

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/watch/${videoId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const helpfulShown = helpfulCount + (myVote === 1 && initialVote !== 1 ? 1 : 0) - (myVote !== 1 && initialVote === 1 ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 items-center overflow-hidden rounded-lg border border-line bg-surface shadow-soft">
        <button
          onClick={() => onVote(1)}
          aria-pressed={myVote === 1}
          className={cn(
            "tabular flex h-full items-center gap-1.5 px-3 text-[13px] font-medium transition-colors hover:bg-bg-subtle",
            myVote === 1 ? "text-accent" : "text-ink-2",
          )}
          title="This helped me"
        >
          <ThumbsUp className={cn("size-4", myVote === 1 && "fill-current")} /> Helpful
          <span className="text-muted">{formatCount(helpfulShown)}</span>
        </button>
        <span className="h-5 w-px bg-line" />
        <button
          onClick={() => onVote(-1)}
          aria-pressed={myVote === -1}
          aria-label="Not helpful"
          title="Not helpful"
          className={cn("flex h-full items-center px-2.5 transition-colors hover:bg-bg-subtle", myVote === -1 ? "text-ink" : "text-muted")}
        >
          <ThumbsDown className={cn("size-4", myVote === -1 && "fill-current")} />
        </button>
      </div>
      <button
        onClick={onSave}
        aria-pressed={saved}
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium shadow-soft transition-colors hover:bg-bg-subtle",
          saved ? "text-accent" : "text-ink-2",
        )}
      >
        <Bookmark className={cn("size-4", saved && "fill-current")} /> {saved ? "Saved" : "Save"}
      </button>
      <button
        onClick={onShare}
        aria-label="Copy link"
        title="Copy link"
        className="flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-2 shadow-soft transition-colors hover:bg-bg-subtle"
      >
        {copied ? <Check className="size-4 text-positive" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}
