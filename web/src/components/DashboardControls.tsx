"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  ChevronDown,
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

export default function DashboardControls({
  assets,
  selectedSymbol,
  onSelectAsset,
  startDate,
  endDate,
  onDateChange,
  timeRange,
  onTimeRangeChange,
  loading,
  hideDateControls,
}: DashboardControlsProps) {
  const [open, setOpen] = useState(false);

  const activeAsset = assets.find((a) => a.symbol === selectedSymbol);

  const handleSelect = (currentValue: string) => {
    onSelectAsset(currentValue === selectedSymbol ? "" : currentValue);
    setOpen(false);
  };

  return (
    <Card className="mb-6 p-4 sticky top-[73px] z-40 backdrop-blur-xl bg-background/80 border-border">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Search Bar */}
        <div className="flex-1 min-w-0">
          <label className="text-[10px] uppercase text-muted-foreground font-bold px-1 mb-1 block">
            Asset
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                <span className="truncate flex items-center gap-2">
                  {activeAsset ? (
                    <>
                      <span>
                        {activeAsset.symbol} - {activeAsset.name}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded shrink-0">
                        {activeAsset.currency}
                      </span>
                    </>
                  ) : (
                    "Select asset..."
                  )}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search asset..." />
                <CommandList>
                  <CommandEmpty>No asset found.</CommandEmpty>
                  <CommandGroup>
                    {assets.map((asset) => (
                      <CommandItem
                        key={asset.id}
                        value={`${asset.symbol} ${asset.name}`}
                        onSelect={() => handleSelect(asset.symbol)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSymbol === asset.symbol
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <span className="font-bold mr-2">{asset.symbol}</span>
                        <span className="text-muted-foreground truncate flex-1">
                          {asset.name}
                        </span>
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-muted rounded">
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
            {/* Time Range Selector Mode */}
            {timeRange && onTimeRangeChange ? (
              <div className="grid gap-1">
                <label className="text-[10px] uppercase text-muted-foreground font-bold px-1">
                  Time Window
                </label>
                <div className="relative">
                  <select
                    value={timeRange}
                    onChange={(e) => onTimeRangeChange(e.target.value)}
                    className="appearance-none h-10 w-[180px] bg-background border border-input rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="1M">1 Month</option>
                    <option value="3M">3 Months</option>
                    <option value="6M">6 Months</option>
                    <option value="1Y">1 Year</option>
                    <option value="YTD">Year to Date</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>
            ) : startDate && endDate && onDateChange ? (
              // Date Pickers Mode
              <>
                <div className="grid gap-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-bold px-1">
                    Start
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[130px] justify-start text-left font-normal",
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
                  <label className="text-[10px] uppercase text-muted-foreground font-bold px-1">
                    End
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[130px] justify-start text-left font-normal",
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
