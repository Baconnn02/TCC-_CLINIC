import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Stethoscope,
    Pencil,
    Trash2,
    Search,
    UserRound,
    Activity,
    Plus,
    X,
    Pill,
    CalendarDays,
    CircleHelp,
} from "lucide-react";
import api from "../services/api";
import { ClinicVisitTable, type VisitRecord } from "../components/clinic-visits/ClinicVisitTable";

const EMPTY_FORM = {
    student_id: "",
    faculty_id: "",
    staff_id: "",
    nurse_id: "",
    visit_date: "",
    reason: "",
    symptoms: "",
    temperature: "",
    blood_pressure: "",
    assessment: "",
    treatment: "",
    medicine_id: "",
    medicine_quantity: "",
    remarks: "",
};

const TREATMENTS = [
    "First Aid",
    "Medication",
    "Wound Care",
    "Cold Compress",
    "Hot Compress",
    "Observation",
    "Referral",
    "Other",
];

const normalizeVisitDateSearch = (value) => {
    const usDate = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
    const isoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
    const parts = usDate
        ? [Number(usDate[3]), Number(usDate[1]), Number(usDate[2])]
        : isoDate
          ? [Number(isoDate[1]), Number(isoDate[2]), Number(isoDate[3])]
          : null;

    if (!parts) return "";

    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day, 12);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return "";
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};







const TREATMENTS_WITH_MEDICINE = [
    "First Aid",
    "Medication",
    "Wound Care",
    "Cold Compress",
    "Hot Compress",
];







const treatmentNeedsMedicine = (treatment) => {
    return TREATMENTS_WITH_MEDICINE.includes(
        treatment
    );
};

function ClinicVisits() {
    const [visits, setVisits] = useState<VisitRecord[]>([]);
    const [visitPagination, setVisitPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 25,
    });
    const [students, setStudents] = useState([]);
    const [studentTotal, setStudentTotal] = useState(0);
    const [facultyStaffTotal, setFacultyStaffTotal] = useState(0);
    const [faculties, setFaculties] = useState([]);
    const [staff, setStaff] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [medicines, setMedicines] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [showAddConfirmation, setShowAddConfirmation] = useState(false);
    const [pendingVisitPayload, setPendingVisitPayload] = useState(null);
    const [editingVisit, setEditingVisit] = useState(null);
    const [deleteVisit, setDeleteVisit] = useState<VisitRecord | null>(null);

    const [formData, setFormData] = useState({
        ...EMPTY_FORM,
    });

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [patientSearch, setPatientSearch] = useState("");
    const [showPatientDropdown, setShowPatientDropdown] =
        useState(false);

    const [medicineSearch, setMedicineSearch] = useState("");
    const [showMedicineDropdown, setShowMedicineDropdown] =
        useState(false);







    const normalizeData = (data) => {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return [];
    };

    const getFullName = (person) => {
        if (!person) {
            return "Unknown";
        }

        return `${person.first_name || ""} ${
            person.middle_name || ""
        } ${person.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim();
    };

    const getNurseName = (nurse) => {
        if (!nurse) {
            return "Unknown Nurse";
        }

        if (nurse.name) {
            return nurse.name;
        }

        return getFullName(nurse);
    };

    const getMedicineName = (medicine) => {
        if (!medicine) {
            return "";
        }

        return (
            medicine.medicine_name ||
            medicine.name ||
            medicine.medication_name ||
            medicine.medicine ||
            ""
        );
    };

    const getMedicineUnit = (medicine) => {
        if (!medicine) {
            return "";
        }

        return medicine.unit || "";
    };

    const getMedicineStock = (medicine) => {
        if (!medicine) {
            return 0;
        }

        return Number(medicine.stock || 0);
    };

    const getMedicineTreatment = (medicine) => {
        if (!medicine) {
            return "";
        }

        return String(
            medicine.treatment_type || ""
        ).trim();
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const value = String(date).slice(0, 10);
        const parts = value.split("-");

        if (parts.length !== 3) {
            return value;
        }

        return `${parts[1]}/${parts[2]}/${parts[0]}`;
    };

    const formatDateInput = (date) => {
        if (!date) {
            return "";
        }

        return String(date).slice(0, 10);
    };

    const getToday = () => {
        const today = new Date();

        const year = today.getFullYear();

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const getErrorMessage = (
        error,
        fallback = "Something went wrong."
    ) => {
        const validationErrors =
            error.response?.data?.errors;

        if (validationErrors) {
            const messages = Object.values(
                validationErrors
            )
                .flat()
                .filter(Boolean);

            if (messages.length > 0) {
                return messages.join("\n");
            }
        }

        return (
            error.response?.data?.message ||
            fallback
        );
    };







    const getPatientName = (visit) => {
        if (visit.student) {
            return {
                name: getFullName(visit.student),
                id: visit.student.student_id || "",
                type: "Student",
            };
        }

        if (visit.faculty) {
            return {
                name: getFullName(visit.faculty),
                id: visit.faculty.employee_id || "",
                type: "Faculty",
            };
        }

        if (visit.staff) {
            return {
                name: getFullName(visit.staff),
                id: visit.staff.staff_id || "",
                type: "Staff",
            };
        }

        return {
            name: "Unknown Patient",
            id: "",
            type: "",
        };
    };

    const patientOptions = useMemo(() => {
        return [
            ...students.map((student) => ({
                id: student.id,
                type: "student",
                label: "Student",
                identifier: student.student_id || "",
                name: getFullName(student),
            })),

            ...faculties.map((faculty) => ({
                id: faculty.id,
                type: "faculty",
                label: "Faculty",
                identifier: faculty.employee_id || "",
                name: getFullName(faculty),
            })),

            ...staff.map((person) => ({
                id: person.id,
                type: "staff",
                label: "Staff",
                identifier: person.staff_id || "",
                name: getFullName(person),
            })),
        ];
    }, [students, faculties, staff]);

    const filteredPatients = useMemo(() => {
        const keyword = patientSearch
            .toLowerCase()
            .trim();

        if (!keyword) {
            return patientOptions;
        }

        const tokens = keyword.split(/[\s,]+/).filter((t) => t && t !== "-");

        return patientOptions.filter((patient) => {
            const name = (patient.name || "").toLowerCase();
            const identifier = (patient.identifier || "").toLowerCase();
            const label = (patient.label || "").toLowerCase();
            const combined = `${identifier} ${name} ${label}`;

            if (combined.includes(keyword) || name.includes(keyword) || identifier.includes(keyword)) {
                return true;
            }

            return tokens.length > 0 && tokens.every((token) => combined.includes(token));
        });
    }, [patientOptions, patientSearch]);

    const selectPatient = (patient) => {
        setFormData((previous) => ({
            ...previous,

            student_id:
                patient.type === "student"
                    ? patient.id
                    : "",

            faculty_id:
                patient.type === "faculty"
                    ? patient.id
                    : "",

            staff_id:
                patient.type === "staff"
                    ? patient.id
                    : "",
        }));

        setPatientSearch(
            `${patient.identifier} - ${patient.name}`
        );

        setShowPatientDropdown(false);
    };









    const filteredMedicines = useMemo(() => {
        const keyword = medicineSearch
            .toLowerCase()
            .trim();




        if (
            !treatmentNeedsMedicine(
                formData.treatment
            )
        ) {
            return [];
        }

        const selectedTreatment =
            String(formData.treatment || "")
                .trim()
                .toLowerCase();

        return medicines.filter((medicine) => {
            const medicineTreatment =
                getMedicineTreatment(
                    medicine
                ).toLowerCase();

            const name =
                getMedicineName(
                    medicine
                ).toLowerCase();

            const unit =
                getMedicineUnit(
                    medicine
                ).toLowerCase();








            const treatmentMatches =
                medicineTreatment ===
                    selectedTreatment ||
                medicineTreatment === "all";

            const searchMatches =
                !keyword ||
                name.includes(keyword) ||
                unit.includes(keyword);

            return (
                treatmentMatches &&
                searchMatches
            );
        });
    }, [
        medicines,
        medicineSearch,
        formData.treatment,
    ]);

    const selectedMedicine = useMemo(() => {
        return medicines.find(
            (medicine) =>
                String(medicine.id) ===
                String(formData.medicine_id)
        );
    }, [
        medicines,
        formData.medicine_id,
    ]);

    const selectMedicine = (medicine) => {
        setFormData((previous) => ({
            ...previous,
            medicine_id: medicine.id,
            medicine_quantity: "",
        }));

        setMedicineSearch(
            getMedicineName(medicine)
        );

        setShowMedicineDropdown(false);
    };







    const fetchVisits = useCallback(async (page = 1, searchTerm = "") => {
        try {
            const response =
                await api.get("/clinic-visits", {
                    params: {
                        page,
                        per_page: 25,
                        search: searchTerm.trim() || undefined,
                    },
                });

            setVisits(
                Array.isArray(response.data?.data)
                    ? response.data.data
                    : Array.isArray(response.data)
                      ? response.data
                      : []
            );
            setVisitPagination({
                current_page: response.data?.current_page || 1,
                last_page: response.data?.last_page || 1,
                total: response.data?.total || 0,
                per_page: response.data?.per_page || 25,
            });
        } catch (error) {
            console.error(
                "Error fetching clinic visits:",
                error
            );

            setVisits([]);
            setVisitPagination({
                current_page: 1,
                last_page: 1,
                total: 0,
                per_page: 25,
            });
        }
    }, []);

    const fetchOptions = async () => {
        try {
            const response = await api.get("/clinic-visit-options");
            const options = response.data || {};
            setStudents(normalizeData(options.students));
            setStaff(normalizeData(options.staff));
            setFaculties(normalizeData(options.faculties));
            setNurses(normalizeData(options.nurses));
            setMedicines(normalizeData(options.medicines));
            setStudentTotal(Number(options.totals?.students || 0));
            setFacultyStaffTotal(Number(options.totals?.faculties || 0) + Number(options.totals?.staff || 0));
        } catch (error) {
            console.error("Error fetching clinic visit options:", error);
            setStudents([]);
            setStaff([]);
            setFaculties([]);
            setNurses([]);
            setMedicines([]);
            setStudentTotal(0);
            setFacultyStaffTotal(0);
        }
    };

    const fetchMedicines = async () => {
        try {
            const response = await api.get("/clinic-visit-options", {
                params: { medicine_search: "" },
            });
            setMedicines(normalizeData(response.data?.medicines));
        } catch (error) {
            console.error(
                "Error fetching medicines:",
                error
            );

            setMedicines([]);
        }
    };

    const fetchAllData = async () => {
        setPageLoading(true);

        await Promise.all([
            fetchVisits(),
            fetchOptions(),
        ]);

        setPageLoading(false);
    };

    useEffect(() => {
        const timeout = setTimeout(() => fetchAllData(), 0);

        return () => clearTimeout(timeout);
    }, []);

    const initialVisitSearch = useRef(true);
    useEffect(() => {
        if (initialVisitSearch.current) {
            initialVisitSearch.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            fetchVisits(1, search);
        }, 250);

        return () => clearTimeout(timeout);
    }, [search, fetchVisits]);

    useEffect(() => {
        const term = patientSearch.trim();

        if (!showPatientDropdown) {
            return undefined;
        }

        let cancelled = false;
        const timeout = setTimeout(async () => {
            try {
                const response = await api.get("/clinic-visit-options", {
                    params: term ? { patient_search: term } : {},
                });

                if (!cancelled) {
                    setStudents(normalizeData(response.data?.students));
                    setStaff(normalizeData(response.data?.staff));
                    setFaculties(normalizeData(response.data?.faculties));
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Patient option search error:", error);
                    setStudents([]);
                    setStaff([]);
                    setFaculties([]);
                }
            }
        }, 200);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [patientSearch, showPatientDropdown]);

    useEffect(() => {
        const term = medicineSearch.trim();

        if (!showMedicineDropdown) {
            return undefined;
        }

        let cancelled = false;
        const timeout = setTimeout(async () => {
            try {
                const response = await api.get("/clinic-visit-options", {
                    params: term ? { medicine_search: term } : {},
                });

                if (!cancelled) {
                    setMedicines(normalizeData(response.data?.medicines));
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Medicine option search error:", error);
                    setMedicines([]);
                }
            }
        }, 200);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [medicineSearch, showMedicineDropdown]);







    useEffect(() => {
        const handleMedicineStockUpdated = () => {
            fetchMedicines();
        };

        window.addEventListener(
            "medicine-stock-updated",
            handleMedicineStockUpdated
        );

        return () => {
            window.removeEventListener(
                "medicine-stock-updated",
                handleMedicineStockUpdated
            );
        };
    }, []);







    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleTreatmentChange = (event) => {
        const value = event.target.value;








        setFormData((previous) => ({
            ...previous,
            treatment: value,
            medicine_id: "",
            medicine_quantity: "",
        }));

        setMedicineSearch("");
        setShowMedicineDropdown(false);
    };







    const openAddForm = () => {
        setEditingVisit(null);

        setFormData({
            ...EMPTY_FORM,
            visit_date: getToday(),
        });

        setPatientSearch("");
        setMedicineSearch("");

        setShowPatientDropdown(false);
        setShowMedicineDropdown(false);

        setShowForm(true);
    };







    const handleEdit = (visit) => {
        setEditingVisit(visit);

        const treatment =
            visit.treatment || "";

        setFormData({
            student_id: visit.student_id || "",
            faculty_id: visit.faculty_id || "",
            staff_id: visit.staff_id || "",

            nurse_id:
                visit.nurse_id ||
                visit.nurse?.id ||
                "",

            visit_date: formatDateInput(
                visit.visit_date
            ),

            reason: visit.reason || "",

            symptoms: visit.symptoms || "",

            temperature:
                visit.temperature || "",

            blood_pressure:
                visit.blood_pressure || "",

            assessment:
                visit.assessment || "",

            treatment: treatment,

            medicine_id:
                visit.medicine_id ||
                visit.medicine?.id ||
                "",

            medicine_quantity:
                visit.medicine_quantity || "",

            remarks: visit.remarks || "",
        });

        if (visit.student) {
            setPatientSearch(
                `${visit.student.student_id || ""} - ${getFullName(
                    visit.student
                )}`
            );
        } else if (visit.faculty) {
            setPatientSearch(
                `${visit.faculty.employee_id || ""} - ${getFullName(
                    visit.faculty
                )}`
            );
        } else if (visit.staff) {
            setPatientSearch(
                `${visit.staff.staff_id || ""} - ${getFullName(
                    visit.staff
                )}`
            );
        } else {
            setPatientSearch("");
        }

        setMedicineSearch(
            getMedicineName(visit.medicine)
        );

        setShowPatientDropdown(false);
        setShowMedicineDropdown(false);

        setShowForm(true);
    };







    const persistVisit = async (payload, visitToUpdate = null) => {
        setLoading(true);

        try {
            if (visitToUpdate) {
                await api.put(
                    `/clinic-visits/${visitToUpdate.id}`,
                    payload
                );
                alert("Clinic visit updated successfully.");
            } else {
                await api.post("/clinic-visits", payload);
                alert("Clinic visit added successfully.");
            }

            await Promise.all([
                fetchVisits(
                    visitToUpdate ? visitPagination.current_page : 1,
                    search
                ),
            ]);

            window.dispatchEvent(new Event("medicine-stock-updated"));
            closeForm();
        } catch (error) {
            console.error("Error saving clinic visit:", error);
            alert(
                getErrorMessage(
                    error,
                    "Failed to save clinic visit."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const cancelAddConfirmation = () => {
        if (loading) return;
        setShowAddConfirmation(false);
        setPendingVisitPayload(null);
    };

    const confirmAddVisit = async () => {
        if (!pendingVisitPayload || loading) return;

        const payload = pendingVisitPayload;
        setShowAddConfirmation(false);
        setPendingVisitPayload(null);
        await persistVisit(payload);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        const patientCount = [
            formData.student_id,
            formData.faculty_id,
            formData.staff_id,
        ].filter(Boolean).length;

        if (patientCount === 0) {
            alert(
                "Please select a Student, Faculty, or Staff."
            );
            return;
        }

        if (patientCount > 1) {
            alert(
                "Please select only one patient."
            );
            return;
        }

        if (!formData.nurse_id) {
            alert(
                "Please select a nurse on duty."
            );
            return;
        }

        if (!formData.visit_date) {
            alert(
                "Please select the visit date."
            );
            return;
        }

        if (!editingVisit && formData.visit_date < getToday()) {
            alert("You cannot add a clinic visit for a past date. Select today or a future date.");
            return;
        }

        if (!formData.reason.trim()) {
            alert(
                "Please enter the reason for visit."
            );
            return;
        }





        if (
            treatmentNeedsMedicine(
                formData.treatment
            ) &&
            !formData.medicine_id
        ) {
            alert(
                `Please select a medicine for ${formData.treatment}.`
            );
            return;
        }




        if (
            treatmentNeedsMedicine(
                formData.treatment
            ) &&
            (
                !formData.medicine_quantity ||
                Number(
                    formData.medicine_quantity
                ) < 1
            )
        ) {
            alert(
                "Please enter a valid quantity used."
            );
            return;
        }







        if (
            !editingVisit &&
            treatmentNeedsMedicine(
                formData.treatment
            ) &&
            selectedMedicine &&
            Number(
                formData.medicine_quantity
            ) >
                getMedicineStock(
                    selectedMedicine
                )
        ) {
            alert(
                `Not enough stock. Available stock: ${getMedicineStock(
                    selectedMedicine
                )}.`
            );
            return;
        }

        const payload = {
            student_id:
                formData.student_id || null,

            faculty_id:
                formData.faculty_id || null,

            staff_id:
                formData.staff_id || null,

            nurse_id:
                formData.nurse_id || null,

            visit_date:
                formData.visit_date,

            reason:
                formData.reason.trim(),

            symptoms:
                formData.symptoms.trim() ||
                null,

            temperature:
                formData.temperature.trim() ||
                null,

            blood_pressure:
                formData.blood_pressure.trim() ||
                null,

            assessment:
                formData.assessment.trim() ||
                null,

            treatment:
                formData.treatment || null,

            medicine_id:
                treatmentNeedsMedicine(
                    formData.treatment
                )
                    ? formData.medicine_id ||
                      null
                    : null,

            medicine_quantity:
                treatmentNeedsMedicine(
                    formData.treatment
                )
                    ? Number(
                          formData.medicine_quantity
                      ) || null
                    : null,

            remarks:
                formData.remarks.trim() ||
                null,
        };

        if (editingVisit) {
            await persistVisit(payload, editingVisit);
        } else {
            setPendingVisitPayload(payload);
            setShowAddConfirmation(true);
        }
    };







    const handleDelete = async () => {
        if (!deleteVisit) {
            return;
        }

        try {
            await api.delete(
                `/clinic-visits/${deleteVisit.id}`
            );

            alert(
                "Clinic visit deleted successfully."
            );

            await Promise.all([
                fetchVisits(
                    visits.length === 1 && visitPagination.current_page > 1
                        ? visitPagination.current_page - 1
                        : visitPagination.current_page,
                    search
                ),
            ]);

            window.dispatchEvent(
                new Event(
                    "medicine-stock-updated"
                )
            );
        } catch (error) {
            console.error(
                "Error deleting clinic visit:",
                error
            );

            alert(
                getErrorMessage(
                    error,
                    "Failed to delete clinic visit."
                )
            );
        } finally {
            setDeleteVisit(null);
        }
    };







    const closeForm = () => {
        if (loading) {
            return;
        }

        setShowForm(false);
        setEditingVisit(null);

        setFormData({
            ...EMPTY_FORM,
        });

        setPatientSearch("");
        setMedicineSearch("");

        setShowPatientDropdown(false);
        setShowMedicineDropdown(false);
    };







    const filteredVisits = useMemo(() => {
        const keyword = search
            .toLowerCase()
            .trim();
        const normalizedDate = normalizeVisitDateSearch(keyword);

        if (!keyword) {
            return visits;
        }

        const tokens = keyword.split(/[\s,]+/).filter((t) => t && t !== "-");

        return visits.filter((visit) => {
            const patient =
                getPatientName(visit);

            const nurseName =
                getNurseName(visit.nurse);

            const medicineName =
                getMedicineName(
                    visit.medicine
                );

            const patientInfo = `${patient.id || ""} ${patient.name || ""} ${patient.type || ""}`.toLowerCase();
            const fullContent = `
                ${patient.id || ""}
                ${patient.name || ""}
                ${patient.type || ""}
                ${nurseName}
                ${visit.reason || ""}
                ${visit.treatment || ""}
                ${medicineName}
                ${visit.medicine_quantity || ""}
                ${visit.visit_date || ""}
                ${formatDate(visit.visit_date)}
                ${visit.temperature || ""}
                ${visit.blood_pressure || ""}
                ${visit.remarks || ""}
            `.toLowerCase();

            if (fullContent.includes(keyword) || patientInfo.includes(keyword)) {
                return true;
            }

            if (tokens.length > 0 && tokens.every((token) => fullContent.includes(token))) {
                return true;
            }

            return Boolean(
                normalizedDate &&
                String(visit.visit_date || "").slice(0, 10) === normalizedDate
            );
        });
    }, [visits, search]);







    return (
        <div className="tcc-module-page min-h-screen px-5 py-5 lg:px-6 lg:py-6">
            <div className="mx-auto max-w-[1500px]">


                <div className="tcc-module-header mb-5 rounded-2xl border px-5 py-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]">
                                <Stethoscope size={24} />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a6f50]">
                                    Clinic Management
                                </p>

                                <h1 className="text-2xl font-bold tracking-tight text-[#3d3329]">
                                    Clinic Visits
                                </h1>

                                <p className="mt-1 text-xs text-[#887d70]">
                                    View and manage student,
                                    faculty, and staff
                                    clinic visit records.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={openAddForm}
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#8a6f50] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#735a40]"
                        >
                            <Plus size={17} />
                            Add Clinic Visit
                        </button>
                    </div>
                </div>


                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

                    <div className="rounded-xl border border-[#e8dfd4] bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ebdf] text-[#8a6f50]">
                                <Stethoscope size={19} />
                            </div>

                            <div>
                                <p className="text-xs text-[#887d70]">
                                    Total Visits
                                </p>

                                <p className="text-2xl font-bold text-[#3c332a]">
                                    {visitPagination.total}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#e8dfd4] bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                                <UserRound size={19} />
                            </div>

                            <div>
                                <p className="text-xs text-[#887d70]">
                                    Students
                                </p>

                                <p className="text-2xl font-bold text-[#3c332a]">
                                    {studentTotal}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#e8dfd4] bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                                <UserRound size={19} />
                            </div>

                            <div>
                                <p className="text-xs text-[#887d70]">
                                    Faculty & Staff
                                </p>

                                <p className="text-2xl font-bold text-[#3c332a]">
                                    {facultyStaffTotal}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#e8dfd4] bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                                <Activity size={19} />
                            </div>

                            <div>
                                <p className="text-xs text-[#887d70]">
                                    Nurses
                                </p>

                                <p className="text-2xl font-bold text-[#3c332a]">
                                    {nurses.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>


                {showForm && (
                    <div className="mb-5 rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-sm">

                        <div className="mb-5 flex items-center justify-between border-b border-[#e8dfd4] pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#3d3329]">
                                    {editingVisit
                                        ? "Edit Clinic Visit"
                                        : "Add Clinic Visit"}
                                </h2>

                                <p className="mt-1 text-xs text-[#887d70]">
                                    {editingVisit
                                        ? "Update the clinic visit information."
                                        : "Enter the clinic visit information."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={loading}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#887d70] hover:bg-[#f6f1e9] disabled:opacity-50"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 gap-4 md:grid-cols-2"
                        >


                            <div className="relative">
                                <label className="mb-1.5 block text-xs font-semibold text-[#675948]">
                                    Patient
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <div className="relative">
                                    <Search
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a99d8f]"
                                    />

                                    <input
                                        type="text"
                                        value={patientSearch}
                                        onChange={(event) => {
                                            const nextValue = event.target.value;
                                            setPatientSearch(nextValue);
                                            setShowPatientDropdown(true);

                                            if (!nextValue.trim()) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    student_id: "",
                                                    faculty_id: "",
                                                    staff_id: "",
                                                }));
                                            }
                                        }}
                                        onFocus={() =>
                                            setShowPatientDropdown(
                                                true
                                            )
                                        }
                                        placeholder="Search student, faculty, or staff by ID or name..."
                                        className="w-full rounded-xl border border-[#e8dfd4] bg-white py-3 pl-10 pr-10 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                    />

                                    {patientSearch && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPatientSearch("");
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    student_id: "",
                                                    faculty_id: "",
                                                    staff_id: "",
                                                }));
                                            }}
                                            aria-label="Clear patient search"
                                            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#a99d8f] hover:bg-[#f6f1e9] hover:text-[#3c332a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {showPatientDropdown && (
                                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-[#e8dfd4] bg-white shadow-lg">

                                        {filteredPatients.length === 0 ? (
                                            <div className="px-4 py-5 text-center text-xs text-[#887d70]">
                                                No patient found.
                                            </div>
                                        ) : (
                                            filteredPatients.map(
                                                (patient) => (
                                                    <button
                                                        key={`${patient.type}-${patient.id}`}
                                                        type="button"
                                                        onClick={() =>
                                                            selectPatient(
                                                                patient
                                                            )
                                                        }
                                                        className="w-full border-b border-[#eee7de] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#fcfaf6]"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-xs font-bold text-[#3c332a]">
                                                                    {
                                                                        patient.name
                                                                    }
                                                                </p>

                                                                <p className="mt-0.5 text-[10px] text-[#887d70]">
                                                                    {
                                                                        patient.identifier
                                                                    }
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                                                                    patient.type ===
                                                                    "student"
                                                                        ? "bg-amber-50 text-amber-600"
                                                                        : patient.type ===
                                                                          "faculty"
                                                                        ? "bg-amber-50 text-amber-600"
                                                                        : "bg-green-50 text-green-600"
                                                                }`}
                                                            >
                                                                {
                                                                    patient.label
                                                                }
                                                            </span>
                                                        </div>
                                                    </button>
                                                )
                                            )
                                        )}
                                    </div>
                                )}
                            </div>


                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#675948]">
                                    Nurse on Duty
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <select
                                    name="nurse_id"
                                    value={formData.nurse_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-[#e8dfd4] bg-white p-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                >
                                    <option value="">
                                        Select Nurse on Duty
                                    </option>

                                    {nurses.map((nurse) => (
                                        <option
                                            key={nurse.id}
                                            value={nurse.id}
                                        >
                                            {getNurseName(
                                                nurse
                                            )}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#675948]">
                                    Visit Date
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="date"
                                    name="visit_date"
                                    value={
                                        formData.visit_date
                                    }
                                    onChange={handleChange}
                                    min={!editingVisit ? getToday() : undefined}
                                    required
                                    className="w-full rounded-xl border border-[#e8dfd4] bg-white p-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                />
                                {!editingVisit && (
                                    <p className="mt-1.5 text-xs text-[#887d70]">
                                        New clinic visits cannot be dated before today.
                                    </p>
                                )}
                            </div>


                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#675948]">
                                    Reason for Visit
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <select
                                    value={formData.reason}
                                    onChange={(event) =>
                                        setFormData(
                                            (previous) => ({
                                                ...previous,
                                                reason: event.target.value,
                                            })
                                        )
                                    }
                                    className="w-full rounded-xl border border-[#e8dfd4] bg-white p-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                    required
                                >
                                    <option value="">
                                        Select reason
                                    </option>

                                    <option value="Fever">
                                        Fever
                                    </option>

                                    <option value="Headache">
                                        Headache
                                    </option>

                                    <option value="Stomachache">
                                        Stomachache
                                    </option>

                                    <option value="Cough / Cold">
                                        Cough / Cold
                                    </option>

                                    <option value="Dizziness">
                                        Dizziness
                                    </option>

                                    <option value="Injury / Wound">
                                        Injury / Wound
                                    </option>

                                    <option value="Body Pain">
                                        Body Pain
                                    </option>

                                    <option value="Check-up">
                                        Check-up
                                    </option>

                                    <option value="First Aid">
                                        First Aid
                                    </option>

                                    <option value="Medication">
                                        Medication
                                    </option>

                                    <option value="Medical Concern">
                                        Medical Concern
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>


                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#675948]">
                                    Temperature
                                </label>

                                <input
                                    type="text"
                                    name="temperature"
                                    value={
                                        formData.temperature
                                    }
                                    onChange={handleChange}
                                    placeholder="e.g. 36.5 °C"
                                    className="w-full rounded-xl border border-[#e8dfd4] bg-white p-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                />
                            </div>


                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#675948]">
                                    Blood Pressure
                                </label>

                                <input
                                    type="text"
                                    name="blood_pressure"
                                    value={
                                        formData.blood_pressure
                                    }
                                    onChange={handleChange}
                                    placeholder="e.g. 120/80"
                                    className="w-full rounded-xl border border-[#e8dfd4] bg-white p-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                />
                            </div>


                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold text-[#675948]">
                                    Symptoms
                                </label>

                                <textarea
                                    name="symptoms"
                                    value={
                                        formData.symptoms
                                    }
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Describe the symptoms..."
                                    className="w-full resize-none rounded-xl border border-[#e8dfd4] bg-white p-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                />
                            </div>


                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#675948]">
                                    Assessment
                                </label>

                                <textarea
                                    name="assessment"
                                    value={
                                        formData.assessment
                                    }
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Clinic assessment..."
                                    className="w-full resize-none rounded-xl border border-[#e8dfd4] bg-white p-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                />
                            </div>


                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#675948]">
                                    Treatment
                                </label>

                                <select
                                    name="treatment"
                                    value={
                                        formData.treatment
                                    }
                                    onChange={
                                        handleTreatmentChange
                                    }
                                    className="w-full rounded-xl border border-[#e8dfd4] bg-white p-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                >
                                    <option value="">
                                        Select Treatment
                                    </option>

                                    {TREATMENTS.map(
                                        (treatment) => (
                                            <option
                                                key={
                                                    treatment
                                                }
                                                value={
                                                    treatment
                                                }
                                            >
                                                {treatment}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>


                            {treatmentNeedsMedicine(
                                formData.treatment
                            ) && (
                                <div className="relative md:col-span-2">

                                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#675948]">
                                        <Pill size={14} />
                                        Medicine / Supply
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <Search
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a99d8f]"
                                        />

                                        <input
                                            type="text"
                                            value={
                                                medicineSearch
                                            }
                                            onChange={(
                                                event
                                            ) => {
                                                setMedicineSearch(
                                                    event
                                                        .target
                                                        .value
                                                );

                                                setFormData(
                                                    (
                                                        previous
                                                    ) => ({
                                                        ...previous,
                                                        medicine_id:
                                                            "",
                                                        medicine_quantity:
                                                            "",
                                                    })
                                                );

                                                setShowMedicineDropdown(
                                                    true
                                                );
                                            }}
                                            onFocus={() =>
                                                setShowMedicineDropdown(
                                                    true
                                                )
                                            }
                                            placeholder={`Search medicine for ${formData.treatment}...`}
                                            className="w-full rounded-xl border border-[#e8dfd4] bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                        />
                                    </div>


                                    {showMedicineDropdown && (
                                        <div className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-[#e8dfd4] bg-white shadow-lg">

                                            {filteredMedicines.length ===
                                            0 ? (
                                                <div className="px-4 py-5 text-center">
                                                    <Pill
                                                        size={
                                                            22
                                                        }
                                                        className="mx-auto mb-2 text-[#ded4c9]"
                                                    />

                                                    <p className="text-xs font-semibold text-[#54483a]">
                                                        No medicine found
                                                    </p>

                                                    <p className="mt-1 text-[10px] text-[#887d70]">
                                                        No medicine is assigned to{" "}
                                                        <span className="font-semibold">
                                                            {
                                                                formData.treatment
                                                            }
                                                        </span>
                                                        .
                                                    </p>
                                                </div>
                                            ) : (
                                                filteredMedicines.map(
                                                    (
                                                        medicine
                                                    ) => {
                                                        const name =
                                                            getMedicineName(
                                                                medicine
                                                            );

                                                        const unit =
                                                            getMedicineUnit(
                                                                medicine
                                                            );

                                                        const stock =
                                                            getMedicineStock(
                                                                medicine
                                                            );

                                                        const treatment =
                                                            getMedicineTreatment(
                                                                medicine
                                                            );

                                                        const outOfStock =
                                                            stock <=
                                                            0;

                                                        const isCurrentlySelected =
                                                            String(
                                                                formData.medicine_id
                                                            ) ===
                                                            String(
                                                                medicine.id
                                                            );







                                                        const disableMedicine =
                                                            outOfStock &&
                                                            !isCurrentlySelected;

                                                        return (
                                                            <button
                                                                key={
                                                                    medicine.id
                                                                }
                                                                type="button"
                                                                disabled={
                                                                    disableMedicine
                                                                }
                                                                onClick={() =>
                                                                    selectMedicine(
                                                                        medicine
                                                                    )
                                                                }
                                                                className="w-full border-b border-[#eee7de] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#fcfaf6] disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <div className="flex items-center justify-between gap-3">

                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-bold text-[#3c332a]">
                                                                            {
                                                                                name
                                                                            }
                                                                        </p>

                                                                        <p className="mt-0.5 text-[10px] text-[#887d70]">
                                                                            Unit:{" "}
                                                                            {
                                                                                unit
                                                                            }
                                                                        </p>

                                                                        <p className="mt-0.5 text-[10px] font-semibold text-[#8a6f50]">
                                                                            Treatment:{" "}
                                                                            {
                                                                                treatment
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <span
                                                                        className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${
                                                                            outOfStock
                                                                                ? "bg-red-50 text-red-600"
                                                                                : stock <=
                                                                                  Number(
                                                                                      medicine.minimum_stock ||
                                                                                          0
                                                                                  )
                                                                                ? "bg-yellow-50 text-yellow-600"
                                                                                : "bg-green-50 text-green-600"
                                                                        }`}
                                                                    >
                                                                        {outOfStock
                                                                            ? "Out of Stock"
                                                                            : `${stock} ${unit}`}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        );
                                                    }
                                                )
                                            )}
                                        </div>
                                    )}


                                    {selectedMedicine &&
                                        treatmentNeedsMedicine(
                                            formData.treatment
                                        ) && (
                                            <div className="mt-2 rounded-xl border border-[#e8dfd4] bg-[#fcfaf6] px-4 py-3">

                                                <div className="flex items-center justify-between gap-3">

                                                    <div>
                                                        <p className="text-xs font-bold text-[#3d3329]">
                                                            {getMedicineName(
                                                                selectedMedicine
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-[10px] text-[#887d70]">
                                                            Unit:{" "}
                                                            {getMedicineUnit(
                                                                selectedMedicine
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-[10px] font-semibold text-[#8a6f50]">
                                                            Treatment:{" "}
                                                            {getMedicineTreatment(
                                                                selectedMedicine
                                                            )}
                                                        </p>
                                                    </div>

                                                    <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-600">
                                                        Stock:{" "}
                                                        {getMedicineStock(
                                                            selectedMedicine
                                                        )}
                                                    </span>
                                                </div>


                                                <div className="mt-3">
                                                    <label className="mb-1.5 block text-xs font-semibold text-[#675948]">
                                                        Quantity Used
                                                        <span className="ml-1 text-red-500">
                                                            *
                                                        </span>
                                                    </label>

                                                    <input
                                                        type="number"
                                                        name="medicine_quantity"
                                                        min="1"
                                                        max={
                                                            getMedicineStock(
                                                                selectedMedicine
                                                            )
                                                        }
                                                        value={
                                                            formData.medicine_quantity
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        required
                                                        placeholder="Enter quantity used"
                                                        className="w-full rounded-xl border border-[#e8dfd4] bg-white p-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                                    />

                                                    <p className="mt-1 text-[10px] text-[#887d70]">
                                                        Available stock:{" "}
                                                        {getMedicineStock(
                                                            selectedMedicine
                                                        )}{" "}
                                                        {getMedicineUnit(
                                                            selectedMedicine
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            )}


                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold text-[#675948]">
                                    Remarks
                                </label>

                                <textarea
                                    name="remarks"
                                    value={
                                        formData.remarks
                                    }
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Additional remarks..."
                                    className="w-full resize-none rounded-xl border border-[#e8dfd4] bg-white p-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                />
                            </div>


                            <div className="flex gap-3 md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[#8a6f50] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#735a40] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading
                                        ? "Saving..."
                                        : editingVisit
                                        ? "Update Visit"
                                        : "Save Visit"}
                                </button>

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={loading}
                                    className="rounded-xl border border-[#e8dfd4] px-5 py-3 text-sm font-semibold text-[#766959] transition hover:bg-[#fcfaf6] disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <ClinicVisitTable search={search} setSearch={setSearch} loading={loading} pageLoading={pageLoading} filteredVisits={filteredVisits} getPatientName={getPatientName} getNurseName={getNurseName} getMedicineName={getMedicineName} getMedicineUnit={getMedicineUnit} formatDate={formatDate} handleEdit={handleEdit} deleteVisit={deleteVisit} setDeleteVisit={setDeleteVisit} handleDelete={handleDelete} visitPagination={visitPagination} fetchVisits={fetchVisits} />

                {showAddConfirmation && (
                    <div
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/45 px-4 py-6 backdrop-blur-sm"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                cancelAddConfirmation();
                            }
                        }}
                    >
                        <section
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="confirm-add-visit-title"
                            aria-describedby="confirm-add-visit-description"
                            className="w-full max-w-md rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-2xl shadow-stone-950/20"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3ebdf] text-[#8a6f50]">
                                <CircleHelp size={24} aria-hidden="true" />
                            </div>

                            <h2 id="confirm-add-visit-title" className="text-lg font-bold text-[#302820]">
                                Confirm clinic visit
                            </h2>
                            <p id="confirm-add-visit-description" className="mt-2 text-sm leading-6 text-[#766959]">
                                Are you sure you want to add this clinic visit?
                            </p>

                            <div className="mt-4 space-y-2 rounded-xl border border-[#e8dfd4] bg-[#fcfaf6] p-3 text-sm">
                                <p className="truncate text-[#302820]">
                                    <span className="font-semibold">Patient:</span>{" "}
                                    {patientSearch || "Selected patient"}
                                </p>
                                <p className="flex items-center gap-2 text-[#766959]">
                                    <CalendarDays size={15} aria-hidden="true" />
                                    <span><span className="font-semibold">Visit date:</span>{" "}{formatDate(formData.visit_date)}</span>
                                </p>
                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={cancelAddConfirmation}
                                    className="rounded-xl border border-[#e8dfd4] px-4 py-2.5 text-sm font-semibold text-[#766959] transition hover:bg-[#fcfaf6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]/40"
                                >
                                    Go back
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmAddVisit}
                                    className="rounded-xl bg-[#8a6f50] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#735a40] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]/40"
                                >
                                    Yes, add visit
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClinicVisits;
