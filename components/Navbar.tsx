"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import {
  Menu,
  X,
  ArrowRight,
  LayoutTemplate,
  ShieldCheck,
  Sparkles,
  FileText,
  CheckCircle2,
  Rocket,
  Wrench,
} from "lucide-react";
import { TOOLS } from "@/lib/registry/tools";

import { CommandPalette } from "@/components/tools/CommandPalette";
import { ThemeToggle } from "@/components/ThemeToggle";
import { KbdShortcut } from "@/components/ui/KbdShortcut";
import { Search } from "lucide-react";

const ANNOUNCEMENT_STORAGE_KEY = "ct_announcement_dismissed_v1";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Check if announcement was previously dismissed
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
      if (dismissed === "true") {
        setIsBannerDismissed(true);
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }, []);

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "true");
    } catch {
      // Ignore
    }
  };

  // Detect scroll to trigger elevated navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize to >= 768px (md breakpoint)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const renderNavContent = () => (
    <div className="flex h-16 sm:h-20 items-center justify-between gap-3 sm:gap-6">
      {/* Brand Logo & Trust Tagline */}
      <div className="flex items-center gap-3 sm:gap-4 shrink min-w-0">
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl py-1"
        >
          <BrandLogo product="cleartrix" size={34} isLight={false} />
        </Link>

        {/* Trust Pill (Desktop only) */}
        <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 px-3 py-1 font-body text-xs font-semibold text-blue-700 dark:text-blue-300 shrink-0 shadow-2xs">
          ✦ Open & private · zero paywalls
        </span>
      </div>

      {/* Center Navigation Links */}
      <nav
        aria-label="Main Navigation"
        className="hidden md:flex items-center gap-5 lg:gap-8 font-body text-xs lg:text-sm font-semibold text-slate-700 dark:text-slate-200 shrink-0"
      >
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap py-1 focus:outline-none focus-visible:text-blue-600 relative group font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Tools</span>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900/80 px-2 py-0.5 rounded-full">
            {TOOLS.length}
          </span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
        </Link>
        <Link
          href="/blog"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap py-1 focus:outline-none focus-visible:text-blue-600 relative group font-semibold text-slate-700 dark:text-slate-200"
        >
          Blog
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
        </Link>
        <Link
          href="/#templates"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap py-1 focus:outline-none focus-visible:text-blue-600 relative group"
        >
          Templates
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
        </Link>
        <Link
          href="/#comparison"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap py-1 focus:outline-none focus-visible:text-blue-600 relative group hidden lg:inline-block"
        >
          Comparison
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
        </Link>
        <Link
          href="/#features"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap py-1 focus:outline-none focus-visible:text-blue-600 relative group"
        >
          Features
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
        </Link>
        <Link
          href="/dashboard"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap py-1 focus:outline-none focus-visible:text-blue-600 relative group"
        >
          My Resumes
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
        </Link>
        <Link
          href="/#faq"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap py-1 focus:outline-none focus-visible:text-blue-600 relative group"
        >
          FAQ
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
        </Link>
      </nav>

      {/* Right Area: Action CTA & Theme Toggle & Mobile Hamburger Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all"
        >
          <Search className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <span>Search</span>
          <KbdShortcut shortcut="K" className="hidden md:inline-flex text-[10px]" />
        </button>

        {/* Header Theme Toggle (Dark/Light Switch) */}
        <ThemeToggle />

        <Link href="/editor" onClick={handleLinkClick}>
          <Button
            size="sm"
            className="gap-1.5 font-extrabold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg rounded-xl h-9 sm:h-10.5 px-3.5 sm:px-5 text-xs sm:text-sm whitespace-nowrap transition-all shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-white/95" />
            <span className="hidden xs:inline">Open Builder</span>
            <span className="xs:hidden">Build</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 ml-0.5 hidden xs:inline" />
          </Button>
        </Link>

        {/* Mobile Hamburger Menu Toggle Button (< 768px) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation-drawer"
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95 transition-all shrink-0"
        >
          {isOpen ? (
            <X className="h-4 w-4 text-slate-900 dark:text-white" />
          ) : (
            <Menu className="h-4 w-4 text-slate-700 dark:text-slate-200" />
          )}
        </button>
      </div>
    </div>
  );

  const renderMobileDrawer = () => (
    <div
      id="mobile-navigation-drawer"
      ref={menuRef}
      className={`md:hidden absolute top-full left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen
          ? "max-h-[85vh] opacity-100 p-4 space-y-3 overflow-y-auto"
          : "max-h-0 opacity-0 pointer-events-none p-0 border-transparent"
      }`}
    >
      <nav className="flex flex-col space-y-1">
        <Link
          href="/tools"
          onClick={handleLinkClick}
          className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Tools & Utilities</span>
          </span>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 px-2 py-0.5 rounded-full">
            {TOOLS.length} tools
          </span>
        </Link>

        <Link
          href="/#templates"
          onClick={handleLinkClick}
          className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <LayoutTemplate className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Resume Templates</span>
          </span>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 px-2 py-0.5 rounded-full">
            20 styles
          </span>
        </Link>

        <Link
          href="/#features"
          onClick={handleLinkClick}
          className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Features & PDF Engine</span>
          </span>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 px-2 py-0.5 rounded-full">
            Vector A4
          </span>
        </Link>

        <Link
          href="/#comparison"
          onClick={handleLinkClick}
          className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Why Cleartrix? (Comparison)</span>
          </span>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 px-2 py-0.5 rounded-full">
            Zero paywall
          </span>
        </Link>

        <Link
          href="/dashboard"
          onClick={handleLinkClick}
          className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>My Resumes</span>
          </span>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 px-2 py-0.5 rounded-full">
            Dashboard
          </span>
        </Link>

        <Link
          href="/blog"
          onClick={handleLinkClick}
          className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Blog & Guides</span>
          </span>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 px-2 py-0.5 rounded-full">
            Articles
          </span>
        </Link>

        <Link
          href="/#faq"
          onClick={handleLinkClick}
          className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Frequently Asked Questions</span>
          </span>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 px-2 py-0.5 rounded-full">
            FAQ
          </span>
        </Link>
      </nav>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 p-3 flex items-start gap-2.5">
        <div className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
          <p className="font-semibold text-slate-800 dark:text-slate-100">Free forever · no account needed</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Runs in your browser. No paywalls, watermarks, or tracking cookies.
          </p>
        </div>
      </div>

      {/* Mobile Drawer Theme Toggle */}
      <div className="pt-1">
        <ThemeToggle showLabel className="w-full justify-between py-2 px-3.5 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700" />
      </div>

      <div className="pt-1">
        <Link href="/editor" onClick={handleLinkClick} className="block w-full">
          <Button
            size="lg"
            className="w-full gap-2 font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg h-10 text-xs shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Start Building Resume Free</span>
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Platform Announcement Banner — Clean, responsive, zero mobile wrapping */}
      {!isBannerDismissed && (
        <aside
          aria-label="Platform Announcement"
          className="w-full bg-slate-900 text-white text-xs relative z-30 transition-all border-b border-slate-800"
        >
          <div className="max-w-container mx-auto flex items-center justify-between px-3 sm:px-6 py-1.5 sm:py-2 gap-2">
            {/* Mobile compact single-line view (< 640px) */}
            <div className="flex sm:hidden items-center justify-between w-full min-w-0 gap-2">
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <Rocket className="h-3 w-3 text-cyan-400 shrink-0" strokeWidth={2} aria-hidden="true" />
                <span className="text-[11px] font-medium text-slate-200 truncate">
                  <span className="font-mono font-bold text-white">{TOOLS.length}+</span> Free Privacy Tools
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/tools"
                  className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-2 transition-colors whitespace-nowrap"
                >
                  Explore →
                </Link>
                <button
                  type="button"
                  onClick={handleDismissBanner}
                  aria-label="Dismiss banner"
                  className="p-0.5 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Tablet & Desktop full view (>= 640px) */}
            <div className="hidden sm:flex flex-1 items-center justify-center gap-2.5 text-center text-xs">
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] tracking-wider uppercase font-bold shrink-0">
                100% Free & Private
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
                <Rocket className="h-3.5 w-3.5 text-cyan-400 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>
                  <span className="font-mono font-bold text-white">{TOOLS.length}+</span> In-Browser Privacy Tools Available
                </span>
              </span>
              <span className="text-slate-400 text-xs hidden lg:inline">• 100% Free, Zero Uploads & Zero Server Storage</span>
              <Link
                href="/tools"
                className="shrink-0 inline-flex items-center gap-1 font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-2 transition-colors ml-1"
              >
                <span>Explore Tools</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <button
              type="button"
              onClick={handleDismissBanner}
              aria-label="Dismiss announcement banner"
              title="Dismiss banner"
              className="hidden sm:flex shrink-0 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* 2. Full-Width Sticky Navbar */}
      <header
        className={`sticky top-0 z-50 w-full bg-white dark:bg-slate-900 transition-all duration-300 ${
          isScrolled
            ? "border-b border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)]"
            : "border-b border-transparent shadow-none"
        }`}
      >
        <div className="max-w-container mx-auto px-4 sm:px-6">
          {renderNavContent()}
        </div>
        {renderMobileDrawer()}
      </header>

      {/* 3. Backdrop overlay when mobile menu is open (z-40 so it stays BEHIND the z-50 sticky header & drawer) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* 4. Global Cmd/Ctrl+K Search Palette */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

