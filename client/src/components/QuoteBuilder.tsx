import { trpc } from "@/lib/trpc";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Save,
  FileText,
  Send,
  Loader2,
  Eye,
  Download,
  RefreshCw,
  Calculator,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";

// Common unit options for concreting work
const UNIT_OPTIONS = ["m²", "m³", "m", "item", "hr", "day", "lot", "ea"];

// Pre-built line item templates for quick add
const TEMPLATE_ITEMS: Record<string, { description: string; unit: string; rate: number }[]> = {
  "Driveway": [
    { description: "Excavation & site preparation", unit: "m²", rate: 22 },
    { description: "Formwork supply & install", unit: "m", rate: 35 },
    { description: "Steel reinforcement (SL82 mesh)", unit: "m²", rate: 18 },
    { description: "Concrete supply & pour (25MPa)", unit: "m²", rate: 55 },
    { description: "Plain finish & curing", unit: "m²", rate: 15 },
    { description: "Site clean-up & waste removal", unit: "lot", rate: 350 },
  ],
  "Concrete Slab / Foundation": [
    { description: "Excavation to required depth", unit: "m²", rate: 25 },
    { description: "Compaction & levelling", unit: "m²", rate: 12 },
    { description: "Formwork supply & install", unit: "m", rate: 35 },
    { description: "Steel reinforcement (SL82 mesh)", unit: "m²", rate: 18 },
    { description: "Vapour barrier (if required)", unit: "m²", rate: 8 },
    { description: "Concrete supply & pour (25MPa)", unit: "m²", rate: 55 },
    { description: "Finish & curing", unit: "m²", rate: 15 },
    { description: "Site clean-up & waste removal", unit: "lot", rate: 350 },
  ],
  "Patio / Entertaining Area": [
    { description: "Excavation & site preparation", unit: "m²", rate: 22 },
    { description: "Formwork supply & install", unit: "m", rate: 38 },
    { description: "Steel reinforcement (SL82 mesh)", unit: "m²", rate: 18 },
    { description: "Concrete supply & pour (25MPa)", unit: "m²", rate: 55 },
    { description: "Exposed aggregate finish", unit: "m²", rate: 45 },
    { description: "Control joints & edging", unit: "m", rate: 12 },
    { description: "Site clean-up & waste removal", unit: "lot", rate: 350 },
  ],
  "Pool Surround": [
    { description: "Excavation & site preparation", unit: "m²", rate: 25 },
    { description: "Formwork supply & install", unit: "m", rate: 40 },
    { description: "Steel reinforcement (SL82 mesh)", unit: "m²", rate: 18 },
    { description: "Concrete supply & pour (25MPa)", unit: "m²", rate: 55 },
    { description: "Non-slip exposed aggregate finish", unit: "m²", rate: 50 },
    { description: "Coping & edge detail", unit: "m", rate: 45 },
    { description: "Site clean-up & waste removal", unit: "lot", rate: 350 },
  ],
  "Pathway / Footpath": [
    { description: "Excavation & site preparation", unit: "m²", rate: 20 },
    { description: "Formwork supply & install", unit: "m", rate: 30 },
    { description: "Steel reinforcement (SL72 mesh)", unit: "m²", rate: 15 },
    { description: "Concrete supply & pour (20MPa)", unit: "m²", rate: 48 },
    { description: "Broom finish", unit: "m²", rate: 8 },
    { description: "Site clean-up", unit: "lot", rate: 200 },
  ],
  "Exposed Aggregate": [
    { description: "Excavation & site preparation", unit: "m²", rate: 22 },
    { description: "Formwork supply & install", unit: "m", rate: 38 },
    { description: "Steel reinforcement (SL82 mesh)", unit: "m²", rate: 18 },
    { description: "Concrete supply & pour (25MPa)", unit: "m²", rate: 55 },
    { description: "Exposed aggregate finish (premium)", unit: "m²", rate: 55 },
    { description: "Sealer application (2 coats)", unit: "m²", rate: 12 },
    { description: "Site clean-up & waste removal", unit: "lot", rate: 350 },
  ],
  "Coloured Concrete": [
    { description: "Excavation & site preparation", unit: "m²", rate: 22 },
    { description: "Formwork supply & install", unit: "m", rate: 35 },
    { description: "Steel reinforcement (SL82 mesh)", unit: "m²", rate: 18 },
    { description: "Coloured concrete supply & pour", unit: "m²", rate: 65 },
    { description: "Colour hardener application", unit: "m²", rate: 20 },
    { description: "Sealer application (2 coats)", unit: "m²", rate: 12 },
    { description: "Site clean-up & waste removal", unit: "lot", rate: 350 },
  ],
};

interface LineItem {
  id: string; // client-side temp ID
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

interface QuoteBuilderProps {
  quoteId: number;
  service: string;
  customerName: string;
  customerEmail: string;
  pdfUrl: string | null;
  pdfRef: string | null;
  pdfSentAt: Date | null;
  customTerms: string | null;
  customNotes: string | null;
  validityDays: number | null;
  gstIncluded: number | null;
  onUpdate: () => void;
}

export default function QuoteBuilder({
  quoteId,
  service,
  customerName,
  customerEmail,
  pdfUrl,
  pdfRef,
  pdfSentAt,
  customTerms: initialTerms,
  customNotes: initialNotes,
  validityDays: initialValidity,
  gstIncluded: initialGst,
  onUpdate,
}: QuoteBuilderProps) {
  const [items, setItems] = useState<LineItem[]>([]);
  const [customTerms, setCustomTerms] = useState(initialTerms || "");
  const [customNotes, setCustomNotes] = useState(initialNotes || "");
  const [validityDays, setValidityDays] = useState(initialValidity ?? 30);
  const [gstIncluded, setGstIncluded] = useState(initialGst !== 0);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch existing line items
  const { data: existingItems, isLoading } = trpc.quote.getLineItems.useQuery(
    { quoteRequestId: quoteId },
  );

  // Load existing items into state
  useEffect(() => {
    if (existingItems && existingItems.length > 0 && items.length === 0) {
      setItems(
        existingItems.map((item) => ({
          id: `existing-${item.id}`,
          description: item.description,
          quantity: Number(item.quantity),
          unit: item.unit,
          rate: Number(item.rate),
          amount: Number(item.amount),
        }))
      );
    }
  }, [existingItems]);

  // Mutations
  const saveLineItems = trpc.quote.saveLineItems.useMutation({
    onSuccess: () => {
      toast.success("Line items saved");
      setHasUnsavedChanges(false);
      onUpdate();
    },
    onError: (err) => toast.error(err.message),
  });

  const saveSettings = trpc.quote.saveQuoteSettings.useMutation({
    onSuccess: () => {
      toast.success("Quote settings saved");
      onUpdate();
    },
    onError: (err) => toast.error(err.message),
  });

  const generatePdf = trpc.quote.generateCustomPdf.useMutation({
    onSuccess: () => {
      toast.success("Custom PDF generated!");
      onUpdate();
    },
    onError: (err) => toast.error(err.message),
  });

  const sendPdf = trpc.quote.sendPdf.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      onUpdate();
    },
    onError: (err) => toast.error(err.message),
  });

  // Calculate totals
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);
  const gstAmount = useMemo(() => (gstIncluded ? subtotal / 11 : 0), [subtotal, gstIncluded]);
  const exGst = useMemo(() => subtotal - gstAmount, [subtotal, gstAmount]);

  // Add a blank row
  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        description: "",
        quantity: 1,
        unit: "m²",
        rate: 0,
        amount: 0,
      },
    ]);
    setHasUnsavedChanges(true);
  }, []);

  // Remove a row
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setHasUnsavedChanges(true);
  }, []);

  // Update a field
  const updateItem = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        // Auto-calculate amount when qty or rate changes
        if (field === "quantity" || field === "rate") {
          updated.amount = Number((updated.quantity * updated.rate).toFixed(2));
        }
        return updated;
      })
    );
    setHasUnsavedChanges(true);
  }, []);

  // Load template items
  const loadTemplate = useCallback((templateKey: string) => {
    const template = TEMPLATE_ITEMS[templateKey];
    if (!template) return;

    const newItems: LineItem[] = template.map((t, i) => ({
      id: `template-${Date.now()}-${i}`,
      description: t.description,
      quantity: 1,
      unit: t.unit,
      rate: t.rate,
      amount: t.rate, // qty=1 so amount=rate
    }));

    setItems(newItems);
    setHasUnsavedChanges(true);
    setShowTemplates(false);
    toast.success(`Loaded ${templateKey} template with ${newItems.length} items`);
  }, []);

  // Save all items
  const handleSave = useCallback(() => {
    const validItems = items.filter((item) => item.description.trim());
    saveLineItems.mutate({
      quoteRequestId: quoteId,
      items: validItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        amount: item.amount,
      })),
    });
    // Also save settings
    saveSettings.mutate({
      id: quoteId,
      customTerms: customTerms || undefined,
      customNotes: customNotes || undefined,
      validityDays,
      gstIncluded,
    });
  }, [items, quoteId, customTerms, customNotes, validityDays, gstIncluded]);

  // Generate custom PDF
  const handleGeneratePdf = useCallback(() => {
    if (hasUnsavedChanges) {
      toast.error("Save your changes before generating PDF");
      return;
    }
    if (items.filter((i) => i.description.trim()).length === 0) {
      toast.error("Add at least one line item before generating PDF");
      return;
    }
    generatePdf.mutate({ id: quoteId });
  }, [quoteId, hasUnsavedChanges, items]);

  // Send PDF
  const handleSendPdf = useCallback(() => {
    if (confirm(`Send PDF quote to ${customerEmail}?`)) {
      sendPdf.mutate({ id: quoteId });
    }
  }, [quoteId, customerEmail]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
        <span className="ml-2 text-sm text-gray-500">Loading quote builder...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with template loader */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-600" />
          Quote Builder
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowTemplates(!showTemplates); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Load Template
              {showTemplates ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showTemplates && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {Object.keys(TEMPLATE_ITEMS).map((key) => (
                  <button
                    key={key}
                    onClick={(e) => { e.stopPropagation(); loadTemplate(key); }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); addItem(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Line Items Table */}
      {items.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-2">No line items yet</p>
          <p className="text-xs text-gray-400">Load a template or add items manually</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" onClick={(e) => e.stopPropagation()}>
            <thead>
              <tr className="bg-gray-800 text-white text-xs">
                <th className="px-2 py-2 text-left w-8"></th>
                <th className="px-2 py-2 text-left">Description</th>
                <th className="px-2 py-2 text-center w-20">Qty</th>
                <th className="px-2 py-2 text-center w-20">Unit</th>
                <th className="px-2 py-2 text-right w-24">Rate ($)</th>
                <th className="px-2 py-2 text-right w-28">Amount ($)</th>
                <th className="px-2 py-2 text-center w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}
                >
                  <td className="px-2 py-1.5 text-gray-400">
                    <GripVertical className="w-3.5 h-3.5" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="Item description..."
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      min={0}
                      step={0.5}
                      className="w-full px-2 py-1 text-xs text-center border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                      className="w-full px-1 py-1 text-xs text-center border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
                      min={0}
                      step={0.5}
                      className="w-full px-2 py-1 text-xs text-right border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="px-2 py-1 text-xs text-right font-semibold text-gray-800 bg-amber-50 rounded border border-amber-200">
                      ${item.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals */}
      {items.length > 0 && (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <div className="w-64 space-y-1">
            {gstIncluded && (
              <>
                <div className="flex justify-between text-xs text-gray-600 px-2">
                  <span>Subtotal (ex GST):</span>
                  <span>${exGst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 px-2">
                  <span>GST (10%):</span>
                  <span>${gstAmount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-sm font-bold bg-amber-100 text-gray-900 px-3 py-2 rounded-lg border border-amber-300">
              <span>{gstIncluded ? "Total (inc GST):" : "Total:"}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Settings Toggle */}
      <div onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          {showSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          Quote Settings (Notes, Terms, GST)
        </button>

        {showSettings && (
          <div className="mt-3 space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
            {/* GST Toggle */}
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-600 font-medium">GST:</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gstIncluded}
                  onChange={(e) => { setGstIncluded(e.target.checked); setHasUnsavedChanges(true); }}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-xs text-gray-600">Prices include GST</span>
              </label>
            </div>

            {/* Validity */}
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-600 font-medium">Valid for:</label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => { setValidityDays(Number(e.target.value)); setHasUnsavedChanges(true); }}
                min={1}
                max={365}
                className="w-20 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 bg-white"
              />
              <span className="text-xs text-gray-500">days</span>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="text-xs text-gray-600 font-medium block mb-1">Notes (shown on PDF):</label>
              <textarea
                value={customNotes}
                onChange={(e) => { setCustomNotes(e.target.value); setHasUnsavedChanges(true); }}
                placeholder="e.g. Access via rear gate. Work to commence within 2 weeks of acceptance."
                rows={2}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-400 bg-white resize-none"
              />
            </div>

            {/* Custom Terms */}
            <div>
              <label className="text-xs text-gray-600 font-medium block mb-1">
                Custom Terms (one per line, leave blank for defaults):
              </label>
              <textarea
                value={customTerms}
                onChange={(e) => { setCustomTerms(e.target.value); setHasUnsavedChanges(true); }}
                placeholder={"Quote valid for 30 days from date of issue.\n30% deposit required upon acceptance.\nBalance due upon completion."}
                rows={4}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-400 bg-white resize-none font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saveLineItems.isPending || saveSettings.isPending}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
            hasUnsavedChanges
              ? "bg-indigo-600 text-white hover:bg-indigo-700 ring-2 ring-indigo-300"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {saveLineItems.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {hasUnsavedChanges ? "Save Changes *" : "Save"}
        </button>

        {/* Generate PDF */}
        <button
          onClick={handleGeneratePdf}
          disabled={generatePdf.isPending || hasUnsavedChanges || items.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          {generatePdf.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Generate PDF
        </button>

        {/* Preview */}
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </a>
        )}

        {/* Download */}
        {pdfUrl && (
          <a
            href={pdfUrl}
            download={`Quote-${pdfRef || quoteId}.pdf`}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        )}

        {/* Send to Customer */}
        {pdfUrl && (
          <button
            onClick={handleSendPdf}
            disabled={sendPdf.isPending}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
              pdfSentAt
                ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {sendPdf.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {pdfSentAt ? "Resend to Customer" : "Send to Customer"}
          </button>
        )}
      </div>

      {/* Status info */}
      {pdfRef && (
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span>Ref: {pdfRef}</span>
          {pdfSentAt && (
            <span className="text-green-600">
              Sent {new Date(pdfSentAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
