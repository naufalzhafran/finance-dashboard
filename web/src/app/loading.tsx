import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
      </div>

      {/* Header Skeleton */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-background/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-muted/50 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="w-32 h-5 bg-muted/50 rounded animate-pulse" />
              <div className="w-24 h-3 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-28 h-8 bg-muted/50 rounded-lg animate-pulse" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Search Skeleton */}
        <section className="max-w-2xl mx-auto">
          <div className="w-full h-12 bg-muted/30 rounded-xl animate-pulse" />
        </section>

        {/* Chart Cards Skeleton */}
        {[1, 2, 3].map((section) => (
          <section key={section}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-primary/50 rounded-full" />
              <div className="w-40 h-5 bg-muted/50 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((card) => (
                <Card
                  key={card}
                  className="p-4 bg-background/50 backdrop-blur-sm animate-pulse"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                      <div className="w-12 h-4 bg-muted/50 rounded" />
                      <div className="w-20 h-3 bg-muted/30 rounded" />
                    </div>
                    <div className="w-14 h-5 bg-muted/50 rounded" />
                  </div>
                  <div className="h-16 bg-muted/20 rounded" />
                </Card>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
