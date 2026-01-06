import React from "react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-red-600">404</h1>
        <p className="mt-4 text-2xl font-bold text-gray-800">
          Oops! Page Not Found
        </p>
        <p className="mt-2 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="px-6 py-3 bg-red-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Go Back Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;