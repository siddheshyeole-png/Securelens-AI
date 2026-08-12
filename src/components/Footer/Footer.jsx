import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Send,
  CheckCircle2,
  Globe,
  Share2,
  Code2,
  Activity,
  MessageSquare
} from "lucide-react";
import { Button } from "../Common/Button";
import { APP_NAME, APP_VERSION } from "../../utils/constants";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="border-t border-zinc-800 bg-[#09090B] text-zinc-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Grid: Newsletter & Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand & Newsletter Section */}
          <div className="lg:col-span-5 space-y-5">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                {APP_NAME}
              </span>
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm font-normal">
              Next-generation AI media verification platform engineered to detect deepfakes, synthetic voices, and digital manipulation in real time.
            </p>

            {/* Newsletter Input Box */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Subscribe to AI Security Dispatch
              </h4>
              {subscribed ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Subscribed! Check your inbox for AI research updates.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center space-x-2 max-w-md">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter corporate email..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <Button type="submit" variant="primary" size="sm" icon={Send}>
                    Subscribe
                  </Button>
                </form>
              )}
              <p className="text-[11px] text-zinc-500 font-mono">
                No spam. Unsubscribe at any time. Encrypted & Privacy Protected.
              </p>
            </div>
          </div>

          {/* 1. Company Section */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors flex items-center justify-between">
                  <span>Careers</span>
                  <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30">
                    HIRING
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors">
                  Research & Engineering
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition-colors">
                  Press & Media Kit
                </Link>
              </li>
            </ul>
          </div>

          {/* 2. Resources Section */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/upload" className="hover:text-blue-400 transition-colors">
                  Deepfake Detection API
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors">
                  Forensic Documentation
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors">
                  Compliance Standards
                </Link>
              </li>
              <li>
                <a href="#status" className="hover:text-blue-400 transition-colors flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>System Status</span>
                </a>
              </li>
            </ul>
          </div>

          {/* 3. Legal Section */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Legal & Ethics
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a href="#privacy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#ethics" className="hover:text-blue-400 transition-colors">
                  Responsible AI Framework
                </a>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors">
                  C2PA Digital Provenance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 4. Social Media & Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center space-x-4">
            <span>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
            <span className="font-mono text-blue-400 font-bold">v{APP_VERSION}</span>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold text-zinc-400 mr-2 uppercase tracking-wider">Connect:</span>
            <a
              href="#network"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-blue-400 hover:border-blue-500/40 transition-all shadow-sm"
              title="Global Network"
            >
              <Globe className="w-4 h-4" />
            </a>
            <a
              href="#code"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-blue-400 hover:border-blue-500/40 transition-all shadow-sm"
              title="Developer Portal"
            >
              <Code2 className="w-4 h-4" />
            </a>
            <a
              href="#share"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-blue-400 hover:border-blue-500/40 transition-all shadow-sm"
              title="Share Platform"
            >
              <Share2 className="w-4 h-4" />
            </a>
            <a
              href="#community"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-blue-400 hover:border-blue-500/40 transition-all shadow-sm"
              title="Community Forum"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
