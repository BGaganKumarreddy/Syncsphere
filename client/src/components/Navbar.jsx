import { Link } from "react-router-dom";

function Navbar({ className = "bg-white border-b border-gray-100" }) {
  return (
    <header className={`w-full ${className}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight flex items-center gap-2"
        >
          <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg">S</span>
          <span>SyncSphere</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium hover:text-indigo-600 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
