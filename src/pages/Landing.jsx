import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-16">
          <div className="text-3xl font-bold tracking-wide">Translator App</div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-500">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-white text-blue-500 hover:bg-blue-100">
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Break Language Barriers <br />
              <span className="text-yellow-300">Effortlessly</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Translate text in over 50 languages with our fast, accurate, and secure translation tool.
            </p>
            <div className="flex gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-yellow-300 text-blue-900 hover:bg-yellow-400">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-500">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-purple-300/20 rounded-2xl transform rotate-6"></div>
            <div className="relative bg-white text-blue-900 rounded-2xl p-8 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    🌐
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Multiple Languages</h3>
                    <p className="text-sm text-gray-600">Support for 50+ languages</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Fast Translation</h3>
                    <p className="text-sm text-gray-600">Instant results</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    🔒
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Secure & Private</h3>
                    <p className="text-sm text-gray-600">Your data is safe with us</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Our Translator?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white text-blue-900 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Accuracy</h3>
              <p className="text-gray-600">High-quality translations powered by advanced AI technology.</p>
            </div>
            <div className="bg-white text-blue-900 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <p className="text-gray-600">Perfect for business, education, and personal use.</p>
            </div>
            <div className="bg-white text-blue-900 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Accessible</h3>
              <p className="text-gray-600">Use anywhere, anytime, on any device.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;