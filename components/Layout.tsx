import { Nav } from "./Nav";
import { Footer } from "./Footer";

type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen w-[min(680px,100%_-_48px)] flex-col pt-[32px] pb-[48px] sm:pt-[36px]">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
