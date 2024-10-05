import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-gray-900 text-white p-2 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <nav className="space-x-6 flex-grow">
          <Link href="/users" className="hover:text-gray-300 transition-colors duration-200 text-lg">
            Users
          </Link>
          <Link href="/environments" className="hover:text-gray-300 transition-colors duration-200 text-lg">
            Env
          </Link>
          <Link href="/logs" className="hover:text-gray-300 transition-colors duration-200 text-lg">
            Logs
          </Link>
        </nav>
        <Link href="/api/auth/signout" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
          Sign Out
        </Link>
      </div>
    </header>
  );
};

export default Header;
