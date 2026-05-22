import { Nav } from "./Nav";
import { Footer } from "./Footer";

type LayoutProps = {
  children: React.ReactNode;
  width?: "default" | "narrow";
};

const widthClass = {
  default: "w-[min(680px,100%_-_48px)]",
  narrow: "w-[min(600px,100%_-_48px)]",
};

export function Layout({ children, width = "default" }: LayoutProps) {
  return (
    <div
      className={`mx-auto flex min-h-screen ${widthClass[width]} flex-col pt-[32px] pb-[48px] sm:pt-[36px]`}
    >
      <Nav />
      <main className="flex-1">{children}</main>
      {/* mt enforces a minimum gap to content; flex-1 main adds more when the
          page is short, so short pages keep their footer-at-bottom look. */}
      <div className="mt-[80px]">
        <Footer />
      </div>
    </div>
  );
}
