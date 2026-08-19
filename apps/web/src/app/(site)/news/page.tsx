import Image from "next/image";
import { SCHOOL } from "@m-scholar/shared";

const GALLERY = [
  { src: SCHOOL.photos.hero, caption: "Learning together in class" },
  { src: SCHOOL.photos.speechBoy, caption: "A pupil speaking at a school gathering" },
  { src: SCHOOL.photos.speechGirl, caption: "Presenting with confidence" },
  { src: SCHOOL.photos.group, caption: "Our pupils" },
  { src: SCHOOL.photos.welcome, caption: "You are highly welcome to M-Scholars' Academy" },
  { src: SCHOOL.photos.courtyard, caption: "A day with staff and children" },
  { src: SCHOOL.photos.community, caption: "Parents and the school community" },
];

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-semibold text-brand">School life</h1>
      <p className="mt-2 max-w-2xl text-lg text-muted">
        Real moments from {SCHOOL.name} — recitation, class, and community in Ogaminana.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {GALLERY.map(({ src, caption }) => (
          <figure key={src} className="card-shadow overflow-hidden rounded-2xl border border-border bg-white">
            <Image src={src} alt={caption} width={900} height={640} className="h-64 w-full object-cover md:h-72" />
            <figcaption className="px-5 py-4 text-sm text-muted">{caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
