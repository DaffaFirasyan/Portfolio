import type { Certificate, CertificateCategory } from '@/types';

/**
 * Display order for the groups, most substantial first.
 *
 * A decision, not data — object key order would otherwise sort the page by
 * whichever certificate happens to be listed first. Every member of
 * CertificateCategory must appear, and a test fails if one is missing, so
 * adding a category to the type cannot silently drop it off the page.
 */
export const CATEGORY_ORDER = [
  'competition',
  'professional',
  'bootcamp',
  'course',
  'workshop',
] as const satisfies readonly CertificateCategory[];

const LABELS: Record<CertificateCategory, string> = {
  competition: 'Competitions',
  professional: 'Professional certifications',
  bootcamp: 'Bootcamps',
  course: 'Courses',
  workshop: 'Workshops',
};

export interface GroupedCertificate {
  certificate: Certificate;
  /**
   * Position in the flat list, carried through grouping.
   *
   * The lightbox steps through certificates by index with the arrow keys. If
   * the rendered order and the walked order ever disagreed, the arrows would
   * jump between groups unpredictably — so the index travels with the item and
   * the caller never has to remember to look it up.
   */
  index: number;
}

export interface CertificateGroup {
  category: CertificateCategory;
  label: string;
  items: GroupedCertificate[];
}

/**
 * Fourteen certificates as a handful of named groups.
 *
 * Fourteen identical tiles is a wall the eye cannot enter. Five groups of two
 * to four is a structure, and it answers a question a reader actually has —
 * what kind of certificates these are. A competition win and a video course
 * otherwise look identical.
 *
 * Grouping is presentational only: the underlying array is untouched.
 */
export function groupByCategory(certificates: Certificate[]): CertificateGroup[] {
  const buckets = new Map<CertificateCategory, GroupedCertificate[]>();

  certificates.forEach((certificate, index) => {
    const bucket = buckets.get(certificate.category);
    if (bucket) bucket.push({ certificate, index });
    else buckets.set(certificate.category, [{ certificate, index }]);
  });

  return CATEGORY_ORDER.filter((category) => buckets.has(category)).map((category) => ({
    category,
    label: LABELS[category],
    items: buckets.get(category) ?? [],
  }));
}
