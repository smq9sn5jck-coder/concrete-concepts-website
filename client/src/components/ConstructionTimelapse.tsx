/**
 * Construction Timelapse Component
 * 
 * Displays a Ken Burns animated slideshow showing the construction stages
 * of a concrete job. Auto-advances through stages with smooth crossfade
 * transitions and subtle zoom/pan effects.
 * 
 * Stages: Existing → Excavated → Formed → Poured → Finished
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Loader2 } from "lucide-react";

export interface TimelapseStage {
  id: string;
  label: string;
  description: string;
  imageUrl: string;
}

interface ConstructionTimelapseProps {
  stages: TimelapseStage[];
  isGenerating?: boolean;
  generationProgress?: number; // 0-4 (which stage is being generated)
  onClose?: () => void;
}

// Duration each stage is displayed (ms)
const STAGE_DURATION = 3500;
// Crossfade transition duration (ms)
const FADE_DURATION = 800;

export default function ConstructionTimelapse({
  stages,
  isGenerating = false,
  generationProgress = 0,
  onClose,
}: ConstructionTimelapseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [kenBurnsKey, setKenBurnsKey] = useState(0);

  // Auto-advance logic
  const advanceToNext = useCallback(() => {
    if (currentIndex >= stages.length - 1) {
      // Loop back to start
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex(0);
        setKenBurnsKey(prev => prev + 1);
        setIsFading(false);
      }, FADE_DURATION);
    } else {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setKenBurnsKey(prev => prev + 1);
        setIsFading(false);
      }, FADE_DURATION);
    }
  }, [currentIndex, stages.length]);

  // Timer for auto-play
  useEffect(() => {
    if (!isPlaying || stages.length <= 1 || isGenerating) return;

    timerRef.current = setTimeout(advanceToNext, STAGE_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, stages.length, isGenerating, advanceToNext]);

  // Start playing when stages are loaded
  useEffect(() => {
    if (stages.length > 1 && !isGenerating) {
      setIsPlaying(true);
    }
  }, [stages.length, isGenerating]);

  const goToStage = (index: number) => {
    if (index === currentIndex) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setKenBurnsKey(prev => prev + 1);
      setIsFading(false);
    }, FADE_DURATION);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    goToStage(currentIndex > 0 ? currentIndex - 1 : stages.length - 1);
  };

  const handleNext = () => {
    setIsPlaying(false);
    goToStage(currentIndex < stages.length - 1 ? currentIndex + 1 : 0);
  };

  const handleReplay = () => {
    setCurrentIndex(0);
    setKenBurnsKey(prev => prev + 1);
    setIsPlaying(true);
  };

  // ═══════════════════════════════════════════════════════════════
  // GENERATING STATE
  // ═══════════════════════════════════════════════════════════════

  if (isGenerating) {
    const stageLabels = ["Existing", "Excavated", "Formed", "Just Poured", "Finished"];
    return (
      <div className="relative rounded-xl overflow-hidden shadow-xl bg-brand-navy/5 border border-brand-navy/10">
        <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-brand-navy mb-2">
              Generating Construction Timelapse
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Creating {stageLabels.length - 1} construction stage visualisations...
            </p>

            {/* Progress steps */}
            <div className="max-w-xs mx-auto space-y-2">
              {stageLabels.map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  {i === 0 ? (
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : i <= generationProgress ? (
                    i === generationProgress ? (
                      <Loader2 className="w-4 h-4 text-brand-gold animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                  )}
                  <span className={`text-sm ${i <= generationProgress ? (i < generationProgress ? "text-green-700" : "text-gray-600") : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Each stage takes ~30-60 seconds to generate
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // PLAYBACK STATE
  // ═══════════════════════════════════════════════════════════════

  if (stages.length === 0) return null;

  const currentStage = stages[currentIndex];

  return (
    <div className="relative rounded-xl overflow-hidden shadow-xl bg-black">
      {/* Main Image with Ken Burns */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {stages.map((stage, i) => (
          <div
            key={`${stage.id}-${i}`}
            className={`absolute inset-0 transition-opacity ${
              i === currentIndex
                ? isFading ? "opacity-0" : "opacity-100"
                : "opacity-0"
            }`}
            style={{ transitionDuration: `${FADE_DURATION}ms` }}
          >
            <img
              key={`img-${stage.id}-${kenBurnsKey}-${i}`}
              src={stage.imageUrl}
              alt={stage.label}
              className={`w-full h-full object-cover ${
                i === currentIndex && !isFading ? "timelapse-ken-burns" : ""
              }`}
            />
          </div>
        ))}

        {/* Stage Label Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
            <p className="text-xs font-medium opacity-70 uppercase tracking-wider">Stage {currentIndex + 1} of {stages.length}</p>
            <p className="text-sm font-semibold">{currentStage?.label}</p>
          </div>
        </div>

        {/* Stage Description Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-4 px-4">
          <p className="text-white text-sm font-medium">{currentStage?.description}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-black/30">
        <div className="flex h-full">
          {stages.map((_, i) => (
            <div
              key={i}
              className="flex-1 relative cursor-pointer"
              onClick={() => goToStage(i)}
            >
              <div className={`absolute inset-0 ${
                i < currentIndex ? "bg-brand-gold" :
                i === currentIndex ? "bg-brand-gold/70" : "bg-white/20"
              }`} />
              {i === currentIndex && isPlaying && !isFading && (
                <div
                  className="absolute inset-y-0 left-0 bg-brand-gold"
                  style={{
                    animation: `timelapse-progress ${STAGE_DURATION}ms linear forwards`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            onClick={handlePrev}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            onClick={handleNext}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            onClick={handleReplay}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stage dots */}
        <div className="flex items-center gap-1.5">
          {stages.map((stage, i) => (
            <button
              key={stage.id}
              onClick={() => goToStage(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex
                  ? "bg-brand-gold w-4"
                  : "bg-white/30 hover:bg-white/60"
              }`}
              title={stage.label}
            />
          ))}
        </div>

        {/* Close button */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
