import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">404</h1>
        <p className="text-slate-300">The page you are looking for could not be found.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sky-400 transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;


