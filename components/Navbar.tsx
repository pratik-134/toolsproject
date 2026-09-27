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
} from "lucide-react";
import { TOOLS } from "@/lib/registry/tools";

const ANNOUNCEMENT_STORAGE_KEY = "ct_announcement_dismissed_v1";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Detect scroll to trigger the sticky slide-down header
  useEffect(() => {
    const handleScroll = () => {
      // Trigger sticky slide-down when scrolled past 80px
      setIsScrolled(window.scrollY > 80);
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
    <div className="px-3 sm:px-6 flex h-12 sm:h-14 items-center justify-between gap-1.5 sm:gap-4">
      {/* Brand Logo & Premium Trust Tagline */}
      <div className="flex items-center gap-2 sm:gap-3.5 shrink min-w-0">
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg py-0.5"
        >
          <BrandLogo product="cleartrix" size={30} isLight={false} />
        </Link>

        {/* Premium Trust Pill (Hidden on Mobile < 1024px) */}
        <span className="hidden xl:inline-flex items-center gap-1.5 rounded-md bg-blue-50 border border-blue-200 px-2.5 py-0.5 font-body text-[11px] font-semibold text-blue-800 shrink-0">
          <Sparkles className="h-2.5 w-2.5 text-blue-600" />
          100% Free & Private
        </span>
      </div>

      <nav
        aria-label="Main Navigation"
        className="hidden md:flex items-center gap-3 lg:gap-5 xl:gap-6 font-body text-xs lg:text-small font-medium text-slate-600 shrink-0"
      >
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-2xs group"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <span>Explore {TOOLS.length} Tools</span>
        </Link>
        <Link
          href="/#templates"
          className="hover:text-blue-600 transition-colors whitespace-nowrap py-1 focus:outline-none focus-visible:text-blue-600 relative group"
        >
          Templates
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
        </Link>
        <Link
          href="/#comparison"
          className="hover:text-blue-600 transition-colors whitespace-nowrap py-1 focus:outline-none focus-visible:text-blue-600 relative group hidden lg:inline-block"
        >
          Comparison
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
        </Link>
        <Link
          href="/#features"
          className="hover:text-blue-600 transition-colors whitespace-nowrap py-1 focus:outline-none focus-visible:text-blue-600 relative group"
        >
          Features
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
        </Link>
        <Link
          href="/dashboard"
          className="hover:text-blue-600 transition-colors whitespace-nowrap py-1 focus:outline-none focus-visible:text-blue-600 relative group"
        >
          My Resumes
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
        </Link>
        <Link
          href="/#faq"
          className="hover:text-blue-600 transition-colors whitespace-nowrap py-1 focus:outline-none focus-visible:text-blue-600 relative group"
        >
          FAQ
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
        </Link>
      </nav>

      {/* Right Area: Action CTA & Mobile Hamburger Button */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Link href="/editor" onClick={handleLinkClick}>
          <Button
            size="sm"
            className="gap-1 font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs hover:shadow-sm rounded-lg h-8 sm:h-9 px-2.5 sm:px-4 text-xs whitespace-nowrap transition-all shrink-0"
          >
            <Sparkles className="h-3 w-3 text-white/95" />
            <span className="hidden xs:inline">Open Builder</span>
            <span className="xs:hidden">Build</span>
            <ArrowRight className="h-3 w-3 shrink-0 ml-0.5 hidden xs:inline" />
          </Button>
        </Link>

        {/* Mobile Hamburger Menu Toggle Button (< 768px) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation-drawer"
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:text-blue-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95 transition-all shrink-0"
        >
          {isOpen ? (
            <X className="h-4 w-4 text-slate-900" />
          ) : (
            <Menu className="h-4 w-4 text-slate-700" />
          )}
        </button>
      </div>
    </div>
  );

  const renderMobileDrawer = () => (
    <div
      id="mobile-navigation-drawer"
      ref={menuRef}
      className={`md:hidden pointer-events-auto w-full mt-2 rounded-lg overflow-y-auto transition-all duration-300 ease-in-out ${
        isOpen
          ? "max-h-[85vh] opacity-100 bg-white shadow-xl p-4 space-y-3"
          : "max-h-0 opacity-0 pointer-events-none p-0"
      }`}
    >
      <nav className="flex flex-col space-y-1">
        <Link
          href="/tools"
          onClick={handleLinkClick}
          className="flex items-center justify-between p-2.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-blue-600 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span>Explore Tools (In-Browser Suite)</span>
          </span>
          <span className="font-mono text-[10px] font-bold text-cyan-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md shadow-2xs">
            {TOOLS.length} Live
          </span>
        </Link>

        <Link
          href="/#templates"
          onClick={handleLinkClick}
          className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <LayoutTemplate className="h-4 w-4 text-blue-600" />
            <span>Resume Templates</span>
          </span>
          <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            20 Styles
          </span>
        </Link>

        <Link
          href="/#features"
          onClick={handleLinkClick}
          className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Features & PDF Engine</span>
          </span>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            Vector A4
          </span>
        </Link>

        <Link
          href="/#comparison"
          onClick={handleLinkClick}
          className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span>Why Cleartrix Resume Builder? (Comparison)</span>
          </span>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            Zero Paywall
          </span>
        </Link>

        <Link
          href="/dashboard"
          onClick={handleLinkClick}
          className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-blue-600" />
            <span>My Resumes</span>
          </span>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            Dashboard
          </span>
        </Link>

        <Link
          href="/#faq"
          onClick={handleLinkClick}
          className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-blue-600" />
            <span>Frequently Asked Questions</span>
          </span>
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            Help & Info
          </span>
        </Link>
      </nav>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-700 leading-relaxed">
          <p className="font-bold text-slate-900">100% Free Forever & Private</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Client-side architecture. No paywalls, watermarks, credit cards, or tracking cookies.
          </p>
        </div>
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
      {/* Platform Announcement Banner */}
      {!isBannerDismissed && (
        <div className="w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs py-2 px-3 sm:px-4 shadow-xs relative z-30 animate-fade-in">
          <div className="max-w-container mx-auto flex items-center justify-between gap-2">
            <div className="flex-1 flex items-center justify-center gap-2 flex-wrap text-center">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] tracking-wider uppercase font-bold text-white shrink-0">
                  Phase 2 Live
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Rocket className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <span>111+ In-Browser Privacy Tools Available</span>
                </span>
              </span>
              <span className="hidden md:inline text-blue-200">• 100% Free, Zero Uploads & Zero Server Storage</span>
              <Link
                href="/tools"
                className="shrink-0 inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:text-blue-100 transition-colors ml-1 sm:ml-2"
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
              className="shrink-0 p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-1 focus:ring-white/40"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Static Initial Header at the top of the page */}
      <div className="w-full max-w-container mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
        <header className="w-full rounded-lg shadow-md bg-white py-1.5 sm:py-2 transition-all duration-200">
          {renderNavContent()}
        </header>
        {!isScrolled && renderMobileDrawer()}
      </div>

      {/* 2. Fixed Sticky Header Island — Smoothly Slides Down from Top when Scrolling */}
      <div
        className={`fixed top-3 sm:top-4 left-0 right-0 z-50 w-full max-w-container mx-auto px-4 sm:px-6 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled
            ? "translate-y-0 opacity-100"
            : "-translate-y-24 opacity-0 pointer-events-none"
        }`}
      >
        <header className="w-full pointer-events-auto rounded-lg shadow-md bg-white py-1 sm:py-1.5 transition-all duration-200">
          {renderNavContent()}
        </header>
        {isScrolled && renderMobileDrawer()}
      </div>

      {/* Backdrop overlay when mobile menu is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}
    </>
  );
};
