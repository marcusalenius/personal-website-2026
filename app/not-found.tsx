import { Layout } from "@/components/Layout";
import { BackLink } from "@/components/BackLink";

export default function NotFound() {
  return (
    <Layout>
      <div className="mt-[110px]">
        <h1 className="type-article-title text-heading">Page not found</h1>
        <div className="mt-[16px]">
          <BackLink href="/">back to home</BackLink>
        </div>
      </div>
    </Layout>
  );
}
