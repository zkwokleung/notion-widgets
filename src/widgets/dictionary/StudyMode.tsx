import { CheckCircle2, RotateCcw } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import SpeakButton from "@/components/widget/SpeakButton";
import { useTranslation } from "@/hooks/useTranslation";
import { dueItems, nextIntervalLabel, review, type Grade } from "@/lib/srs";
import { languageName } from "@/utils/lang";
import type { DictWord, ReviewState } from "../../../shared/widgetConfigs";

interface StudyModeProps {
  words: DictWord[];
  rate: number;
  onReview: (id: string, review: ReviewState) => void;
}

const GRADES: { grade: Grade; label: string; key: string }[] = [
  { grade: "again", label: "Again", key: "1" },
  { grade: "hard", label: "Hard", key: "2" },
  { grade: "good", label: "Good", key: "3" },
  { grade: "easy", label: "Easy", key: "4" },
];

function formatRelative(iso: string, now: Date): string {
  const minutes = Math.max(1, Math.round((new Date(iso).getTime() - now.getTime()) / 60000));
  if (minutes < 60) return `in ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `in ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "tomorrow" : `in ${days} days`;
}

function StudyMode({ words, rate, onReview }: StudyModeProps) {
  const studyable = words.filter((word) => word.text.trim());
  // The session is fixed when it starts so graded cards don't reshuffle the queue.
  const [queue, setQueue] = useState(() => dueItems(studyable, new Date()).map(({ id }) => id));
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionSize, setSessionSize] = useState(queue.length);

  const byId = new Map(studyable.map((word) => [word.id, word]));
  const current = byId.get(queue[position] ?? "");

  const startSession = (ids: string[]) => {
    setQueue(ids);
    setSessionSize(ids.length);
    setPosition(0);
    setRevealed(false);
  };

  const grade = (value: Grade) => {
    if (!current) return;
    onReview(current.id, review(current.review, value, new Date()));
    // Forgotten cards come back at the end of this session.
    if (value === "again") setQueue((ids) => [...ids, current.id]);
    setPosition((index) => index + 1);
    setRevealed(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (!revealed && (event.key === " " || event.key === "Enter")) {
      event.preventDefault();
      setRevealed(true);
      return;
    }
    const match = revealed && GRADES.find(({ key }) => key === event.key);
    if (match) {
      event.preventDefault();
      grade(match.grade);
    }
  };

  if (studyable.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-muted-foreground">
        Add some words first, then come back to study them.
      </p>
    );
  }

  if (!current) {
    const now = new Date();
    const nextDue = studyable
      .map((word) => word.review?.dueAt)
      .filter((due): due is string => !!due)
      .sort()[0];
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
        <CheckCircle2 aria-hidden className="size-6 text-success" />
        <div>
          <p className="font-medium">All caught up</p>
          <p className="text-muted-foreground">
            {nextDue ? `Next review ${formatRelative(nextDue, now)}.` : "Nothing is due right now."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => startSession(studyable.map(({ id }) => id))}
        >
          <RotateCcw />
          {studyable.length === 1 ? "Practice 1 word" : `Practice all ${studyable.length} words`}
        </Button>
      </div>
    );
  }

  const done = Math.min(position, sessionSize);

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Flashcard. Press space to reveal, then 1 to 4 to grade."
      className="flex flex-col gap-4 rounded-md px-2 py-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Progress value={(done / Math.max(1, sessionSize)) * 100} aria-label="Session progress" />
        <span className="shrink-0 tabular-nums">
          {done} / {sessionSize}
        </span>
      </div>

      <Card key={`${current.id}-${position}`} word={current} rate={rate} revealed={revealed} />

      {revealed ? (
        <div className="grid grid-cols-2 gap-2 @md:grid-cols-4" role="group" aria-label="How well did you know it?">
          {GRADES.map(({ grade: value, label, key }) => (
            <Button
              key={value}
              type="button"
              variant={value === "good" ? "default" : "outline"}
              onClick={() => grade(value)}
              className="h-auto flex-col gap-0 py-1.5"
            >
              <span>{label}</span>
              <span className="text-[0.7rem] font-normal opacity-70">
                {nextIntervalLabel(current.review, value, new Date())} · {key}
              </span>
            </Button>
          ))}
        </div>
      ) : (
        <Button type="button" variant="secondary" onClick={() => setRevealed(true)} className="self-center">
          Show answer
        </Button>
      )}
    </div>
  );
}

function Card({ word, rate, revealed }: { word: DictWord; rate: number; revealed: boolean }) {
  const translation = useTranslation(word.text.trim(), word.from, word.to);

  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border border-border px-4 py-6 text-center">
      <span className="text-xs text-muted-foreground">{languageName(word.from)}</span>
      <div className="flex items-center gap-1">
        <span className="text-2xl font-semibold break-words">{word.text}</span>
        <SpeakButton text={word.text} lang={word.from} rate={rate} subject="word" />
      </div>
      {revealed && (
        <div className="flex flex-col items-center gap-1 border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">{languageName(word.to)}</span>
          <div className="flex items-center gap-1">
            <span className="text-lg" aria-live="polite">
              {translation || "…"}
            </span>
            <SpeakButton text={translation} lang={word.to} rate={rate} subject="translation" />
          </div>
        </div>
      )}
    </div>
  );
}

export default StudyMode;
