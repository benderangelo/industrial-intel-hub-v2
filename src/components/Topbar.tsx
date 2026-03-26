import { Search, Bell, User, Sun, Moon, Monitor } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const regions = ["All Regions", "North America", "Europe", "LATAM", "APAC", "Africa/Middle East"];

export function Topbar() {
  const [region, setRegion] = useState("All Regions");
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/70 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search machines, competitors, specs..."
            className="bg-secondary border border-border rounded-md pl-9 pr-4 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-80"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden min-w-[132px] md:block">
          <Select value={theme ?? "light"} onValueChange={setTheme}>
            <SelectTrigger className="h-9 bg-secondary/70">
              <div className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="h-4 w-4" /> : theme === "system" ? <Monitor className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <SelectValue placeholder="Theme" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
        </button>
        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
      </div>
    </header>
  );
}
