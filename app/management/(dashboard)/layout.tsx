import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAdmin } from "../admin";
import { AppSidebar } from "./AppSidebar";
import { SiteHeader } from "./SiteHeader";

export default async function DashboardLayout({ children }: LayoutProps<"/management">) {
  const { email, isAdmin } = await getAdmin();
  return (
    <SidebarProvider>
      <AppSidebar email={email} />
      <SidebarInset>
        <SiteHeader email={email} />
        {isAdmin ? (
          children
        ) : (
          <div className="p-4 md:p-6">
            <Alert variant="destructive" className="max-w-xl">
              <AlertTitle>This account isn’t an admin</AlertTitle>
              <AlertDescription>
                Add {email} to the admins table in Supabase (see supabase/schema.sql), then reload.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
