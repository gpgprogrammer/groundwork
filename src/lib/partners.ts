import "server-only";
import { getStore } from "@/lib/data/store";
import { SERVICES, type Service, type ServiceKind } from "@/lib/tutoring";

/** A tutoring business applying to be listed as a Merit partner (10% referral fee on booked students). */
export type PartnerApp = {
  id: string;
  businessName: string;
  website: string;
  contactName: string;
  email: string;
  kind: ServiceKind;
  blurb: string;
  /** Empty means every subject. */
  courseIds: string[];
  agreedAt: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  submittedBy: string | null;
};

export async function listPartnerApps() {
  return (await (await getStore()).listDocs<PartnerApp>("partnerApps")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function toService(p: PartnerApp): Service {
  return {
    id: `p-${p.id}`,
    name: p.businessName,
    kind: p.kind,
    blurb: p.blurb,
    url: () => p.website,
    covers: (c) => !c || !p.courseIds.length || p.courseIds.includes(c.id),
    partner: true,
  };
}

/** Approved partners first, then the directory of well-known services. */
export async function allServices(): Promise<Service[]> {
  const partners = (await listPartnerApps()).filter((p) => p.status === "approved").map(toService);
  return [...partners, ...SERVICES];
}

export async function findService(id: string) {
  return (await allServices()).find((s) => s.id === id);
}
