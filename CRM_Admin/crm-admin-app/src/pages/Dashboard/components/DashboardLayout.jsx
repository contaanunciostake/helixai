import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-[280px] transition-all duration-300">
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="mt-[70px] min-h-[calc(100vh-70px)]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;