import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function Layout({ children }: any) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 bg-gray-100 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
