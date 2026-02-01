"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, Book, ChevronRight, Menu, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- Content Data ---
const chapters = [
  {
    id: "technical",
    title: "Technical Indicators",
    description:
      "Mathematical calculations based on price, volume, or open interest used to predict future market movements.",
    sections: [
      {
        id: "rsi",
        title: "Relative Strength Index (RSI)",
        definition:
          "A momentum oscillator that measures the speed and change of price movements, oscillating between zero and 100.",
        formula: "RSI = 100 - [100 / (1 + Average Gain / Average Loss)]",
        interpretation: (
          <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-muted-foreground">
            <li>
              <strong>Overbought (&gt;70):</strong> Suggests the asset may be
              overvalued and due for a pullback.
            </li>
            <li>
              <strong>Oversold (&lt;30):</strong> Suggests the asset may be
              undervalued and due for a bounce.
            </li>
            <li>
              <strong>Divergence:</strong> When price makes a new high/low but
              RSI does not, indicating a potential reversal.
            </li>
          </ul>
        ),
        takeaways: [
          "Best used in ranging markets rather than strong trends.",
          "Can stay overbought/oversold for long periods during strong momentum.",
          "Failure swings (W or M patterns) on RSI can signal reversals.",
        ],
      },
      {
        id: "macd",
        title: "Moving Average Convergence Divergence (MACD)",
        definition:
          "A trend-following momentum indicator that shows the relationship between two moving averages of a security's price.",
        formula:
          "MACD Line = 12-Period EMA - 26-Period EMA\nSignal Line = 9-Period EMA of MACD Line",
        interpretation: (
          <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-muted-foreground">
            <li>
              <strong>Golden Cross:</strong> MACD Line crosses above Signal Line
              (Bullish).
            </li>
            <li>
              <strong>Death Cross:</strong> MACD Line crosses below Signal Line
              (Bearish).
            </li>
            <li>
              <strong>Zero Line Cross:</strong> Crossing above zero implies
              uptrend; below implies downtrend.
            </li>
          </ul>
        ),
        takeaways: [
          "Useful for identifying trend direction and momentum.",
          "Lagging indicator, meaning it confirms trends rather than predicting them early.",
          "Histogram represents the distance between MACD and Signal line.",
        ],
      },
      {
        id: "bollinger",
        title: "Bollinger Bands",
        definition:
          "A volatility indicator consisting of a middle simple moving average (SMA) and two standard deviation lines.",
        formula:
          "Middle Band = 20-Day SMA\nUpper Band = Middle Band + (2 x Std Dev)\nLower Band = Middle Band - (2 x Std Dev)",
        interpretation: (
          <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-muted-foreground">
            <li>
              <strong>The Squeeze:</strong> When bands tighten, strictly low
              volatility, often followed by a breakout.
            </li>
            <li>
              <strong>Touch:</strong> Price touching upper band = Overbought;
              Lower band = Oversold.
            </li>
          </ul>
        ),
        takeaways: [
          "Bands widen during high volatility and contract during low volatility.",
          "Price often returns to the middle band (mean reversion).",
          "A breakout outside the bands can signal a continuation of the trend.",
        ],
      },
      {
        id: "sma",
        title: "Simple Moving Average (SMA)",
        definition:
          "The average price of a security over a specific time period, smoothing out price data to identify the trend direction.",
        formula: "SMA = (Sum of Prices over N periods) / N",
        interpretation: (
          <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-muted-foreground">
            <li>
              <strong>Price &gt; SMA:</strong> Generally indicates an uptrend.
            </li>
            <li>
              <strong>Price &lt; SMA:</strong> Generally indicates a downtrend.
            </li>
          </ul>
        ),
        takeaways: [
          "SMA 50 is a common short-term trend proxy.",
          "SMA 200 is the benchmark for long-term trend; staying above it is bullish.",
          "Golden Cross (SMA 50 crosses above SMA 200) is a major bullish signal.",
        ],
      },
    ],
  },
  {
    id: "risk",
    title: "Risk Metrics",
    description:
      "Tools to quantify uncertainty and potential financial loss, essential for portfolio management.",
    sections: [
      {
        id: "volatility",
        title: "Volatility (Historical)",
        definition:
          "A statistical measure of the dispersion of returns. High volatility means the price can change dramatically over a short time period.",
        formula: "Standard Deviation of Returns (Annualized)",
        interpretation: (
          <p className="text-sm text-muted-foreground">
            Higher % = Higher Risk & Higher Potential Reward.
          </p>
        ),
        takeaways: [
          "Often used as a proxy for risk.",
          "low volatility is preferred for steady growth portfolios.",
          "Measured using standard deviation or variance.",
        ],
      },
      {
        id: "sharpe",
        title: "Sharpe Ratio",
        definition:
          "A measure that helps investors understand the return of an investment compared to its risk.",
        formula:
          "Sharpe = (Portfolio Return - Risk-Free Rate) / Standard Deviation of Portfolio Excess Return",
        interpretation: (
          <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-muted-foreground">
            <li>
              <strong>&gt; 1.0:</strong> Good risk-adjusted return.
            </li>
            <li>
              <strong>&gt; 2.0:</strong> Very good.
            </li>
            <li>
              <strong>&gt; 3.0:</strong> Excellent.
            </li>
          </ul>
        ),
        takeaways: [
          "Allows comparison between different assets.",
          "Penalizes both upside and downside volatility equally (unlike Sortino).",
          "Negative Sharpe ratio means holding risk-free asset would have been better.",
        ],
      },
      {
        id: "sortino",
        title: "Sortino Ratio",
        definition:
          "A variation of the Sharpe ratio that differentiates harmful volatility from total overall volatility.",
        formula:
          "Sortino = (Portfolio Return - Risk-Free Rate) / Standard Deviation of Downside Return",
        interpretation: (
          <p className="text-sm text-muted-foreground">
            Higher is better. A high Sortino ratio indicates high returns
            without large downside risks.
          </p>
        ),
        takeaways: [
          "Better than Sharpe for asymmetrical return distributions.",
          "Only penalizes downside volatility (losses).",
          "Useful for investors who don't mind upside volatility (big gains).",
        ],
      },
      {
        id: "max-drawdown",
        title: "Max Drawdown (MDD)",
        definition:
          "The maximum observed loss from a peak to a trough of a portfolio, before a new peak is attained.",
        formula: "MDD = (Trough Value - Peak Value) / Peak Value",
        interpretation: (
          <p className="text-sm text-muted-foreground">
            Indicates the worst-case scenario over a specific period.
          </p>
        ),
        takeaways: [
          "Measures capital preservation capability.",
          "Recovery time from a drawdown is also critical.",
          "High MDD suggests a risky strategy.",
        ],
      },
      {
        id: "beta",
        title: "Beta",
        definition:
          "A measure of the systematic risk or volatility of a security or portfolio compared to the market as a whole.",
        formula: "Beta = Covariance(Stock, Market) / Variance(Market)",
        interpretation: (
          <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-muted-foreground">
            <li>
              <strong>1.0:</strong> Moves with the market.
            </li>
            <li>
              <strong>&gt; 1.0:</strong> More volatile (Aggressive).
            </li>
            <li>
              <strong>&lt; 1.0:</strong> Less volatile (Defensive).
            </li>
          </ul>
        ),
        takeaways: [
          "Negative beta means inverse correlation to the market (e.g., Gold sometimes).",
          "High beta stocks outperform in bull markets but underperform in bear markets.",
        ],
      },
    ],
  },
  {
    id: "fundamentals",
    title: "Fundamental Analysis",
    description:
      "Evaluating a security's intrinsic value by examining related economic and financial factors.",
    sections: [
      {
        id: "pe-ratio",
        title: "Price-to-Earnings Ratio (P/E)",
        definition:
          "The ratio for valuing a company that measures its current share price relative to its per-share earnings.",
        formula: "P/E = Market Price per Share / Earnings per Share (EPS)",
        interpretation: (
          <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-muted-foreground">
            <li>
              <strong>High P/E:</strong> Overvalued or high growth expectations.
            </li>
            <li>
              <strong>Low P/E:</strong> Undervalued or poor future prospects.
            </li>
          </ul>
        ),
        takeaways: [
          "Standard P/E uses trailing 12-month earnings.",
          "Foward P/E uses estimated future earnings.",
          "Compare P/E against industry peers, not just broadly.",
        ],
      },
      {
        id: "roe",
        title: "Return on Equity (ROE)",
        definition:
          "A measure of financial performance calculated by dividing net income by shareholders' equity.",
        formula: "ROE = Net Income / Shareholders' Equity",
        interpretation: (
          <p className="text-sm text-muted-foreground">
            15-20% is generally considered good. Measures how effectively
            management uses assets to create profit.
          </p>
        ),
        takeaways: [
          "High ROE with high debt can be misleading.",
          "A rising ROE suggests the company is becoming more efficient at generating profit.",
        ],
      },
      {
        id: "pb-ratio",
        title: "Price-to-Book Ratio (P/B)",
        definition:
          "Compares a company's market value to its book value (net assets).",
        formula: "P/B = Market Price per Share / Book Value per Share",
        interpretation: (
          <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-muted-foreground">
            <li>
              <strong>&lt; 1.0:</strong> Potentially undervalued (trading below
              asset value).
            </li>
            <li>
              <strong>&gt; 3.0:</strong> Potential overvaluation.
            </li>
          </ul>
        ),
        takeaways: [
          "Useful for asset-heavy industries (banks, manufacturing).",
          "Less useful for tech companies with intangible assets.",
        ],
      },
      {
        id: "debt-equity",
        title: "Debt-to-Equity Ratio (D/E)",
        definition:
          "Calculates the weight of total debt and financial liabilities against total shareholders' equity.",
        formula: "D/E = Total Liabilities / Total Shareholders' Equity",
        interpretation: (
          <p className="text-sm text-muted-foreground">
            High D/E signals aggressive financing with debt (leverage), which is
            riskier.
          </p>
        ),
        takeaways: [
          "Varies widely by industry (Utilities often have high D/E).",
          "Used to evaluate a company's financial leverage.",
        ],
      },
      {
        id: "fcf",
        title: "Free Cash Flow (FCF)",
        definition:
          "The cash a company generates after considering cash outflows to support operations and maintain its capital assets.",
        formula: "FCF = Operating Cash Flow - Capital Expenditures",
        interpretation: (
          <p className="text-sm text-muted-foreground">
            Positive FCF indicates the ability to pay debts, buy back stock, or
            pay dividends.
          </p>
        ),
        takeaways: [
          "Harder to manipulate than Net Income.",
          "Vital for dividend safety analysis.",
        ],
      },
    ],
  },
];

export default function GlossaryPage() {
  const router = useRouter();
  const [activeChapter, setActiveChapter] = useState("technical");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">
      {/* Background Effects (Matching Dashboard) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
      </div>

      <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-background/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 group text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Glossary
              </h1>
              <p className="text-xs">Financial Terms & Indicators</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Book className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 relative z-10">
        {/* Navigation Sidebar (Desktop) */}
        <aside className="hidden md:block w-full md:w-64 shrink-0 md:sticky md:top-24 md:h-[calc(100vh-8rem)]">
          <Card className="bg-background/50 backdrop-blur-sm p-4 h-full border-border/50 overflow-y-auto">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 px-2">
              Table of Contents
            </h3>
            <nav className="space-y-1">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapter(chapter.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-lg transition-all flex items-center justify-between group",
                    activeChapter === chapter.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {chapter.title}
                  {activeChapter === chapter.id && (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              ))}
            </nav>
          </Card>
        </aside>

        {/* Mobile Navigation Drawer */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 md:hidden bg-background/80 backdrop-blur-sm animate-in fade-in-0 mt-[73px]">
            <div className="bg-background border-b border-white/5 p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 px-2">
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      setActiveChapter(chapter.id);
                      setShowMobileMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm rounded-lg transition-all flex items-center justify-between group",
                      activeChapter === chapter.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    {chapter.title}
                    {activeChapter === chapter.id && (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
            {/* Click outside to close area */}
            <div
              className="h-full w-full"
              onClick={() => setShowMobileMenu(false)}
            />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 space-y-12 pb-24">
          {chapters
            .filter((chapter) => chapter.id === activeChapter)
            .map((chapter) => (
              <section key={chapter.id} className="animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-foreground inline-block mb-2">
                    {chapter.title}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {chapter.description}
                  </p>
                </div>

                <div className="grid gap-6">
                  {chapter.sections.map((section) => (
                    <Card
                      key={section.id}
                      className="p-6 bg-background/50 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex flex-col gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                            {section.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {section.definition}
                          </p>
                        </div>

                        {section.formula && (
                          <div className="bg-muted/30 p-3 rounded-lg border border-white/5">
                            <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
                              Formula
                            </p>
                            <code className="text-sm font-mono text-primary block whitespace-pre-wrap">
                              {section.formula}
                            </code>
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4 mt-2">
                          {section.interpretation && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                How to Read
                              </p>
                              <div className="text-sm">
                                {section.interpretation}
                              </div>
                            </div>
                          )}

                          {section.takeaways && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                Key Takeaways
                              </p>
                              <ul className="space-y-1">
                                {section.takeaways.map((point, i) => (
                                  <li
                                    key={i}
                                    className="text-sm text-muted-foreground flex gap-2"
                                  >
                                    <span className="text-primary">•</span>
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </main>
    </div>
  );
}
