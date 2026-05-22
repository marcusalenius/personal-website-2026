import { formatMonthDayYear } from "@/lib/date";
import { readingTimeMinutes } from "@/lib/reading-time";

type ArticleHeaderProps = {
  title: string;
  lede: string;
  date: string;
  readingTime?: number;
  wordCount: number;
};

export function ArticleHeader({
  title,
  lede,
  date,
  readingTime,
  wordCount,
}: ArticleHeaderProps) {
  const minutes = readingTime ?? readingTimeMinutes(wordCount);

  return (
    <header className="flex flex-col gap-[16px]">
      <p className="type-meta text-accent">
        {formatMonthDayYear(date)} · {minutes} min read
      </p>
      <h1 className="type-article-title text-heading">{title}</h1>
      <p className="type-lede text-body">{lede}</p>
    </header>
  );
}
