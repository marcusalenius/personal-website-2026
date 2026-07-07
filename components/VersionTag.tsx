import { ArrowUpRightIcon } from "@/components/icons";

const REPO = "marcusalenius/personal-website-2026";

// Captured at module load. In dev this is the process start; in CI builds the
// env vars below are set, so this branch never runs in prod.
const devDate = new Date().toISOString().slice(0, 10);

export function VersionTag() {
  const sha = process.env.NEXT_PUBLIC_COMMIT_SHA;
  const date = process.env.NEXT_PUBLIC_COMMIT_DATE;

  const href = sha
    ? `https://github.com/${REPO}/commit/${sha}`
    : `https://github.com/${REPO}`;

  const label = sha && date ? `${sha} (${date})` : `DEV (${devDate})`;

  return (
    <p className="text-[13px]">
      <a
        href={href}
        className="font-semibold text-muted no-underline transition-colors hover:text-muted-strong"
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
        <ArrowUpRightIcon size={8} className="md-link-arrow version-tag-arrow" />
      </a>
    </p>
  );
}
