/**
 * AI Concrete Visualiser V4 — Premium Interactive Visualisation
 * 
 * Flow: Upload → Draw Area (brush + polygon) → Choose Finish + Customise → Claude QA → FLUX Fill → Compare Before/After → Request Quote
 * 
 * V4 Enhancements:
 * - Stone mix colour picker (6 Australian aggregate options for exposed/honed)
 * - Polygon drawing tool (tap corners for exact straight-edge shapes)
 * - Border configuration (toggle + colour for dual-tone finishes)
 * - Enhanced prompts threading all customisation into generation
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { trpc } from "@/lib/trpc";
import { useLeadSource } from "@/hooks/useLeadSource";
import { trackQuoteConversion } from "@/components/ConversionTracking";
import {
  assessSubmissionSignals,
  classifyServiceArea,
  validateAustralianPhone,
} from "@shared/leadValidation";
import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Phone,
  Sparkles,
  Upload,
  User,
  ArrowRight,
  Wand2,
  Paintbrush,
  Eraser,
  RotateCcw,
  Undo2,
  AlertTriangle,
  RefreshCw,
  Pentagon,
  Film,
} from "lucide-react";
import { toast } from "sonner";
import ConstructionTimelapse, { type TimelapseStage } from "@/components/ConstructionTimelapse";

// ═══════════════════════════════════════════════════════════════
// FINISH OPTIONS — 8 types
// ═══════════════════════════════════════════════════════════════

const FINISHES = [
  { id: "exposed-aggregate", name: "Exposed Aggregate", description: "Natural stone pebbles visible through the surface", icon: "🪨", hasStoneOptions: true },
  { id: "broom-finish", name: "Broom Finish", description: "Fine parallel brush lines for subtle grip texture", icon: "🧹", hasStoneOptions: false },
  { id: "plain", name: "Plain Concrete", description: "Clean smooth grey with steel-trowel finish", icon: "⬜", hasStoneOptions: false },
  { id: "charcoal-oxide", name: "Charcoal Oxide", description: "Deep dark grey-black integral oxide colour", icon: "⬛", hasStoneOptions: false },
  { id: "cove-finish", name: "Cove Finish", description: "Smooth rounded edges at walls and borders", icon: "〰️", hasStoneOptions: false },
  { id: "honed", name: "Honed Concrete", description: "Polished semi-gloss revealing fine aggregate", icon: "✨", hasStoneOptions: true },
  { id: "saw-cut", name: "Saw-Cut Pattern", description: "Clean precise cuts creating geometric panels", icon: "📐", hasStoneOptions: false },
  { id: "border-colour", name: "Border Colour", description: "Contrasting coloured border with plain main area", icon: "🔲", hasStoneOptions: false },
] as const;

// ═══════════════════════════════════════════════════════════════
// STONE MIX OPTIONS — Australian aggregate colours
// ═══════════════════════════════════════════════════════════════

const STONE_MIXES = [
  { id: "warm-blend", name: "Warm Blend", description: "Cream, tan, and honey tones — classic Australian", colour: "#D4A574", promptFragment: "warm-toned aggregate blend with cream, tan, honey, and light brown natural river stones" },
  { id: "charcoal-blend", name: "Charcoal Blend", description: "Dark grey and black stones — modern dramatic", colour: "#4A4A4A", promptFragment: "dark charcoal and black aggregate blend with deep grey basalt stones and occasional white quartz flecks" },
  { id: "ocean-mix", name: "Ocean Mix", description: "Blue-grey and white — coastal feel", colour: "#7B9BA6", promptFragment: "ocean-toned aggregate blend with blue-grey granite, white quartz, and pale grey river stones" },
  { id: "autumn-gold", name: "Autumn Gold", description: "Rich gold, amber, and rust tones", colour: "#B8860B", promptFragment: "rich autumn gold aggregate blend with amber, golden, rust, and deep honey-coloured natural stones" },
  { id: "salt-pepper", name: "Salt & Pepper", description: "Classic black and white mix — timeless", colour: "#808080", promptFragment: "classic salt and pepper aggregate blend with contrasting black basalt and white quartz stones in equal proportion" },
  { id: "sandstone-cream", name: "Sandstone Cream", description: "Light cream and beige — subtle elegant", colour: "#F5DEB3", promptFragment: "light sandstone cream aggregate blend with pale beige, ivory, and soft cream natural stones for a subtle elegant finish" },
] as const;

type StoneMixId = typeof STONE_MIXES[number]["id"];

// ═══════════════════════════════════════════════════════════════
// BORDER COLOUR OPTIONS
// ═══════════════════════════════════════════════════════════════

const BORDER_COLOURS = [
  { id: "charcoal", name: "Charcoal", colour: "#3D3D3D", promptFragment: "dark charcoal oxide coloured border strip" },
  { id: "terracotta", name: "Terracotta", colour: "#CC5533", promptFragment: "warm terracotta red oxide coloured border strip" },
  { id: "sandstone", name: "Sandstone", colour: "#D2B48C", promptFragment: "natural sandstone tan coloured border strip" },
  { id: "slate-grey", name: "Slate Grey", colour: "#708090", promptFragment: "medium slate grey oxide coloured border strip" },
] as const;

type BorderColourId = typeof BORDER_COLOURS[number]["id"];

type FinishId = typeof FINISHES[number]["id"];
type Step = "upload" | "draw-mask" | "select-finish" | "generating" | "result" | "lead-gate";
type DrawTool = "brush" | "eraser" | "polygon";

// ═══════════════════════════════════════════════════════════════
// IMAGE COMPARISON SLIDER
// ═══════════════════════════════════════════════════════════════

function ImageComparisonSlider({ before, after, finishName }: { before: string; after: string; finishName: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  }, []);

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging.current) handleMove(e.clientX); };
  const handleTouchMove = (e: React.TouchEvent) => { handleMove(e.touches[0].clientX); };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] overflow-hidden rounded-xl cursor-col-resize select-none shadow-xl"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* After image (full width, behind) */}
      <img src={after} alt={`After — ${finishName}`} className="absolute inset-0 w-full h-full object-cover" />
      {/* Before image (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
        <img
          src={before}
          alt="Before"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : "100%", maxWidth: "none" }}
        />
      </div>
      {/* Slider line */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10" style={{ left: `${sliderPosition}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-gray-700 -mr-1" />
          <ChevronRight className="w-4 h-4 text-gray-700 -ml-1" />
        </div>
      </div>
      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded z-20">BEFORE</div>
      <div className="absolute top-3 right-3 bg-brand-gold/90 text-white text-xs font-semibold px-2.5 py-1 rounded z-20">AFTER</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function Visualiser() {
  const [step, setStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [selectedFinish, setSelectedFinish] = useState<FinishId | "">("");
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isQA, setIsQA] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [suburb, setSuburb] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [qaWarning, setQaWarning] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const leadFormStartedAt = useRef(Date.now());

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [tool, setTool] = useState<DrawTool>("brush");
  const [maskDataUrl, setMaskDataUrl] = useState<string>("");
  const [drawHistory, setDrawHistory] = useState<ImageData[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Polygon state
  const [polygonPoints, setPolygonPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [isPolygonClosed, setIsPolygonClosed] = useState(false);

  // Preserve toggles
  const [preserveGrassStrips, setPreserveGrassStrips] = useState(true);
  const [preserveStructures, setPreserveStructures] = useState(true);

  // Customer notes (optional description)
  const [customerNotes, setCustomerNotes] = useState("");

  // V4: Stone mix and border options
  const [selectedStoneMix, setSelectedStoneMix] = useState<StoneMixId>("warm-blend");
  const [addBorder, setAddBorder] = useState(false);
  const [selectedBorderColour, setSelectedBorderColour] = useState<BorderColourId>("charcoal");

  // V4: Timelapse state
  const [showTimelapse, setShowTimelapse] = useState(false);
  const [timelapseStages, setTimelapseStages] = useState<TimelapseStage[]>([]);
  const [isGeneratingTimelapse, setIsGeneratingTimelapse] = useState(false);
  const [timelapseProgress, setTimelapseProgress] = useState(0);

  const leadSource = useLeadSource();

  // tRPC mutations
  const qaMutation = trpc.visualiser.qa.useMutation();
  const generateMutation = trpc.visualiser.generate.useMutation();
  const timelapseMutation = trpc.visualiser.timelapse.useMutation();
  const submitLead = trpc.quote.submit.useMutation({
    onSuccess: () => {
      setLeadCaptured(true);
      trackQuoteConversion({ phone: phone.trim(), name: name.trim() });
    },
    onError: (mutationError) => {
      setError(mutationError.message || "We couldn't confirm your enquiry. Please check your details and try again.");
    },
  });

  // ═══════════════════════════════════════════════════════════════
  // FILE HANDLING
  // ═══════════════════════════════════════════════════════════════

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 10MB.");
      return;
    }

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setStep("draw-mask");
  };

  // ═══════════════════════════════════════════════════════════════
  // CANVAS / DRAWING
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (step === "draw-mask" && previewUrl && canvasRef.current) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img;
        const canvas = canvasRef.current!;
        const container = canvas.parentElement!;
        const containerWidth = container.clientWidth;
        const scale = Math.min(containerWidth / img.width, 600 / img.height);
        const displayWidth = Math.floor(img.width * scale);
        const displayHeight = Math.floor(img.height * scale);

        canvas.width = displayWidth;
        canvas.height = displayHeight;
        setCanvasSize({ width: displayWidth, height: displayHeight });

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
        setImageLoaded(true);
        const initialData = ctx.getImageData(0, 0, displayWidth, displayHeight);
        setDrawHistory([initialData]);
      };
      img.src = previewUrl;
    }
  }, [step, previewUrl]);

  const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }, []);

  // Brush / Eraser drawing
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (tool === "polygon") {
      handlePolygonClick(e);
      return;
    }
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    const ctx = canvasRef.current!.getContext("2d")!;

    if (tool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(201, 164, 77, 0.5)";
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const img = imageRef.current!;
      const canvas = canvasRef.current!;
      const sx = (x - brushSize / 2) * (img.width / canvas.width);
      const sy = (y - brushSize / 2) * (img.height / canvas.height);
      const sw = brushSize * (img.width / canvas.width);
      const sh = brushSize * (img.height / canvas.height);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, sx, sy, sw, sh, x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
      ctx.restore();
    }
  }, [getCanvasCoords, brushSize, tool]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (tool === "polygon" || !isDrawing) return;
    const { x, y } = getCanvasCoords(e);
    const ctx = canvasRef.current!.getContext("2d")!;

    if (tool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(201, 164, 77, 0.5)";
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const img = imageRef.current!;
      const canvas = canvasRef.current!;
      const sx = (x - brushSize / 2) * (img.width / canvas.width);
      const sy = (y - brushSize / 2) * (img.height / canvas.height);
      const sw = brushSize * (img.width / canvas.width);
      const sh = brushSize * (img.height / canvas.height);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, sx, sy, sw, sh, x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
      ctx.restore();
    }
  }, [isDrawing, getCanvasCoords, brushSize, tool]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setDrawHistory(prev => [...prev, data]);
    }
  }, [isDrawing]);

  // ═══════════════════════════════════════════════════════════════
  // POLYGON TOOL — Tap corners for exact straight-edge shapes
  // ═══════════════════════════════════════════════════════════════

  const handlePolygonClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isPolygonClosed) return;
    const { x, y } = getCanvasCoords(e);

    // Check if clicking near the first point to close the polygon
    if (polygonPoints.length >= 3) {
      const first = polygonPoints[0];
      const dist = Math.sqrt((x - first.x) ** 2 + (y - first.y) ** 2);
      if (dist < 15) {
        // Close the polygon and fill it
        closeAndFillPolygon([...polygonPoints]);
        return;
      }
    }

    const newPoints = [...polygonPoints, { x, y }];
    setPolygonPoints(newPoints);

    // Draw the point and connecting line
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.fillStyle = "rgba(201, 164, 77, 0.9)";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    if (newPoints.length > 1) {
      const prev = newPoints[newPoints.length - 2];
      ctx.strokeStyle = "rgba(201, 164, 77, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [polygonPoints, isPolygonClosed, getCanvasCoords]);

  const closeAndFillPolygon = (points: Array<{ x: number; y: number }>) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(201, 164, 77, 0.5)";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // Draw solid border
    ctx.strokeStyle = "rgba(201, 164, 77, 0.9)";
    ctx.lineWidth = 2;
    ctx.stroke();

    setIsPolygonClosed(true);
    const data = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    setDrawHistory(prev => [...prev, data]);
  };

  const resetPolygon = () => {
    setPolygonPoints([]);
    setIsPolygonClosed(false);
  };

  const handleUndo = () => {
    if (drawHistory.length <= 1) return;
    const newHistory = drawHistory.slice(0, -1);
    setDrawHistory(newHistory);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
    // Reset polygon if we undo past it
    if (polygonPoints.length > 0) {
      resetPolygon();
    }
  };

  const handleClear = () => {
    if (!imageRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDrawHistory([data]);
    resetPolygon();
  };

  // ═══════════════════════════════════════════════════════════════
  // MASK GENERATION — Binary mask (white = work area, black = preserve)
  // ═══════════════════════════════════════════════════════════════

  const generateMask = (): string => {
    const canvas = canvasRef.current!;
    const img = imageRef.current!;

    // Create mask at original image resolution
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = img.width;
    maskCanvas.height = img.height;
    const maskCtx = maskCanvas.getContext("2d")!;
    maskCtx.fillStyle = "black";
    maskCtx.fillRect(0, 0, img.width, img.height);

    // Get drawn canvas vs original to detect painted pixels
    const ctx = canvas.getContext("2d")!;
    const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const origCanvas = document.createElement("canvas");
    origCanvas.width = canvas.width;
    origCanvas.height = canvas.height;
    const origCtx = origCanvas.getContext("2d")!;
    origCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const origData = origCtx.getImageData(0, 0, canvas.width, canvas.height);

    // Build mask at canvas resolution
    const maskSmall = document.createElement("canvas");
    maskSmall.width = canvas.width;
    maskSmall.height = canvas.height;
    const maskSmallCtx = maskSmall.getContext("2d")!;
    maskSmallCtx.fillStyle = "black";
    maskSmallCtx.fillRect(0, 0, canvas.width, canvas.height);

    const maskSmallData = maskSmallCtx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < canvasData.data.length; i += 4) {
      const rDiff = Math.abs(canvasData.data[i] - origData.data[i]);
      const gDiff = Math.abs(canvasData.data[i + 1] - origData.data[i + 1]);
      const bDiff = Math.abs(canvasData.data[i + 2] - origData.data[i + 2]);
      if (rDiff + gDiff + bDiff > 30) {
        maskSmallData.data[i] = 255;
        maskSmallData.data[i + 1] = 255;
        maskSmallData.data[i + 2] = 255;
        maskSmallData.data[i + 3] = 255;
      }
    }
    maskSmallCtx.putImageData(maskSmallData, 0, 0);

    // Scale up to original resolution
    maskCtx.drawImage(maskSmall, 0, 0, img.width, img.height);
    return maskCanvas.toDataURL("image/png");
  };

  const handleDoneDrawing = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const origCanvas = document.createElement("canvas");
    origCanvas.width = canvas.width;
    origCanvas.height = canvas.height;
    const origCtx = origCanvas.getContext("2d")!;
    origCtx.drawImage(imageRef.current!, 0, 0, canvas.width, canvas.height);
    const origData = origCtx.getImageData(0, 0, canvas.width, canvas.height);

    let paintedPixels = 0;
    for (let i = 0; i < canvasData.data.length; i += 4) {
      const rDiff = Math.abs(canvasData.data[i] - origData.data[i]);
      const gDiff = Math.abs(canvasData.data[i + 1] - origData.data[i + 1]);
      const bDiff = Math.abs(canvasData.data[i + 2] - origData.data[i + 2]);
      if (rDiff + gDiff + bDiff > 30) paintedPixels++;
    }

    const totalPixels = canvas.width * canvas.height;
    const paintedPercent = (paintedPixels / totalPixels) * 100;

    if (paintedPercent < 1) {
      toast.error("Please paint the areas you want concreted before continuing.");
      return;
    }

    const mask = generateMask();
    setMaskDataUrl(mask);
    setStep("select-finish");
  };

  // ═══════════════════════════════════════════════════════════════
  // UPLOAD
  // ═══════════════════════════════════════════════════════════════

  const uploadPhoto = async (): Promise<string> => {
    if (!selectedFile) throw new Error("No file selected");
    setIsUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const response = await fetch("/api/upload-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: base64, contentType: selectedFile.type, fileName: selectedFile.name }),
      });

      if (!response.ok) throw new Error("Upload failed");
      const { url } = await response.json();
      setUploadedUrl(url);
      return url;
    } finally {
      setIsUploading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // BUILD CUSTOMISATION NOTES — Thread V4 options into the prompt
  // ═══════════════════════════════════════════════════════════════

  const buildCustomisationNotes = (): string => {
    const parts: string[] = [];

    // Stone mix (only for exposed aggregate and honed)
    const finish = FINISHES.find(f => f.id === selectedFinish);
    if (finish?.hasStoneOptions && selectedStoneMix) {
      const mix = STONE_MIXES.find(m => m.id === selectedStoneMix);
      if (mix) {
        parts.push(`Stone mix colour: ${mix.name} — ${mix.promptFragment}`);
      }
    }

    // Border configuration
    if (addBorder) {
      const border = BORDER_COLOURS.find(b => b.id === selectedBorderColour);
      if (border) {
        parts.push(`Add a ${border.name} coloured border strip (100-150mm wide) running along all edges of the concrete — ${border.promptFragment}`);
      }
    }

    // Customer notes
    if (customerNotes.trim()) {
      parts.push(customerNotes.trim());
    }

    return parts.join(". ");
  };

  // ═══════════════════════════════════════════════════════════════
  // GENERATE — Full pipeline: Upload → QA → FLUX Fill
  // ═══════════════════════════════════════════════════════════════

  const handleGenerate = async () => {
    if (!selectedFinish) {
      toast.error("Please select a concrete finish first.");
      return;
    }

    setStep("generating");
    setError("");
    setQaWarning("");

    try {
      // Step 1: Upload photo
      let imageUrl = uploadedUrl;
      if (!imageUrl) {
        imageUrl = await uploadPhoto();
      }

      // Step 2: Claude QA — get structured job brief
      setIsQA(true);
      const maskBase64 = maskDataUrl.split(",")[1];
      const customisationNotes = buildCustomisationNotes();

      const qaResult = await qaMutation.mutateAsync({
        imageUrl,
        mask: maskBase64,
        finish: selectedFinish as FinishId,
        preserveGrassStrips,
        preserveStructures,
        customerNotes: customisationNotes || undefined,
      });

      if (!qaResult.success || !qaResult.brief) {
        throw new Error(qaResult.error || "QA analysis failed");
      }

      // Check if QA says needs confirmation
      if (qaResult.brief.status === "NEEDS_USER_CONFIRMATION") {
        setQaWarning(qaResult.brief.risk_notes?.join(". ") || "The marked area may need adjustment.");
      }

      setIsQA(false);

      // Step 3: FLUX Fill — inpaint only the masked area
      setIsGenerating(true);

      const genResult = await generateMutation.mutateAsync({
        imageUrl,
        mask: maskBase64,
        finish: selectedFinish as FinishId,
        generationPrompt: qaResult.brief.generation_prompt,
        customerNotes: customisationNotes || undefined,
      });

      if (!genResult.success) {
        throw new Error(genResult.error || "Image generation failed");
      }

      setGeneratedUrl(genResult.generatedUrl);
      setIsGenerating(false);
      setStep("result");
    } catch (err: any) {
      console.error("[Visualiser V4] Error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setIsQA(false);
      setIsGenerating(false);
      setStep("select-finish");
      toast.error(err.message || "Generation failed. Please try again.");
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // LEAD CAPTURE
  // ═══════════════════════════════════════════════════════════════

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    const phoneValidation = validateAustralianPhone(phone);
    if (!phoneValidation.valid) { setError(phoneValidation.error); return; }
    const serviceArea = classifyServiceArea(suburb);
    if (!serviceArea.canSubmit) { setError(serviceArea.message); return; }
    const signals = assessSubmissionSignals({ honeypot: website, startedAt: leadFormStartedAt.current });
    if (!signals.allowed) { setError("Please check the form and try again."); return; }

    submitLead.mutate({
      name: name.trim(),
      phone: phoneValidation.normalized,
      email: "not-provided@visualiser-lead.com",
      service: FINISHES.find(f => f.id === selectedFinish)?.name || "Concrete Visualisation",
      suburb: serviceArea.normalized,
      details: `AI Visualiser V4 lead — finish: ${selectedFinish}, stone mix: ${selectedStoneMix}, border: ${addBorder ? selectedBorderColour : "none"}.`,
      website,
      formStartedAt: leadFormStartedAt.current,
      leadSource: "ai-visualiser",
      utmSource: leadSource.utmSource || undefined,
      utmMedium: leadSource.utmMedium || undefined,
      utmCampaign: leadSource.utmCampaign || undefined,
      utmTerm: leadSource.utmTerm || undefined,
      utmContent: leadSource.utmContent || undefined,
      gclid: leadSource.gclid || undefined,
      fbclid: leadSource.fbclid || undefined,
      referrer: leadSource.referrer || undefined,
      landingPage: leadSource.landingPage || undefined,
    });
  };

  const handleDownload = () => {
    if (!generatedUrl) return;
    const link = document.createElement("a");
    link.href = generatedUrl;
    link.download = `concrete-visualisation-${selectedFinish}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ═══════════════════════════════════════════════════════════════
  // TIMELAPSE — Generate construction stage keyframes
  // ═══════════════════════════════════════════════════════════════

  const handleGenerateTimelapse = async () => {
    if (!uploadedUrl || !maskDataUrl || !selectedFinish) {
      toast.error("Missing data for timelapse generation.");
      return;
    }

    setShowTimelapse(true);
    setIsGeneratingTimelapse(true);
    setTimelapseProgress(1);
    setTimelapseStages([]);

    try {
      const maskBase64 = maskDataUrl.split(",")[1];
      const customisationNotes = buildCustomisationNotes();

      // Simulate progress updates (since we can't get real-time updates from a single mutation)
      const progressInterval = setInterval(() => {
        setTimelapseProgress(prev => Math.min(prev + 1, 4));
      }, 35000); // Each stage takes ~30-60s

      const result = await timelapseMutation.mutateAsync({
        imageUrl: uploadedUrl,
        mask: maskBase64,
        finish: selectedFinish as any,
        customerNotes: customisationNotes || undefined,
      });

      clearInterval(progressInterval);

      if (!result.success || result.stages.length < 3) {
        throw new Error(result.error || "Timelapse generation failed");
      }

      setTimelapseStages(result.stages);
      setIsGeneratingTimelapse(false);
      toast.success("Construction timelapse ready!");
    } catch (err: any) {
      console.error("[Timelapse] Error:", err);
      setIsGeneratingTimelapse(false);
      setShowTimelapse(false);
      toast.error(err.message || "Timelapse generation failed. Please try again.");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadedUrl("");
    setSelectedFinish("");
    setGeneratedUrl("");
    setMaskDataUrl("");
    setDrawHistory([]);
    setImageLoaded(false);
    setError("");
    setQaWarning("");
    setLeadCaptured(false);
    setName("");
    setPhone("");
    setShowTimelapse(false);
    setTimelapseStages([]);
    setIsGeneratingTimelapse(false);
    setTimelapseProgress(0);
    resetPolygon();
  };

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  const currentFinish = FINISHES.find(f => f.id === selectedFinish);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="AI Concrete Visualiser | See Your Property Transformed | Concrete Concepts Group"
        description="Upload a photo of your property, draw the areas you want concreted, choose your stone mix and finish — see a realistic AI visualisation of the finished job. 8 finish types, 6 stone colours."
        keywords="concrete visualiser, concrete driveway visualiser, exposed aggregate preview, concrete finish preview Brisbane, stone mix colour picker"
        canonical="/visualiser"
      />
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <section className="container max-w-5xl mx-auto px-4 mb-12">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-gold/10 text-brand-gold px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Visualisation
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-brand-navy mb-4">
              See Your Concrete Job{" "}
              <span className="text-brand-gold">Before It's Poured</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload a photo, mark the exact area, pick your stone mix and finish — our AI shows you a photorealistic result on your actual property.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-1 md:gap-3 mb-10 flex-wrap">
            {[
              { label: "Upload", icon: Camera, active: step === "upload" },
              { label: "Draw Area", icon: Paintbrush, active: step === "draw-mask" },
              { label: "Customise", icon: Sparkles, active: step === "select-finish" },
              { label: "Generate", icon: Wand2, active: step === "generating" },
              { label: "Result", icon: CheckCircle2, active: step === "result" || step === "lead-gate" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  s.active ? "bg-brand-gold text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  <s.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < 4 && <ArrowRight className="w-3 h-3 text-gray-300" />}
              </div>
            ))}
          </div>

          {/* ═══ STEP 1: UPLOAD ═══ */}
          {step === "upload" && (
            <Card className="max-w-2xl mx-auto border-2 border-dashed border-gray-200 hover:border-brand-gold/50 transition-colors">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-8 h-8 text-brand-gold" />
                </div>
                <h2 className="text-xl font-semibold text-brand-navy mb-2">Upload a Photo of Your Property</h2>
                <p className="text-gray-500 mb-6">
                  Take a photo of your driveway, patio, path, or yard — the area you want concreted.
                  <br />
                  <span className="text-sm">Supports JPEG, PNG, WebP (max 10MB)</span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  size="lg"
                  className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Choose Photo
                </Button>
                <p className="text-xs text-gray-400 mt-4">
                  Tip: Photos taken in daylight with a clear view of the ground area work best.
                </p>
              </CardContent>
            </Card>
          )}

          {/* ═══ STEP 2: DRAW MASK ═══ */}
          {step === "draw-mask" && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-brand-navy mb-2">
                  Mark the Exact Area for Concrete
                </h2>
                <p className="text-gray-500 text-sm max-w-lg mx-auto">
                  Use the <strong>brush</strong> to paint freely, or the <strong>polygon</strong> tool to tap corners for exact straight edges. The AI will only change what you mark.
                </p>
              </div>

              {/* Toolbar */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 mb-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={tool === "brush" ? "default" : "outline"}
                      className={tool === "brush" ? "bg-brand-gold hover:bg-brand-gold/90" : ""}
                      onClick={() => setTool("brush")}
                    >
                      <Paintbrush className="w-4 h-4 mr-1" />
                      Paint
                    </Button>
                    <Button
                      size="sm"
                      variant={tool === "polygon" ? "default" : "outline"}
                      className={tool === "polygon" ? "bg-brand-gold hover:bg-brand-gold/90" : ""}
                      onClick={() => { setTool("polygon"); resetPolygon(); }}
                    >
                      <Pentagon className="w-4 h-4 mr-1" />
                      Polygon
                    </Button>
                    <Button
                      size="sm"
                      variant={tool === "eraser" ? "default" : "outline"}
                      className={tool === "eraser" ? "bg-brand-gold hover:bg-brand-gold/90" : ""}
                      onClick={() => setTool("eraser")}
                    >
                      <Eraser className="w-4 h-4 mr-1" />
                      Erase
                    </Button>
                  </div>

                  {tool !== "polygon" && (
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Size:</span>
                      <Slider
                        value={[brushSize]}
                        onValueChange={(v) => setBrushSize(v[0])}
                        min={10}
                        max={80}
                        step={5}
                        className="w-24"
                      />
                      <span className="text-xs text-gray-600 w-6">{brushSize}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleUndo} disabled={drawHistory.length <= 1}>
                      <Undo2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleClear}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Polygon instructions */}
                {tool === "polygon" && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <strong>Polygon mode:</strong> Tap corners to define the exact shape of your driveway. Click near the first point to close the shape.
                      {polygonPoints.length > 0 && ` (${polygonPoints.length} points placed${isPolygonClosed ? " — closed" : ""})`}
                    </p>
                  </div>
                )}
              </div>

              {/* Preserve Toggles */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 mb-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={preserveGrassStrips} onCheckedChange={setPreserveGrassStrips} />
                    <span className="text-sm text-gray-700">Preserve grass strips</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={preserveStructures} onCheckedChange={setPreserveStructures} />
                    <span className="text-sm text-gray-700">Preserve walls / house / garage</span>
                  </label>
                </div>
              </div>

              {/* Canvas */}
              <div className="relative bg-gray-100 rounded-xl overflow-hidden shadow-lg mb-6 flex items-center justify-center" style={{ minHeight: "300px" }}>
                <canvas
                  ref={canvasRef}
                  className={`max-w-full touch-none ${tool === "polygon" ? "cursor-crosshair" : "cursor-crosshair"}`}
                  style={{ display: imageLoaded ? "block" : "none" }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!imageLoaded && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading image...
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800">
                  <strong>How it works:</strong> Paint over ALL areas you want to be concrete — including existing driveways to resurface, grass to fill in, or new paths. Use the <strong>polygon tool</strong> for straight edges (tap corners, click first point to close). The AI will change ONLY the painted areas.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handleReset}>Change Photo</Button>
                <Button
                  size="lg"
                  className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8"
                  onClick={handleDoneDrawing}
                >
                  Continue — Customise Finish
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: SELECT FINISH + CUSTOMISE ═══ */}
          {step === "select-finish" && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="relative rounded-xl overflow-hidden shadow-lg max-w-md mx-auto">
                  <img src={previewUrl} alt="Your property" className="w-full h-64 object-cover" />
                  <div className="absolute top-3 left-3 bg-brand-gold/90 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Area selected ✓
                  </div>
                  <div className="absolute top-3 right-3">
                    <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm text-xs" onClick={() => setStep("draw-mask")}>
                      Edit Area
                    </Button>
                  </div>
                </div>
              </div>

              {/* Finish Selection */}
              <h2 className="text-xl font-semibold text-brand-navy text-center mb-6">Choose Your Concrete Finish</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {FINISHES.map((finish) => (
                  <button
                    key={finish.id}
                    onClick={() => setSelectedFinish(finish.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                      selectedFinish === finish.id
                        ? "border-brand-gold bg-brand-gold/5 shadow-md ring-2 ring-brand-gold/20"
                        : "border-gray-200 hover:border-brand-gold/30"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl">{finish.icon}</span>
                      <div>
                        <h3 className="font-semibold text-brand-navy text-sm">{finish.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{finish.description}</p>
                      </div>
                    </div>
                    {selectedFinish === finish.id && (
                      <div className="mt-2 flex items-center gap-1 text-brand-gold text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* V4: Stone Mix Colour Picker — only for exposed aggregate and honed */}
              {currentFinish?.hasStoneOptions && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-brand-navy text-center mb-4">Choose Your Stone Mix</h3>
                  <p className="text-sm text-gray-500 text-center mb-4">Select the aggregate colour blend for your {currentFinish.name.toLowerCase()}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-3xl mx-auto">
                    {STONE_MIXES.map((mix) => (
                      <button
                        key={mix.id}
                        onClick={() => setSelectedStoneMix(mix.id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all hover:shadow-md ${
                          selectedStoneMix === mix.id
                            ? "border-brand-gold ring-2 ring-brand-gold/20 shadow-md"
                            : "border-gray-200 hover:border-brand-gold/30"
                        }`}
                      >
                        <div
                          className="w-12 h-12 rounded-full mx-auto mb-2 border border-gray-200 shadow-inner"
                          style={{ background: `radial-gradient(circle at 30% 30%, ${mix.colour}dd, ${mix.colour}88, ${mix.colour}55)` }}
                        />
                        <h4 className="font-medium text-brand-navy text-xs">{mix.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{mix.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* V4: Border Configuration */}
              <div className="max-w-lg mx-auto mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <Switch checked={addBorder} onCheckedChange={setAddBorder} />
                    <div>
                      <span className="text-sm font-medium text-brand-navy">Add Contrasting Border Strip</span>
                      <p className="text-xs text-gray-400">100-150mm coloured border running along all edges</p>
                    </div>
                  </label>

                  {addBorder && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Border colour:</p>
                      <div className="flex gap-3">
                        {BORDER_COLOURS.map((border) => (
                          <button
                            key={border.id}
                            onClick={() => setSelectedBorderColour(border.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                              selectedBorderColour === border.id
                                ? "border-brand-gold ring-1 ring-brand-gold/30"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div
                              className="w-8 h-8 rounded-full border border-gray-300"
                              style={{ backgroundColor: border.colour }}
                            />
                            <span className="text-[10px] text-gray-600 font-medium">{border.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional customer notes */}
              <div className="max-w-lg mx-auto mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Additional notes <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Concrete should come straight off each side of the brickwork. I want the driveway to slope slightly toward the street."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/50 transition-all"
                  rows={3}
                />
                <p className="text-xs text-gray-400 mt-1">Describe any specific requirements — edges, slopes, or areas to watch out for.</p>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-10 py-6 text-lg"
                  onClick={handleGenerate}
                  disabled={!selectedFinish}
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Visualisation
                </Button>
                {!selectedFinish && (
                  <p className="text-sm text-gray-400 mt-2">Select a finish above to continue</p>
                )}
              </div>
            </div>
          )}

          {/* ═══ STEP 4: GENERATING ═══ */}
          {step === "generating" && (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-brand-navy mb-3">
                  {isUploading && "Uploading your photo..."}
                  {isQA && "AI is analysing your project..."}
                  {isGenerating && "Generating your visualisation..."}
                  {!isUploading && !isQA && !isGenerating && "Processing..."}
                </h2>
                <p className="text-gray-500">
                  {isQA && "Claude is validating your mask, analysing the scene geometry, and preparing the generation brief."}
                  {isGenerating && "FLUX Fill is applying your selected concrete finish to the marked area only. This may take 30-60 seconds."}
                  {isUploading && "Securely uploading your photo..."}
                </p>

                <div className="mt-8 space-y-3 max-w-xs mx-auto text-left">
                  <div className="flex items-center gap-3">
                    {isUploading ? <Loader2 className="w-4 h-4 text-brand-gold animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    <span className={`text-sm ${!isUploading ? "text-green-700" : "text-gray-600"}`}>Photo uploaded</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {isQA ? <Loader2 className="w-4 h-4 text-brand-gold animate-spin" /> : (isGenerating || generatedUrl) ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
                    <span className={`text-sm ${isQA ? "text-gray-600" : (isGenerating || generatedUrl) ? "text-green-700" : "text-gray-400"}`}>Scene analysed & mask validated</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {isGenerating ? <Loader2 className="w-4 h-4 text-brand-gold animate-spin" /> : generatedUrl ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
                    <span className={`text-sm ${isGenerating ? "text-gray-600" : generatedUrl ? "text-green-700" : "text-gray-400"}`}>Concrete applied to marked area</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══ STEP 5: RESULT — Before/After Comparison ═══ */}
          {step === "result" && (
            <div className="max-w-4xl mx-auto">
              {/* QA Warning */}
              {qaWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">AI Note</p>
                    <p className="text-sm text-amber-700">{qaWarning}</p>
                  </div>
                </div>
              )}

              {/* Before/After Slider */}
              {!leadCaptured ? (
                <div className="mb-8">
                  <div className="relative rounded-xl overflow-hidden shadow-xl">
                    <img src={generatedUrl} alt="AI generated visualisation" className="w-full aspect-[4/3] object-cover blur-md" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-center text-white p-6">
                        <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-80" />
                        <p className="font-semibold text-xl mb-1">Your visualisation is ready!</p>
                        <p className="text-sm opacity-80">Enter your details below to unlock the full before/after comparison</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <ImageComparisonSlider
                    before={previewUrl}
                    after={generatedUrl}
                    finishName={FINISHES.find(f => f.id === selectedFinish)?.name || ""}
                  />
                  <p className="text-center text-sm text-gray-500 mt-3">← Drag the slider to compare before and after →</p>
                </div>
              )}

              {/* Lead Capture OR Actions */}
              {!leadCaptured ? (
                <Card className="max-w-md mx-auto border-brand-gold/30">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-brand-navy text-center mb-1">Unlock Your Visualisation</h3>
                    <p className="text-sm text-gray-500 text-center mb-5">Enter your details to see the full before/after comparison.</p>
                    <form onSubmit={handleLeadSubmit} className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" className="pl-10" />
                      </div>
                      <div className="relative">
                        <Input placeholder="Suburb or postcode" value={suburb} onChange={(e) => setSuburb(e.target.value)} autoComplete="postal-code" />
                      </div>
                      <input
                        type="text"
                        name="website"
                        value={website}
                        onChange={(event) => setWebsite(event.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
                      />
                      {error && <p className="text-sm text-red-500">{error}</p>}
                      <Button type="submit" className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold" disabled={submitLead.isPending}>
                        {submitLead.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Unlock Full Image
                      </Button>
                      <p className="text-xs text-gray-400 text-center">We'll only use your details to discuss your project. No spam.</p>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button size="lg" className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold" onClick={handleDownload}>
                      <Download className="w-5 h-5 mr-2" />
                      Download Image
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white font-semibold"
                      onClick={() => window.location.href = "/get-quote"}
                    >
                      Get a Free Quote
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  {/* Timelapse Button */}
                  <div className="mt-4">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-brand-navy/30 text-brand-navy hover:bg-brand-navy/5 font-medium"
                      onClick={handleGenerateTimelapse}
                      disabled={isGeneratingTimelapse || showTimelapse}
                    >
                      <Film className="w-5 h-5 mr-2" />
                      {isGeneratingTimelapse ? "Generating Timelapse..." : "See It Built — Construction Timelapse"}
                    </Button>
                    <p className="text-xs text-gray-400 mt-1">Watch the construction stages from excavation to finished surface</p>
                  </div>

                  {/* Timelapse Player */}
                  {showTimelapse && (
                    <div className="mt-6 max-w-3xl mx-auto">
                      <ConstructionTimelapse
                        stages={timelapseStages}
                        isGenerating={isGeneratingTimelapse}
                        generationProgress={timelapseProgress}
                        onClose={() => setShowTimelapse(false)}
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-brand-gold/50 text-brand-gold hover:bg-brand-gold/10"
                      onClick={() => {
                        setGeneratedUrl("");
                        setStep("select-finish");
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refine Result
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500" onClick={handleReset}>
                      Try another photo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Trust Section */}
        <section className="container max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Paintbrush className="w-6 h-6 text-brand-gold" />
              </div>
              <h3 className="font-semibold text-brand-navy mb-1 text-sm">Draw Your Vision</h3>
              <p className="text-xs text-gray-500">Paint or polygon-select exactly where you want concrete — the mask is the source of truth</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-brand-gold" />
              </div>
              <h3 className="font-semibold text-brand-navy mb-1 text-sm">Pick Your Stone Mix</h3>
              <p className="text-xs text-gray-500">6 Australian aggregate colours, 8 finish types, optional border strips — fully customisable</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-brand-gold" />
              </div>
              <h3 className="font-semibold text-brand-navy mb-1 text-sm">Photorealistic Result</h3>
              <p className="text-xs text-gray-500">AI validates your mask, then generates a realistic visualisation — only the marked area changes</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
