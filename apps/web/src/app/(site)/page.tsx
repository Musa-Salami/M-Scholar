import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Heart, Shield } from "lucide-react";
import { SCHOOL } from "@m-scholar/shared";
import { pageHref, whatsappHref } from "@/lib/paths";

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[78vh] overflow-hidden text-white">
        <Image
          src={SCHOOL.photos.hero}
          alt="Pupils of M-Scholars' Academy in class"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand/95 via-brand/80 to-brand/45" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 py-20 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">You are highly welcome</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">
            {SCHOOL.name}
          </h1>
          <p className="mt-4 max-w-xl font-display text-xl text-gold md:text-2xl">{SCHOOL.motto}</p>
          <p className="mt-3 max-w-xl text-lg text-white/85">{SCHOOL.vision}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={pageHref("/admissions")}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-6 py-3.5 font-semibold text-brand hover:bg-[#d4b03c]"
            >
              Admission now open <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappHref(SCHOOL.whatsapp, `Assalamu alaikum. I want to enquire about admission into ${SCHOOL.name} for ${SCHOOL.session}.`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-xl border border-white/40 px-6 py-3.5 font-semibold text-white hover:bg-white/10"
            >
              Call / WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
          {[
            { icon: BookOpen, title: "Integrated education", text: "Islamic and Western learning, Tahfeez, and Jolly Phonics." },
            { icon: Heart, title: "Moral values", text: SCHOOL.vision },
            { icon: Shield, title: "A safe start", text: "Kindergarten to Primary 5 in Ogaminana, Adavi LGA." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-brand">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2 md:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gold">Our story</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-brand">A school rooted in faith and learning</h2>
            <p className="mt-4 leading-relaxed text-muted">
              {SCHOOL.name} is in {SCHOOL.address}. We raise children who can read, reason, and live with Allah&apos;s
              consciousness — through qualified teachers, a Montessori and phonics foundation, and a close school
              community.
            </p>
            <Link href={pageHref("/about")} className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-brand hover:underline">
              Read about us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Image src={SCHOOL.photos.speechGirl} alt="A pupil presenting at a school gathering" width={480} height={360} className="h-40 w-full rounded-2xl object-cover md:h-52" />
            <Image src={SCHOOL.photos.group} alt="Pupils of M-Scholars' Academy" width={480} height={360} className="h-40 w-full rounded-2xl object-cover md:h-52" />
            <Image src={SCHOOL.photos.welcome} alt="Welcome gathering at M-Scholars' Academy" width={480} height={360} className="col-span-2 h-44 w-full rounded-2xl object-cover md:h-56" />
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="font-display text-3xl font-semibold text-brand">Now admitting · {SCHOOL.session}</h2>
          <p className="mt-2 text-muted">Limited spaces. Register today.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SCHOOL.levels.map((level) => (
              <div key={level.name} className="card-shadow rounded-2xl border border-border bg-cream p-5">
                <h3 className="font-display text-lg font-semibold text-brand">{level.name}</h3>
                <p className="mt-2 text-sm text-muted">{level.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 text-white">
        <Image src={SCHOOL.photos.welcome} alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-brand/88" />
        <div className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
          <p className="font-display text-2xl font-semibold md:text-3xl">{SCHOOL.motto}</p>
          <p className="mt-3 text-white/80">{SCHOOL.tagline}</p>
          <Link
            href={pageHref("/admissions")}
            className="mt-8 inline-flex min-h-11 rounded-xl bg-gold px-8 py-3.5 font-semibold text-brand hover:bg-[#d4b03c]"
          >
            Start admission
          </Link>
        </div>
      </section>
    </>
  );
}
