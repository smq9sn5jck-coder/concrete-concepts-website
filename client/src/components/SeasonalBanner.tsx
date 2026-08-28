/*
  SeasonalBanner: Dynamic seasonal promotion banner that auto-updates based on the current month.
  Shows relevant concreting promotions for Brisbane's climate and building seasons.
*/
import { ArrowRight, Sun, Leaf, Snowflake, Flower2 } from "lucide-react";

function getSeasonalContent() {
  const month = new Date().getMonth(); // 0-11

  // Brisbane seasons (Southern Hemisphere)
  // Summer: Dec-Feb, Autumn: Mar-May, Winter: Jun-Aug, Spring: Sep-Nov
  if (month >= 2 && month <= 4) {
    // Autumn (Mar-May) — Best concreting weather in Brisbane
    return {
      icon: Leaf,
      season: "Autumn",
      headline: "Autumn Is Brisbane's Best Concreting Season",
      subtext: "Cooler temps mean perfect curing conditions. Book now before winter rain sets in.",
      cta: "Lock In Your Autumn Quote",
      badge: "PEAK SEASON",
      gradient: "from-amber-900/90 to-amber-800/90",
      accentColor: "text-amber-300",
      badgeBg: "bg-amber-500",
    };
  } else if (month >= 5 && month <= 7) {
    // Winter (Jun-Aug) — Dry season, great for big projects
    return {
      icon: Snowflake,
      season: "Winter",
      headline: "Winter Dry Season = Ideal for Big Pours",
      subtext: "Brisbane's driest months are perfect for slabs, driveways, and retaining walls.",
      cta: "Get Your Winter Quote",
      badge: "DRY SEASON",
      gradient: "from-slate-800/90 to-slate-700/90",
      accentColor: "text-blue-300",
      badgeBg: "bg-blue-500",
    };
  } else if (month >= 8 && month <= 10) {
    // Spring (Sep-Nov) — Pre-summer rush
    return {
      icon: Flower2,
      season: "Spring",
      headline: "Spring Into Your Outdoor Project",
      subtext: "Get your concrete done before the Christmas rush. Spots are filling fast.",
      cta: "Book Your Spring Project",
      badge: "FILLING FAST",
      gradient: "from-green-900/90 to-green-800/90",
      accentColor: "text-green-300",
      badgeBg: "bg-green-500",
    };
  } else {
    // Summer (Dec-Feb) — Wet season, but still busy
    return {
      icon: Sun,
      season: "Summer",
      headline: "Summer Projects — We Work Around the Weather",
      subtext: "Our team plans around Brisbane's wet season to keep your project on track.",
      cta: "Get a Summer Quote",
      badge: "WE PLAN AHEAD",
      gradient: "from-orange-900/90 to-orange-800/90",
      accentColor: "text-orange-300",
      badgeBg: "bg-orange-500",
    };
  }
}

export default function SeasonalBanner() {
  const content = getSeasonalContent();
  const Icon = content.icon;

  return (
    <section className={`relative py-10 bg-gradient-to-r ${content.gradient}`}>
      <div className="container">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          {/* Icon */}
          <div className="shrink-0">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <Icon className={`w-8 h-8 ${content.accentColor}`} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center sm:text-left">
            <span className={`inline-block ${content.badgeBg} text-white text-xs font-bold px-3 py-1 rounded-full mb-2 tracking-wider`}
              style={{ fontFamily: "var(--font-body)" }}>
              {content.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              {content.headline}
            </h2>
            <p className="text-white/70 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              {content.subtext}
            </p>
          </div>

          {/* CTA */}
          <div className="shrink-0">
            <a
              href="/get-quote"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold px-6 py-3 rounded-lg text-sm tracking-wide uppercase transition-all whitespace-nowrap"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {content.cta}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
