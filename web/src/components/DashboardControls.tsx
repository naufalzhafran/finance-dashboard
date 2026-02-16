"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  Search,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { Asset } from "@/types";

interface DashboardControlsProps {
  assets: Asset[];
  selectedSymbol: string | null;
  onSelectAsset: (symbol: string) => void;

  // Date Picker Mode
  startDate?: string;
  endDate?: string;
  onDateChange?: (start: string, end: string) => void;

  // Time Range Mode
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;

  loading?: boolean;
  hideDateControls?: boolean;
}

const TIME_RANGES = [
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
  { value: "YTD", label: "YTD" },
];

export default function DashboardControls({
  assets,
  selectedSymbol,
  onSelectAsset,
  startDate,
  endDate,
  onDateChange,
  timeRange,
  onTimeRangeChange,
  loading: _loading,
  hideDateControls,
}: DashboardControlsProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const commandListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commandListRef.current) {
      commandListRef.current.scrollTop = 0;
    }
  }, [searchQuery]);

  const activeAsset = assets.find((a) => a.symbol === selectedSymbol);

  const handleSelect = (currentValue: string) => {
    onSelectAsset(currentValue === selectedSymbol ? "" : currentValue);
    setOpen(false);
  };

  return (
    <Card className="mb-6 p-4 sticky top-[73px] z-40 backdrop-blur-xl bg-card/80 border-border/50">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 flex-wrap">
        {/* Search Bar */}
        <div className="flex-1 min-w-0">
          <label className="text-[10px] uppercase text-muted-foreground font-bold px-1 mb-1 block tracking-widest">
            Asset
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-secondary/50 border-border/50 hover:bg-secondary hover:border-primary/30 transition-all duration-200 cursor-pointer"
              >
                <span className="truncate flex items-center gap-2">
                  {activeAsset ? (
                    <>
                      <Search className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>
                        {activeAsset.symbol} - {activeAsset.name}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded shrink-0">
                        {activeAsset.currency}
                      </span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5 text-muted-foreground" />
                      Select asset...
                    </>
                  )}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search asset..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList ref={commandListRef}>
                  <CommandEmpty>No asset found.</CommandEmpty>
                  <CommandGroup>
                    {assets.map((asset) => (
                      <CommandItem
                        key={asset.id}
                        value={`${asset.symbol} ${asset.name}`}
                        onSelect={() => handleSelect(asset.symbol)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSymbol === asset.symbol
                              ? "opacity-100 text-primary"
                              : "opacity-0",
                          )}
                        />
                        <span className="font-bold mr-2">{asset.symbol}</span>
                        <span className="text-muted-foreground truncate flex-1">
                          {asset.name}
                        </span>
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-secondary rounded">
                          {asset.currency}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Controls Section */}
        {!hideDateControls && (
          <div className="flex items-end gap-3 shrink-0">
            {/* Pill-style Time Range Selector */}
            {timeRange && onTimeRangeChange ? (
              <div className="grid gap-1">
                <label className="text-[10px] uppercase text-muted-foreground font-bold px-1 tracking-widest">
                  Time Window
                </label>
                <div className="flex p-1 bg-secondary/50 rounded-lg border border-border/50">
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => onTimeRangeChange(range.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer",
                        timeRange === range.value
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : startDate && endDate && onDateChange ? (
              // Date Pickers Mode
              <>
                <div className="grid gap-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-bold px-1 tracking-widest">
                    Start
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[130px] justify-start text-left font-normal cursor-pointer",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {startDate
                            ? format(new Date(startDate), "MMM d, yyyy")
                            : "Pick date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate ? new Date(startDate) : undefined}
                        onSelect={(date) =>
                          date &&
                          onDateChange(format(date, "yyyy-MM-dd"), endDate)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-bold px-1 tracking-widest">
                    End
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[130px] justify-start text-left font-normal cursor-pointer",
                          !endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {endDate
                            ? format(new Date(endDate), "MMM d, yyyy")
                            : "Pick date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={endDate ? new Date(endDate) : undefined}
                        onSelect={(date) =>
                          date &&
                          onDateChange(startDate, format(date, "yyyy-MM-dd"))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </Card>
  );
}
