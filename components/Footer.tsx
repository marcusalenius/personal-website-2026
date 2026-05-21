import { siteConfig } from "@/site.config";

export function Footer() {
  return (
    <footer className="border-t border-divider pt-[26px]">
      <ul className="flex flex-wrap justify-center gap-x-[28px] gap-y-[12px]">
        {siteConfig.contacts.map((contact) => {
          const Icon = contact.icon;
          return (
            <li key={contact.kind}>
              <a
                href={contact.href}
                className="inline-flex items-center gap-[7px] type-caption text-muted"
                {...(contact.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <Icon size={15} aria-hidden />
                <span>{contact.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </footer>
  );
}
