import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSelector() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Persist preference
    localStorage.setItem("intel_hub_lng", lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className="h-9 w-[140px] bg-secondary/70 border-border">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <SelectValue placeholder={t("topbar.language")} />
          </div>
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="en">
            <span className="flex items-center gap-2">
              <span className="text-xs">🇺🇸</span> {t("language.en")}
            </span>
          </SelectItem>
          <SelectItem value="pt">
            <span className="flex items-center gap-2">
              <span className="text-xs">🇧🇷</span> {t("language.pt")}
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
