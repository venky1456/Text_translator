import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold">Translator App</div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6">
              Translate Your World with Ease
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Break down language barriers with our powerful translation tool.
              Fast, accurate, and easy to use.
            </p>
            <div className="flex gap-4">
              <Link to="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl transform rotate-6"></div>
            <div className="relative bg-background rounded-2xl p-8 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    🌐
                  </div>
                  <div>
                    <h3 className="font-semibold">Multiple Languages</h3>
                    <p className="text-sm text-muted-foreground">
                      Support for 50+ languages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-semibold">Fast Translation</h3>
                    <p className="text-sm text-muted-foreground">
                      Instant results
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    🔒
                  </div>
                  <div>
                    <h3 className="font-semibold">Secure & Private</h3>
                    <p className="text-sm text-muted-foreground">
                      Your data is safe with us
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our Translator?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Accuracy</h3>
              <p className="text-muted-foreground">
                High-quality translations powered by advanced AI technology
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <p className="text-muted-foreground">
                Perfect for business, education, and personal use
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Accessible</h3>
              <p className="text-muted-foreground">
                Use anywhere, anytime, on any device
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 