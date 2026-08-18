/** Sample-record ids. Real vaults must never keep these. */
export const DEMO_IDS = {
  users: new Set(["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"]),
  classes: new Set(["c1", "c2", "c3", "c4", "c5"]),
  students: new Set(["s1", "s2", "s3", "s4", "s5"]),
  feeStructures: new Set(["fs1", "fs2", "fs3"]),
  invoices: new Set(["inv1", "inv2", "inv3", "inv4", "inv5"]),
  payments: new Set(["pay1", "pay2", "pay3", "pay4"]),
  income: new Set(["inc1", "inc2", "inc3"]),
  expenditure: new Set(["exp1", "exp2", "exp3"]),
  staff: new Set(["st1", "st2", "st3", "st4"]),
  assessments: new Set(["a1", "a2", "a3", "a4", "a5"]),
  assignments: new Set(["hw1", "hw2"]),
  scores: new Set(["sc1", "sc2", "sc3", "sc4"]),
  results: new Set(["r1", "r2", "r3"]),
  registers: new Set(["reg1"]),
  notes: new Set(["n1", "n2"]),
  threads: new Set(["t1"]),
  messages: new Set(["m1", "m2"]),
  notifications: new Set(["notif1", "notif2", "notif3", "notif4"]),
};

export function isDemoRecordId(id: string, kind: keyof typeof DEMO_IDS): boolean {
  return DEMO_IDS[kind].has(id);
}
