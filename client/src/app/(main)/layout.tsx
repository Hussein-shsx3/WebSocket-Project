import { ProtectedLayout } from "@/components/layout/ProtectedLayout";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
