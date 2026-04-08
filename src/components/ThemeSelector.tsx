import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Select value={theme ?? "light"} onValueChange={setTheme}>
      <SelectTrigger className="h-9 w-[110px] bg-secondary/70 border-border">
        <div className="flex items-center gap-2">
          {theme === "dark" ? (
            <Moon className="h-4 w-4 text-primary" />
          ) : theme === "system" ? (
            <Monitor className="h-4 w-4 text-primary" />
          ) : (
            <Sun className="h-4 w-4 text-primary" />
          )}
          <SelectValue placeholder={t("topbar.theme")} />
        </div>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="light">{t("common.light")}</SelectItem>
        <SelectItem value="dark">{t("common.dark")}</SelectItem>
        <SelectItem value="system">{t("common.system")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
