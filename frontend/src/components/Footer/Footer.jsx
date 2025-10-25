import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-200 py-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {/* About Section */}
        <div>
          <h2 className="text-lg font-bold mb-4">About Incident Reporter</h2>
          <p className="text-sm text-gray-400">
            Incident Reporter is your go-to platform for reporting, managing, and resolving incidents efficiently. Join our community to make a difference.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-bold mb-4">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-white">Home</Link>
            </li>
            <li>
              <Link to="/incidents" className="hover:text-white">Incidents</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white">Log In</Link>
            </li>
            <li>
              <Link to="/signup" className="hover:text-white">Sign Up</Link>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h2 className="text-lg font-bold mb-4">Contact Us</h2>
          <p className="text-sm text-gray-400">Prof. Dr. P.J. Pawar</p>
          <p className="text-sm text-gray-400">Email: pj.pawar@example.com</p>
          <p className="text-sm text-gray-400">Phone: +91 9876543210</p>

          <p className="text-sm text-gray-400 mt-4">Prof. Dr. R. K. Munje</p>
          <p className="text-sm text-gray-400">Email: rk.munje@example.com</p>
          <p className="text-sm text-gray-400">Phone: +91 8765432109</p>
        </div>
      </div>

      {/* Social Media and Copyright */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center">
        <div className="flex justify-center space-x-4 mb-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
            <Facebook />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
            <Twitter />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
            <Instagram />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
            <Linkedin />
          </a>
        </div>
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Incident Reporter. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
