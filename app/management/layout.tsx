import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Management",
  robots: { index: false, follow: false },
};

/** `admin` switches on the shadcn/ui styles in globals.css. */
export default function ManagementLayout({ children }: LayoutProps<"/management">) {
  return <div className="admin min-h-dvh">{children}</div>;
}
