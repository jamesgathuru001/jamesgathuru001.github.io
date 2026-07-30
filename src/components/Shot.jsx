/**
 * Live-product screenshot. Captured by `npm run shoot`, optimized to
 * avif/webp by `npm run assets`.
 *
 * A project has a shot exactly when it has a public URL to shoot — ShuleDrive
 * is offline, and Atom's Orca/Neutron consoles are login walls we deliberately
 * don't publish. Hence the `live` check rather than a slug allowlist.
 */
export default function Shot({ slug, title, live, placeholder = 'Capture pending', sizes }) {
  if (!live) {
    return (
      <div className="pcard__shot pcard__shot--none" aria-hidden="true">
        <span>{placeholder}</span>
      </div>
    );
  }
  const s = sizes ?? '(max-width: 900px) 100vw, 60vw';
  return (
    <picture>
      <source
        type="image/avif"
        srcSet={`/assets/work/${slug}-800.avif 800w, /assets/work/${slug}-1200.avif 1200w, /assets/work/${slug}-1600.avif 1600w`}
        sizes={s}
      />
      <img
        className="pcard__shot"
        src={`/assets/work/${slug}-1200.webp`}
        srcSet={`/assets/work/${slug}-800.webp 800w, /assets/work/${slug}-1200.webp 1200w, /assets/work/${slug}-1600.webp 1600w`}
        sizes={s}
        width="1600"
        height="1000"
        loading="lazy"
        decoding="async"
        alt={`${title} — screenshot of the live product`}
      />
    </picture>
  );
}
