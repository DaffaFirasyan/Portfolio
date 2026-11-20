import { useState } from 'react';

import SectionShell from '@/components/layout/SectionShell';
import ContactForm from '@/components/ui/ContactForm';
import { shellPropsFrom } from '@/data/sections';
import { useLanguage } from '@/context/LanguageContext';

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY ?? '';

const LINK =
  'inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:text-accent';

/**
 * His address is the headline, as large as the page sets anything but the
 * name, because it is the fastest way in and has to work without the form. The
 * other ways in sit under it as one row of links; the form is last, in a plain
 * hairline frame, because it is the slowest way and the one that can fail.
 */
export default function Contact() {
  const { profile, sections, t, language } = useLanguage();
  const shell = shellPropsFrom(sections, 'contact');
  const [copied, setCopied] = useState(false);
  const [local, domain] = profile.email.split('@');

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
      <p className="max-w-[48ch] text-lg text-muted text-pretty">{t.fastestWay}</p>

      <a
        href={`mailto:${profile.email}`}
        className="sweep mt-6 inline-block text-3xl font-normal tracking-[-0.03em] text-primary sm:text-4xl xl:text-5xl"
      >
        {/* A break opportunity before the @, so a narrow column splits the
            address there and never in the middle of a word. */}
        {local}
        <wbr />@{domain}
      </a>

      <div className="mt-6 flex flex-wrap gap-x-6 border-t border-edge pt-3">
        <button
          type="button"
          onClick={handleCopyEmail}
          aria-label={copied ? t.emailCopied : t.copyEmail}
          className={LINK}
        >
          {copied ? t.emailCopied : t.copyEmail}
        </button>
        {profile.whatsapp && (
          <a
            href={`https://wa.me/62${profile.whatsapp.replace(/^0/, '').replace(/\D/g, '')}?text=${encodeURIComponent(
              language === 'id'
                ? 'Halo Daffa, saya melihat portofolio Anda dan tertarik untuk berdiskusi lebih lanjut.'
                : 'Hi Daffa, I came across your portfolio and would like to connect with you.',
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK}
          >
            {t.chatOnWhatsApp} ↗
          </a>
        )}
        {/* display: contents, so the profiles are a labelled list for assistive
            technology and still sit in the same row as the links beside them. */}
        <ul aria-label={t.socialLinks} className="contents">
          {profile.socials.map((social) => (
            <li key={social.label}>
              <a href={social.url} target="_blank" rel="noopener noreferrer" className={LINK}>
                {social.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 max-w-[48ch] text-sm text-muted text-pretty">{t.directEmailNotice}</p>

      <div className="mt-16 border-t border-edge pt-8">
        <div className="max-w-[34rem]">
          <ContactForm accessKey={ACCESS_KEY} />
        </div>
      </div>
    </SectionShell>
  );
}
