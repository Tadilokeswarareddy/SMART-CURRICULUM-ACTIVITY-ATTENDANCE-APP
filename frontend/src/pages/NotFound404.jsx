import React from "react";
import { Link } from "react-router-dom";

const NotFound404 = () => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center text-center p-4">
      <h1 className="text-5xl font-bold text-red-600 mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-2xl mb-6">
        The page you are looking for doesn’t exist. Please go back to the login page.
      </p>

      <Link
        to="/login"
        className="px-5 py-2 bg-red-600 text-white rounded-md"
      >
        Go to Login
      </Link>
    </div>
  );
};

export default NotFound404;
