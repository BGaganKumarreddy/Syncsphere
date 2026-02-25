import Navbar from "./Navbar";

function Layout({ children, className = "bg-gray-50 text-slate-900", navbarClass }) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Navbar className={navbarClass} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}

export default Layout;
