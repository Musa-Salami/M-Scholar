import Link from "next/link";
import { SCHOOL, PUBLIC_NAV, LOGIN_PORTALS } from "@m-scholar/shared";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <p className="font-display text-xl font-bold text-white">{SCHOOL.name}</p>
          <p className="mt-2 text-sm text-slate-400">{SCHOOL.tagline}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" />{SCHOOL.address}</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" />{SCHOOL.phone}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" />{SCHOOL.email}</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Quick links</p>
          <ul className="mt-3 space-y-2 text-sm">
            {PUBLIC_NAV.map(({ label, href }) => (
              <li key={href}><Link href={href} className="hover:text-white">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Portal login</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/login/student" className="hover:text-white">{LOGIN_PORTALS.student.title}</Link></li>
            <li><Link href="/login/teacher" className="hover:text-white">{LOGIN_PORTALS.teacher.title}</Link></li>
            <li><Link href="/login/parent" className="hover:text-white">{LOGIN_PORTALS.parent.title}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 text-center text-xs text-slate-500 md:px-6">
          <span>© {new Date().getFullYear()} {SCHOOL.name}. All rights reserved.</span>
          <Link
            href="/login/staff"
            title="Staff portal"
            aria-label="Staff portal sign in"
            className="inline-flex items-center text-slate-600 transition hover:text-slate-400"
          >
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </div>    </footer>
  );
}
