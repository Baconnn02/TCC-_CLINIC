import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const EMPTY_STUDENT_FORM = {
    student_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    course: "",
    year_level: "",
    section: "",
    sex: "",
    birth_date: "",
    contact_number: "",
    address: "",
};

const EMPTY_STAFF_FORM = {
    staff_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    position: "",
    department: "",
    sex: "",
    birth_date: "",
    contact_number: "",
    address: "",
};

const COURSES = [
    "BSIT",
    "BSBA",
    "MidWifery",
    "BSHM",
    "BLIS",
    "BSED",
    "BSCRIM",
];

const YEAR_LEVELS = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
];

const SEX_OPTIONS = [
    "Male",
    "Female",
];

const STAFF_POSITIONS = [
    "Faculty",
    "Staff",
];

function InputField({
    label,
    value,
    onChange,
    type = "text",
    required = false,
    placeholder = "",
    disabled = false,
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <input
                type={type}
                value={value ?? ""}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
        </div>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
    required = false,
    disabled = false,
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <select
                value={value ?? ""}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
                <option value="">
                    Select {label}
                </option>

                {options.map((option) => (
                    <option
                        key={option}
                        value={option}
                    >
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

function Modal({
    children,
    onClose,
    title,
    maxWidth = "max-w-3xl",
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div
                className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-2xl bg-white shadow-xl`}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}

function ConfirmationModal({
    open,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
    loading = false,
    onConfirm,
    onClose,
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start gap-4 px-6 py-5">
                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                            danger
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                        }`}
                    >
                        {danger ? (
                            <span className="text-2xl">!</span>
                        ) : (
                            <span className="text-xl">✓</span>
                        )}
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-gray-800">
                            {title}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            danger
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {loading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium uppercase text-gray-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
                {value || "-"}
            </p>
        </div>
    );
}

function RecordSection({
    icon,
    title,
    children,
}) {
    return (
        <div className="mb-6 last:mb-0">
            <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="text-base leading-none">
                    {icon}
                </span>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                    {title}
                </h3>
            </div>

            {children}
        </div>
    );
}

function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [showTypeChoice, setShowTypeChoice] =
        useState(false);

    const [showStudentForm, setShowStudentForm] =
        useState(false);

    const [showStaffForm, setShowStaffForm] =
        useState(false);

    const [editingStudent, setEditingStudent] =
        useState(null);

    const [editingStaff, setEditingStaff] =
        useState(null);

    const [viewingStudent, setViewingStudent] =
        useState(null);

    const [viewingStaff, setViewingStaff] =
        useState(null);

    const [confirmation, setConfirmation] =
        useState(null);

    const [studentForm, setStudentForm] = useState({
        ...EMPTY_STUDENT_FORM,
    });

    const [staffForm, setStaffForm] = useState({
        ...EMPTY_STAFF_FORM,
    });

    useEffect(() => {
        fetchData();
    }, []);
    const getFullName = (person) => {
        if (!person) {
            return "";
        }

        return [
            person.first_name,
            person.middle_name,
            person.last_name,
        ]
            .filter(Boolean)
            .join(" ");
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(date);
        }

        return parsedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    /*
    | Used specifically for <input type="date">
    */
    const formatDateInput = (date) => {
        if (!date) {
            return "";
        }

        return String(date).slice(0, 10);
    };

    const getErrorMessage = (
        err,
        fallback
    ) => {
        const validationErrors =
            err.response?.data?.errors;

        if (validationErrors) {
            const firstError = Object.values(
                validationErrors
            )
                .flat()
                .find(Boolean);

            if (firstError) {
                return firstError;
            }
        }

        return (
            err.response?.data?.message ||
            fallback
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Fetch Data
    |--------------------------------------------------------------------------
    */

    const fetchData = async () => {
        setLoading(true);

        try {
            const [
                studentsResponse,
                staffResponse,
            ] = await Promise.all([
                api.get("/students"),
                api.get("/staff"),
            ]);

            const studentData =
                Array.isArray(studentsResponse.data)
                    ? studentsResponse.data
                    : studentsResponse.data?.data || [];

            const staffData =
                Array.isArray(staffResponse.data)
                    ? staffResponse.data
                    : staffResponse.data?.data || [];

            setStudents(studentData);
            setStaff(staffData);
        } catch (err) {
            console.error(err);

            setError(
                getErrorMessage(
                    err,
                    "Unable to load students and staff."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const filteredStudents = useMemo(() => {
        const keyword = search
            .toLowerCase()
            .trim();

        if (!keyword) {
            return students;
        }

        return students.filter((student) => {
            const fullName = getFullName(
                student
            ).toLowerCase();

            return (
                String(
                    student.student_id || ""
                )
                    .toLowerCase()
                    .includes(keyword) ||
                fullName.includes(keyword) ||
                String(student.course || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(student.year_level || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(student.section || "")
                    .toLowerCase()
                    .includes(keyword)
            );
        });
    }, [students, search]);

    const filteredStaff = useMemo(() => {
        const keyword = search
            .toLowerCase()
            .trim();

        if (!keyword) {
            return staff;
        }

        return staff.filter((person) => {
            const fullName = getFullName(
                person
            ).toLowerCase();

            return (
                String(
                    person.staff_id || ""
                )
                    .toLowerCase()
                    .includes(keyword) ||
                fullName.includes(keyword) ||
                String(person.position || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(person.department || "")
                    .toLowerCase()
                    .includes(keyword)
            );
        });
    }, [staff, search]);

    /*
    |--------------------------------------------------------------------------
    | Student Form
    |--------------------------------------------------------------------------
    */

    const openStudentForm = (
        student = null
    ) => {
        setError("");
        setEditingStudent(student);

        if (student) {
            setStudentForm({
                student_id:
                    student.student_id || "",

                first_name:
                    student.first_name || "",

                middle_name:
                    student.middle_name || "",

                last_name:
                    student.last_name || "",

                course:
                    student.course || "",

                year_level:
                    student.year_level || "",

                section:
                    student.section || "",

                sex:
                    student.sex || "",

                birth_date:
                    formatDateInput(
                        student.birth_date
                    ),

                contact_number:
                    student.contact_number || "",

                address:
                    student.address || "",
            });
        } else {
            setStudentForm({
                ...EMPTY_STUDENT_FORM,
            });
        }

        setShowTypeChoice(false);
        setShowStudentForm(true);
    };

    const closeStudentForm = () => {
        if (saving) {
            return;
        }

        setShowStudentForm(false);
        setEditingStudent(null);

        setStudentForm({
            ...EMPTY_STUDENT_FORM,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Staff Form
    |--------------------------------------------------------------------------
    */

    const openStaffForm = (
        person = null
    ) => {
        setError("");
        setEditingStaff(person);

        if (person) {
            setStaffForm({
                staff_id:
                    person.staff_id || "",

                first_name:
                    person.first_name || "",

                middle_name:
                    person.middle_name || "",

                last_name:
                    person.last_name || "",

                position:
                    person.position || "",

                department:
                    person.department || "",

                sex:
                    person.sex || "",

                birth_date:
                    formatDateInput(
                        person.birth_date
                    ),

                contact_number:
                    person.contact_number || "",

                address:
                    person.address || "",
            });
        } else {
            setStaffForm({
                ...EMPTY_STAFF_FORM,
            });
        }

        setShowTypeChoice(false);
        setShowStaffForm(true);
    };

    const closeStaffForm = () => {
        if (saving) {
            return;
        }

        setShowStaffForm(false);
        setEditingStaff(null);

        setStaffForm({
            ...EMPTY_STAFF_FORM,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | View Student
    |--------------------------------------------------------------------------
    */

    const viewStudentRecord = async (
        student
    ) => {
        setError("");

        try {
            const response = await api.get(
                `/students/${student.id}`
            );

            setViewingStudent(response.data);
        } catch (err) {
            console.error(err);

            setViewingStudent(student);

            setError(
                getErrorMessage(
                    err,
                    "Unable to load student record."
                )
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | View Staff
    |--------------------------------------------------------------------------
    */

    const viewStaffRecord = async (
        person
    ) => {
        setError("");

        try {
            const response = await api.get(
                `/staff/${person.id}`
            );

            setViewingStaff(response.data);
        } catch (err) {
            console.error(err);

            setViewingStaff(person);

            setError(
                getErrorMessage(
                    err,
                    "Unable to load staff/faculty record."
                )
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Save / Update Student
    |--------------------------------------------------------------------------
    */

    const handleStudentSubmit = async (
        e
    ) => {
        e.preventDefault();

        if (saving) {
            return;
        }

        setError("");

        setConfirmation({
            type: editingStudent
                ? "updateStudent"
                : "addStudent",
            title: editingStudent
                ? "Confirm Update"
                : "Confirm Add Student",
            message: editingStudent
                ? `Are you sure you want to update "${getFullName(editingStudent)}"?`
                : `Are you sure you want to add "${getFullName(studentForm)}" as a new student?`,
            confirmText: editingStudent
                ? "Update Student"
                : "Add Student",
            danger: false,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Save / Update Staff
    |--------------------------------------------------------------------------
    */

    const handleStaffSubmit = async (
        e
    ) => {
        e.preventDefault();

        if (saving) {
            return;
        }

        setError("");

        if (!staffForm.staff_id.trim()) {
            setError("Staff ID is required.");
            return;
        }

        if (!staffForm.first_name.trim()) {
            setError("First name is required.");
            return;
        }

        if (!staffForm.last_name.trim()) {
            setError("Last name is required.");
            return;
        }

        if (!staffForm.position) {
            setError("Position is required.");
            return;
        }

        if (!staffForm.sex) {
            setError("Sex is required.");
            return;
        }

        if (!staffForm.birth_date) {
            setError("Birth date is required.");
            return;
        }

        if (!staffForm.contact_number.trim()) {
            setError("Contact number is required.");
            return;
        }

        if (!staffForm.address.trim()) {
            setError("Address is required.");
            return;
        }

        setConfirmation({
            type: editingStaff
                ? "updateStaff"
                : "addStaff",
            title: editingStaff
                ? "Confirm Update"
                : "Confirm Add Staff / Faculty",
            message: editingStaff
                ? `Are you sure you want to update "${getFullName(editingStaff)}"?`
                : `Are you sure you want to add "${getFullName(staffForm)}" as a new staff/faculty record?`,
            confirmText: editingStaff
                ? "Update Record"
                : "Add Record",
            danger: false,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Student
    |--------------------------------------------------------------------------
    */

    const deleteStudent = (
        student
    ) => {
        const name =
            getFullName(student) ||
            "this student";

        setConfirmation({
            type: "deleteStudent",
            person: student,
            title: "Delete Student",
            message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            confirmText: "Delete Student",
            danger: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Staff
    |--------------------------------------------------------------------------
    */

    const deleteStaff = (
        person
    ) => {
        const name =
            getFullName(person) ||
            "this staff/faculty member";

        setConfirmation({
            type: "deleteStaff",
            person,
            title: "Delete Staff / Faculty",
            message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            confirmText: "Delete Record",
            danger: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Confirm Add / Edit / Delete
    |--------------------------------------------------------------------------
    */

    const handleConfirmation = async () => {
        if (!confirmation || saving) {
            return;
        }

        setSaving(true);
        setError("");

        try {
            switch (confirmation.type) {
                case "addStudent":
                    await api.post(
                        "/students",
                        studentForm
                    );
                    closeStudentForm();
                    break;

                case "updateStudent":
                    await api.put(
                        `/students/${editingStudent.id}`,
                        studentForm
                    );
                    closeStudentForm();
                    break;

                case "addStaff":
                    await api.post(
                        "/staff",
                        staffForm
                    );
                    closeStaffForm();
                    break;

                case "updateStaff":
                    await api.put(
                        `/staff/${editingStaff.id}`,
                        staffForm
                    );
                    closeStaffForm();
                    break;

                case "deleteStudent":
                    await api.delete(
                        `/students/${confirmation.person.id}`
                    );

                    if (
                        viewingStudent?.id ===
                        confirmation.person.id
                    ) {
                        setViewingStudent(null);
                    }
                    break;

                case "deleteStaff":
                    await api.delete(
                        `/staff/${confirmation.person.id}`
                    );

                    if (
                        viewingStaff?.id ===
                        confirmation.person.id
                    ) {
                        setViewingStaff(null);
                    }
                    break;

                default:
                    break;
            }

            setConfirmation(null);
            await fetchData();
        } catch (err) {
            console.error(err);

            setError(
                getErrorMessage(
                    err,
                    confirmation.type.includes("Student")
                        ? "Unable to complete student action."
                        : "Unable to complete staff/faculty action."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f7fb] p-6">
        {/* BACKGROUND DESIGN */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#8b1538]/5 blur-3xl" />
            <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-[#8b1538]/5 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />

            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage:
                        "linear-gradient(#8b1538 1px, transparent 1px), linear-gradient(90deg, #8b1538 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />
        </div>

        <div className="relative mx-auto max-w-7xl"></div>
            <div className="mx-auto max-w-7xl">

                {/* HEADER */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                           PATIENT INFORMATION
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage student and staff/faculty information.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            setShowTypeChoice(true);
                        }}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        + Add New Record
                    </button>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            className="font-bold"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* SEARCH */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search student or staff..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {loading ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                        Loading records...
                    </div>
                ) : (
                    <>
                        {/* ======================================================
                            STUDENTS
                        ====================================================== */}

                        <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="font-semibold text-gray-800">
                                    Students
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {filteredStudents.length} student(s)
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="px-5 py-3">
                                                Student ID
                                            </th>

                                            <th className="px-5 py-3">
                                                Name
                                            </th>

                                            <th className="px-5 py-3">
                                                Course
                                            </th>

                                            <th className="px-5 py-3">
                                                Year Level
                                            </th>

                                            <th className="px-5 py-3">
                                                Sex
                                            </th>

                                            <th className="px-5 py-3 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {filteredStudents.length ===
                                        0 ? (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="px-5 py-8 text-center text-gray-500"
                                                >
                                                    No students found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStudents.map(
                                                (student) => (
                                                    <tr
                                                        key={
                                                            student.id
                                                        }
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-5 py-4 font-medium text-gray-800">
                                                            {
                                                                student.student_id
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-700">
                                                            {getFullName(
                                                                student
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-600">
                                                            {student.course ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-600">
                                                            {student.year_level ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-600">
                                                            {student.sex ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        viewStudentRecord(
                                                                            student
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                                                                >
                                                                    View Record
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openStudentForm(
                                                                            student
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        deleteStudent(
                                                                            student
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ======================================================
                            STAFF / FACULTY
                        ====================================================== */}

                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="font-semibold text-gray-800">
                                    Staff / Faculty
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {filteredStaff.length} staff/faculty record(s)
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="px-5 py-3">
                                                Staff ID
                                            </th>

                                            <th className="px-5 py-3">
                                                Name
                                            </th>

                                            <th className="px-5 py-3">
                                                Position
                                            </th>

                                            <th className="px-5 py-3">
                                                Department
                                            </th>

                                            <th className="px-5 py-3">
                                                Sex
                                            </th>

                                            <th className="px-5 py-3 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {filteredStaff.length ===
                                        0 ? (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="px-5 py-8 text-center text-gray-500"
                                                >
                                                    No staff/faculty found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStaff.map(
                                                (person) => (
                                                    <tr
                                                        key={
                                                            person.id
                                                        }
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-5 py-4 font-medium text-gray-800">
                                                            {
                                                                person.staff_id
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-700">
                                                            {getFullName(
                                                                person
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-600">
                                                            {person.position ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-600">
                                                            {person.department ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-600">
                                                            {person.sex ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex justify-end gap-2">

                                                                {/* VIEW */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        viewStaffRecord(
                                                                            person
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                                                                >
                                                                    View Record
                                                                </button>

                                                                {/* EDIT */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openStaffForm(
                                                                            person
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                                                                >
                                                                    Edit
                                                                </button>

                                                                {/* DELETE */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        deleteStaff(
                                                                            person
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                                                                >
                                                                    Delete
                                                                </button>

                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ================================================================
                RECORD TYPE CHOICE
            ================================================================ */}

            {showTypeChoice && (
                <Modal
                    title="Choose Record Type"
                    onClose={() =>
                        setShowTypeChoice(false)
                    }
                >
                    <div className="grid gap-4 p-6 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() =>
                                openStudentForm()
                            }
                            className="rounded-xl border border-gray-200 p-6 text-left transition hover:border-blue-500 hover:bg-blue-50"
                        >
                            <div className="mb-3 text-3xl">
                                🎓
                            </div>

                            <h3 className="font-semibold text-gray-800">
                                Student
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Add a new student record.
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                openStaffForm()
                            }
                            className="rounded-xl border border-gray-200 p-6 text-left transition hover:border-blue-500 hover:bg-blue-50"
                        >
                            <div className="mb-3 text-3xl">
                                👨‍🏫
                            </div>

                            <h3 className="font-semibold text-gray-800">
                                Staff / Faculty
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Add a staff or faculty record.
                            </p>
                        </button>
                    </div>
                </Modal>
            )}

            {/* ================================================================
                STUDENT FORM
            ================================================================ */}

            {showStudentForm && (
                <Modal
                    title={
                        editingStudent
                            ? "Edit Student"
                            : "Add New Student"
                    }
                    onClose={closeStudentForm}
                >
                    <form
                        onSubmit={
                            handleStudentSubmit
                        }
                        className="p-6"
                    >
                        <div className="grid gap-4 md:grid-cols-2">

                            <InputField
                                label="Student ID"
                                value={
                                    studentForm.student_id
                                }
                                onChange={(e) =>
                                    setStudentForm(
                                        {
                                            ...studentForm,
                                            student_id:
                                                e.target.value,
                                        }
                                    )
                                }
                                required
                            />

                            <InputField
                                label="First Name"
                                value={
                                    studentForm.first_name
                                }
                                onChange={(e) =>
                                    setStudentForm(
                                        {
                                            ...studentForm,
                                            first_name:
                                                e.target.value,
                                        }
                                    )
                                }
                                required
                            />

                            <InputField
                                label="Middle Name"
                                value={
                                    studentForm.middle_name
                                }
                                onChange={(e) =>
                                    setStudentForm(
                                        {
                                            ...studentForm,
                                            middle_name:
                                                e.target.value,
                                        }
                                    )
                                }
                            />

                            <InputField
                                label="Last Name"
                                value={
                                    studentForm.last_name
                                }
                                onChange={(e) =>
                                    setStudentForm(
                                        {
                                            ...studentForm,
                                            last_name:
                                                e.target.value,
                                        }
                                    )
                                }
                                required
                            />

                            <SelectField
                                label="Course"
                                value={
                                    studentForm.course
                                }
                                onChange={(e) =>
                                    setStudentForm(
                                        {
                                            ...studentForm,
                                            course:
                                                e.target.value,
                                        }
                                    )
                                }
                                options={COURSES}
                                required
                            />

                            <SelectField
                                label="Year Level"
                                value={
                                    studentForm.year_level
                                }
                                onChange={(e) =>
                                    setStudentForm(
                                        {
                                            ...studentForm,
                                            year_level:
                                                e.target.value,
                                        }
                                    )
                                }
                                options={
                                    YEAR_LEVELS
                                }
                                required
                            />

                            <InputField
                                label="Section"
                                value={
                                    studentForm.section
                                }
                                onChange={(e) =>
                                    setStudentForm(
                                        {
                                            ...studentForm,
                                            section:
                                                e.target.value,
                                        }
                                    )
                                }
                                placeholder="Example: BSIT-3B"
                            />

                            <SelectField
                                label="Sex"
                                value={
                                    studentForm.sex
                                }
                                onChange={(e) =>
                                    setStudentForm(
                                        {
                                            ...studentForm,
                                            sex:
                                                e.target.value,
                                        }
                                    )
                                }
                                options={
                                    SEX_OPTIONS
                                }
                                required
                            />

                            <InputField
                                label="Birth Date"
                                type="date"
                                value={
                                    studentForm.birth_date
                                }
                                onChange={(e) =>
                                    setStudentForm(
                                        {
                                            ...studentForm,
                                            birth_date:
                                                e.target.value,
                                        }
                                    )
                                }
                                required
                            />

                            <InputField
                                label="Contact Number"
                                value={
                                    studentForm.contact_number
                                }
                                onChange={(e) =>
                                    setStudentForm(
                                        {
                                            ...studentForm,
                                            contact_number:
                                                e.target.value,
                                        }
                                    )
                                }
                                required
                            />

                            <div className="md:col-span-2">
                                <InputField
                                    label="Address"
                                    value={
                                        studentForm.address
                                    }
                                    onChange={(e) =>
                                        setStudentForm(
                                            {
                                                ...studentForm,
                                                address:
                                                    e.target.value,
                                            }
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t pt-5">
                            <button
                                type="button"
                                onClick={
                                    closeStudentForm
                                }
                                disabled={saving}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingStudent
                                    ? "Update Student"
                                    : "Save Student"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ================================================================
                STAFF FORM
            ================================================================ */}

            {showStaffForm && (
                <Modal
                    title={
                        editingStaff
                            ? "Edit Staff / Faculty"
                            : "Add Staff / Faculty"
                    }
                    onClose={closeStaffForm}
                >
                    <form
                        onSubmit={
                            handleStaffSubmit
                        }
                        className="p-6"
                    >
                        <div className="grid gap-4 md:grid-cols-2">

                            {/* STAFF ID */}
                            <InputField
                                label="Staff ID"
                                value={
                                    staffForm.staff_id
                                }
                                onChange={(e) =>
                                    setStaffForm(
                                        {
                                            ...staffForm,
                                            staff_id:
                                                e.target.value,
                                        }
                                    )
                                }
                                required
                            />

                            {/* FIRST NAME */}
                            <InputField
                                label="First Name"
                                value={
                                    staffForm.first_name
                                }
                                onChange={(e) =>
                                    setStaffForm(
                                        {
                                            ...staffForm,
                                            first_name:
                                                e.target.value,
                                        }
                                    )
                                }
                                required
                            />

                            {/* MIDDLE NAME */}
                            <InputField
                                label="Middle Name"
                                value={
                                    staffForm.middle_name
                                }
                                onChange={(e) =>
                                    setStaffForm(
                                        {
                                            ...staffForm,
                                            middle_name:
                                                e.target.value,
                                        }
                                    )
                                }
                            />

                            {/* LAST NAME */}
                            <InputField
                                label="Last Name"
                                value={
                                    staffForm.last_name
                                }
                                onChange={(e) =>
                                    setStaffForm(
                                        {
                                            ...staffForm,
                                            last_name:
                                                e.target.value,
                                        }
                                    )
                                }
                                required
                            />

                            {/* POSITION */}
                            <SelectField
                                label="Position"
                                value={
                                    staffForm.position
                                }
                                onChange={(e) =>
                                    setStaffForm(
                                        {
                                            ...staffForm,
                                            position:
                                                e.target.value,
                                        }
                                    )
                                }
                                options={
                                    STAFF_POSITIONS
                                }
                                required
                            />

                            {/* DEPARTMENT */}
                            <InputField
                                label="Department"
                                value={
                                    staffForm.department
                                }
                                onChange={(e) =>
                                    setStaffForm(
                                        {
                                            ...staffForm,
                                            department:
                                                e.target.value,
                                        }
                                    )
                                }
                            />

                            {/* SEX */}
                            <SelectField
                                label="Sex"
                                value={
                                    staffForm.sex
                                }
                                onChange={(e) =>
                                    setStaffForm(
                                        {
                                            ...staffForm,
                                            sex:
                                                e.target.value,
                                        }
                                    )
                                }
                                options={
                                    SEX_OPTIONS
                                }
                                required
                            />

                            {/* BIRTH DATE */}
                            <InputField
                                label="Birth Date"
                                type="date"
                                value={
                                    staffForm.birth_date
                                }
                                onChange={(e) =>
                                    setStaffForm(
                                        {
                                            ...staffForm,
                                            birth_date:
                                                e.target.value,
                                        }
                                    )
                                }
                                required
                            />

                            {/* CONTACT */}
                            <InputField
                                label="Contact Number"
                                value={
                                    staffForm.contact_number
                                }
                                onChange={(e) =>
                                    setStaffForm(
                                        {
                                            ...staffForm,
                                            contact_number:
                                                e.target.value,
                                        }
                                    )
                                }
                                required
                            />

                            {/* ADDRESS */}
                            <div className="md:col-span-2">
                                <InputField
                                    label="Address"
                                    value={
                                        staffForm.address
                                    }
                                    onChange={(e) =>
                                        setStaffForm(
                                            {
                                                ...staffForm,
                                                address:
                                                    e.target.value,
                                            }
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t pt-5">
                            <button
                                type="button"
                                onClick={
                                    closeStaffForm
                                }
                                disabled={saving}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingStaff
                                    ? "Update Staff"
                                    : "Save Staff"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ================================================================
                STUDENT VIEW
            ================================================================ */}

            {viewingStudent && (
                <Modal
                    title="Student Information"
                    onClose={() =>
                        setViewingStudent(null)
                    }
                    maxWidth="max-w-4xl"
                >
                    <div className="p-6">

                        <div className="mb-6 flex flex-col gap-1 rounded-xl bg-blue-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-lg font-semibold text-gray-800">
                                    {getFullName(
                                        viewingStudent
                                    )}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {viewingStudent.course ||
                                        "-"}
                                    {" · "}
                                    {viewingStudent.year_level ||
                                        "-"}
                                    {viewingStudent.section
                                        ? ` · ${viewingStudent.section}`
                                        : ""}
                                </p>
                            </div>

                            <span className="inline-flex w-fit items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                ID:{" "}
                                {
                                    viewingStudent.student_id
                                }
                            </span>
                        </div>

                        <RecordSection
                            icon="🧑"
                            title="Personal Information"
                        >
                            <div className="grid gap-3 sm:grid-cols-2">
                                <InfoItem
                                    label="Sex"
                                    value={
                                        viewingStudent.sex
                                    }
                                />

                                <InfoItem
                                    label="Birth Date"
                                    value={formatDate(
                                        viewingStudent.birth_date
                                    )}
                                />
                            </div>
                        </RecordSection>

                        <RecordSection
                            icon="🎓"
                            title="Academic Information"
                        >
                            <div className="grid gap-3 sm:grid-cols-3">
                                <InfoItem
                                    label="Course"
                                    value={
                                        viewingStudent.course
                                    }
                                />

                                <InfoItem
                                    label="Year Level"
                                    value={
                                        viewingStudent.year_level
                                    }
                                />

                                <InfoItem
                                    label="Section"
                                    value={
                                        viewingStudent.section
                                    }
                                />
                            </div>
                        </RecordSection>

                        <RecordSection
                            icon="📍"
                            title="Contact Information"
                        >
                            <div className="grid gap-3 sm:grid-cols-2">
                                <InfoItem
                                    label="Contact Number"
                                    value={
                                        viewingStudent.contact_number
                                    }
                                />

                                <InfoItem
                                    label="Address"
                                    value={
                                        viewingStudent.address
                                    }
                                />
                            </div>
                        </RecordSection>

                        <RecordSection
                            icon="🩺"
                            title="Clinic Visit History"
                        >
                            <p className="-mt-2 mb-3 text-xs text-gray-500">
                                Previous visits recorded in the clinic
                            </p>

                            {Array.isArray(
                                viewingStudent.clinic_visits
                            ) &&
                            viewingStudent
                                .clinic_visits
                                .length > 0 ? (
                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Visit Date
                                                </th>

                                                <th className="px-4 py-3">
                                                    Reason for Visit
                                                </th>

                                                <th className="px-4 py-3">
                                                    Nurse / Attended By
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {viewingStudent.clinic_visits
                                                .slice()
                                                .sort(
                                                    (
                                                        a,
                                                        b
                                                    ) =>
                                                        new Date(
                                                            b.visit_date
                                                        ) -
                                                        new Date(
                                                            a.visit_date
                                                        )
                                                )
                                                .map(
                                                    (
                                                        visit,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                visit.id ||
                                                                index
                                                            }
                                                            className={
                                                                index %
                                                                    2 ===
                                                                0
                                                                    ? "bg-white hover:bg-gray-50"
                                                                    : "bg-gray-50/50 hover:bg-gray-50"
                                                            }
                                                        >
                                                            <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">
                                                                {formatDate(
                                                                    visit.visit_date
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-3 text-gray-600">
                                                                {visit.reason ||
                                                                    "-"}
                                                            </td>

                                                            <td className="px-4 py-3 font-medium text-gray-700">
                                                                {visit
                                                                    .nurse
                                                                    ?.name ||
                                                                    "-"}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                                    <p className="text-sm font-medium text-gray-600">
                                        No clinic visits recorded.
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        Click "Add Clinic Visit" to record the student's first visit.
                                    </p>
                                </div>
                            )}
                        </RecordSection>
                    </div>
                </Modal>
            )}

            {/* ================================================================
                STAFF VIEW
            ================================================================ */}

            {viewingStaff && (
                <Modal
                    title="Staff / Faculty Information"
                    onClose={() =>
                        setViewingStaff(null)
                    }
                    maxWidth="max-w-3xl"
                >
                    <div className="p-6">

                        <div className="mb-6 rounded-xl bg-blue-50 px-5 py-4">
                            <p className="text-lg font-semibold text-gray-800">
                                {getFullName(
                                    viewingStaff
                                )}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                {viewingStaff.position ||
                                    "-"}
                            </p>

                            <span className="mt-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                Staff ID:{" "}
                                {
                                    viewingStaff.staff_id
                                }
                            </span>
                        </div>

                        <RecordSection
                            icon="🧑"
                            title="Personal Information"
                        >
                            <div className="grid gap-3 sm:grid-cols-2">

                                <InfoItem
                                    label="Staff ID"
                                    value={
                                        viewingStaff.staff_id
                                    }
                                />

                                <InfoItem
                                    label="Full Name"
                                    value={getFullName(
                                        viewingStaff
                                    )}
                                />

                                <InfoItem
                                    label="Sex"
                                    value={
                                        viewingStaff.sex
                                    }
                                />

                                <InfoItem
                                    label="Birth Date"
                                    value={formatDate(
                                        viewingStaff.birth_date
                                    )}
                                />
                            </div>
                        </RecordSection>

                        <RecordSection
                            icon="💼"
                            title="Work Information"
                        >
                            <div className="grid gap-3 sm:grid-cols-2">

                                <InfoItem
                                    label="Position"
                                    value={
                                        viewingStaff.position
                                    }
                                />

                                <InfoItem
                                    label="Department"
                                    value={
                                        viewingStaff.department ||
                                        "Not specified"
                                    }
                                />
                            </div>
                        </RecordSection>

                        <RecordSection
                            icon="📍"
                            title="Contact Information"
                        >
                            <div className="grid gap-3 sm:grid-cols-2">

                                <InfoItem
                                    label="Contact Number"
                                    value={
                                        viewingStaff.contact_number
                                    }
                                />

                                <InfoItem
                                    label="Address"
                                    value={
                                        viewingStaff.address
                                    }
                                />
                            </div>
                        </RecordSection>

                    </div>
                </Modal>
            )}
            {/* ================================================================
                FLOATING CONFIRMATION
            ================================================================ */}

            {confirmation && (
                <ConfirmationModal
                    open={Boolean(confirmation)}
                    title={confirmation.title}
                    message={confirmation.message}
                    confirmText={confirmation.confirmText}
                    danger={confirmation.danger}
                    loading={saving}
                    onClose={() => {
                        if (!saving) {
                            setConfirmation(null);
                        }
                    }}
                    onConfirm={handleConfirmation}
                />
            )}

        </div>
    );
}

export default StudentManagement;