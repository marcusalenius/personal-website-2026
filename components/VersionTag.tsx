import { ArrowUpRightIcon } from "@/components/icons";

const REPO = "marcusalenius/personal-website-2026";

// Captured at module load. In dev this is the process start; in CI builds the
// env vars below are set, so this branch never runs in prod.
const devDate = new Date().toISOString().slice(0, 10);

export function VersionTag() {
  const sha = process.env.NEXT_PUBLIC_COMMIT_SHA;
  const date = process.env.NEXT_PUBLIC_COMMIT_DATE;

  const href = `https://github.com/${REPO}/tree/main`;

  const label = sha && date ? `${sha} (${date})` : `DEV (${devDate})`;

  return (
    <p className="font-mono">
      <a
        href={href}
        className="font-semibold text-muted no-underline transition-colors hover:text-muted-strong"
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
        <ArrowUpRightIcon size={10} className="md-link-arrow" />
      </a>
    </p>
  );
}
