import { MainLayout } from "@/components/layout/mainLayout";
import { protectPage } from "@/protect";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect all routes in this group
  await protectPage();

  return <MainLayout>{children}</MainLayout>;
}
