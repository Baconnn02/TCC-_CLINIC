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
} from "lucide-react";
import api from "../services/api";

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

/*
|--------------------------------------------------------------------------
| TREATMENTS THAT CAN USE MEDICINE / SUPPLIES
|--------------------------------------------------------------------------
*/

const TREATMENTS_WITH_MEDICINE = [
    "First Aid",
    "Medication",
    "Wound Care",
    "Cold Compress",
    "Hot Compress",
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const treatmentNeedsMedicine = (treatment) => {
    return TREATMENTS_WITH_MEDICINE.includes(
        treatment
    );
};

function ClinicVisits() {
    const [visits, setVisits] = useState([]);
    const [visitPagination, setVisitPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 25,
    });
    const [students, setStudents] = useState([]);
    const [studentTotal, setStudentTotal] = useState(0);
    const [faculties, setFaculties] = useState([]);
    const [staff, setStaff] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [medicines, setMedicines] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingVisit, setEditingVisit] = useState(null);
    const [deleteVisit, setDeleteVisit] = useState(null);

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

    /*
    |--------------------------------------------------------------------------
    | GENERAL HELPERS
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | PATIENT
    |--------------------------------------------------------------------------
    */

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

        return patientOptions.filter(
            (patient) =>
                patient.name
                    .toLowerCase()
                    .includes(keyword) ||
                patient.identifier
                    .toLowerCase()
                    .includes(keyword) ||
                patient.label
                    .toLowerCase()
                    .includes(keyword)
        );
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

    /*
    |--------------------------------------------------------------------------
    | MEDICINES
    |--------------------------------------------------------------------------
    | Only medicines assigned to the selected treatment are displayed.
    |--------------------------------------------------------------------------
    */

    const filteredMedicines = useMemo(() => {
        const keyword = medicineSearch
            .toLowerCase()
            .trim();

        /*
         * Observation and Referral do not use medicine.
         */
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

            /*
             * Medicine must belong to the selected
             * treatment.
             *
             * "all" can be used for a medicine that
             * is allowed for every treatment.
             */
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

    /*
    |--------------------------------------------------------------------------
    | FETCH DATA
    |--------------------------------------------------------------------------
    */

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

    const fetchStudents = async () => {
        try {
            const response =
                await api.get("/students", {
                    params: { per_page: 10 },
                });

            setStudents(
                normalizeData(response.data)
            );
            setStudentTotal(response.data?.total || 0);
        } catch (error) {
            console.error(
                "Error fetching students:",
                error
            );

            setStudents([]);
            setStudentTotal(0);
        }
    };

    const fetchFaculties = async () => {
        try {
            const response =
                await api.get("/faculties");

            setFaculties(
                normalizeData(response.data)
            );
        } catch (error) {
            console.error(
                "Error fetching faculties:",
                error
            );

            setFaculties([]);
        }
    };

    const fetchStaff = async () => {
        try {
            const response =
                await api.get("/staff");

            setStaff(
                normalizeData(response.data)
            );
        } catch (error) {
            console.error(
                "Error fetching staff:",
                error
            );

            setStaff([]);
        }
    };

    const fetchNurses = async () => {
        try {
            const response =
                await api.get("/nurses");

            setNurses(
                normalizeData(response.data)
            );
        } catch {
            try {
                const response =
                    await api.get("/users");

                const users = normalizeData(
                    response.data
                );

                const nurseUsers = users.filter(
                    (user) => {
                        const role = String(
                            user.role || ""
                        ).toLowerCase();

                        return (
                            role === "nurse" ||
                            role.includes("nurse")
                        );
                    }
                );

                setNurses(nurseUsers);
            } catch (secondError) {
                console.error(
                    "Error fetching nurses:",
                    secondError
                );

                setNurses([]);
            }
        }
    };

    const fetchMedicines = async () => {
        try {
            const response =
                await api.get("/medicines", {
                    params: { per_page: 10 },
                });

            setMedicines(
                normalizeData(response.data)
            );
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
            fetchStudents(),
            fetchFaculties(),
            fetchStaff(),
            fetchNurses(),
            fetchMedicines(),
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

        if (!showPatientDropdown || !term) {
            return undefined;
        }

        let cancelled = false;
        const timeout = setTimeout(async () => {
            try {
                const response = await api.get("/students", {
                    params: { search: term, per_page: 10 },
                });

                if (!cancelled) {
                    setStudents(response.data?.data || []);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Student option search error:", error);
                    setStudents([]);
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

        if (!showMedicineDropdown || !term) {
            return undefined;
        }

        let cancelled = false;
        const timeout = setTimeout(async () => {
            try {
                const response = await api.get("/medicines", {
                    params: { search: term, per_page: 10 },
                });

                if (!cancelled) {
                    setMedicines(response.data?.data || []);
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

    /*
    |--------------------------------------------------------------------------
    | UPDATE MEDICINE INVENTORY DISPLAY
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleTreatmentChange = (event) => {
        const value = event.target.value;

        /*
         * Every time treatment changes,
         * clear the previous medicine.
         *
         * This prevents a medicine from another
         * treatment from remaining selected.
         */
        setFormData((previous) => ({
            ...previous,
            treatment: value,
            medicine_id: "",
            medicine_quantity: "",
        }));

        setMedicineSearch("");
        setShowMedicineDropdown(false);
    };

    /*
    |--------------------------------------------------------------------------
    | ADD FORM
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | EDIT
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

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

        if (!formData.reason.trim()) {
            alert(
                "Please enter the reason for visit."
            );
            return;
        }

        /*
         * If the selected treatment requires medicine,
         * medicine is required.
         */
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

        /*
         * If medicine is selected, quantity is required.
         */
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

        /*
        |--------------------------------------------------------------------------
        | STOCK CHECK
        |--------------------------------------------------------------------------
        */

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

        setLoading(true);

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

        try {
            if (editingVisit) {
                await api.put(
                    `/clinic-visits/${editingVisit.id}`,
                    payload
                );

                alert(
                    "Clinic visit updated successfully."
                );
            } else {
                await api.post(
                    "/clinic-visits",
                    payload
                );

                alert(
                    "Clinic visit added successfully."
                );
            }

            await Promise.all([
                fetchVisits(
                    editingVisit ? visitPagination.current_page : 1,
                    search
                ),
                fetchMedicines(),
            ]);

            window.dispatchEvent(
                new Event(
                    "medicine-stock-updated"
                )
            );

            closeForm();
        } catch (error) {
            console.error(
                "Error saving clinic visit:",
                error
            );

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

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

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
                fetchMedicines(),
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

    /*
    |--------------------------------------------------------------------------
    | CLOSE FORM
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | SEARCH VISITS
    |--------------------------------------------------------------------------
    */

    const filteredVisits = useMemo(() => {
        const keyword = search
            .toLowerCase()
            .trim();

        if (!keyword) {
            return visits;
        }

        return visits.filter((visit) => {
            const patient =
                getPatientName(visit);

            const nurseName =
                getNurseName(visit.nurse);

            const medicineName =
                getMedicineName(
                    visit.medicine
                );

            return `
                ${patient.name}
                ${patient.id}
                ${patient.type}
                ${nurseName}
                ${visit.reason || ""}
                ${visit.treatment || ""}
                ${medicineName}
                ${visit.medicine_quantity || ""}
                ${visit.visit_date || ""}
                ${visit.temperature || ""}
                ${visit.blood_pressure || ""}
            `
                .toLowerCase()
                .includes(keyword);
        });
    }, [visits, search]);

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div className="tcc-module-page min-h-screen px-5 py-5 lg:px-6 lg:py-6">
            <div className="mx-auto max-w-[1500px]">

                {/* HEADER */}
                <div className="tcc-module-header mb-5 rounded-2xl border px-5 py-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fce8e4] text-[#8b1505]">
                                <Stethoscope size={24} />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b1505]">
                                    Clinic Management
                                </p>

                                <h1 className="text-2xl font-bold tracking-tight text-[#64101e]">
                                    Clinic Visits
                                </h1>

                                <p className="mt-1 text-xs text-[#8a736e]">
                                    View and manage student,
                                    faculty, and staff
                                    clinic visit records.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={openAddForm}
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#8b1505] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6f1004]"
                        >
                            <Plus size={17} />
                            Add Clinic Visit
                        </button>
                    </div>
                </div>

                {/* SUMMARY */}
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

                    <div className="rounded-xl border border-[#f0ded9] bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fce8e4] text-[#8b1505]">
                                <Stethoscope size={19} />
                            </div>

                            <div>
                                <p className="text-xs text-[#765e59]">
                                    Total Visits
                                </p>

                                <p className="text-2xl font-bold text-[#2b1a17]">
                                    {visitPagination.total}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#f0ded9] bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                <UserRound size={19} />
                            </div>

                            <div>
                                <p className="text-xs text-[#765e59]">
                                    Students
                                </p>

                                <p className="text-2xl font-bold text-[#2b1a17]">
                                    {studentTotal}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#f0ded9] bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                                <UserRound size={19} />
                            </div>

                            <div>
                                <p className="text-xs text-[#765e59]">
                                    Faculty & Staff
                                </p>

                                <p className="text-2xl font-bold text-[#2b1a17]">
                                    {faculties.length +
                                        staff.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#f0ded9] bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                                <Activity size={19} />
                            </div>

                            <div>
                                <p className="text-xs text-[#765e59]">
                                    Nurses
                                </p>

                                <p className="text-2xl font-bold text-[#2b1a17]">
                                    {nurses.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FORM */}
                {showForm && (
                    <div className="mb-5 rounded-2xl border border-[#f0ded9] bg-white p-6 shadow-sm">

                        <div className="mb-5 flex items-center justify-between border-b border-[#f0ded9] pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#64101e]">
                                    {editingVisit
                                        ? "Edit Clinic Visit"
                                        : "Add Clinic Visit"}
                                </h2>

                                <p className="mt-1 text-xs text-[#8a736e]">
                                    {editingVisit
                                        ? "Update the clinic visit information."
                                        : "Enter the clinic visit information."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={loading}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8a736e] hover:bg-[#fdf5f3] disabled:opacity-50"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 gap-4 md:grid-cols-2"
                        >

                            {/* PATIENT */}
                            <div className="relative">
                                <label className="mb-1.5 block text-xs font-semibold text-[#5f4944]">
                                    Patient
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <div className="relative">
                                    <Search
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8918c]"
                                    />

                                    <input
                                        type="text"
                                        value={patientSearch}
                                        onChange={(event) => {
                                            setPatientSearch(
                                                event.target.value
                                            );

                                            setShowPatientDropdown(
                                                true
                                            );
                                        }}
                                        onFocus={() =>
                                            setShowPatientDropdown(
                                                true
                                            )
                                        }
                                        placeholder="Search student, faculty, or staff..."
                                        className="w-full rounded-xl border border-[#ead8d3] bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#8b1505] focus:ring-4 focus:ring-[#8b1505]/10"
                                    />
                                </div>

                                {showPatientDropdown && (
                                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-[#ead8d3] bg-white shadow-lg">

                                        {filteredPatients.length === 0 ? (
                                            <div className="px-4 py-5 text-center text-xs text-[#8a736e]">
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
                                                        className="w-full border-b border-[#f4e8e5] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#fdf8f7]"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-xs font-bold text-[#2b1a17]">
                                                                    {
                                                                        patient.name
                                                                    }
                                                                </p>

                                                                <p className="mt-0.5 text-[10px] text-[#8a736e]">
                                                                    {
                                                                        patient.identifier
                                                                    }
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                                                                    patient.type ===
                                                                    "student"
                                                                        ? "bg-blue-50 text-blue-600"
                                                                        : patient.type ===
                                                                          "faculty"
                                                                        ? "bg-purple-50 text-purple-600"
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

                            {/* NURSE */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#5f4944]">
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
                                    className="w-full rounded-xl border border-[#ead8d3] bg-white p-3 text-sm outline-none focus:border-[#8b1505] focus:ring-4 focus:ring-[#8b1505]/10"
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

                            {/* DATE */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#5f4944]">
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
                                    required
                                    className="w-full rounded-xl border border-[#ead8d3] bg-white p-3 text-sm outline-none focus:border-[#8b1505] focus:ring-4 focus:ring-[#8b1505]/10"
                                />
                            </div>

                            {/* REASON FOR VISIT */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#5f4944]">
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
                                    className="w-full rounded-xl border border-[#ead8d3] bg-white p-3 text-sm outline-none focus:border-[#8b1505] focus:ring-4 focus:ring-[#8b1505]/10"
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

                            {/* TEMPERATURE */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#5f4944]">
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
                                    className="w-full rounded-xl border border-[#ead8d3] bg-white p-3 text-sm outline-none focus:border-[#8b1505] focus:ring-4 focus:ring-[#8b1505]/10"
                                />
                            </div>

                            {/* BLOOD PRESSURE */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#5f4944]">
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
                                    className="w-full rounded-xl border border-[#ead8d3] bg-white p-3 text-sm outline-none focus:border-[#8b1505] focus:ring-4 focus:ring-[#8b1505]/10"
                                />
                            </div>

                            {/* SYMPTOMS */}
                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold text-[#5f4944]">
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
                                    className="w-full resize-none rounded-xl border border-[#ead8d3] bg-white p-3 text-sm outline-none focus:border-[#8b1505] focus:ring-4 focus:ring-[#8b1505]/10"
                                />
                            </div>

                            {/* ASSESSMENT */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#5f4944]">
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
                                    className="w-full resize-none rounded-xl border border-[#ead8d3] bg-white p-3 text-sm outline-none focus:border-[#8b1505] focus:ring-4 focus:ring-[#8b1505]/10"
                                />
                            </div>

                            {/* TREATMENT */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#5f4944]">
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
                                    className="w-full rounded-xl border border-[#ead8d3] bg-white p-3 text-sm outline-none focus:border-[#8b1505] focus:ring-4 focus:ring-[#8b1505]/10"
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

                            {/* MEDICINE */}
                            {treatmentNeedsMedicine(
                                formData.treatment
                            ) && (
                                <div className="relative md:col-span-2">

                                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#5f4944]">
                                        <Pill size={14} />
                                        Medicine / Supply
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <Search
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8918c]"
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
                                            className="w-full rounded-xl border border-[#ead8d3] bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#8b1505] focus:ring-4 focus:ring-[#8b1505]/10"
                                        />
                                    </div>

                                    {/* MEDICINE DROPDOWN */}
                                    {showMedicineDropdown && (
                                        <div className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-[#ead8d3] bg-white shadow-lg">

                                            {filteredMedicines.length ===
                                            0 ? (
                                                <div className="px-4 py-5 text-center">
                                                    <Pill
                                                        size={
                                                            22
                                                        }
                                                        className="mx-auto mb-2 text-[#d9c4bf]"
                                                    />

                                                    <p className="text-xs font-semibold text-[#4c3834]">
                                                        No medicine found
                                                    </p>

                                                    <p className="mt-1 text-[10px] text-[#8a736e]">
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

                                                        /*
                                                         * During edit,
                                                         * allow currently
                                                         * selected medicine
                                                         * even if stock is 0.
                                                         */
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
                                                                className="w-full border-b border-[#f4e8e5] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#fdf8f7] disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <div className="flex items-center justify-between gap-3">

                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-bold text-[#2b1a17]">
                                                                            {
                                                                                name
                                                                            }
                                                                        </p>

                                                                        <p className="mt-0.5 text-[10px] text-[#8a736e]">
                                                                            Unit:{" "}
                                                                            {
                                                                                unit
                                                                            }
                                                                        </p>

                                                                        <p className="mt-0.5 text-[10px] font-semibold text-[#8b1505]">
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

                                    {/* SELECTED MEDICINE */}
                                    {selectedMedicine &&
                                        treatmentNeedsMedicine(
                                            formData.treatment
                                        ) && (
                                            <div className="mt-2 rounded-xl border border-[#f0ded9] bg-[#fdf8f7] px-4 py-3">

                                                <div className="flex items-center justify-between gap-3">

                                                    <div>
                                                        <p className="text-xs font-bold text-[#64101e]">
                                                            {getMedicineName(
                                                                selectedMedicine
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-[10px] text-[#8a736e]">
                                                            Unit:{" "}
                                                            {getMedicineUnit(
                                                                selectedMedicine
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-[10px] font-semibold text-[#8b1505]">
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

                                                {/* QUANTITY */}
                                                <div className="mt-3">
                                                    <label className="mb-1.5 block text-xs font-semibold text-[#5f4944]">
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
                                                        className="w-full rounded-xl border border-[#ead8d3] bg-white p-3 text-sm outline-none focus:border-[#8b1505] focus:ring-4 focus:ring-[#8b1505]/10"
                                                    />

                                                    <p className="mt-1 text-[10px] text-[#8a736e]">
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

                            {/* REMARKS */}
                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold text-[#5f4944]">
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
                                    className="w-full resize-none rounded-xl border border-[#ead8d3] bg-white p-3 text-sm outline-none focus:border-[#8b1505] focus:ring-4 focus:ring-[#8b1505]/10"
                                />
                            </div>

                            {/* BUTTONS */}
                            <div className="flex gap-3 md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[#8b1505] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6f1004] disabled:cursor-not-allowed disabled:opacity-50"
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
                                    className="rounded-xl border border-[#ead8d3] px-5 py-3 text-sm font-semibold text-[#6b5551] transition hover:bg-[#fdf8f7] disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TABLE */}
                <div className="overflow-hidden rounded-2xl border border-[#f0ded9] bg-white shadow-sm">

                    {/* TABLE HEADER */}
                    <div className="flex flex-col gap-3 border-b border-[#f0ded9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h2 className="text-base font-bold text-[#64101e]">
                                Clinic Visit Records
                            </h2>

                            <p className="mt-1 text-xs text-[#8a736e]">
                                View and manage existing clinic visits.
                            </p>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8918c]"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search clinic visits..."
                                className="w-full rounded-xl border border-[#ead8d3] bg-[#fdf8f7] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#8b1505] focus:ring-4 focus:ring-[#8b1505]/10"
                            />
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px] text-left">

                            <thead>
                                <tr className="border-b border-[#f0ded9] bg-[#fdf8f7]">

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#765e59]">
                                        Patient
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#765e59]">
                                        Nurse on Duty
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#765e59]">
                                        Reason
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#765e59]">
                                        Visit Date
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#765e59]">
                                        Temperature
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#765e59]">
                                        Blood Pressure
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#765e59]">
                                        Treatment
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#765e59]">
                                        Medicine
                                    </th>

                                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wide text-[#765e59]">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {pageLoading ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-5 py-12 text-center text-xs text-[#8a736e]"
                                        >
                                            Loading clinic visits...
                                        </td>
                                    </tr>
                                ) : filteredVisits.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-5 py-12 text-center"
                                        >
                                            <Stethoscope
                                                size={30}
                                                className="mx-auto mb-2 text-[#d9c4bf]"
                                            />

                                            <p className="text-sm font-semibold text-[#4c3834]">
                                                No clinic visits found
                                            </p>

                                            <p className="mt-1 text-xs text-[#8a736e]">
                                                No clinic visit records match your search.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVisits.map(
                                        (visit) => {
                                            const patient =
                                                getPatientName(
                                                    visit
                                                );

                                            const medicineName =
                                                getMedicineName(
                                                    visit.medicine
                                                );

                                            return (
                                                <tr
                                                    key={visit.id}
                                                    className="border-b border-[#f6eae7] transition hover:bg-[#fdf8f7]"
                                                >

                                                    {/* PATIENT */}
                                                    <td className="px-5 py-3.5">
                                                        <p className="text-xs font-bold text-[#2b1a17]">
                                                            {
                                                                patient.name
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 text-[10px] text-[#8a736e]">
                                                            {
                                                                patient.type
                                                            }

                                                            {patient.id
                                                                ? ` • ${patient.id}`
                                                                : ""}
                                                        </p>
                                                    </td>

                                                    {/* NURSE */}
                                                    <td className="px-5 py-3.5">
                                                        <p className="text-xs font-medium text-[#2b1a17]">
                                                            {getNurseName(
                                                                visit.nurse
                                                            )}
                                                        </p>

                                                        {visit.nurse?.role && (
                                                            <p className="mt-0.5 text-[10px] text-[#8a736e]">
                                                                {
                                                                    visit
                                                                        .nurse
                                                                        .role
                                                                }
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* REASON */}
                                                    <td className="max-w-[180px] px-5 py-3.5 text-xs text-[#6b5551]">
                                                        <span className="line-clamp-2">
                                                            {visit.reason ||
                                                                "-"}
                                                        </span>
                                                    </td>

                                                    {/* DATE */}
                                                    <td className="px-5 py-3.5 text-xs text-[#6b5551]">
                                                        {formatDate(
                                                            visit.visit_date
                                                        )}
                                                    </td>

                                                    {/* TEMPERATURE */}
                                                    <td className="px-5 py-3.5 text-xs text-[#6b5551]">
                                                        {visit.temperature ||
                                                            "-"}
                                                    </td>

                                                    {/* BP */}
                                                    <td className="px-5 py-3.5 text-xs text-[#6b5551]">
                                                        {visit.blood_pressure ||
                                                            "-"}
                                                    </td>

                                                    {/* TREATMENT */}
                                                    <td className="max-w-[160px] px-5 py-3.5 text-xs text-[#6b5551]">
                                                        {visit.treatment ||
                                                            "-"}
                                                    </td>

                                                    {/* MEDICINE */}
                                                    <td className="max-w-[200px] px-5 py-3.5 text-xs text-[#6b5551]">

                                                        {medicineName ? (
                                                            <div>

                                                                <p className="font-semibold text-[#64101e]">
                                                                    {
                                                                        medicineName
                                                                    }
                                                                </p>

                                                                {visit.medicine?.unit && (
                                                                    <p className="mt-0.5 text-[10px] text-[#8a736e]">
                                                                        Unit:{" "}
                                                                        {
                                                                            visit
                                                                                .medicine
                                                                                .unit
                                                                        }
                                                                    </p>
                                                                )}

                                                                {visit.medicine_quantity && (
                                                                    <p className="mt-0.5 text-[10px] font-semibold text-[#8b1505]">
                                                                        Quantity Used:{" "}
                                                                        {
                                                                            visit.medicine_quantity
                                                                        }
                                                                    </p>
                                                                )}

                                                            </div>
                                                        ) : (
                                                            "-"
                                                        )}

                                                    </td>

                                                    {/* ACTIONS */}
                                                    <td className="px-5 py-3.5">

                                                        <div className="flex justify-end gap-2">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        visit
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ead8d3] text-[#8b1505] transition hover:bg-[#fcebe7]"
                                                                title="Edit visit"
                                                            >
                                                                <Pencil
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteVisit(
                                                                        visit
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
                                                                title="Delete visit"
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )
                                )}

                            </tbody>

                        </table>
                    </div>
                </div>

                <div className="mb-6 flex items-center justify-between gap-3 text-sm text-[#765e59]">
                    <span>
                        Page {visitPagination.current_page} of {visitPagination.last_page}
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={visitPagination.current_page <= 1}
                            onClick={() =>
                                fetchVisits(visitPagination.current_page - 1, search)
                            }
                            className="rounded-lg border border-[#ead8d3] bg-white px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            disabled={visitPagination.current_page >= visitPagination.last_page}
                            onClick={() =>
                                fetchVisits(visitPagination.current_page + 1, search)
                            }
                            className="rounded-lg border border-[#ead8d3] bg-white px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* DELETE CONFIRMATION MODAL */}
                {deleteVisit && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                            <div className="flex items-start gap-4">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                                    <Trash2 size={20} />
                                </div>

                                <div className="min-w-0">

                                    <h3 className="text-base font-bold text-[#2b1a17]">
                                        Delete Clinic Visit?
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-[#765e59]">
                                        Are you sure you want to delete this clinic visit record? This action cannot be undone.
                                    </p>

                                    <div className="mt-3 rounded-xl border border-[#f0ded9] bg-[#fdf8f7] px-4 py-3">

                                        <p className="text-xs font-bold text-[#64101e]">
                                            {
                                                getPatientName(
                                                    deleteVisit
                                                ).name
                                            }
                                        </p>

                                        <p className="mt-1 text-[10px] text-[#8a736e]">
                                            {formatDate(
                                                deleteVisit.visit_date
                                            )}{" "}
                                            •{" "}
                                            {deleteVisit.reason ||
                                                "Clinic Visit"}
                                        </p>

                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setDeleteVisit(
                                            null
                                        )
                                    }
                                    className="rounded-xl border border-[#ead8d3] px-4 py-2.5 text-sm font-semibold text-[#6b5551] transition hover:bg-[#fdf8f7]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                                >
                                    <Trash2 size={15} />
                                    Delete
                                </button>

                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default ClinicVisits;
