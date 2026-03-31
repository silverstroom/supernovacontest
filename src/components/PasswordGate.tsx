import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface PasswordGateProps {
  onUnlock: () => void;
}

const PASSWORD = "supernova2025";

const PasswordGate = ({ onUnlock }: PasswordGateProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem("supernova_auth", "true");
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass gradient-border rounded-3xl p-8 w-full max-w-sm text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gradient-start via-gradient-mid to-gradient-end flex items-center justify-center mx-auto">
          <Lock size={28} className="text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold gradient-text">Supernova</h1>
          <p className="text-muted-foreground text-sm mt-1">Inserisci la password per accedere</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`w-full px-4 py-3 rounded-xl bg-secondary border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
              error ? "border-destructive animate-shake" : "border-border"
            }`}
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end text-primary-foreground font-display font-semibold hover:opacity-90 transition-opacity"
          >
            Accedi
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default PasswordGate;
