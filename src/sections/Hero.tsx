import { profile } from '@/data/profile';

export default function Hero() {
  return (
    <section id="home" className="flex min-h-[100svh] items-center py-24">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {profile.openToWork ? `${profile.location} — Open to work` : profile.location}
            </p>

            <h1 className="mt-4 font-display text-display-sm font-extrabold leading-none tracking-[-0.02em] text-primary md:text-display">
              {profile.name}
            </h1>

            <p className="mt-4 text-xl font-semibold text-accent-2">{profile.roles[0]}</p>
            <p className="mt-4 max-w-[52ch] text-muted">{profile.tagline}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#projects"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-void"
              >
                View projects
              </a>
              <a
                href={profile.cvUrl}
                download
                className="rounded-full border border-edge px-5 py-2.5 text-sm font-semibold text-muted"
              >
                Download CV
              </a>
            </div>

            <dl className="mt-10 flex flex-wrap gap-8">
              {profile.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-primary">
                    {`${stat.value}${stat.suffix ?? ''}`}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="md:col-span-5">
            <img
              src={profile.avatarUrl}
              alt={`${profile.name}, ${profile.roles[0]}`}
              width={800}
              height={800}
              className="w-full max-w-sm rounded-xl border border-edge"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
