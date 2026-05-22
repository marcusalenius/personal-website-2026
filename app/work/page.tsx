import type { Metadata } from "next";
import { work } from "#site/content";
import { Layout } from "@/components/Layout";
import { Title } from "@/components/Title";
import { formatMonthYear } from "@/lib/date";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Work",
  description: "Roles and research Marcus Alenius has worked on.",
  path: "/work",
});

export default function WorkPage() {
  const entries = [...work].sort(
    (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime(),
  );

  return (
    <Layout>
      <div className="mt-[64px] sm:mt-[95px]">
        <Title subhead="/work" />
      </div>
      <ul className="mt-[56px] flex flex-col gap-[30px] sm:mt-[78px]">
        {entries.map((entry) => (
          <li
            key={`${entry.organization}-${entry.start}`}
            className="flex gap-[28px]"
          >
            <div className="w-[100px] shrink-0">
              <div className="type-meta text-accent">
                {formatMonthYear(entry.start)} –
              </div>
              <div className="type-meta text-accent">
                {entry.end ? formatMonthYear(entry.end) : "Present"}
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
              <div className="type-title text-heading">{entry.organization}</div>
              <div className="type-role text-body">{entry.role}</div>
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
