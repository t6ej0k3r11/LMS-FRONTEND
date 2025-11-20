import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin, Youtube, Instagram } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    // Handle subscription logic here, e.g., API call
    console.log('Subscribed with email:', email);
    setEmail('');
    alert('Thank you for subscribing!');
  };

  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300">
      <div className="border-t border-gray-300 dark:border-gray-700"></div>
      <div className="container mx-auto max-w-7xl py-10 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About DeshGory */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl font-bold text-primary">DeshGory</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Empowering Learning, Everywhere.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your gateway to quality education and skill development.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                <Youtube size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-gray-500 hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/courses" className="text-sm text-gray-500 hover:text-primary transition-colors">Courses</Link></li>
              <li><Link to="/instructors" className="text-sm text-gray-500 hover:text-primary transition-colors">Instructors</Link></li>
              <li><Link to="/about" className="text-sm text-gray-500 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-500 hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/faqs" className="text-sm text-gray-500 hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/blog" className="text-sm text-gray-500 hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/help" className="text-sm text-gray-500 hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-500 hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Stay updated with new courses & offers.
            </p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-300 dark:border-gray-700 py-4">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} DeshGory. All rights reserved. Sister Concern of iTechss.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;