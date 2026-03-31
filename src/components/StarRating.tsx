import { Star, StarHalf } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  disabled?: boolean;
}

const StarRating = ({ rating, onRate, disabled }: StarRatingProps) => {
  const [hover, setHover] = useState(0);

  const handleClick = (starIndex: number, isLeftHalf: boolean) => {
    if (disabled) return;
    const value = isLeftHalf ? starIndex - 0.5 : starIndex;
    onRate(value);
  };

  const handleHover = (starIndex: number, isLeftHalf: boolean) => {
    if (disabled) return;
    setHover(isLeftHalf ? starIndex - 0.5 : starIndex);
  };

  const displayValue = hover || rating;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => {
        const isFull = displayValue >= star;
        const isHalf = !isFull && displayValue >= star - 0.5;

        return (
          <div key={star} className="relative w-[18px] h-[18px]">
            {/* Left half hitbox */}
            <div
              className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
              style={{ cursor: disabled ? "not-allowed" : "pointer" }}
              onMouseEnter={() => handleHover(star, true)}
              onMouseLeave={() => setHover(0)}
              onClick={() => handleClick(star, true)}
            />
            {/* Right half hitbox */}
            <div
              className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
              style={{ cursor: disabled ? "not-allowed" : "pointer" }}
              onMouseEnter={() => handleHover(star, false)}
              onMouseLeave={() => setHover(0)}
              onClick={() => handleClick(star, false)}
            />
            {/* Star icon */}
            <motion.div whileHover={{ scale: disabled ? 1 : 1.2 }}>
              {isHalf ? (
                <div className="relative w-[18px] h-[18px]">
                  <Star size={18} className="absolute fill-transparent text-star-empty" />
                  <div className="absolute overflow-hidden w-[9px] h-[18px]">
                    <Star size={18} className="fill-star-filled text-star-filled" />
                  </div>
                </div>
              ) : (
                <Star
                  size={18}
                  className={`transition-colors duration-200 ${
                    isFull
                      ? "fill-star-filled text-star-filled"
                      : "fill-transparent text-star-empty"
                  }`}
                />
              )}
            </motion.div>
          </div>
        );
      })}
      <span className="ml-2 text-sm font-display text-muted-foreground">
        {rating > 0 ? `${rating}/10` : "—"}
      </span>
    </div>
  );
};

export default StarRating;
