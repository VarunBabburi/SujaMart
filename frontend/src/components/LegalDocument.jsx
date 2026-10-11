// Put this file at: src/components/LegalDocument.jsx
// Renders long legal text (Privacy Policy, Terms) with a sticky contents list.
import { APP_INFO } from "../constants/appInfo";

function LegalDocument({ intro, sections }) {
  return (
    <div className="lg:grid lg:grid-cols-[230px_1fr] lg:gap-5 lg:items-start">
      {/* Table of contents (desktop) */}
      <nav className="hidden lg:block sticky top-24 bg-white rounded-3xl border border-purple-100/70 p-4 shadow-[0_2px_16px_rgba(76,29,149,0.05)]">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Contents</p>
        <ul className="space-y-0.5">
          {sections.map((s, i) => (
            <li key={s.title}>
              <a
                href={`#sec-${i + 1}`}
                className="block text-[13px] font-semibold text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg px-2.5 py-1.5 transition"
              >
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-3">
        {/* Intro */}
        <div className="bg-white rounded-3xl border border-purple-100/70 p-5 shadow-[0_2px_16px_rgba(76,29,149,0.05)]">
          <span className="inline-block text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
            Last updated: {APP_INFO.lastUpdated}
          </span>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 font-medium">{intro}</p>
        </div>

        {sections.map((s, i) => (
          <section
            key={s.title}
            id={`sec-${i + 1}`}
            className="scroll-mt-24 bg-white rounded-3xl border border-purple-100/70 p-5 shadow-[0_2px_16px_rgba(76,29,149,0.05)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7A22FD] to-[#B318B0] text-white text-sm font-black flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <h2 className="text-[16px] font-extrabold tracking-tight">{s.title}</h2>
            </div>

            {s.paragraphs?.map((p, idx) => (
              <p key={idx} className="text-sm leading-relaxed text-slate-600 font-medium mb-2.5 last:mb-0">
                {p}
              </p>
            ))}

            {s.bullets && (
              <ul className="mt-2 space-y-2">
                {s.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600 font-medium">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

export default LegalDocument;