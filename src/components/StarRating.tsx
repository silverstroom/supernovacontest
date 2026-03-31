import { Star, X } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  onClear?: () => void;
  disabled?: boolean;
}

const STAR_COUNT = 10;
const STAR_SIZE = 28;
const STAR_GAP = 2;

const StarRating = ({ rating, onRate, onClear, disabled }: StarRatingProps) => {
  const [preview, setPreview] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getValueFromPosition = useCallback((clientX: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const starWidth = STAR_SIZE + STAR_GAP;
    const totalWidth = starWidth * STAR_COUNT;
    const clampedX = Math.max(0, Math.min(x, totalWidth));
    
    // Calculate which star and half
    const starIndex = clampedX / starWidth;
    const starNumber = Math.floor(starIndex) + 1;
    const fraction = starIndex - Math.floor(starIndex);
    
    if (starNumber > STAR_COUNT) return STAR_COUNT;
    if (starNumber < 1) return 0.5;
    
    return fraction < 0.5 ? starNumber - 0.5 : starNumber;
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    const val = getValueFromPosition(e.touches[0].clientX);
    setPreview(val);
  }, [disabled, getValueFromPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !isDragging) return;
    e.preventDefault();
    const val = getValueFromPosition(e.touches[0].clientX);
    setPreview(val);
  }, [disabled, isDragging, getValueFromPosition]);

  const handleTouchEnd = useCallback(() => {
    if (disabled || !isDragging) return;
    if (preview > 0) onRate(preview);
    setIsDragging(false);
    setPreview(0);
  }, [disabled, isDragging, preview, onRate]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    const val = getValueFromPosition(e.clientX);
    setPreview(val);
  }, [disabled, getValueFromPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    const val = getValueFromPosition(e.clientX);
    if (isDragging) {
      setPreview(val);
    } else {
      setPreview(val);
    }
  }, [disabled, isDragging, getValueFromPosition]);

  const handleMouseUp = useCallback(() => {
    if (disabled || !isDragging) return;
    if (preview > 0) onRate(preview);
    setIsDragging(false);
    setPreview(0);
  }, [disabled, isDragging, preview, onRate]);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) setPreview(0);
  }, [isDragging]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    const val = getValueFromPosition(e.clientX);
    onRate(val);
    setPreview(0);
    setIsDragging(false);
  }, [disabled, getValueFromPosition, onRate]);

  const displayValue = isDragging ? preview : (preview || rating);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div
          ref={containerRef}
          className="flex items-center touch-none select-none"
          style={{ gap: `${STAR_GAP}px` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          {Array.from({ length: STAR_COUNT }, (_, i) => {
            const star = i + 1;
            const isFull = displayValue >= star;
            const isHalf = !isFull && displayValue >= star - 0.5;

            return (
              <motion.div
                key={star}
                style={{ width: STAR_SIZE, height: STAR_SIZE }}
                className="relative cursor-pointer"
                animate={{
                  scale: isDragging && displayValue >= star - 0.5 ? 1.15 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {isHalf ? (
                  <div className="relative" style={{ width: STAR_SIZE, height: STAR_SIZE }}>
                    <Star size={STAR_SIZE} className="absolute text-star-empty fill-transparent" />
                    <div className="absolute overflow-hidden" style={{ width: STAR_SIZE / 2, height: STAR_SIZE }}>
                      <Star size={STAR_SIZE} className="fill-star-filled text-star-filled drop-shadow-[0_0_6px_hsl(var(--star-filled)/0.5)]" />
                    </div>
                  </div>
                ) : (
                  <Star
                    size={STAR_SIZE}
                    className={`transition-colors duration-150 ${
                      isFull
                        ? "fill-star-filled text-star-filled drop-shadow-[0_0_6px_hsl(var(--star-filled)/0.5)]"
                        : "fill-transparent text-star-empty"
                    }`}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Rating display + clear */}
      <div className="flex items-center gap-2 ml-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={isDragging ? `preview-${preview}` : `rating-${rating}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`text-sm font-display font-semibold ${
              isDragging ? "text-star-filled" : "text-muted-foreground"
            }`}
          >
            {isDragging && preview > 0
              ? `${preview}/10`
              : rating > 0
                ? `${rating}/10`
                : "Trascina per votare ★"}
          </motion.span>
        </AnimatePresence>

        <AnimatePresence>
          {rating > 0 && onClear && !isDragging && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileTap={{ scale: 0.85 }}
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="w-7 h-7 rounded-full bg-destructive/15 flex items-center justify-center text-destructive active:bg-destructive/30 transition-colors"
              title="Annulla voto"
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StarRating;
