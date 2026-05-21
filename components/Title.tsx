import { siteConfig } from "@/site.config";

type TitleProps = {
  subhead?: string;
};

export function Title({ subhead }: TitleProps) {
  return (
    <div>
      <span className="block type-display text-accent">
        {siteConfig.name.first}
      </span>
      <span className="block type-display-italic text-heading">
        {siteConfig.name.last}
      </span>
      {subhead && (
        <span className="block type-section text-muted">{subhead}</span>
      )}
    </div>
  );
}
