import Link from "next/link";
import { SearchX, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      <Card className="relative z-10 max-w-md mx-auto p-8 bg-card/80 backdrop-blur-sm border-border/50">
        <div className="text-center">
          <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 border border-border/50">
            <SearchX className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <Button asChild className="cursor-pointer gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
