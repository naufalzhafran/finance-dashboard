import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      </div>

      {/* Header Skeleton */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-background/70 sticky top-0">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-xl animate-shimmer" />
            <div className="space-y-2">
              <div className="w-36 h-5 bg-secondary rounded-md animate-shimmer" />
              <div className="w-24 h-3 bg-secondary/50 rounded-md animate-shimmer" />
            </div>
          </div>
          <div className="w-24 h-9 bg-secondary rounded-lg animate-shimmer" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Search Skeleton */}
        <section className="max-w-2xl mx-auto">
          <div className="w-full h-14 bg-card/80 border border-border/50 rounded-xl animate-shimmer" />
        </section>

        {/* Chart Cards Skeleton */}
        {[1, 2, 3].map((section) => (
          <section key={section}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-primary/10 rounded-lg animate-shimmer" />
              <div className="w-40 h-5 bg-secondary rounded-md animate-shimmer" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((card) => (
                <Card key={card} className="p-4 bg-card/80 border-border/50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1.5">
                      <div className="w-14 h-4 bg-secondary rounded-md animate-shimmer" />
                      <div className="w-20 h-3 bg-secondary/50 rounded-md animate-shimmer" />
                    </div>
                    <div className="space-y-1.5 flex flex-col items-end">
                      <div className="w-16 h-4 bg-secondary rounded-md animate-shimmer" />
                      <div className="w-10 h-3 bg-secondary/50 rounded-md animate-shimmer" />
                    </div>
                  </div>
                  <div className="h-16 bg-secondary/30 rounded-md animate-shimmer" />
                </Card>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
