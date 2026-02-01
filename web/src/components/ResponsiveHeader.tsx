"use client";

import { Book, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface ResponsiveHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function ResponsiveHeader({
  title = "Finance Dashboard",
  subtitle = "Market Overview",
}: ResponsiveHeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative z-50 border-b border-white/5 backdrop-blur-md bg-background/50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight line-clamp-1">
                {title}
              </h1>
              <p className="text-muted-foreground text-xs hidden sm:block">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-4">
            <button
              onClick={() => router.push("/glossary")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/50 border border-border hover:bg-muted/50 transition-colors text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <Book className="w-4 h-4" />
              <span>Glossary</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="sm:hidden pt-4 pb-2 animate-in slide-in-from-top-2">
            <div className="space-y-2">
              <button
                onClick={() => {
                  router.push("/glossary");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/30 active:bg-muted transition-colors text-sm font-medium text-foreground"
              >
                <Book className="w-4 h-4 text-primary" />
                <span>Glossary</span>
              </button>
              {/* Add more mobile nav items here if needed */}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
