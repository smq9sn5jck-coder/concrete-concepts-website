import { ExternalLink } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import NotFound from "@/pages/NotFound";
import { isCustomerWebsiteHost } from "@/lib/customerWebsiteHost";
import { BATCH_ONE_LOCALITIES } from "@shared/localityContent";

function groupLocalitiesByRegion() {
  return BATCH_ONE_LOCALITIES.reduce((groups, record) => {
    const records = groups.get(record.region) ?? [];
    groups.set(record.region, [...records, record]);
    return groups;
  }, new Map<string, (typeof BATCH_ONE_LOCALITIES)[number][]>());
}

export default function BatchOneReviewPage() {
  if (typeof window !== "undefined" && isCustomerWebsiteHost(window.location.hostname)) {
    return <NotFound />;
  }

  const groups = groupLocalitiesByRegion();
  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead title="Batch 1 Locality Review | CCG Staging" description="Noindex staging review index for Batch 1 locality pages." canonical="/batch-one-review" noindex />
      <Navbar />
      <main className="container pt-32 pb-20">
        <p className="text-sm font-bold uppercase tracking-wider text-brand-gold-dark">Noindex staging review</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-brand-charcoal">Batch 1 locality pages</h1>
        <p className="mt-4 max-w-3xl text-gray-600">Twenty fixed review candidates are grouped below. Create routes remain unavailable on customer production hosts until a separate activation release.</p>
        <div className="mt-12 space-y-10">
          {Array.from(groups.entries()).map(([region, records]) => (
            <section key={region} aria-labelledby={`review-${region.toLowerCase().replaceAll(" ", "-")}`}>
              <h2 id={`review-${region.toLowerCase().replaceAll(" ", "-")}`} className="text-2xl font-bold text-brand-charcoal">{region}</h2>
              <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-brand-charcoal text-white"><tr><th className="p-4">Locality</th><th className="p-4">Action</th><th className="p-4">Postcode</th><th className="p-4">Evidence</th><th className="p-4">Page</th></tr></thead>
                  <tbody>{records.map(record => (
                    <tr key={record.slug} className="border-t border-border">
                      <td className="p-4 font-semibold">{record.locality}</td>
                      <td className="p-4 capitalize">{record.action}</td>
                      <td className="p-4">{record.postcode}</td>
                      <td className="p-4">
                        <div className="flex flex-col items-start gap-2">
                          {record.localityContext.sourceUrls.map((sourceUrl, index) => (
                            <a key={sourceUrl} href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-gold-dark hover:underline">
                              {record.localityContext.sourceLabel}{record.localityContext.sourceUrls.length > 1 ? ` — ${index + 1}` : ""}<ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ))}
                        </div>
                      </td>
                      <td className="p-4"><Link href={`/areas/${record.slug}`} className="font-semibold text-brand-gold-dark hover:underline">Review page</Link></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
