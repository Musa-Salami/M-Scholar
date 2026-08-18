import { SUBJECTS } from "@m-scholar/shared";

export default function AcademicsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-bold text-slate-900">Academics</h1>
      <p className="mt-2 text-lg text-slate-500">A rigorous curriculum from Nursery to Senior Secondary</p>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {[
          { level: "Nursery & Primary", desc: "Foundation literacy, numeracy, and creative development for ages 3–11.", subjects: ["English", "Mathematics", "Basic Science", "Creative Arts", "Phonics"] },
          { level: "Junior Secondary (JSS)", desc: "Broad-based curriculum preparing students for senior school specialisation.", subjects: [...SUBJECTS, "French", "Computer Studies"] },
          { level: "Senior Secondary (SS)", desc: "Science, Arts, and Commercial streams with WAEC and NECO preparation.", subjects: ["Core subjects + electives per stream"] },
        ].map(({ level, desc, subjects }) => (
          <div key={level} className="card-shadow rounded-2xl border border-slate-100 bg-white p-6">
            <h2 className="font-display text-xl font-bold text-slate-900">{level}</h2>
            <p className="mt-2 text-sm text-slate-600">{desc}</p>
            <ul className="mt-4 space-y-1">
              {subjects.map((s) => (
                <li key={s} className="text-sm text-slate-700">• {s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 card-shadow rounded-2xl border border-slate-100 bg-white p-8">
        <h2 className="font-display text-xl font-bold text-slate-900">Assessment & Reporting</h2>
        <p className="mt-2 text-slate-600">
          Continuous Assessment (CA) combined with end-of-term examinations. Parents and students
          access results, attendance, and teacher feedback through the school portal in real time.
        </p>
      </div>
    </div>
  );
}
