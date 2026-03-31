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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/30">
      <div className="flex items-center justify-around h-[4.5rem] max-w-lg mx-auto pb-safe">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.85 }}
              onClick={() => onTabChange(tab.key)}
              className="flex flex-col items-center justify-center gap-1 w-16 h-14 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ 
                  y: isActive ? -2 : 0,
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <tab.icon
                  size={22}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </motion.div>
              <span
                className={`text-[10px] font-display transition-all duration-200 ${
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
