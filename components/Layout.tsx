import { Nav } from "./Nav";
import { Footer } from "./Footer";

type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[680px] flex-col px-4 pt-[36px] pb-[48px] sm:px-0">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
