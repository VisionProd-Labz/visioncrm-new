import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { LanguageProvider } from '@/contexts/language-context';
import { ModulesProvider } from '@/contexts/modules-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <ModulesProvider>
        <SidebarProvider>
          <div className="h-screen flex overflow-hidden bg-background">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto bg-background">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ModulesProvider>
    </LanguageProvider>
  );
}
