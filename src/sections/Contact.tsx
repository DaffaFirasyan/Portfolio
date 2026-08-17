import SectionShell from '@/components/layout/SectionShell';
import { profile } from '@/data/profile';

export default function Contact() {
  return (
    <SectionShell id="contact" index={6} label="Contact" title="Let us talk">
      <p className="max-w-[60ch] text-muted">
        The fastest way to reach me is email. I read everything and reply to anything specific.
      </p>

      <a
        href={`mailto:${profile.email}`}
        className="mt-6 inline-block font-display text-2xl font-bold break-words text-accent"
      >
        {profile.email}
      </a>

      <ul aria-label="Social links" className="mt-8 flex flex-wrap gap-4">
        {profile.socials.map((social) => (
          <li key={social.label}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-edge px-4 py-2 text-sm text-muted"
            >
              {social.label}
            </a>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
