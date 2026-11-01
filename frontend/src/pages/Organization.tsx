import React, { useState, useMemo, useEffect } from "react";
import {
    Network,
    Users,
    Building2,
    GraduationCap,
    Search,
    Mail,
    Phone,
    MapPin,
    Clock,
    ShieldCheck,
    CheckCircle2,
    Sparkles,
    ChevronDown,
    ChevronRight,
    UserCheck,
    Stethoscope,
    Pencil,
    Plus,
    Trash2,
    X,
    Save,
    RotateCcw,
    AlertCircle,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface OrgMember {
    id: string;
    name: string;
    role: string;
    department: string;
    credentials: string;
    level: number;
    email: string;
    phone: string;
    location: string;
    dutyHours: string;
    status: "Active Duty" | "In Clinic" | "On Call" | "Administrative";
    avatarBg: string;
    badgeColor: string;
    responsibilities: string[];
    reportsTo?: string;
}

export type OrgCategory = "clinic" | "admin" | "interns";

/* ─── Organization Data ──────────────────────────────────────────────────── */
export const ORG_DATA: Record<
    OrgCategory,
    {
        title: string;
        tagline: string;
        icon: React.ReactNode;
        members: OrgMember[];
    }
> = {
    clinic: {
        title: "Clinic Healthcare Team",
        tagline: "Medical officers, clinical nurses, midwives, and healthcare specialists serving the TCC campus daily.",
        icon: <Stethoscope size={18} />,
        members: [
            {
                id: "c-1",
                name: "Dr. Maria Elena Ramos, MD",
                role: "College Medical Officer / Head Physician",
                department: "Health Services & Diagnostics",
                credentials: "Doctor of Medicine (MD) · Board Certified",
                level: 1,
                email: "dr.ramos@tcc.edu.ph",
                phone: "+63 (088) 555-0101",
                location: "Baluarte Campus Clinic · Room 101",
                dutyHours: "Mon - Thu · 8:00 AM - 5:00 PM",
                status: "In Clinic",
                avatarBg: "bg-[#70091f]",
                badgeColor: "bg-[#70091f]/10 text-[#70091f] border-[#70091f]/30 dark:bg-[#70091f]/30 dark:text-[#fcebe7]",
                responsibilities: [
                    "Directs campus health policy and patient diagnosis",
                    "Conducts routine student & faculty clinical evaluations",
                    "Supervises prescription dispensations and emergency protocols",
                ],
            },
            {
                id: "c-2",
                name: "Angel Santos, RN, MAN",
                role: "Head Nurse & Clinic Coordinator",
                department: "Nursing & Clinic Operations",
                credentials: "BS Nursing · Master of Arts in Nursing (MAN)",
                level: 2,
                email: "angel.santos@tcc.edu.ph",
                phone: "+63 (088) 555-0102",
                location: "Baluarte Campus Clinic · Triage Station",
                dutyHours: "Mon - Fri · 7:30 AM - 4:30 PM",
                status: "Active Duty",
                avatarBg: "bg-[#8b1505]",
                badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
                reportsTo: "c-1",
                responsibilities: [
                    "Coordinates day-to-day clinic visits and patient intake",
                    "Manages student vital signs and immunization tracking",
                    "Supervises junior staff nurses and clinical interns",
                ],
            },
            {
                id: "c-3",
                name: "Carmela Bautista, RN",
                role: "Staff Nurse (Primary Care & Triage)",
                department: "Primary Healthcare Unit",
                credentials: "BS Nursing · Registered Nurse (RN)",
                level: 3,
                email: "carmela.bautista@tcc.edu.ph",
                phone: "+63 (088) 555-0103",
                location: "Baluarte Campus Clinic · Bed Ward 1",
                dutyHours: "Mon - Fri · 8:00 AM - 5:00 PM",
                status: "Active Duty",
                avatarBg: "bg-[#5c0819]",
                badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
                reportsTo: "c-2",
                responsibilities: [
                    "First aid treatment and wound dressing",
                    "Patient vital signs recording and consultation logs",
                    "Assisting physician in student physical examinations",
                ],
            },
            {
                id: "c-4",
                name: "Jocelyn Dela Cruz, RM, RN",
                role: "Staff Midwife & Maternal Health Specialist",
                department: "Maternal & Reproductive Healthcare",
                credentials: "Registered Midwife (RM) · Registered Nurse (RN)",
                level: 3,
                email: "jocelyn.delacruz@tcc.edu.ph",
                phone: "+63 (088) 555-0104",
                location: "Baluarte Campus Clinic · Examination Room",
                dutyHours: "Mon - Fri · 8:00 AM - 5:00 PM",
                status: "Active Duty",
                avatarBg: "bg-[#a31a08]",
                badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
                reportsTo: "c-2",
                responsibilities: [
                    "Maternal and reproductive health counseling",
                    "Fetal Doppler monitoring and routine vitals assessment",
                    "Women's health wellness education seminars",
                ],
            },
            {
                id: "c-5",
                name: "Mark Anthony Dizon, RN",
                role: "Emergency & First Aid Nurse",
                department: "Emergency Response & Triage",
                credentials: "BS Nursing · BLS / ACLS Certified",
                level: 3,
                email: "mark.dizon@tcc.edu.ph",
                phone: "+63 (088) 555-0105",
                location: "Baluarte Campus Clinic · Emergency Bay",
                dutyHours: "Mon - Fri · 8:00 AM - 5:00 PM",
                status: "On Call",
                avatarBg: "bg-[#70091f]",
                badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
                reportsTo: "c-2",
                responsibilities: [
                    "Emergency trauma response on campus grounds",
                    "Maintenance of emergency kit, oxygen, and stretchers",
                    "CPR and emergency medical transport coordination",
                ],
            },
            {
                id: "c-6",
                name: "Kristine Mae Perez, RPh",
                role: "Clinic Pharmacist & Dispensary Custodian",
                department: "Pharmacy & Medicine Inventory",
                credentials: "BS Pharmacy · Registered Pharmacist (RPh)",
                level: 4,
                email: "kristine.perez@tcc.edu.ph",
                phone: "+63 (088) 555-0106",
                location: "Baluarte Campus Clinic · Pharmacy Room",
                dutyHours: "Mon - Fri · 8:30 AM - 4:30 PM",
                status: "Active Duty",
                avatarBg: "bg-[#480613]",
                badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
                reportsTo: "c-2",
                responsibilities: [
                    "Medicine stock tracking, expiration audits & re-ordering",
                    "Safe prescription dispensing and dosage instructions",
                    "Inventory logging on the digital clinic management system",
                ],
            },
            {
                id: "c-7",
                name: "Ryan Paul Villanueva",
                role: "Medical Records Officer & Health Data Custodian",
                department: "Health Records & Statistics",
                credentials: "BS Information Technology · Health Records Specialist",
                level: 4,
                email: "ryan.villanueva@tcc.edu.ph",
                phone: "+63 (088) 555-0107",
                location: "Baluarte Campus Clinic · Archive Section",
                dutyHours: "Mon - Fri · 8:00 AM - 5:00 PM",
                status: "In Clinic",
                avatarBg: "bg-[#2e030c]",
                badgeColor: "bg-stone-50 text-stone-700 border-stone-200 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-700",
                reportsTo: "c-2",
                responsibilities: [
                    "Maintenance of student digital and physical health folders",
                    "Processing medical certificates and clearance documents",
                    "Generation of monthly health statistics and clinic analytics",
                ],
            },
        ],
    },
    admin: {
        title: "College Administration & Health Services",
        tagline: "Executive leadership guiding health governance, institutional accreditation, and campus student welfare.",
        icon: <Building2 size={18} />,
        members: [
            {
                id: "a-1",
                name: "Dr. Lincoln V. Tan, EdD",
                role: "College President",
                department: "Office of the President",
                credentials: "Doctor of Education (EdD) · Institutional Head",
                level: 1,
                email: "president@tcc.edu.ph",
                phone: "+63 (088) 555-0001",
                location: "TCC Administration Building · Executive Suite",
                dutyHours: "Mon - Fri · 8:00 AM - 5:00 PM",
                status: "Administrative",
                avatarBg: "bg-[#70091f]",
                badgeColor: "bg-[#70091f]/10 text-[#70091f] border-[#70091f]/30 dark:bg-[#70091f]/30 dark:text-[#fcebe7]",
                responsibilities: [
                    "Institutional direction and educational governance",
                    "Sanctioning campus health & safety operational budgets",
                    "Liaison with municipal government and healthcare partners",
                ],
            },
            {
                id: "a-2",
                name: "Dr. Rebecca S. Reyes, PhD",
                role: "Vice President for Academic Affairs",
                department: "Academic Affairs Directorate",
                credentials: "PhD in Educational Leadership · ALCUCOA Lead Evaluator",
                level: 2,
                email: "vpaa@tcc.edu.ph",
                phone: "+63 (088) 555-0002",
                location: "TCC Administration Building · 2nd Floor",
                dutyHours: "Mon - Fri · 8:00 AM - 5:00 PM",
                status: "Administrative",
                avatarBg: "bg-[#8b1505]",
                badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
                reportsTo: "a-1",
                responsibilities: [
                    "Academic integration of campus healthcare programs",
                    "Institutional medical requirements for enrolled students",
                    "Faculty wellness and health development programs",
                ],
            },
            {
                id: "a-3",
                name: "Prof. Rowena G. Alcantara, RN, MN",
                role: "Dean, College of Nursing & Midwifery",
                department: "College of Nursing & Health Sciences",
                credentials: "BS Nursing · Master of Nursing (MN)",
                level: 3,
                email: "dean.nursing@tcc.edu.ph",
                phone: "+63 (088) 555-0003",
                location: "Health Sciences Building · Dean's Office",
                dutyHours: "Mon - Fri · 8:00 AM - 5:00 PM",
                status: "Active Duty",
                avatarBg: "bg-[#5c0819]",
                badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
                reportsTo: "a-2",
                responsibilities: [
                    "Supervision of nursing & midwifery clinical affiliations",
                    "Clinical curriculum and competency standards",
                    "Collaboration between academic department & campus clinic",
                ],
            },
            {
                id: "a-4",
                name: "Prof. Edgardo M. Morales, MAEd",
                role: "Dean of Student Affairs & Services",
                department: "Student Affairs and Services (SAS)",
                credentials: "MA in Educational Management",
                level: 3,
                email: "osas@tcc.edu.ph",
                phone: "+63 (088) 555-0004",
                location: "Student Center · Room 204",
                dutyHours: "Mon - Fri · 8:00 AM - 5:00 PM",
                status: "Administrative",
                avatarBg: "bg-[#480613]",
                badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
                reportsTo: "a-1",
                responsibilities: [
                    "Student welfare and emergency crisis assistance",
                    "Campus-wide annual medical and dental checkup drives",
                    "Coordination of medical clearance for collegiate athletes",
                ],
            },
        ],
    },
    interns: {
        title: "Clinical Training & Midwifery Interns",
        tagline: "Clinical preceptors, senior student nurses, and student health aides supporting daily campus consultations.",
        icon: <GraduationCap size={18} />,
        members: [
            {
                id: "i-1",
                name: "Prof. Teresa G. Mercado, RN, MAN",
                role: "Lead Clinical Instructor & Preceptor",
                department: "Clinical Nursing Department",
                credentials: "BS Nursing · Clinical Preceptor Certified",
                level: 1,
                email: "teresa.mercado@tcc.edu.ph",
                phone: "+63 (088) 555-0201",
                location: "Clinic Simulation Lab & Campus Clinic",
                dutyHours: "Mon - Thu · 7:30 AM - 4:30 PM",
                status: "In Clinic",
                avatarBg: "bg-[#70091f]",
                badgeColor: "bg-[#70091f]/10 text-[#70091f] border-[#70091f]/30 dark:bg-[#70091f]/30 dark:text-[#fcebe7]",
                responsibilities: [
                    "Oversees student clinical duty rotations and hands-on drills",
                    "Evaluates vital signs, maternity assessments and charting",
                    "Conducts bedside patient care orientation and debriefs",
                ],
            },
            {
                id: "i-2",
                name: "Prof. Arthur J. Lopez, RM, RN",
                role: "Maternal Health Training Supervisor",
                department: "Midwifery Clinical Training",
                credentials: "Registered Midwife · Registered Nurse",
                level: 1,
                email: "arthur.lopez@tcc.edu.ph",
                phone: "+63 (088) 555-0202",
                location: "Maternal Health Station",
                dutyHours: "Tue - Fri · 8:00 AM - 5:00 PM",
                status: "Active Duty",
                avatarBg: "bg-[#8b1505]",
                badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
                responsibilities: [
                    "Instructs Fetal Doppler usage and palpation techniques",
                    "Conducts prenatal counseling training with interns",
                    "Monitors accuracy of clinic maternal care logs",
                ],
            },
            {
                id: "i-3",
                name: "Bea Patricia Salcedo",
                role: "Senior Nursing Intern (Team Lead)",
                department: "Intern Duty Shift A",
                credentials: "BS Nursing · 4th Year Senior Intern",
                level: 2,
                email: "salcedo.bea@tcc.edu.ph",
                phone: "+63 (088) 555-0203",
                location: "Campus Clinic · Duty Station 1",
                dutyHours: "Mon - Wed · 8:00 AM - 4:00 PM",
                status: "Active Duty",
                avatarBg: "bg-[#5c0819]",
                badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
                reportsTo: "i-1",
                responsibilities: [
                    "Coordinates intern clinical duty assignments",
                    "Performs blood pressure, pulse, and temperature triage",
                    "Assists nurses in patient intake documentation",
                ],
            },
            {
                id: "i-4",
                name: "Dianne Nicole Castro",
                role: "Senior Midwifery Intern (Clinical Duty)",
                department: "Intern Duty Shift B",
                credentials: "Diploma in Midwifery · Senior Clinical Duty",
                level: 2,
                email: "castro.dianne@tcc.edu.ph",
                phone: "+63 (088) 555-0204",
                location: "Campus Clinic · Examination Bay",
                dutyHours: "Wed - Fri · 8:00 AM - 4:00 PM",
                status: "Active Duty",
                avatarBg: "bg-[#a31a08]",
                badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
                reportsTo: "i-2",
                responsibilities: [
                    "Bedside patient assistance and maternal care checks",
                    "Prepares ultrasound gel and Doppler instruments",
                    "Health education handout distribution",
                ],
            },
            {
                id: "i-5",
                name: "Joshua Dave Mendoza",
                role: "Nursing Intern (Triage & First Aid)",
                department: "Intern Duty Shift A",
                credentials: "BS Nursing · 3rd Year Clinical Student",
                level: 3,
                email: "mendoza.joshua@tcc.edu.ph",
                phone: "+63 (088) 555-0205",
                location: "Campus Clinic · Triage Counter",
                dutyHours: "Mon - Tue · 8:00 AM - 4:00 PM",
                status: "In Clinic",
                avatarBg: "bg-[#480613]",
                badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
                reportsTo: "i-3",
                responsibilities: [
                    "Student patient queuing and physical distance management",
                    "Routine heights, weights, and BMI calculation",
                    "Restocking bedside supplies and cotton swabs",
                ],
            },
            {
                id: "i-6",
                name: "Alyssa Marie Cruz",
                role: "Campus Health Aide & Youth Volunteer",
                department: "Red Cross Youth Council · TCC Chapter",
                credentials: "Certified First Aider · Red Cross Youth Volunteer",
                level: 3,
                email: "cruz.alyssa@tcc.edu.ph",
                phone: "+63 (088) 555-0206",
                location: "Student Center / Clinic Lobby",
                dutyHours: "Flexible · Event Deployment",
                status: "On Call",
                avatarBg: "bg-[#70091f]",
                badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
                reportsTo: "i-3",
                responsibilities: [
                    "Campus athletic event first-aid assistance",
                    "Blood letting drive coordinator volunteer",
                    "Health awareness campaign liaison",
                ],
            },
        ],
    },
};

/* ─── Helpers & Storage ─────────────────────────────────────────────────── */
const STORAGE_KEY = "tcc_organization_data_v1";

export function getBadgeColorForStatus(status: OrgMember["status"]): string {
    switch (status) {
        case "Active Duty":
            return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
        case "In Clinic":
            return "bg-[#70091f]/10 text-[#70091f] border-[#70091f]/30 dark:bg-[#70091f]/30 dark:text-[#fcebe7]";
        case "On Call":
            return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
        case "Administrative":
            return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
        default:
            return "bg-stone-50 text-stone-700 border-stone-200";
    }
}

export function getAvatarBgForLevel(level: number): string {
    switch (level) {
        case 1:
            return "bg-[#70091f]";
        case 2:
            return "bg-[#8b1505]";
        case 3:
            return "bg-[#9c182f]";
        case 4:
        default:
            return "bg-[#5c0819]";
    }
}

export function loadStoredOrgData(): typeof ORG_DATA {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.clinic && parsed.admin && parsed.interns) {
                return {
                    clinic: { ...ORG_DATA.clinic, ...parsed.clinic, icon: ORG_DATA.clinic.icon },
                    admin: { ...ORG_DATA.admin, ...parsed.admin, icon: ORG_DATA.admin.icon },
                    interns: { ...ORG_DATA.interns, ...parsed.interns, icon: ORG_DATA.interns.icon },
                };
            }
        }
    } catch (err) {
        console.warn("Failed to read org data from storage", err);
    }
    return ORG_DATA;
}

/* ─── Member Card Component ──────────────────────────────────────────────── */
function MemberCard({
    member,
    isExpanded,
    onToggle,
    onEdit,
}: {
    member: OrgMember;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit?: (member: OrgMember) => void;
}): React.JSX.Element {
    const initials =
        (
            member.name
                .split(" ")
                .filter(
                    (w) =>
                        !["Dr.", "Prof.", "MD", "RN", "MAN", "RM", "RPh", "EdD", "PhD"].includes(w)
                )
                .slice(0, 2)
                .map((w) => w[0])
                .join("") || member.name.slice(0, 2)
        ).toUpperCase() || "TC";

    return (
        <div
            className={[
                "group relative flex flex-col rounded-2xl border transition-all duration-300 bg-white p-5 shadow-sm dark:bg-[#201a14] dark:border-[#3d3328]",
                isExpanded
                    ? "ring-2 ring-[#70091f] border-[#70091f] shadow-lg dark:ring-[#d4a017] dark:border-[#d4a017]"
                    : "hover:border-[#70091f]/40 hover:shadow-md dark:hover:border-[#d4a017]/40",
            ].join(" ")}
        >
            {/* Header row: Avatar + Name + Status + Edit */}
            <div className="flex items-start gap-3.5">
                {/* Avatar with initials and level badge */}
                <div
                    className={[
                        "relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-white font-bold text-base shadow-md ring-2 ring-white/50 dark:ring-black/40",
                        member.avatarBg || "bg-[#70091f]",
                    ].join(" ")}
                >
                    <span>{initials}</span>
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d4a017] text-[10px] font-extrabold text-[#140307] shadow ring-1 ring-white">
                        L{member.level}
                    </span>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <h3 className="text-base font-bold text-stone-900 truncate dark:text-stone-100">
                            {member.name}
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <span
                                className={[
                                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                                    member.badgeColor,
                                ].join(" ")}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {member.status}
                            </span>
                            {onEdit && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(member);
                                    }}
                                    title="Edit personnel details"
                                    className="flex h-6 w-6 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 shadow-xs transition hover:border-[#70091f]/50 hover:bg-[#fae1dc]/40 hover:text-[#70091f] active:scale-95 dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-400 dark:hover:text-[#f38a7c]"
                                    aria-label={"Edit " + member.name}
                                >
                                    <Pencil size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-xs font-semibold text-[#70091f] mt-0.5 dark:text-[#f38a7c]">
                        {member.role}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate dark:text-stone-400">
                        {member.credentials || "Member"}
                    </p>
                </div>
            </div>

            {/* Department tag */}
            <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
                <Building2 size={13} className="text-[#70091f] shrink-0 dark:text-[#d4a017]" />
                <span className="truncate font-medium">{member.department}</span>
            </div>

            {/* Contact details */}
            <div className="mt-2.5 space-y-1 text-xs text-stone-500 dark:text-stone-400 border-t border-stone-100 pt-2.5 dark:border-stone-800">
                <div className="flex items-center gap-2 truncate">
                    <MapPin size={12} className="text-stone-400 shrink-0" />
                    <span className="truncate">{member.location}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                    <Clock size={12} className="text-stone-400 shrink-0" />
                    <span className="truncate">{member.dutyHours}</span>
                </div>
            </div>

            {/* Expandable Key Responsibilities */}
            <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex w-full items-center justify-between text-xs font-semibold text-[#70091f] hover:text-[#8b1505] transition-colors dark:text-[#e1ccb0] dark:hover:text-[#fcebe7]"
                >
                    <span>Key Duties &amp; Scope ({member.responsibilities?.length || 0})</span>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isExpanded && (
                    <ul className="mt-2 space-y-1.5 pl-1 text-[11px] text-stone-600 dark:text-stone-300 animate-fadeIn">
                        {Array.isArray(member.responsibilities) && member.responsibilities.length > 0 ? (
                            member.responsibilities.map((resp, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-left">
                                    <CheckCircle2 size={12} className="text-[#d4a017] shrink-0 mt-0.5" />
                                    <span>{resp}</span>
                                </li>
                            ))
                        ) : (
                            <li className="text-[11px] italic text-stone-400">
                                No specific duties registered.
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {/* Quick Contact Footer */}
            <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 dark:border-stone-800">
                <a
                    href={"mailto:" + member.email}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-600 hover:text-[#70091f] transition-colors dark:text-stone-400 dark:hover:text-[#d4a017]"
                >
                    <Mail size={12} />
                    <span className="truncate">{member.email || "No email"}</span>
                </a>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        Level {member.level}
                    </span>
                    {onEdit && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(member);
                            }}
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-[#70091f] hover:bg-[#fae1dc]/50 transition dark:text-[#f38a7c] dark:hover:bg-[#70091f]/20"
                        >
                            <Pencil size={11} />
                            <span>Edit</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Member Edit / Add Modal ─────────────────────────────────────────────── */
function MemberEditModal({
    isOpen,
    onClose,
    member,
    isNew,
    onSave,
    onDelete,
}: {
    isOpen: boolean;
    onClose: () => void;
    member: OrgMember | null;
    isNew: boolean;
    onSave: (updated: OrgMember) => void;
    onDelete?: (id: string) => void;
}): React.JSX.Element | null {
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [department, setDepartment] = useState("");
    const [credentials, setCredentials] = useState("");
    const [level, setLevel] = useState<number>(3);
    const [status, setStatus] = useState<OrgMember["status"]>("Active Duty");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [dutyHours, setDutyHours] = useState("");
    const [responsibilitiesText, setResponsibilitiesText] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (member) {
            setName(member.name || "");
            setRole(member.role || "");
            setDepartment(member.department || "");
            setCredentials(member.credentials || "");
            setLevel(member.level || 3);
            setStatus(member.status || "Active Duty");
            setEmail(member.email || "");
            setPhone(member.phone || "");
            setLocation(member.location || "");
            setDutyHours(member.dutyHours || "");
            setResponsibilitiesText((member.responsibilities || []).join("\n"));
            setError(null);
        }
    }, [member]);

    if (!isOpen || !member) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Full Name is required.");
            return;
        }
        if (!role.trim()) {
            setError("Role or Position title is required.");
            return;
        }

        const responsibilities = responsibilitiesText
            .split("\n")
            .map((r) => r.trim())
            .filter(Boolean);

        const updated: OrgMember = {
            ...member,
            name: name.trim(),
            role: role.trim(),
            department: department.trim() || "Health Services",
            credentials: credentials.trim() || "Licensed Staff",
            level: Number(level),
            status,
            email: email.trim() || "clinic@tcc.edu.ph",
            phone: phone.trim() || "+63 (088) 555-0100",
            location: location.trim() || "Baluarte Campus Clinic",
            dutyHours: dutyHours.trim() || "Mon - Fri · 8:00 AM - 5:00 PM",
            avatarBg: member.avatarBg || getAvatarBgForLevel(Number(level)),
            badgeColor: getBadgeColorForStatus(status),
            responsibilities:
                responsibilities.length > 0
                    ? responsibilities
                    : ["Campus health care service and patient monitoring"],
        };

        onSave(updated);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div
                className="relative flex flex-col w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-stone-200 dark:bg-[#201a14] dark:border-[#3d3328]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50/80 dark:bg-[#251f19] dark:border-[#382f25]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#70091f] text-white shadow-sm">
                            {isNew ? <Plus size={20} /> : <Pencil size={18} />}
                        </div>
                        <div>
                            <h2 id="modal-headline" className="text-base font-bold text-stone-900 dark:text-stone-100">
                                {isNew ? "Add Organization Personnel" : "Edit Personnel Details"}
                            </h2>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                {isNew
                                    ? "Add a new member to this organizational team"
                                    : "Updating details for " + (member.name || "personnel")}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 transition dark:hover:bg-[#342820] dark:hover:text-stone-200"
                        aria-label="Close dialog"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
                    {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                            <AlertCircle size={16} className="shrink-0 text-red-600" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                Full Name <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Dr. Maria Elena Ramos, MD"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/20 dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-100"
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                Role / Title <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Head Nurse & Clinic Coordinator"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/20 dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-100"
                            />
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                Department / Unit
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Health Services & Diagnostics"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/20 dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-100"
                            />
                        </div>

                        {/* Credentials */}
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                Credentials &amp; Certifications
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. BS Nursing · Registered Nurse (RN)"
                                value={credentials}
                                onChange={(e) => setCredentials(e.target.value)}
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/20 dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-100"
                            />
                        </div>

                        {/* Level */}
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                Hierarchy Level
                            </label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(Number(e.target.value))}
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/20 dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-100"
                            >
                                <option value={1}>Level 1 · Executive Directorate</option>
                                <option value={2}>Level 2 · Supervisory &amp; Coordination</option>
                                <option value={3}>Level 3 · Clinical Staff &amp; Specialists</option>
                                <option value={4}>Level 4 · Support &amp; Records Unit</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                Duty Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as OrgMember["status"])}
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/20 dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-100"
                            >
                                <option value="Active Duty">Active Duty</option>
                                <option value="In Clinic">In Clinic</option>
                                <option value="On Call">On Call</option>
                                <option value="Administrative">Administrative</option>
                            </select>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="e.g. angel.santos@tcc.edu.ph"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/20 dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-100"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                Phone / Local Extension
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. +63 (088) 555-0102"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/20 dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-100"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                Clinic Location / Office
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Baluarte Campus Clinic · Triage Station"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/20 dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-100"
                            />
                        </div>

                        {/* Duty Hours */}
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                Duty Schedule / Hours
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Mon - Fri · 7:30 AM - 4:30 PM"
                                value={dutyHours}
                                onChange={(e) => setDutyHours(e.target.value)}
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/20 dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-100"
                            />
                        </div>
                    </div>

                    {/* Key Responsibilities */}
                    <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                            Key Duties &amp; Responsibilities (one per line)
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Directs campus health policy and patient diagnosis&#10;Conducts routine student & faculty clinical evaluations&#10;Supervises prescription dispensations and emergency protocols"
                            value={responsibilitiesText}
                            onChange={(e) => setResponsibilitiesText(e.target.value)}
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/20 dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-100"
                        />
                        <p className="mt-1 text-[11px] text-stone-400">
                            Press Enter after each duty to create separate bullet points on the member card.
                        </p>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
                        <div>
                            {!isNew && onDelete && (
                                <button
                                    type="button"
                                    onClick={() => onDelete(member.id)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition active:scale-95 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                                >
                                    <Trash2 size={14} />
                                    <span>Remove Member</span>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#70091f] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#8b1505] transition active:scale-95"
                            >
                                <Save size={14} />
                                <span>{isNew ? "Add to Chart" : "Save Changes"}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── Main Organization Component ────────────────────────────────────────── */
export default function Organization(): React.JSX.Element {
    const [selectedCategory, setSelectedCategory] = useState<OrgCategory>("clinic");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedMembers, setExpandedMembers] = useState<Record<string, boolean>>({
        "c-1": true,
        "a-1": true,
        "i-1": true,
    });
    const [viewMode, setViewMode] = useState<"hierarchy" | "directory">("hierarchy");

    // Dynamic organization data initialized from localStorage or defaults
    const [orgData, setOrgData] = useState<typeof ORG_DATA>(() => loadStoredOrgData());
    const [editingMember, setEditingMember] = useState<OrgMember | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [hasCustomChanges, setHasCustomChanges] = useState<boolean>(() => {
        try {
            return Boolean(localStorage.getItem(STORAGE_KEY));
        } catch {
            return false;
        }
    });

    const activeGroup = orgData[selectedCategory];

    /* Filter members by search */
    const filteredMembers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return activeGroup.members;
        return activeGroup.members.filter(
            (m) =>
                m.name.toLowerCase().includes(query) ||
                m.role.toLowerCase().includes(query) ||
                m.department.toLowerCase().includes(query) ||
                m.credentials.toLowerCase().includes(query)
        );
    }, [activeGroup, searchQuery]);

    /* Group by hierarchy levels */
    const levelGroups = useMemo(() => {
        const groups: Record<number, OrgMember[]> = {};
        filteredMembers.forEach((m) => {
            if (!groups[m.level]) groups[m.level] = [];
            groups[m.level].push(m);
        });
        return groups;
    }, [filteredMembers]);

    const toggleMember = (id: string) => {
        setExpandedMembers((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const expandAll = () => {
        const all: Record<string, boolean> = {};
        activeGroup.members.forEach((m) => {
            all[m.id] = true;
        });
        setExpandedMembers(all);
    };

    const collapseAll = () => {
        setExpandedMembers({});
    };

    const handleOpenEdit = (member: OrgMember) => {
        setIsCreatingNew(false);
        setEditingMember(member);
    };

    const handleOpenCreate = () => {
        const newTemplate: OrgMember = {
            id: "custom-" + Date.now(),
            name: "",
            role: "",
            department:
                selectedCategory === "clinic"
                    ? "Health Services & Diagnostics"
                    : selectedCategory === "admin"
                    ? "College Administration"
                    : "Clinical Internship Unit",
            credentials: "",
            level: 3,
            email: "",
            phone: "+63 (088) 555-0100",
            location: "Baluarte Campus Clinic",
            dutyHours: "Mon - Fri · 8:00 AM - 5:00 PM",
            status: "Active Duty",
            avatarBg: "bg-[#70091f]",
            badgeColor: getBadgeColorForStatus("Active Duty"),
            responsibilities: [],
        };
        setIsCreatingNew(true);
        setEditingMember(newTemplate);
    };

    const handleSaveMember = (updated: OrgMember) => {
        setOrgData((prev) => {
            const currentMembers = prev[selectedCategory].members;
            let newMembers: OrgMember[];
            if (isCreatingNew || !currentMembers.some((m) => m.id === updated.id)) {
                newMembers = [updated, ...currentMembers];
            } else {
                newMembers = currentMembers.map((m) => (m.id === updated.id ? updated : m));
            }
            const nextData = {
                ...prev,
                [selectedCategory]: {
                    ...prev[selectedCategory],
                    members: newMembers,
                },
            };
            try {
                const toSave = {
                    clinic: { ...nextData.clinic, icon: undefined },
                    admin: { ...nextData.admin, icon: undefined },
                    interns: { ...nextData.interns, icon: undefined },
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
                setHasCustomChanges(true);
            } catch (err) {
                console.error("Failed to save org data", err);
            }
            return nextData;
        });
        setEditingMember(null);
        setIsCreatingNew(false);
    };

    const handleDeleteMember = (memberId: string) => {
        if (!window.confirm("Are you sure you want to remove this personnel member from the organizational chart?")) {
            return;
        }
        setOrgData((prev) => {
            const nextMembers = prev[selectedCategory].members.filter((m) => m.id !== memberId);
            const nextData = {
                ...prev,
                [selectedCategory]: {
                    ...prev[selectedCategory],
                    members: nextMembers,
                },
            };
            try {
                const toSave = {
                    clinic: { ...nextData.clinic, icon: undefined },
                    admin: { ...nextData.admin, icon: undefined },
                    interns: { ...nextData.interns, icon: undefined },
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
                setHasCustomChanges(true);
            } catch (err) {
                console.error("Failed to save org data", err);
            }
            return nextData;
        });
        setEditingMember(null);
        setIsCreatingNew(false);
    };

    const handleResetDefaults = () => {
        if (
            window.confirm(
                "Reset all personnel and organization charts to official institution defaults? All customized edits will be cleared."
            )
        ) {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch {
                // ignore
            }
            setOrgData(ORG_DATA);
            setHasCustomChanges(false);
        }
    };

    return (
        <div className="flex w-full flex-col p-6 lg:p-7">
            {/* ── HEADER BANNER ────────────────────────────────────────── */}
            <div className="relative mb-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#fae1dc] to-[#fcebe7] border border-[#f0ded9] p-6 sm:p-7 dark:from-[#2e0911] dark:to-[#1e050b] dark:border-[#521320]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#70091f] text-white shadow-sm">
                                <Network size={14} />
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#70091f] dark:text-[#f38a7c]">
                                Tagoloan Community College · Health Services
                            </span>
                        </div>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#302820] sm:text-3xl dark:text-white">
                            Organizational Chart
                        </h1>
                        <p className="mt-1 max-w-2xl text-xs text-[#766959] sm:text-sm dark:text-stone-300">
                            Institutional leadership, clinical faculty, staff nurses, and student interns dedicated to campus health and community wellness.
                        </p>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        <div className="rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-center shadow-sm dark:bg-[#251f19] dark:border-[#44382c]">
                            <p className="text-lg font-bold text-[#70091f] dark:text-[#f38a7c]">
                                {orgData.clinic.members.length}
                            </p>
                            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                                Clinic Staff
                            </p>
                        </div>
                        <div className="rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-center shadow-sm dark:bg-[#251f19] dark:border-[#44382c]">
                            <p className="text-lg font-bold text-[#d4a017]">
                                {orgData.interns.members.length}
                            </p>
                            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                                Interns &amp; Aides
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CONTROLS ROW: CHOICE TABS, SEARCH, EDIT ACTIONS & VIEW MODE ────────── */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Category Choice Selector Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                    {(
                        [
                            {
                                key: "clinic",
                                label: "Clinic Healthcare Team",
                                icon: <Stethoscope size={15} />,
                                count: orgData.clinic.members.length,
                            },
                            {
                                key: "admin",
                                label: "College Administration",
                                icon: <Building2 size={15} />,
                                count: orgData.admin.members.length,
                            },
                            {
                                key: "interns",
                                label: "Clinical Instructors & Interns",
                                icon: <GraduationCap size={15} />,
                                count: orgData.interns.members.length,
                            },
                        ] as const
                    ).map((tab) => {
                        const isSelected = selectedCategory === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => {
                                    setSelectedCategory(tab.key);
                                    setSearchQuery("");
                                }}
                                className={[
                                    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm",
                                    isSelected
                                        ? "bg-[#70091f] text-white shadow-md ring-2 ring-[#70091f]/30 dark:bg-[#8b1505]"
                                        : "bg-white text-stone-700 hover:bg-[#fae1dc]/40 hover:text-[#70091f] border border-stone-200 dark:bg-[#251f19] dark:text-stone-300 dark:border-[#382f25] dark:hover:bg-[#342820]",
                                ].join(" ")}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                                <span
                                    className={[
                                        "rounded-full px-1.5 py-0.2 text-[10px] font-extrabold",
                                        isSelected
                                            ? "bg-white/25 text-white"
                                            : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
                                    ].join(" ")}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search & Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative min-w-[200px] flex-1 sm:flex-none">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                            type="text"
                            placeholder="Search name, role, degree..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-3 text-xs text-stone-800 placeholder-stone-400 shadow-sm transition-all focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/20 dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-100 dark:placeholder-stone-500"
                        />
                    </div>

                    {/* Add Personnel Button */}
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#70091f] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#8b1505] active:scale-95"
                    >
                        <Plus size={14} />
                        <span>Add Personnel</span>
                    </button>

                    {/* Reset to Defaults button (if custom edits exist) */}
                    {hasCustomChanges && (
                        <button
                            type="button"
                            onClick={handleResetDefaults}
                            title="Reset all organization data to default records"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-xs hover:border-[#70091f]/40 hover:bg-[#fae1dc]/30 hover:text-[#70091f] transition dark:bg-[#251f19] dark:border-[#382f25] dark:text-stone-300"
                        >
                            <RotateCcw size={13} />
                            <span className="hidden sm:inline">Reset Defaults</span>
                        </button>
                    )}

                    {/* View mode toggle */}
                    <div className="inline-flex rounded-xl border border-stone-200 bg-white p-0.5 shadow-sm dark:bg-[#251f19] dark:border-[#382f25]">
                        <button
                            type="button"
                            onClick={() => setViewMode("hierarchy")}
                            className={[
                                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                                viewMode === "hierarchy"
                                    ? "bg-[#70091f] text-white shadow"
                                    : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100",
                            ].join(" ")}
                        >
                            Hierarchy Tree
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("directory")}
                            className={[
                                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                                viewMode === "directory"
                                    ? "bg-[#70091f] text-white shadow"
                                    : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100",
                            ].join(" ")}
                        >
                            Directory Grid
                        </button>
                    </div>

                    {/* Expand/Collapse All */}
                    <div className="hidden sm:flex items-center gap-1.5 text-xs">
                        <button
                            type="button"
                            onClick={expandAll}
                            className="rounded-lg px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 font-medium"
                        >
                            Expand All
                        </button>
                        <button
                            type="button"
                            onClick={collapseAll}
                            className="rounded-lg px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 font-medium"
                        >
                            Collapse
                        </button>
                    </div>
                </div>
            </div>

            {/* ── ACTIVE CATEGORY BANNER ───────────────────────────────── */}
            <div className="mb-6 rounded-xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-left dark:bg-[#1f1914] dark:border-[#382f25]">
                <p className="text-xs text-stone-600 dark:text-stone-300">
                    <span className="font-bold text-[#70091f] dark:text-[#f38a7c]">
                        {activeGroup.title}:
                    </span>{" "}
                    {activeGroup.tagline}
                </p>
            </div>

            {/* ── HIERARCHICAL TREE VIEW ───────────────────────────────── */}
            {viewMode === "hierarchy" ? (
                <div className="space-y-8">
                    {Object.keys(levelGroups)
                        .map(Number)
                        .sort((a, b) => a - b)
                        .map((level) => {
                            const levelMembers = levelGroups[level];
                            const levelTitle =
                                level === 1
                                    ? "Executive & Medical Directorate"
                                    : level === 2
                                    ? "Supervisory & Nursing Coordination"
                                    : level === 3
                                    ? "Clinical Staff & Specialists"
                                    : "Support, Pharmacy & Records Unit";

                            return (
                                <div key={level} className="relative">
                                    {/* Level separator & badge */}
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 shadow-sm dark:bg-[#251f19] dark:border-[#382f25]">
                                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#70091f] text-[10px] font-bold text-white">
                                                {level}
                                            </span>
                                            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                                {levelTitle}
                                            </span>
                                        </div>
                                        <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
                                    </div>

                                    {/* Cards Grid for this level */}
                                    <div
                                        className={[
                                            "grid gap-5",
                                            levelMembers.length === 1
                                                ? "mx-auto max-w-md"
                                                : levelMembers.length === 2
                                                ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                                                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                                        ].join(" ")}
                                    >
                                        {levelMembers.map((member) => (
                                            <MemberCard
                                                key={member.id}
                                                member={member}
                                                isExpanded={!!expandedMembers[member.id]}
                                                onToggle={() => toggleMember(member.id)}
                                                onEdit={handleOpenEdit}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            ) : (
                /* ── DIRECTORY GRID VIEW ──────────────────────────────── */
                <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredMembers.map((member) => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            isExpanded={!!expandedMembers[member.id]}
                            onToggle={() => toggleMember(member.id)}
                            onEdit={handleOpenEdit}
                        />
                    ))}
                </div>
            )}

            {filteredMembers.length === 0 && (
                <div className="rounded-2xl border border-dashed border-stone-300 p-12 text-center dark:border-stone-700">
                    <Users size={32} className="mx-auto text-stone-400" />
                    <h3 className="mt-3 text-base font-bold text-stone-700 dark:text-stone-300">
                        No personnel found
                    </h3>
                    <p className="mt-1 text-xs text-stone-500">
                        No team members matched "{searchQuery}". Try a different name or title.
                    </p>
                    <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="mt-4 rounded-xl bg-[#70091f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#8b1505]"
                    >
                        Clear Search
                    </button>
                </div>
            )}

            {/* ── MEMBER EDIT / ADD MODAL ──────────────────────────────── */}
            <MemberEditModal
                isOpen={!!editingMember}
                onClose={() => {
                    setEditingMember(null);
                    setIsCreatingNew(false);
                }}
                member={editingMember}
                isNew={isCreatingNew}
                onSave={handleSaveMember}
                onDelete={handleDeleteMember}
            />
        </div>
    );
}
