import {
  PaperPlaneTiltIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  type IconComponent,
} from "@/components/icons";

type Contact = {
  kind: "email" | "github" | "linkedin";
  label: string;
  href: string;
  icon: IconComponent;
};

export const siteConfig = {
  name: { first: "Marcus", last: "Alenius" },
  url: "https://alenius.io",
  description: "Personal site of Marcus Alenius.",
  nav: [
    { label: "home", href: "/" },
    { label: "work", href: "/work" },
    { label: "posts", href: "/posts" },
  ],
  contacts: [
    {
      kind: "email",
      label: "marcus.alenius@gmail.com",
      href: "mailto:marcus.alenius@gmail.com",
      icon: PaperPlaneTiltIcon,
    },
    {
      kind: "github",
      label: "marcusalenius",
      href: "https://github.com/marcusalenius",
      icon: GithubLogoIcon,
    },
    {
      kind: "linkedin",
      label: "marcusalenius",
      href: "https://linkedin.com/in/marcusalenius",
      icon: LinkedinLogoIcon,
    },
  ] satisfies Contact[],
  ogImage: "/og/default.png",
} as const;
