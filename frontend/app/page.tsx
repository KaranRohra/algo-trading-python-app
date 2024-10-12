import authenticate from "./auth";

async function page() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center bg-white p-8 rounded shadow">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome, Admin
        </h1>
        <p className="text-md text-gray-600 mb-6">
          You are successfully logged in.
        </p>
        <a
          href="/api/auth/signout"
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </a>
      </div>
    </div>
  );
}

export default authenticate(page);
