"use client";
import React, { useState } from "react";
import { LogEntry } from "./types";
import { recursiveStringToJsonFormatter } from "../utils";

interface LogsProps {
  logs: LogEntry[];
}

const Logs: React.FC<LogsProps> = ({ logs }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<object>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const logsPerPage = 20;

  const showModal = (details: object) => {
    setModalContent(details);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setModalContent({});
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const filteredLogs = logs.filter(
    (log) =>
      (log.timestamp && log.timestamp.includes(searchQuery)) ||
      (log.logType && log.logType.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.message && log.message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(indexOfFirstLog, indexOfLastLog);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Logs</h1>
      <input type="text" placeholder="Search logs..." value={searchQuery} onChange={handleSearchChange} className="mb-4 p-2 border border-gray-300 rounded" />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Timestamp</th>
              <th className="py-3 px-4 text-left">Log Type</th>
              <th className="py-3 px-4 text-left">Message</th>
              <th className="py-3 px-4 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log, index) => (
              <tr key={index} className="border-b last:border-none hover:bg-gray-100">
                <td className="py-3 px-4">{log.timestamp.split(".")[0]}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      log.logType === "SUCCESS"
                        ? "bg-green-100 text-green-800"
                        : log.logType === "ERROR"
                        ? "bg-red-100 text-red-800"
                        : log.logType === "WARN"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {log.logType}
                  </span>
                </td>
                <td className="py-3 px-4">{log.message.length > 100 ? `${log.message.substring(0, 100)}...` : log.message}</td>
                <td className="py-3 px-4">
                  {log.details ? (
                    <button className="text-blue-500 hover:underline" onClick={() => showModal(log.details)}>
                      View Details
                    </button>
                  ) : (
                    "No details available"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={hideModal}>
              &times;
            </button>
            <div className="max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{recursiveStringToJsonFormatter(JSON.stringify(modalContent))}</pre>
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700" onClick={hideModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
