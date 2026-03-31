import { Star } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  disabled?: boolean;
}

const StarRating = ({ rating, onRate, disabled }: StarRatingProps) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
        <motion.button
          key={star}
          whileHover={{ scale: disabled ? 1 : 1.2 }}
          whileTap={{ scale: disabled ? 1 : 0.9 }}
          className="focus:outline-none disabled:cursor-not-allowed"
          disabled={disabled}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => !disabled && onRate(star)}
        >
          <Star
            size={18}
            className={`transition-colors duration-200 ${
              star <= (hover || rating)
                ? "fill-star-filled text-star-filled"
                : "fill-transparent text-star-empty"
            }`}
          />
        </motion.button>
      ))}
      <span className="ml-2 text-sm font-display text-muted-foreground">
        {rating > 0 ? `${rating}/10` : "—"}
      </span>
    </div>
  );
};

export default StarRating;
