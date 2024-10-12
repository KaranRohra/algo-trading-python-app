import Link from "next/link";

const Header = () => {
  const headerItems = [
    { label: "Users", link: "/users" },
    { label: "Env", link: "/environments" },
    { label: "Logs", link: "/logs" },
  ];
  return (
    <header className="bg-gray-900 text-white p-2 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <nav className="space-x-6 flex-grow">
          {headerItems.map((item, index) => (
            <Link key={index} href={item.link} className="hover:text-gray-300 transition-colors duration-200 text-lg">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/api/auth/signout" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
          Sign Out
        </Link>
      </div>
    </header>
  );
};

export default Header;
