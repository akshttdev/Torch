import { DashboardSidebar, DashboardTopbar } from "@/components/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="canvas-cream relative min-h-screen">
      <DashboardSidebar />
      <DashboardTopbar />
      <div className="md:pl-64">{children}</div>
    </div>
  );
}
