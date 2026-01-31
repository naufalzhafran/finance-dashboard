import { Card } from "@/components/ui/card";

export default function AssetLoading() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
      </div>

      {/* Header Skeleton */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-background/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-muted/50 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="w-32 h-5 bg-muted/50 rounded animate-pulse" />
              <div className="w-48 h-3 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Controls Skeleton */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px] h-10 bg-muted/30 rounded-lg animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-12 h-10 bg-muted/30 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* Main Chart Skeleton */}
          <Card className="h-[500px] bg-background/50 backdrop-blur-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-2">
                <div className="w-24 h-6 bg-muted/50 rounded animate-pulse" />
                <div className="w-32 h-4 bg-muted/30 rounded animate-pulse" />
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-20 h-8 bg-muted/30 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div className="h-[400px] bg-muted/20 rounded-lg animate-pulse flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            </div>
          </Card>

          {/* Strategy Card Skeleton */}
          <Card className="p-6 bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-muted/50 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="w-40 h-5 bg-muted/50 rounded animate-pulse" />
                <div className="w-24 h-4 bg-muted/30 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 bg-muted/10 rounded-lg">
                  <div className="w-16 h-3 bg-muted/50 rounded animate-pulse mb-2" />
                  <div className="w-20 h-5 bg-muted/30 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </Card>

          {/* Technical Indicators Skeleton */}
          <div>
            <div className="w-40 h-6 bg-muted/50 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="p-4 bg-background/50 backdrop-blur-sm">
                  <div className="w-20 h-3 bg-muted/50 rounded animate-pulse mb-2" />
                  <div className="w-24 h-5 bg-muted/30 rounded animate-pulse" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
