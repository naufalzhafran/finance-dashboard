"use client";

import { Book, Menu, TrendingUp, X } from "lucide-react";
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
    <header className="relative z-50 border-b border-border/50 backdrop-blur-xl bg-background/70 sticky top-0">
      {/* Subtle glow line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary/90 to-accent/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 group-hover:shadow-primary/40 transition-shadow duration-300">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary hover:border-primary/30 transition-all duration-200 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
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
              className="cursor-pointer"
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
          <div className="sm:hidden pt-4 pb-2 animate-fade-in">
            <div className="space-y-2">
              <button
                onClick={() => {
                  router.push("/glossary");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/30 active:bg-secondary transition-colors text-sm font-medium text-foreground cursor-pointer"
              >
                <Book className="w-4 h-4 text-primary" />
                <span>Glossary</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
