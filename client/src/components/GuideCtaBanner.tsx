import { BookOpen, Download } from "lucide-react";
import { Link } from "wouter";

interface GuideCtaBannerProps {
  /** "inline" for blog sidebar / within content, "section" for full-width homepage section */
  variant?: "inline" | "section";
}

export default function GuideCtaBanner({ variant = "inline" }: GuideCtaBannerProps) {
  if (variant === "section") {
    return (
      <section className="py-16 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAwdjYwTTAgMzBoNjAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left: Icon + Text */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                <BookOpen className="w-4 h-4" />
                Free Download
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                The Brisbane Homeowner's
                <span className="text-amber-400"> Guide to Concreting</span>
              </h2>
              <p className="text-zinc-400 max-w-xl">
                13 pages covering finishes, costs, council requirements, and maintenance — everything you need before starting your project.
              </p>
            </div>

            {/* Right: CTA */}
            <div className="shrink-0">
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg shadow-amber-500/20"
              >
                <Download className="w-5 h-5" />
                Download Free Guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Inline variant — compact card for blog sidebar or within content
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 text-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-amber-400" />
        </div>
        <span className="text-sm font-medium text-amber-400">Free Guide</span>
      </div>
      <h3 className="font-bold text-lg mb-2 leading-snug">
        Homeowner's Guide to Concreting
      </h3>
      <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
        13-page guide covering finishes, costs, council requirements, and maintenance tips for Brisbane homeowners.
      </p>
      <Link
        href="/guide"
        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors w-full justify-center"
      >
        <Download className="w-4 h-4" />
        Download Free
      </Link>
    </div>
  );
}
