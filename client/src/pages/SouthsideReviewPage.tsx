import { ExternalLink } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import NotFound from "@/pages/NotFound";
import { isCustomerWebsiteHost } from "@/lib/customerWebsiteHost";
import { SOUTHSIDE_LOCALITIES } from "@shared/southsideLocalityContent";

export default function SouthsideReviewPage() {
  if (typeof window !== "undefined" && isCustomerWebsiteHost(window.location.hostname)) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead
        title="Brisbane South-Side Locality Review | CCG Staging"
        description="Noindex staging review for the approved eight-page Brisbane south-side locality cluster."
        canonical="/southside-review"
        noindex
      />
      <Navbar />
      <main className="container pt-32 pb-20">
        <p className="text-sm font-bold uppercase tracking-wider text-brand-gold-dark">Noindex Cloudflare staging review</p>
        <h1 className="mt-3 text-3xl font-bold text-brand-charcoal sm:text-4xl">Brisbane south-side locality pages</h1>
        <p className="mt-4 max-w-3xl text-gray-600">
          Review the eight approved pages below. Murarrie is already live; the six upgraded replacements and the new Norman Park page remain staging-only until a separate production release is approved.
        </p>

        <div className="mt-10 overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-brand-charcoal text-white">
              <tr>
                <th className="p-4">Locality</th>
                <th className="p-4">Release action</th>
                <th className="p-4">Postcode</th>
                <th className="p-4">Evidence</th>
                <th className="p-4">Page</th>
              </tr>
            </thead>
            <tbody>
              {SOUTHSIDE_LOCALITIES.map(record => (
                <tr key={record.slug} className="border-t border-border">
                  <td className="p-4 font-semibold">{record.locality}</td>
                  <td className="p-4 capitalize">{record.releaseAction}</td>
                  <td className="p-4">{record.postcode}</td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-2">
                      {record.localityContext.sourceUrls.map((sourceUrl, index) => (
                        <a
                          key={sourceUrl}
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand-gold-dark hover:underline"
                        >
                          {record.localityContext.sourceLabel}
                          {record.localityContext.sourceUrls.length > 1 ? ` — ${index + 1}` : ""}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <Link href={`/areas/${record.slug}`} className="font-semibold text-brand-gold-dark hover:underline">
                      Review page
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
