/*
  Customer Satisfaction Survey Page
  Public-facing page where customers rate their experience after project completion.
  Happy customers (4-5 stars) are prompted to leave a Google review.
  Brand: Concrete Concepts Group — gold/charcoal palette
*/
import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle, ExternalLink, Loader2, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const GOOGLE_REVIEW_URL = "https://g.page/r/CQrqBqXQkKwdEAI/review";

function StarRating({
  value,
  onChange,
  label,
  size = "lg",
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  size?: "sm" | "lg";
}) {
  const [hover, setHover] = useState(0);
  const starSize = size === "lg" ? "w-10 h-10" : "w-7 h-7";

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="text-sm font-medium text-brand-charcoal/70"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 rounded"
          >
            <Star
              className={`${starSize} transition-colors ${
                star <= (hover || value)
                  ? "fill-brand-gold text-brand-gold"
                  : "fill-transparent text-brand-charcoal/20"
              }`}
            />
          </button>
        ))}
      </div>
      {value > 0 && (
        <span className="text-xs text-brand-charcoal/50" style={{ fontFamily: "var(--font-body)" }}>
          {value === 1 && "Poor"}
          {value === 2 && "Fair"}
          {value === 3 && "Good"}
          {value === 4 && "Very Good"}
          {value === 5 && "Excellent"}
        </span>
      )}
    </div>
  );
}

export default function SurveyPage() {
  const [, params] = useRoute("/survey/:token");
  const token = params?.token || "";

  const { data: survey, isLoading } = trpc.survey.getByToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const [overallRating, setOverallRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showGoogleReview, setShowGoogleReview] = useState(false);

  const submitSurvey = trpc.survey.submit.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      if (data.showGoogleReview) {
        setShowGoogleReview(true);
      }
      toast.success("Thank you for your feedback!");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const trackGoogleClick = trpc.survey.trackGoogleReviewClick.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (overallRating === 0) {
      toast.error("Please provide an overall rating.");
      return;
    }
    submitSurvey.mutate({
      token,
      overallRating,
      qualityRating: qualityRating || undefined,
      communicationRating: communicationRating || undefined,
      timelinessRating: timelinessRating || undefined,
      feedback: feedback || undefined,
      wouldRecommend: wouldRecommend ?? undefined,
    });
  };

  const handleGoogleReviewClick = () => {
    trackGoogleClick.mutate({ token });
    window.open(GOOGLE_REVIEW_URL, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold text-brand-charcoal mb-3">Survey Not Found</h1>
          <p className="text-brand-charcoal/60" style={{ fontFamily: "var(--font-body)" }}>
            This survey link may have expired or is invalid. If you believe this is an error, please contact us.
          </p>
        </div>
      </div>
    );
  }

  if (survey.status === "completed" && !submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="text-center max-w-md px-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brand-charcoal mb-3">Already Completed</h1>
          <p className="text-brand-charcoal/60" style={{ fontFamily: "var(--font-body)" }}>
            You've already submitted your feedback. Thank you for taking the time!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Customer Feedback | Concrete Concepts Group"
        description="Share your experience with Concrete Concepts Group"
        noindex
      />

      <div className="min-h-screen bg-brand-cream py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-full-navbar_2520906a.png"
                width={200}
                height={80}
                loading="eager"
                decoding="async"
              alt="Concrete Concepts Group"
              className="h-12 mx-auto mb-6"
            />
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-charcoal mb-2">
              How Did We Go?
            </h1>
            <p
              className="text-brand-charcoal/60 text-lg"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Hi {survey.customerName.split(" ")[0]}, we'd love your honest feedback
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-lg border border-brand-charcoal/5 p-8 sm:p-10 space-y-8"
              >
                {/* Overall Rating */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-brand-charcoal mb-4">
                    Overall Experience
                  </h2>
                  <StarRating
                    value={overallRating}
                    onChange={setOverallRating}
                    label="How would you rate your overall experience?"
                    size="lg"
                  />
                </div>

                {/* Detailed Ratings */}
                <div className="border-t border-brand-charcoal/10 pt-6">
                  <p
                    className="text-sm text-brand-charcoal/50 text-center mb-6"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Optional: Rate specific aspects of our service
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <StarRating
                      value={qualityRating}
                      onChange={setQualityRating}
                      label="Workmanship"
                      size="sm"
                    />
                    <StarRating
                      value={communicationRating}
                      onChange={setCommunicationRating}
                      label="Communication"
                      size="sm"
                    />
                    <StarRating
                      value={timelinessRating}
                      onChange={setTimelinessRating}
                      label="Timeliness"
                      size="sm"
                    />
                  </div>
                </div>

                {/* Would Recommend */}
                <div className="border-t border-brand-charcoal/10 pt-6">
                  <p
                    className="text-sm font-medium text-brand-charcoal/70 text-center mb-4"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Would you recommend us to friends or family?
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setWouldRecommend(1)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                        wouldRecommend === 1
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-brand-charcoal/10 text-brand-charcoal/60 hover:border-green-300"
                      }`}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <Heart className={`w-5 h-5 ${wouldRecommend === 1 ? "fill-green-500" : ""}`} />
                      Yes, definitely!
                    </button>
                    <button
                      type="button"
                      onClick={() => setWouldRecommend(0)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                        wouldRecommend === 0
                          ? "border-red-400 bg-red-50 text-red-600"
                          : "border-brand-charcoal/10 text-brand-charcoal/60 hover:border-red-300"
                      }`}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Not really
                    </button>
                  </div>
                </div>

                {/* Written Feedback */}
                <div className="border-t border-brand-charcoal/10 pt-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-brand-charcoal/70 mb-3">
                    <MessageSquare className="w-4 h-4" />
                    Any additional comments? (Optional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what went well, or how we could improve..."
                    rows={4}
                    className="w-full bg-brand-cream/50 border border-brand-charcoal/10 rounded-lg px-4 py-3 text-brand-charcoal placeholder:text-brand-charcoal/30 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all outline-none resize-none"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={submitSurvey.isPending || overallRating === 0}
                  className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold py-4 text-lg rounded-lg"
                >
                  {submitSurvey.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-lg border border-brand-charcoal/5 p-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                </motion.div>

                <h2 className="text-2xl font-bold text-brand-charcoal mb-3">
                  Thank You, {survey.customerName.split(" ")[0]}!
                </h2>
                <p
                  className="text-brand-charcoal/60 text-lg mb-8"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Your feedback means the world to us and helps us continue to improve.
                </p>

                {showGoogleReview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-brand-gold/10 border border-brand-gold/20 rounded-xl p-6 mb-6"
                  >
                    <p
                      className="text-brand-charcoal font-semibold text-lg mb-2"
                    >
                      Glad you had a great experience!
                    </p>
                    <p
                      className="text-brand-charcoal/60 mb-4"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Would you mind sharing a quick review on Google? It really helps other homeowners find quality concreters.
                    </p>
                    <Button
                      onClick={handleGoogleReviewClick}
                      className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold px-8 py-3 text-base"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Leave a Google Review
                    </Button>
                  </motion.div>
                )}

                <p
                  className="text-sm text-brand-charcoal/40"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  — The Concrete Concepts Group Team
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
