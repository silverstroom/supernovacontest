import { Home, Search, Heart, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export type TabKey = "home" | "search" | "favorites" | "stats";

interface BottomNavProps {
  active: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const tabs = [
  { key: "home" as TabKey, label: "Home", icon: Home },
  { key: "search" as TabKey, label: "Cerca", icon: Search },
  { key: "favorites" as TabKey, label: "Preferiti", icon: Heart },
  { key: "stats" as TabKey, label: "Statistiche", icon: BarChart3 },
];

const BottomNav = ({ active, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/30 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className="flex flex-col items-center justify-center gap-0.5 w-16 relative"
            >
              <tab.icon
                size={20}
                className={`transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-display transition-colors ${
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-px left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
