"use client";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { FC, useState } from "react";

type EnvironmentVariables = { [key: string]: string };

interface IEnvironmentsProps {
  environmentVariables: EnvironmentVariables;
  saveEnvironmentVariable: (envVariables: EnvironmentVariables) => Promise<void>;
  deleteEnvironmentVariable: (key: string) => Promise<void>;
}

const Environments: FC<IEnvironmentsProps> = ({ environmentVariables, saveEnvironmentVariable, deleteEnvironmentVariable }) => {
  const [envVariables, setEnvVariables] = useState<EnvironmentVariables>(environmentVariables);

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAddRow = async () => {
    if (!newKey || !newValue) return;

    const newEnvVariables = { ...envVariables, [newKey]: newValue };
    setEnvVariables(newEnvVariables);
    setNewKey("");
    setNewValue("");
    await saveEnvironmentVariable(newEnvVariables);
  };

  const handleDeleteRow = async (keyToDelete: string) => {
    const { [keyToDelete]: _, ...newEnvVariables } = envVariables; // eslint-disable-line @typescript-eslint/no-unused-vars
    setEnvVariables(newEnvVariables);
    await deleteEnvironmentVariable(keyToDelete);
  };

  const handleValueChange = (key: string, newValue: string) => {
    setEnvVariables((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveEnvironmentVariable(envVariables);
    alert("Environment variables saved successfully!");
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Environment Variables</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="border border-gray-300 p-3 rounded-l w-1/2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="border border-gray-300 p-3 rounded-r w-1/2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button type="button" onClick={handleAddRow} className="bg-blue-600 text-white p-3 rounded ml-2 hover:bg-blue-700 transition duration-300">
            Add
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2 text-left text-gray-700">Key</th>
              <th className="border px-4 py-2 text-left text-gray-700">Value</th>
              <th className="border px-4 py-2 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(envVariables).map(([key, value]) => (
              <tr key={key} className="hover:bg-gray-100 transition duration-300">
                <td className="border px-4 py-2">{key}</td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleValueChange(key, e.target.value)}
                    className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="border px-4 py-2 text-center w-10">
                  <XMarkIcon
                    onClick={() => handleDeleteRow(key)}
                    height={35}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-300"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="submit" onClick={handleSubmit} className="mt-6 bg-green-600 text-white p-3 rounded w-full hover:bg-green-700 transition duration-300">
        Save Environment Variables
      </button>
    </div>
  );
};

export default Environments;
