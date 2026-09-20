import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

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
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

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

function ClinicVisits() {
    const [visits, setVisits] = useState([]);
    const [students, setStudents] = useState([]);
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
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);

    const [medicineSearch, setMedicineSearch] = useState("");
    const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);

    // Floating message
    const [toast, setToast] = useState({
        show: false,
        type: "success",
        message: "",
    });

    // =========================================================
    // FLOATING MESSAGE
    // =========================================================

    const showToast = (message, type = "success") => {
        setToast({
            show: true,
            type,
            message,
        });
    };

    const closeToast = () => {
        setToast((previous) => ({
            ...previous,
            show: false,
        }));
    };

    useEffect(() => {
        if (!toast.show) return;

        const timer = setTimeout(() => {
            setToast({
                show: false,
                type: "success",
                message: "",
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, [toast.show, toast.message]);

    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setPageLoading(true);

        try {
            await Promise.all([
                fetchVisits(),
                fetchStudents(),
                fetchFaculties(),
                fetchStaff(),
                fetchNurses(),
                fetchMedicines(),
            ]);
        } catch (error) {
            console.error("Failed to load clinic data:", error);
        } finally {
            setPageLoading(false);
        }
    };

    const fetchVisits = async () => {
        try {
            const response = await api.get("/clinic-visits");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            setVisits(data);
        } catch (error) {
            console.error("Error loading clinic visits:", error);
            setVisits([]);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get("/students");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            setStudents(data);
        } catch (error) {
            console.error("Error loading students:", error);
            setStudents([]);
        }
    };

    const fetchFaculties = async () => {
        try {
            const response = await api.get("/faculties");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            setFaculties(data);
        } catch (error) {
            console.error("Error loading faculties:", error);
            setFaculties([]);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await api.get("/staff");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            setStaff(data);
        } catch (error) {
            console.error("Error loading staff:", error);
            setStaff([]);
        }
    };

    const fetchNurses = async () => {
        try {
            const response = await api.get("/nurses");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            setNurses(data);
        } catch (error) {
            console.error("Error loading nurses:", error);
            setNurses([]);
        }
    };

    const fetchMedicines = async () => {
        try {
            const response = await api.get("/medicines");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            setMedicines(data);
        } catch (error) {
            console.error("Error loading medicines:", error);
            setMedicines([]);
        }
    };

    // =========================================================
    // HELPERS
    // =========================================================

    const getFullName = (person) => {
        if (!person) return "Unknown";

        return [
            person.first_name,
            person.middle_name,
            person.last_name,
        ]
            .filter(Boolean)
            .join(" ");
    };

    const getErrorMessage = (error) => {
        const validationErrors = error?.response?.data?.errors;

        if (validationErrors) {
            return Object.values(validationErrors)
                .flat()
                .join("\n");
        }

        return (
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong."
        );
    };

    const formatDate = (date) => {
        if (!date) return "—";

        try {
            return new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return date;
        }
    };

    const getStudentName = (visit) => {
        if (visit.student) {
            return getFullName(visit.student);
        }

        const student = students.find(
            (item) =>
                String(item.id) === String(visit.student_id)
        );

        return student ? getFullName(student) : "Unknown Student";
    };

    const getNurseName = (visit) => {
        if (visit.nurse) {
            return getFullName(visit.nurse);
        }

        const nurse = nurses.find(
            (item) =>
                String(item.id) === String(visit.nurse_id)
        );

        return nurse ? getFullName(nurse) : "—";
    };

    const getMedicineName = (visit) => {
        if (visit.medicine) {
            return visit.medicine.name;
        }

        const medicine = medicines.find(
            (item) =>
                String(item.id) === String(visit.medicine_id)
        );

        return medicine?.name || "—";
    };

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredVisits = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return visits;

        return visits.filter((visit) => {
            const studentName = getStudentName(visit).toLowerCase();
            const reason = String(visit.reason || "").toLowerCase();
            const treatment = String(
                visit.treatment || ""
            ).toLowerCase();
            const assessment = String(
                visit.assessment || ""
            ).toLowerCase();

            return (
                studentName.includes(keyword) ||
                reason.includes(keyword) ||
                treatment.includes(keyword) ||
                assessment.includes(keyword)
            );
        });
    }, [visits, search, students]);

    const filteredPatients = useMemo(() => {
        const keyword = patientSearch.trim().toLowerCase();

        if (!keyword) {
            return students.slice(0, 10);
        }

        return students
            .filter((student) => {
                const fullName = getFullName(student).toLowerCase();
                const studentId = String(
                    student.student_id || ""
                ).toLowerCase();

                return (
                    fullName.includes(keyword) ||
                    studentId.includes(keyword)
                );
            })
            .slice(0, 10);
    }, [students, patientSearch]);

    const filteredMedicines = useMemo(() => {
        const keyword = medicineSearch.trim().toLowerCase();

        return medicines
            .filter((medicine) => {
                const name = String(
                    medicine.name || ""
                ).toLowerCase();

                return name.includes(keyword);
            })
            .slice(0, 10);
    }, [medicines, medicineSearch]);

    // =========================================================
    // FORM
    // =========================================================

    const openAddForm = () => {
        setEditingVisit(null);

        setFormData({
            ...EMPTY_FORM,
            visit_date: new Date()
                .toISOString()
                .split("T")[0],
        });

        setPatientSearch("");
        setMedicineSearch("");
        setShowPatientDropdown(false);
        setShowMedicineDropdown(false);

        setShowForm(true);
    };

    const openEditForm = (visit) => {
        setEditingVisit(visit);

        setFormData({
            student_id: visit.student_id || "",
            faculty_id: visit.faculty_id || "",
            staff_id: visit.staff_id || "",
            nurse_id: visit.nurse_id || "",
            visit_date: visit.visit_date
                ? String(visit.visit_date).substring(0, 10)
                : "",
            reason: visit.reason || "",
            symptoms: visit.symptoms || "",
            temperature: visit.temperature || "",
            blood_pressure: visit.blood_pressure || "",
            assessment: visit.assessment || "",
            treatment: visit.treatment || "",
            medicine_id: visit.medicine_id || "",
            medicine_quantity:
                visit.medicine_quantity || "",
            remarks: visit.remarks || "",
        });

        if (visit.student) {
            setPatientSearch(getFullName(visit.student));
        } else {
            const student = students.find(
                (item) =>
                    String(item.id) ===
                    String(visit.student_id)
            );

            setPatientSearch(
                student ? getFullName(student) : ""
            );
        }

        if (visit.medicine) {
            setMedicineSearch(visit.medicine.name || "");
        } else {
            const medicine = medicines.find(
                (item) =>
                    String(item.id) ===
                    String(visit.medicine_id)
            );

            setMedicineSearch(medicine?.name || "");
        }

        setShowPatientDropdown(false);
        setShowMedicineDropdown(false);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingVisit(null);
        setFormData({ ...EMPTY_FORM });
        setPatientSearch("");
        setMedicineSearch("");
        setShowPatientDropdown(false);
        setShowMedicineDropdown(false);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const selectPatient = (student) => {
        setFormData((previous) => ({
            ...previous,
            student_id: student.id,
        }));

        setPatientSearch(getFullName(student));
        setShowPatientDropdown(false);
    };

    const selectMedicine = (medicine) => {
        setFormData((previous) => ({
            ...previous,
            medicine_id: medicine.id,
        }));

        setMedicineSearch(medicine.name || "");
        setShowMedicineDropdown(false);
    };

    // =========================================================
    // ADD / UPDATE CLINIC VISIT
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.student_id) {
            showToast(
                "Please select a student.",
                "error"
            );
            return;
        }

        if (!formData.visit_date) {
            showToast(
                "Please select the visit date.",
                "error"
            );
            return;
        }

        if (!formData.reason.trim()) {
            showToast(
                "Please enter the reason for the visit.",
                "error"
            );
            return;
        }

        setLoading(true);

        try {
            const payload = {
                student_id: formData.student_id,
                faculty_id:
                    formData.faculty_id || null,
                staff_id:
                    formData.staff_id || null,
                nurse_id:
                    formData.nurse_id || null,
                visit_date: formData.visit_date,
                reason: formData.reason,
                symptoms: formData.symptoms || null,
                temperature:
                    formData.temperature || null,
                blood_pressure:
                    formData.blood_pressure || null,
                assessment:
                    formData.assessment || null,
                treatment:
                    formData.treatment || null,
                medicine_id:
                    formData.medicine_id || null,
                medicine_quantity:
                    formData.medicine_quantity || null,
                remarks: formData.remarks || null,
            };

            if (editingVisit) {
                await api.put(
                    `/clinic-visits/${editingVisit.id}`,
                    payload
                );

                await Promise.all([
                    fetchVisits(),
                    fetchMedicines(),
                ]);

                window.dispatchEvent(
                    new Event("clinicVisitUpdated")
                );

                closeForm();

                showToast(
                    "Clinic visit updated successfully.",
                    "success"
                );
            } else {
                await api.post(
                    "/clinic-visits",
                    payload
                );

                await Promise.all([
                    fetchVisits(),
                    fetchMedicines(),
                ]);

                window.dispatchEvent(
                    new Event("clinicVisitAdded")
                );

                closeForm();

                // FLOATING MESSAGE ON LOCALHOST
                showToast(
                    "Clinic visit added successfully.",
                    "success"
                );
            }
        } catch (error) {
            console.error(
                "Error saving clinic visit:",
                error
            );

            showToast(
                getErrorMessage(error),
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // DELETE
    // =========================================================

    const confirmDelete = (visit) => {
        setDeleteVisit(visit);
    };

    const handleDelete = async () => {
        if (!deleteVisit) return;

        setLoading(true);

        try {
            await api.delete(
                `/clinic-visits/${deleteVisit.id}`
            );

            await Promise.all([
                fetchVisits(),
                fetchMedicines(),
            ]);

            window.dispatchEvent(
                new Event("clinicVisitDeleted")
            );

            setDeleteVisit(null);

            showToast(
                "Clinic visit deleted successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Error deleting clinic visit:",
                error
            );

            showToast(
                getErrorMessage(error),
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // SUMMARY
    // =========================================================

    const totalVisits = visits.length;

    const todayVisits = visits.filter((visit) => {
        if (!visit.visit_date) return false;

        const visitDate = new Date(visit.visit_date)
            .toISOString()
            .split("T")[0];

        const today = new Date()
            .toISOString()
            .split("T")[0];

        return visitDate === today;
    }).length;

    const totalStudentsVisited = new Set(
        visits.map((visit) => visit.student_id)
    ).size;

    // =========================================================
    // LOADING
    // =========================================================

    if (pageLoading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center bg-[#fbf6f5]">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#800020]/20 border-t-[#800020]" />

                    <p className="text-sm font-medium text-gray-600">
                        Loading clinic visits...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fbf6f5] px-5 py-6 lg:px-6">

            {/* =====================================================
                FLOATING TOAST MESSAGE
            ====================================================== */}

            {toast.show && (
                <div className="pointer-events-none fixed right-4 top-4 z-[9999] w-[calc(100%-2rem)] max-w-sm">
                    <div
                        className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-4 shadow-2xl backdrop-blur-md ${
                            toast.type === "success"
                                ? "border-green-200 bg-white text-green-800"
                                : "border-red-200 bg-white text-red-800"
                        }`}
                    >
                        <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                toast.type === "success"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                            }`}
                        >
                            {toast.type === "success" ? (
                                <CheckCircle2
                                    size={21}
                                />
                            ) : (
                                <AlertCircle
                                    size={21}
                                />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold">
                                {toast.type === "success"
                                    ? "Success"
                                    : "Error"}
                            </p>

                            <p className="mt-1 whitespace-pre-line text-sm leading-5 text-gray-600">
                                {toast.message}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={closeToast}
                            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        >
                            <X size={17} />
                        </button>
                    </div>
                </div>
            )}

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#800020] text-white shadow-md">
                            <Stethoscope size={25} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Clinic Visits
                            </h1>

                            <p className="text-sm text-gray-500">
                                Manage and monitor student clinic visits
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={openAddForm}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#800020] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#68001a]"
                >
                    <Plus size={18} />
                    Add Clinic Visit
                </button>
            </div>

            {/* =====================================================
                SUMMARY CARDS
            ====================================================== */}

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Total Visits
                            </p>

                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {totalVisits}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#800020]/10 text-[#800020]">
                            <Activity size={22} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Today's Visits
                            </p>

                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {todayVisits}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Stethoscope size={22} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Students Visited
                            </p>

                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {totalStudentsVisited}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <UserRound size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                FORM
            ====================================================== */}

            {showForm && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingVisit
                                    ? "Edit Clinic Visit"
                                    : "Add Clinic Visit"}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Enter the clinic visit information below.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        >
                            <X size={21} />
                        </button>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 p-6"
                    >
                        {/* Patient */}
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <div className="relative">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Student
                                    <span className="text-red-500">
                                        {" "}*
                                    </span>
                                </label>

                                <div className="relative">
                                    <Search
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        value={patientSearch}
                                        onChange={(event) => {
                                            setPatientSearch(
                                                event.target.value
                                            );

                                            setFormData(
                                                (previous) => ({
                                                    ...previous,
                                                    student_id: "",
                                                })
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
                                        placeholder="Search student..."
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                                    />
                                </div>

                                {showPatientDropdown && (
                                    <div className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map(
                                                (student) => (
                                                    <button
                                                        type="button"
                                                        key={student.id}
                                                        onClick={() =>
                                                            selectPatient(
                                                                student
                                                            )
                                                        }
                                                        className="flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left transition last:border-b-0 hover:bg-[#800020]/5"
                                                    >
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#800020]/10 text-[#800020]">
                                                            <UserRound
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-gray-800">
                                                                {getFullName(
                                                                    student
                                                                )}
                                                            </p>

                                                            <p className="text-xs text-gray-500">
                                                                {student.student_id ||
                                                                    "No Student ID"}
                                                            </p>
                                                        </div>
                                                    </button>
                                                )
                                            )
                                        ) : (
                                            <div className="px-4 py-6 text-center text-sm text-gray-500">
                                                No students found.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Visit Date */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Visit Date
                                    <span className="text-red-500">
                                        {" "}*
                                    </span>
                                </label>

                                <input
                                    type="date"
                                    name="visit_date"
                                    value={
                                        formData.visit_date
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                                />
                            </div>
                        </div>

                        {/* Faculty / Staff / Nurse */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Faculty
                                </label>

                                <select
                                    name="faculty_id"
                                    value={
                                        formData.faculty_id
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                                >
                                    <option value="">
                                        Select Faculty
                                    </option>

                                    {faculties.map(
                                        (faculty) => (
                                            <option
                                                key={faculty.id}
                                                value={faculty.id}
                                            >
                                                {getFullName(
                                                    faculty
                                                )}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Staff
                                </label>

                                <select
                                    name="staff_id"
                                    value={
                                        formData.staff_id
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                                >
                                    <option value="">
                                        Select Staff
                                    </option>

                                    {staff.map(
                                        (person) => (
                                            <option
                                                key={person.id}
                                                value={person.id}
                                            >
                                                {getFullName(
                                                    person
                                                )}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Nurse
                                </label>

                                <select
                                    name="nurse_id"
                                    value={
                                        formData.nurse_id
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                                >
                                    <option value="">
                                        Select Nurse
                                    </option>

                                    {nurses.map(
                                        (nurse) => (
                                            <option
                                                key={nurse.id}
                                                value={nurse.id}
                                            >
                                                {getFullName(
                                                    nurse
                                                )}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Reason for Visit
                                <span className="text-red-500">
                                    {" "}*
                                </span>
                            </label>

                            <input
                                type="text"
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder="Example: Headache, fever, injury..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                            />
                        </div>

                        {/* Symptoms */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Symptoms
                            </label>

                            <textarea
                                name="symptoms"
                                value={formData.symptoms}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Describe the student's symptoms..."
                                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                            />
                        </div>

                        {/* Vital Signs */}
                        <div>
                            <h3 className="mb-3 text-sm font-bold text-gray-800">
                                Vital Signs
                            </h3>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Temperature
                                    </label>

                                    <input
                                        type="text"
                                        name="temperature"
                                        value={
                                            formData.temperature
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Example: 36.5 °C"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Blood Pressure
                                    </label>

                                    <input
                                        type="text"
                                        name="blood_pressure"
                                        value={
                                            formData.blood_pressure
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Example: 120/80"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Assessment */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Assessment
                            </label>

                            <textarea
                                name="assessment"
                                value={formData.assessment}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Enter the clinic assessment..."
                                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                            />
                        </div>

                        {/* Treatment */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Treatment
                            </label>

                            <select
                                name="treatment"
                                value={formData.treatment}
                                onChange={
                                    handleInputChange
                                }
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                            >
                                <option value="">
                                    Select Treatment
                                </option>

                                {TREATMENTS.map(
                                    (treatment) => (
                                        <option
                                            key={treatment}
                                            value={treatment}
                                        >
                                            {treatment}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* Medicine */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="relative">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Medicine
                                </label>

                                <div className="relative">
                                    <Pill
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        value={
                                            medicineSearch
                                        }
                                        onChange={(event) => {
                                            setMedicineSearch(
                                                event.target
                                                    .value
                                            );

                                            setFormData(
                                                (previous) => ({
                                                    ...previous,
                                                    medicine_id:
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
                                        placeholder="Search medicine..."
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                                    />
                                </div>

                                {showMedicineDropdown && (
                                    <div className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                                        {filteredMedicines.length >
                                        0 ? (
                                            filteredMedicines.map(
                                                (medicine) => (
                                                    <button
                                                        type="button"
                                                        key={
                                                            medicine.id
                                                        }
                                                        onClick={() =>
                                                            selectMedicine(
                                                                medicine
                                                            )
                                                        }
                                                        className="flex w-full items-center justify-between border-b border-gray-50 px-4 py-3 text-left transition last:border-b-0 hover:bg-[#800020]/5"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#800020]/10 text-[#800020]">
                                                                <Pill
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </div>

                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-800">
                                                                    {
                                                                        medicine.name
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-gray-500">
                                                                    Stock:{" "}
                                                                    {medicine.stock ??
                                                                        0}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                )
                                            )
                                        ) : (
                                            <div className="px-4 py-6 text-center text-sm text-gray-500">
                                                No medicines found.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    name="medicine_quantity"
                                    value={
                                        formData.medicine_quantity
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Example: 1"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                                />
                            </div>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Remarks
                            </label>

                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Additional notes..."
                                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={loading}
                                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#800020] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#68001a] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        {editingVisit
                                            ? "Update Visit"
                                            : "Save Clinic Visit"}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* =====================================================
                SEARCH + TABLE
            ====================================================== */}

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Clinic Visit Records
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            View and manage all clinic visit records.
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search clinic visits..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-[1000px] w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Student
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Date
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Reason
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Nurse
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Treatment
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Medicine
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredVisits.length > 0 ? (
                                filteredVisits.map(
                                    (visit) => (
                                        <tr
                                            key={visit.id}
                                            className="border-b border-gray-50 transition hover:bg-[#800020]/[0.02]"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#800020]/10 text-[#800020]">
                                                        <UserRound
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            {getStudentName(
                                                                visit
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {visit
                                                                .student
                                                                ?.student_id ||
                                                                students.find(
                                                                    (
                                                                        student
                                                                    ) =>
                                                                        String(
                                                                            student.id
                                                                        ) ===
                                                                        String(
                                                                            visit.student_id
                                                                        )
                                                                )
                                                                    ?.student_id ||
                                                                "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {formatDate(
                                                    visit.visit_date
                                                )}
                                            </td>

                                            <td className="max-w-[220px] px-5 py-4">
                                                <p className="truncate text-sm font-medium text-gray-800">
                                                    {visit.reason ||
                                                        "—"}
                                                </p>

                                                {visit.symptoms && (
                                                    <p className="mt-1 truncate text-xs text-gray-500">
                                                        {
                                                            visit.symptoms
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {getNurseName(
                                                    visit
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                {visit.treatment ? (
                                                    <span className="inline-flex rounded-full bg-[#800020]/10 px-3 py-1 text-xs font-semibold text-[#800020]">
                                                        {
                                                            visit.treatment
                                                        }
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                {visit.medicine_id ? (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">
                                                            {getMedicineName(
                                                                visit
                                                            )}
                                                        </p>

                                                        {visit.medicine_quantity && (
                                                            <p className="text-xs text-gray-500">
                                                                Qty:{" "}
                                                                {
                                                                    visit.medicine_quantity
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditForm(
                                                                visit
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                                        title="Edit"
                                                    >
                                                        <Pencil
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            confirmDelete(
                                                                visit
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                                                        title="Delete"
                                                    >
                                                        <Trash2
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-5 py-16 text-center"
                                    >
                                        <div className="mx-auto flex max-w-sm flex-col items-center">
                                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                                <Stethoscope
                                                    size={25}
                                                />
                                            </div>

                                            <h3 className="font-semibold text-gray-800">
                                                No clinic visits found
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Add a clinic visit
                                                to start building
                                                your records.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredVisits.length > 0 && (
                    <div className="border-t border-gray-100 px-5 py-4">
                        <p className="text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-semibold text-gray-700">
                                {filteredVisits.length}
                            </span>{" "}
                            clinic visit
                            {filteredVisits.length !== 1
                                ? "s"
                                : ""}
                        </p>
                    </div>
                )}
            </div>

            {/* =====================================================
                DELETE CONFIRMATION MODAL
            ====================================================== */}

            {deleteVisit && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <Trash2 size={22} />
                        </div>

                        <h2 className="mt-4 text-xl font-bold text-gray-900">
                            Delete Clinic Visit?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Are you sure you want to delete the
                            clinic visit for{" "}
                            <span className="font-semibold text-gray-700">
                                {getStudentName(
                                    deleteVisit
                                )}
                            </span>
                            ? This action cannot be undone.
                        </p>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteVisit(null)
                                }
                                disabled={loading}
                                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={17} />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClinicVisits;