import {
  Box,
  Brain,
  ChartColumn,
  Code,
  Component,
  Database,
  Eye,
  FlaskConical,
  GitBranch,
  Layers,
  Pen,
  Search,
  Server,
  Share2,
  Triangle,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

/**
 * `Skill.icon` has been in the data and the type since the first plan, and
 * was never once read — the whole point of skills-data.test.ts's referential-
 * integrity checks is catching exactly this shape of thing, but a string with
 * nowhere to resolve to isn't a broken reference, so nothing caught it.
 *
 * The keys are kebab-case on purpose, matching lucide's own icon slugs, but
 * kept as a separate map rather than a `mod[pascalCase(icon)]` lookup: two of
 * the sixteen data uses (`chart`, `flask`) have no bare-word icon in the
 * installed set at all, only `ChartColumn` and `FlaskConical`. A derived
 * lookup would need to know that exception anyway, so an explicit table is
 * the same amount of code and does not silently swallow a typo behind an
 * `undefined` render.
 */
const ICONS: Record<string, LucideIcon> = {
  code: Code,
  component: Component,
  layers: Layers,
  server: Server,
  database: Database,
  brain: Brain,
  search: Search,
  'share-2': Share2,
  chart: ChartColumn,
  eye: Eye,
  box: Box,
  'git-branch': GitBranch,
  triangle: Triangle,
  pen: Pen,
  wrench: Wrench,
  flask: FlaskConical,
};

/** Undefined for a name with no entry, rather than a default — a wrong icon
 * reads as correct, a missing one is obvious the moment someone looks. */
export function skillIcon(name: string): LucideIcon | undefined {
  return ICONS[name];
}
