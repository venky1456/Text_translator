import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to the Translator App</h1>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default Home; 