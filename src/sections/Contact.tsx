import { useState } from 'react';
import { Copy, Check, MessageCircle } from 'lucide-react';

import SectionShell from '@/components/layout/SectionShell';
import ContactForm from '@/components/ui/ContactForm';
import { shellPropsFrom } from '@/data/sections';
import { useLanguage } from '@/context/LanguageContext';
import Reveal from '@/motion/Reveal';
import Sparks from '@/motion/Sparks';
import Typed from '@/motion/Typed';

/**
 * Public by design — a Web3Forms access key identifies a form, not an account,
 * and the service expects it in client-side code. Absent, the form resolves to
 * its error state, which is where the mailto: fallback already lives.
 */
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY ?? '';

export default function Contact() {
  const { profile, sections, t, language } = useLanguage();
  const shell = shellPropsFrom(sections, 'contact');
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <SectionShell {...shell}>
      {/* No `fill` on either Reveal. They are grid items, but each holds a
          column of stacked content rather than a card that must match a
          sibling's height, and h-full on stacked Reveals is what broke the
          hero in the motion plan. */}
      <Sparks>
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative flex flex-col">
              <Typed
                key={t.fastestWay}
                text={t.fastestWay}
                className="max-w-[48ch] text-muted"
              />

              <p className="mt-3 max-w-[48ch] text-muted">
                {t.directEmailNotice}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${profile.email}`}
                  className="font-display text-xl sm:text-2xl font-bold break-words text-accent transition-colors hover:text-accent-bright"
                >
                  {profile.email}
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label={copied ? t.emailCopied : t.copyEmail}
                  title={copied ? t.emailCopied : t.copyEmail}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    copied
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'border-edge/70 bg-surface/50 text-muted hover:border-edge-bright hover:text-primary hover:bg-surface/80'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{t.emailCopied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{t.copyEmail}</span>
                    </>
                  )}
                </button>
              </div>

              {profile.whatsapp && (
                <div className="mt-4">
                  <a
                    href={`https://wa.me/62${profile.whatsapp.replace(/^0/, '').replace(/\D/g, '')}?text=${encodeURIComponent(
                      language === 'id'
                        ? 'Halo Daffa, saya melihat portofolio Anda dan tertarik untuk berdiskusi lebih lanjut.'
                        : 'Hi Daffa, I came across your portfolio and would like to connect with you.',
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 transition-all duration-200 hover:bg-emerald-500/20 hover:border-emerald-500/70 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{t.chatOnWhatsApp}</span>
                  </a>
                </div>
              )}

              <ul aria-label={t.socialLinks} className="mt-8 flex flex-wrap gap-4">
                {profile.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center rounded-full border border-edge px-4 text-sm text-muted"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <ContactForm accessKey={ACCESS_KEY} />
          </Reveal>
        </div>
      </Sparks>
    </SectionShell>
  );
}
