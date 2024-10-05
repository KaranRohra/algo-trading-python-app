import Link from "next/link";
import { User } from "@/app/users/types";

const UserList = ({ users }: { users: User[] }) => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">Users List</h1>
        <Link href="/users/create">
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">
            Add New User
          </button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                User ID
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                Name
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                Active
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                Broker Name
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                Start Time
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                End Time
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                Priority
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.user_id}
                className="border-b last:border-none hover:bg-gray-100"
              >
                <td className="py-4 px-6 text-sm text-gray-800">
                  {user.user_id}
                </td>
                <td className="py-4 px-6 text-sm text-gray-800">
                  {user.user_name}
                </td>
                <td className="py-4 px-6 text-sm">
                  {user.active ? (
                    <span className="text-green-600 font-semibold">Active</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Inactive</span>
                  )}
                </td>
                <td className="py-4 px-6 text-sm text-gray-800">
                  {user.broker_name}
                </td>
                <td className="py-4 px-6 text-sm text-gray-800">
                  {user.start_time}
                </td>
                <td className="py-4 px-6 text-sm text-gray-800">
                  {user.end_time}
                </td>
                <td className="py-4 px-6 text-sm text-gray-800">
                  {user.priority}
                </td>
                <td className="py-4 px-6 text-sm">
                  <Link href={`/users/${user._id}`}>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">
                      Edit
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
