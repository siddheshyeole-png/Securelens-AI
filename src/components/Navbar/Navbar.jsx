import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, ArrowRight, LayoutDashboard, LogOut, UploadCloud } from "lucide-react";
import { Button } from "../Common/Button";
import { useAuth } from "../../hooks/useAuth";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Features", path: "/features" },
    { label: "How it Works", path: "/how-it-works" },
    { label: "Pricing", path: "/pricing" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" }
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#09090B]/90 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl"
          : "bg-[#09090B]/70 backdrop-blur-md border-b border-zinc-800/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-20 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/20 shrink-0 border border-blue-400/30"
            >
              <Shield className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center">
              SecureLens <span className="text-gradient-linear ml-1.5 font-mono text-sm sm:text-base font-bold">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-1 font-sans">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="relative px-3.5 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors group"
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            {isAuthenticated && user ? (
              <>
                <Link to="/dashboard/upload">
                  <Button variant="secondary" size="md" icon={UploadCloud}>
                    Upload
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="primary" size="md" icon={LayoutDashboard}>
                    Dashboard
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Login
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="primary" size="md" icon={ArrowRight}>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden shrink-0">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-zinc-300 hover:bg-zinc-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Animated Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-b border-zinc-800 bg-[#09090B]/95 backdrop-blur-2xl px-4 pt-2 pb-6 space-y-3"
          >
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-base font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block w-full">
                    <Button variant="primary" size="md" icon={LayoutDashboard} className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={LogOut}
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                      navigate("/");
                    }}
                    className="w-full text-rose-400"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full">
                    <Button variant="secondary" size="md" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full">
                    <Button variant="primary" size="md" icon={ArrowRight} className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
