/*
  DESIGN: Refined Craft — Concrete Concepts Group brand
  Contact: Two-column layout — info left, quote form right
  Gold accents, charcoal background, prominent form
  Connected to tRPC backend for quote submission
  Supports photo uploads for project area images
*/
import { useState, useRef } from "react";
import { useLeadSource } from "@/hooks/useLeadSource";
import { trackQuoteConversion, trackPhoneCallClick, trackEmailClick } from "@/components/ConversionTracking";
import { trackFormFieldFocus, trackFormFieldComplete, useFormAbandonDetection } from "@/components/GodModeTracking";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Loader2, Camera, X, ImageIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { submitFormFallback, CONTACT_INFO } from "@/lib/formFallback";
import {
  assessSubmissionSignals,
  classifyServiceArea,
  validateAustralianPhone,
} from "@shared/leadValidation";

const contactInfo = [
  { icon: Phone, label: "Phone", value: "0424 463 268", href: "tel:0424463268" },
  { icon: Mail, label: "Email", value: "info@concreteconceptsgroup.com", href: "mailto:info@concreteconceptsgroup.com" },
  { icon: MapPin, label: "Service Area", value: "Brisbane & All Surrounding Areas", href: null },
  { icon: Clock, label: "Hours", value: "Mon – Sat: 6am – 5pm", href: null },
];

const serviceOptions = [
  "Concrete Slab / Foundation",
  "Driveway",
  "Pathway / Footpath",
  "Patio / Entertaining Area",
  "Pool Surround",
  "Retaining Wall",
  "Stairs / Steps",
  "Exposed Aggregate",
  "Coloured Concrete",
  "Covercrete",
  "Excavation",
  "Formwork",
  "Concrete Removal",
  "Grinding / Cutting",
  "Sealing",
  "Reinforcement",
  "Pumping",
  "Commercial Project",
  "Other",
];

interface PhotoPreview {
  file: File;
  preview: string;
}

export default function ContactSection() {
  const leadSource = useLeadSource();
  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formStartedAt = useRef(Date.now());
  const [website, setWebsite] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    suburb: "",
    message: "",
  });

  const submitQuote = trpc.quote.submit.useMutation({
    onSuccess: (result) => {
      trackQuoteConversion(
        { email: formData.email, phone: formData.phone, name: formData.name },
      );
      setSubmitted(true);
      toast.success("Quote request sent! We'll be in touch within 24 hours.");
      if (result.serviceAreaStatus === "service_area_review") {
        toast.info("We received your enquiry and will confirm availability for your location.");
      }
    },
    onError: async (error) => {
      if (error.data?.code === "BAD_REQUEST" || error.data?.code === "TOO_MANY_REQUESTS") {
        toast.error(error.message);
        return;
      }
      console.warn("[ContactForm] Backend unavailable, trying fallback:", error.message);
      try {
        const result = await submitFormFallback({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          suburb: formData.suburb,
          details: formData.message,
          source: "contact-section",
          website,
          formStartedAt: formStartedAt.current,
        });
        if (result.success) {
          trackQuoteConversion({ email: formData.email, phone: formData.phone, name: formData.name });
          setSubmitted(true);
          toast.success("Quote request sent! We'll be in touch within 24 hours.");
        } else if (result.method === "mailto") {
          toast.info("Your email app has opened. Please press Send to complete the enquiry.");
        }
      } catch (fallbackError) {
        toast.error(fallbackError instanceof Error ? fallbackError.message : `Something went wrong. Call us directly: ${CONTACT_INFO.phone}`);
      }
    },
  });

  const saveAbandonedQuote = trpc.abandonedQuote.save.useMutation();
  const [abandonedSaved, setAbandonedSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Track abandoned quotes: save partial form data when user fills email but may not submit
  const handleEmailBlur = () => {
    if (formData.email && formData.email.includes("@") && !abandonedSaved && !submitted) {
      saveAbandonedQuote.mutate({
        email: formData.email,
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        suburb: formData.suburb || undefined,
        service: formData.service || undefined,
        page: window.location.pathname,
      });
      setAbandonedSaved(true);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxPhotos = 5;
    const remaining = maxPhotos - photos.length;

    if (files.length > remaining) {
      toast.error(`You can upload up to ${maxPhotos} photos. ${remaining} remaining.`);
    }

    const newPhotos = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const photo of photos) {
      try {
        // Read file as base64
        const arrayBuffer = await photo.file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );

        const response = await fetch("/api/upload-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: base64,
            contentType: photo.file.type || "image/jpeg",
            fileName: photo.file.name,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          console.error("[Upload] Error:", err.error);
          continue;
        }

        const result = await response.json();
        urls.push(result.url);
      } catch (err) {
        console.error("[Upload] Failed to upload photo:", err);
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.suburb || !formData.service) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const phoneValidation = validateAustralianPhone(formData.phone);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error);
      return;
    }
    const serviceArea = classifyServiceArea(formData.suburb);
    if (!serviceArea.canSubmit) {
      toast.error(serviceArea.message);
      return;
    }
    const submissionSignals = assessSubmissionSignals({
      honeypot: website,
      startedAt: formStartedAt.current,
    });
    if (!submissionSignals.allowed) {
      toast.error("Please check the form and try again.");
      return;
    }

    let photoUrls: string[] = [];
    if (photos.length > 0) {
      setUploading(true);
      try {
        photoUrls = await uploadPhotos();
      } catch (err) {
        console.error("[Upload] Photo upload error:", err);
      }
      setUploading(false);
    }

    submitQuote.mutate({
      name: formData.name.trim(),
      phone: phoneValidation.normalized,
      email: formData.email,
      suburb: serviceArea.normalized,
      service: formData.service,
      details: formData.message || undefined,
      photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
      website,
      formStartedAt: formStartedAt.current,
      leadSource: leadSource.leadSource,
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
  const isSubmitting = submitQuote.isPending || uploading;

  // God-mode form abandon detection
  useFormAbandonDetection("contact_full_quote", formData, submitted);

  return (
    <section id="contact" className="py-24 lg:py-32 bg-brand-charcoal relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left Column — Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-px bg-brand-gold" />
              <span
                className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Get a Quote
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Ready to
              <br />
              <span className="text-brand-gold italic">Start Your</span>
              <br />
              Project?
            </h2>

            <p
              className="text-brand-silver-light/70 text-lg leading-relaxed mb-10"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Fill out the form and we&apos;ll get back to you with a free, 
              no-obligation quote within 24 hours. Or reach out directly 
              using the details below.
            </p>

            {/* Contact Details */}
            <div className="space-y-5">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5" style={{ fontFamily: "var(--font-body)" }}>
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        onClick={item.href.startsWith("tel:") ? () => trackPhoneCallClick() : item.href.startsWith("mailto:") ? () => trackEmailClick() : undefined}
                        className="text-white hover:text-brand-gold transition-colors font-medium"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white font-medium" style={{ fontFamily: "var(--font-body)" }}>
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column — Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {submitted ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-16 h-16 text-brand-gold mx-auto mb-6" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">Quote Request Received</h3>
                <p className="text-brand-silver-light/70 text-lg mb-6" style={{ fontFamily: "var(--font-body)" }}>
                  Thanks {formData.name}! We&apos;ve received your enquiry and will 
                  be in touch within 24 hours with your free quote.
                </p>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", phone: "", service: "", suburb: "", message: "" });
                    setPhotos([]);
                    setWebsite("");
                    formStartedAt.current = Date.now();
                  }}
                  variant="outline"
                  className="border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Submit Another Enquiry
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 lg:p-10"
              >
                <h3 className="text-2xl font-bold text-white mb-2">Request a Free Quote</h3>
                <p className="text-white/50 text-sm mb-8" style={{ fontFamily: "var(--font-body)" }}>
                  No obligation. We&apos;ll respond within 24 hours.
                </p>

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-white/60 text-sm mb-1.5 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your Full Name"
                      onFocus={() => trackFormFieldFocus("name", "contact_full_quote")}
                      onBlur={(e) => { if (e.target.value) trackFormFieldComplete("name", "contact_full_quote"); }}
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all outline-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-white/60 text-sm mb-1.5 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="04XX XXX XXX"
                      autoComplete="tel"
                      onFocus={() => trackFormFieldFocus("phone", "contact_full_quote")}
                      onBlur={(e) => { if (e.target.value) trackFormFieldComplete("phone", "contact_full_quote"); }}
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all outline-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-white/60 text-sm mb-1.5 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleEmailBlur}
                      required
                      placeholder="john@example.com"
                      onFocus={() => trackFormFieldFocus("email", "contact_full_quote")}
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all outline-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>

                  {/* Suburb */}
                  <div>
                    <label className="block text-white/60 text-sm mb-1.5 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                      Suburb / Location *
                    </label>
                    <input
                      type="text"
                      name="suburb"
                      value={formData.suburb}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Manly West 4179"
                      autoComplete="postal-code"
                      onFocus={() => trackFormFieldFocus("suburb", "contact_full_quote")}
                      onBlur={(e) => { if (e.target.value) trackFormFieldComplete("suburb", "contact_full_quote"); }}
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all outline-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                    {formData.suburb && classifyServiceArea(formData.suburb).status === "service_area_review" && (
                      <p className="text-amber-200/80 text-xs mt-1.5">
                        You can continue — our team will confirm availability for this Queensland location.
                      </p>
                    )}
                  </div>

                  {/* Service Type */}
                  <div className="sm:col-span-2">
                    <label className="block text-white/60 text-sm mb-1.5 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                      Service Required *
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all outline-none appearance-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <option value="" className="bg-brand-charcoal">Select a service...</option>
                      {serviceOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-brand-charcoal">
                          {opt}
                        </option>
                      ))}
                    </select>
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

                  {/* Message */}
                  <div className="sm:col-span-2">
                    <label className="block text-white/60 text-sm mb-1.5 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                      Project Details
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about your project — size, type of finish, any specific requirements..."
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all outline-none resize-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>

                  {/* Photo Upload */}
                  <div className="sm:col-span-2">
                    <label className="block text-white/60 text-sm mb-1.5 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                      Project Photos <span className="text-white/30">(optional, up to 5)</span>
                    </label>

                    {/* Photo previews */}
                    {photos.length > 0 && (
                      <div className="flex flex-wrap gap-3 mb-3">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={photo.preview}
                              alt={`Project photo ${index + 1}`}
                              width={80}
                              height={80}
                              loading="lazy"
                              decoding="async"
                              className="w-20 h-20 object-cover rounded-lg border border-white/15"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {photos.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-white/15 rounded-lg px-4 py-4 text-white/40 hover:text-brand-gold hover:border-brand-gold/30 transition-all flex items-center justify-center gap-3 cursor-pointer"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <Camera className="w-5 h-5" />
                        <span className="text-sm">
                          {photos.length === 0
                            ? "Add photos of your project area"
                            : `Add more photos (${5 - photos.length} remaining)`}
                        </span>
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                      multiple
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />

                    <p className="text-white/20 text-xs mt-1.5" style={{ fontFamily: "var(--font-body)" }}>
                      JPEG, PNG, WebP or HEIC. Max 10MB per photo.
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold py-6 text-base tracking-wide uppercase shadow-xl shadow-brand-gold/20 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-gold/30 flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {uploading ? "Uploading Photos..." : "Sending..."}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Quote Request
                      {photos.length > 0 && (
                        <span className="ml-1 flex items-center gap-1 text-brand-charcoal/70">
                          <ImageIcon className="w-3.5 h-3.5" />
                          {photos.length}
                        </span>
                      )}
                    </>
                  )}
                </Button>

                <p className="text-white/30 text-xs text-center mt-4" style={{ fontFamily: "var(--font-body)" }}>
                  By submitting this form, you agree to be contacted regarding your enquiry. 
                  We respect your privacy and will never share your information.
                </p>
              </form>
            )}
          </motion.div>
        </div>

        {/* Google Maps — Service Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="w-10 h-px bg-brand-gold" />
            <span
              className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Our Service Area
            </span>
            <div className="w-10 h-px bg-brand-gold" />
          </div>
          <p className="text-white/60 text-center mb-6 max-w-xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            We service Brisbane and all surrounding areas — from the Gold Coast to the Sunshine Coast, Ipswich to the Redlands, and everywhere in between.
          </p>
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            <iframe
              title="Concrete Concepts Group Service Area — Brisbane & South East QLD"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d453571.3513092705!2d152.68231879999998!3d-27.470933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b91579aac93d233%3A0x402a35af3deaf40!2sBrisbane%20QLD%2C%20Australia!5e0!3m2!1sen!2sau!4v1709900000000!5m2!1sen!2sau"
              width="100%"
              height="400"
              style={{ border: 0, filter: "grayscale(30%) contrast(1.1)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
