import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { profile } from '@/data/profile';

export default function About() {
  return (
    <SectionShell {...shellProps('about')}>
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <img
            src={profile.avatarUrl}
            alt={`${profile.name} at work`}
            width={800}
            height={800}
            loading="lazy"
            decoding="async"
            className="w-full rounded-xl border border-edge"
          />
        </div>

        <div className="md:col-span-7">
          {profile.bio.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="mb-4 max-w-[68ch] text-muted">
              {paragraph}
            </p>
          ))}

          <dl className="mt-8 grid gap-4 rounded-xl border border-edge bg-surface p-6 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Location</dt>
              <dd className="mt-1 text-primary">{profile.location}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Status</dt>
              <dd className="mt-1 text-primary">
                {profile.openToWork ? 'Open to work' : 'Not looking right now'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </SectionShell>
  );
}
