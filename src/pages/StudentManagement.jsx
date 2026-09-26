import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

/*
|--------------------------------------------------------------------------
| EMPTY FORMS
|--------------------------------------------------------------------------
*/

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

const EMPTY_FACULTY_FORM = {
    employee_id: "",
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

/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| INPUT FIELD
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| SELECT FIELD
|--------------------------------------------------------------------------
*/

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
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| MODAL
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| CONFIRMATION MODAL
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| INFO ITEM
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| RECORD SECTION
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

function StudentManagement() {
    /*
    |--------------------------------------------------------------------------
    | DATA
    |--------------------------------------------------------------------------
    */

    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [faculties, setFaculties] = useState([]);

    /*
    |--------------------------------------------------------------------------
    | GENERAL STATE
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | MODALS
    |--------------------------------------------------------------------------
    */

    const [showTypeChoice, setShowTypeChoice] = useState(false);
    const [showStudentForm, setShowStudentForm] = useState(false);
    const [showStaffForm, setShowStaffForm] = useState(false);
    const [showFacultyForm, setShowFacultyForm] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | EDITING
    |--------------------------------------------------------------------------
    */

    const [editingStudent, setEditingStudent] = useState(null);
    const [editingStaff, setEditingStaff] = useState(null);
    const [editingFaculty, setEditingFaculty] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | VIEWING
    |--------------------------------------------------------------------------
    */

    const [viewingStudent, setViewingStudent] = useState(null);
    const [viewingStaff, setViewingStaff] = useState(null);
    const [viewingFaculty, setViewingFaculty] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | CONFIRMATION
    |--------------------------------------------------------------------------
    */

    const [confirmation, setConfirmation] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | FORMS
    |--------------------------------------------------------------------------
    */

    const [studentForm, setStudentForm] = useState({
        ...EMPTY_STUDENT_FORM,
    });

    const [staffForm, setStaffForm] = useState({
        ...EMPTY_STAFF_FORM,
    });

    const [facultyForm, setFacultyForm] = useState({
        ...EMPTY_FACULTY_FORM,
    });

    /*
    |--------------------------------------------------------------------------
    | LOAD DATA
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchData();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

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

    const formatDateInput = (date) => {
        if (!date) {
            return "";
        }

        return String(date).slice(0, 10);
    };

    const getErrorMessage = (err, fallback) => {
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
    | FETCH ALL PATIENT TYPES
    |--------------------------------------------------------------------------
    */

    const fetchData = async () => {
        setLoading(true);
        setError("");

        try {
            const [
                studentsResponse,
                staffResponse,
                facultiesResponse,
            ] = await Promise.all([
                api.get("/students"),
                api.get("/staff"),
                api.get("/faculties"),
            ]);

            const studentData =
                Array.isArray(studentsResponse.data)
                    ? studentsResponse.data
                    : studentsResponse.data?.data || [];

            const staffData =
                Array.isArray(staffResponse.data)
                    ? staffResponse.data
                    : staffResponse.data?.data || [];

            const facultyData =
                Array.isArray(facultiesResponse.data)
                    ? facultiesResponse.data
                    : facultiesResponse.data?.data || [];

            setStudents(studentData);
            setStaff(staffData);
            setFaculties(facultyData);
        } catch (err) {
            console.error(err);

            setError(
                getErrorMessage(
                    err,
                    "Unable to load student, staff, and faculty records."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | FILTER STUDENTS
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
            const fullName =
                getFullName(student).toLowerCase();

            return (
                String(student.student_id || "")
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

    /*
    |--------------------------------------------------------------------------
    | FILTER STAFF
    |--------------------------------------------------------------------------
    */

    const filteredStaff = useMemo(() => {
        const keyword = search
            .toLowerCase()
            .trim();

        if (!keyword) {
            return staff;
        }

        return staff.filter((person) => {
            const fullName =
                getFullName(person).toLowerCase();

            return (
                String(person.staff_id || "")
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
    | FILTER FACULTY
    |--------------------------------------------------------------------------
    */

    const filteredFaculties = useMemo(() => {
        const keyword = search
            .toLowerCase()
            .trim();

        if (!keyword) {
            return faculties;
        }

        return faculties.filter((faculty) => {
            const fullName =
                getFullName(faculty).toLowerCase();

            return (
                String(faculty.employee_id || "")
                    .toLowerCase()
                    .includes(keyword) ||
                fullName.includes(keyword) ||
                String(faculty.position || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(faculty.department || "")
                    .toLowerCase()
                    .includes(keyword)
            );
        });
    }, [faculties, search]);

    /*
    |--------------------------------------------------------------------------
    | STUDENT FORM
    |--------------------------------------------------------------------------
    */

    const openStudentForm = (student = null) => {
        setError("");
        setEditingStudent(student);

        if (student) {
            setStudentForm({
                student_id: student.student_id || "",
                first_name: student.first_name || "",
                middle_name: student.middle_name || "",
                last_name: student.last_name || "",
                course: student.course || "",
                year_level: student.year_level || "",
                section: student.section || "",
                sex: student.sex || "",
                birth_date: formatDateInput(
                    student.birth_date
                ),
                contact_number:
                    student.contact_number || "",
                address: student.address || "",
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
    | STAFF FORM
    |--------------------------------------------------------------------------
    */

    const openStaffForm = (person = null) => {
        setError("");
        setEditingStaff(person);

        if (person) {
            setStaffForm({
                staff_id: person.staff_id || "",
                first_name: person.first_name || "",
                middle_name: person.middle_name || "",
                last_name: person.last_name || "",
                position: person.position || "",
                department: person.department || "",
                sex: person.sex || "",
                birth_date: formatDateInput(
                    person.birth_date
                ),
                contact_number:
                    person.contact_number || "",
                address: person.address || "",
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
    | FACULTY FORM
    |--------------------------------------------------------------------------
    */

    const openFacultyForm = (faculty = null) => {
        setError("");
        setEditingFaculty(faculty);

        if (faculty) {
            setFacultyForm({
                employee_id:
                    faculty.employee_id || "",
                first_name:
                    faculty.first_name || "",
                middle_name:
                    faculty.middle_name || "",
                last_name:
                    faculty.last_name || "",
                position:
                    faculty.position || "",
                department:
                    faculty.department || "",
                sex:
                    faculty.sex || "",
                birth_date:
                    formatDateInput(
                        faculty.birth_date
                    ),
                contact_number:
                    faculty.contact_number || "",
                address:
                    faculty.address || "",
            });
        } else {
            setFacultyForm({
                ...EMPTY_FACULTY_FORM,
            });
        }

        setShowTypeChoice(false);
        setShowFacultyForm(true);
    };

    const closeFacultyForm = () => {
        if (saving) {
            return;
        }

        setShowFacultyForm(false);
        setEditingFaculty(null);

        setFacultyForm({
            ...EMPTY_FACULTY_FORM,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | VIEW STUDENT
    |--------------------------------------------------------------------------
    */

    const viewStudentRecord = async (student) => {
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
    | VIEW STAFF
    |--------------------------------------------------------------------------
    */

    const viewStaffRecord = async (person) => {
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
                    "Unable to load staff record."
                )
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | VIEW FACULTY
    |--------------------------------------------------------------------------
    */

    const viewFacultyRecord = async (faculty) => {
        setError("");

        try {
            const response = await api.get(
                `/faculties/${faculty.id}`
            );

            setViewingFaculty(response.data);
        } catch (err) {
            console.error(err);

            setViewingFaculty(faculty);

            setError(
                getErrorMessage(
                    err,
                    "Unable to load faculty record."
                )
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | STUDENT SUBMIT
    |--------------------------------------------------------------------------
    */

    const handleStudentSubmit = (e) => {
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
                ? `Are you sure you want to update "${getFullName(
                      editingStudent
                  )}"?`
                : `Are you sure you want to add "${getFullName(
                      studentForm
                  )}" as a new student?`,

            confirmText: editingStudent
                ? "Update Student"
                : "Add Student",

            danger: false,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | STAFF SUBMIT
    |--------------------------------------------------------------------------
    */

    const handleStaffSubmit = (e) => {
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

        if (!staffForm.position.trim()) {
            setError("Position is required.");
            return;
        }

        setConfirmation({
            type: editingStaff
                ? "updateStaff"
                : "addStaff",

            title: editingStaff
                ? "Confirm Update Staff"
                : "Confirm Add Staff",

            message: editingStaff
                ? `Are you sure you want to update "${getFullName(
                      editingStaff
                  )}"?`
                : `Are you sure you want to add "${getFullName(
                      staffForm
                  )}" as a new staff record?`,

            confirmText: editingStaff
                ? "Update Staff"
                : "Add Staff",

            danger: false,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | FACULTY SUBMIT
    |--------------------------------------------------------------------------
    */

    const handleFacultySubmit = (e) => {
        e.preventDefault();

        if (saving) {
            return;
        }

        setError("");

        if (!facultyForm.employee_id.trim()) {
            setError("Employee ID is required.");
            return;
        }

        if (!facultyForm.first_name.trim()) {
            setError("First name is required.");
            return;
        }

        if (!facultyForm.last_name.trim()) {
            setError("Last name is required.");
            return;
        }

        if (!facultyForm.position.trim()) {
            setError("Position is required.");
            return;
        }

        setConfirmation({
            type: editingFaculty
                ? "updateFaculty"
                : "addFaculty",

            title: editingFaculty
                ? "Confirm Update Faculty"
                : "Confirm Add Faculty",

            message: editingFaculty
                ? `Are you sure you want to update "${getFullName(
                      editingFaculty
                  )}"?`
                : `Are you sure you want to add "${getFullName(
                      facultyForm
                  )}" as a new faculty record?`,

            confirmText: editingFaculty
                ? "Update Faculty"
                : "Add Faculty",

            danger: false,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE STUDENT
    |--------------------------------------------------------------------------
    */

    const deleteStudent = (student) => {
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
    | DELETE STAFF
    |--------------------------------------------------------------------------
    */

    const deleteStaff = (person) => {
        const name =
            getFullName(person) ||
            "this staff member";

        setConfirmation({
            type: "deleteStaff",
            person,

            title: "Delete Staff",

            message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,

            confirmText: "Delete Staff",
            danger: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE FACULTY
    |--------------------------------------------------------------------------
    */

    const deleteFaculty = (faculty) => {
        const name =
            getFullName(faculty) ||
            "this faculty member";

        setConfirmation({
            type: "deleteFaculty",
            person: faculty,

            title: "Delete Faculty",

            message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,

            confirmText: "Delete Faculty",
            danger: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | CONFIRMATION ACTIONS
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
                /*
                |--------------------------------------------------------------
                | STUDENT
                |--------------------------------------------------------------
                */

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

                /*
                |--------------------------------------------------------------
                | STAFF
                |--------------------------------------------------------------
                */

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

                /*
                |--------------------------------------------------------------
                | FACULTY
                |--------------------------------------------------------------
                */

                case "addFaculty":
                    await api.post(
                        "/faculties",
                        facultyForm
                    );

                    closeFacultyForm();
                    break;

                case "updateFaculty":
                    await api.put(
                        `/faculties/${editingFaculty.id}`,
                        facultyForm
                    );

                    closeFacultyForm();
                    break;

                case "deleteFaculty":
                    await api.delete(
                        `/faculties/${confirmation.person.id}`
                    );

                    if (
                        viewingFaculty?.id ===
                        confirmation.person.id
                    ) {
                        setViewingFaculty(null);
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
                    "Unable to complete the requested action."
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
        <div className="tcc-module-page relative min-h-screen overflow-hidden p-5 sm:p-6">

            {/* BACKGROUND */}
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

            <div className="tcc-module-content relative mx-auto max-w-[1500px]">

                {/* HEADER */}
                <div className="tcc-module-header mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#64101e]">
                            PATIENT INFORMATION
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage student, staff, and faculty information.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            setShowTypeChoice(true);
                        }}
                        className="rounded-xl bg-[#8b1505] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6f1004]"
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
                            onClick={() => setError("")}
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
                            setSearch(e.target.value)
                        }
                        placeholder="Search student, staff, or faculty..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {loading ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                        Loading records...
                    </div>
                ) : (
                    <>
                        {/* ==================================================
                            STUDENTS
                        ================================================== */}

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
                                        {filteredStudents.length === 0 ? (
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
                                                        key={student.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-5 py-4 font-medium text-gray-800">
                                                            {student.student_id}
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
                                                                    View
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

                        {/* ==================================================
                            STAFF
                        ================================================== */}

                        <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="font-semibold text-gray-800">
                                    Staff
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {filteredStaff.length} staff record(s)
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
                                        {filteredStaff.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="px-5 py-8 text-center text-gray-500"
                                                >
                                                    No staff found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStaff.map(
                                                (person) => (
                                                    <tr
                                                        key={person.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-5 py-4 font-medium text-gray-800">
                                                            {person.staff_id}
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
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        viewStaffRecord(
                                                                            person
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                                                                >
                                                                    View
                                                                </button>

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

                        {/* ==================================================
                            FACULTY
                        ================================================== */}

                        <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="font-semibold text-gray-800">
                                    Faculty
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {filteredFaculties.length} faculty record(s)
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="px-5 py-3">
                                                Employee ID
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
                                        {filteredFaculties.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="px-5 py-8 text-center text-gray-500"
                                                >
                                                    No faculty found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredFaculties.map(
                                                (faculty) => (
                                                    <tr
                                                        key={faculty.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-5 py-4 font-medium text-gray-800">
                                                            {
                                                                faculty.employee_id
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-700">
                                                            {getFullName(
                                                                faculty
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-600">
                                                            {faculty.position ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-600">
                                                            {faculty.department ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-600">
                                                            {faculty.sex ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        viewFacultyRecord(
                                                                            faculty
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                                                                >
                                                                    View
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openFacultyForm(
                                                                            faculty
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        deleteFaculty(
                                                                            faculty
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
                CHOOSE RECORD TYPE
            ================================================================ */}

            {showTypeChoice && (
                <Modal
                    title="Choose Record Type"
                    onClose={() =>
                        setShowTypeChoice(false)
                    }
                >
                    <div className="grid gap-4 p-6 md:grid-cols-3">

                        {/* STUDENT */}
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

                        {/* STAFF */}
                        <button
                            type="button"
                            onClick={() =>
                                openStaffForm()
                            }
                            className="rounded-xl border border-gray-200 p-6 text-left transition hover:border-blue-500 hover:bg-blue-50"
                        >
                            <div className="mb-3 text-3xl">
                                👤
                            </div>

                            <h3 className="font-semibold text-gray-800">
                                Staff
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Add a new staff record.
                            </p>
                        </button>

                        {/* FACULTY */}
                        <button
                            type="button"
                            onClick={() =>
                                openFacultyForm()
                            }
                            className="rounded-xl border border-gray-200 p-6 text-left transition hover:border-blue-500 hover:bg-blue-50"
                        >
                            <div className="mb-3 text-3xl">
                                👩‍🏫
                            </div>

                            <h3 className="font-semibold text-gray-800">
                                Faculty
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Add a new faculty record.
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
                        onSubmit={handleStudentSubmit}
                        className="p-6"
                    >
                        <div className="grid gap-4 md:grid-cols-2">

                            <InputField
                                label="Student ID"
                                value={
                                    studentForm.student_id
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        student_id:
                                            e.target.value,
                                    })
                                }
                                required
                            />

                            <InputField
                                label="First Name"
                                value={
                                    studentForm.first_name
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        first_name:
                                            e.target.value,
                                    })
                                }
                                required
                            />

                            <InputField
                                label="Middle Name"
                                value={
                                    studentForm.middle_name
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        middle_name:
                                            e.target.value,
                                    })
                                }
                            />

                            <InputField
                                label="Last Name"
                                value={
                                    studentForm.last_name
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        last_name:
                                            e.target.value,
                                    })
                                }
                                required
                            />

                            <SelectField
                                label="Course"
                                value={
                                    studentForm.course
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        course:
                                            e.target.value,
                                    })
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
                                    setStudentForm({
                                        ...studentForm,
                                        year_level:
                                            e.target.value,
                                    })
                                }
                                options={YEAR_LEVELS}
                                required
                            />

                            <InputField
                                label="Section"
                                value={
                                    studentForm.section
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        section:
                                            e.target.value,
                                    })
                                }
                                placeholder="Example: BSIT-3B"
                            />

                            <SelectField
                                label="Sex"
                                value={
                                    studentForm.sex
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        sex:
                                            e.target.value,
                                    })
                                }
                                options={SEX_OPTIONS}
                                required
                            />

                            <InputField
                                label="Birth Date"
                                type="date"
                                value={
                                    studentForm.birth_date
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        birth_date:
                                            e.target.value,
                                    })
                                }
                                required
                            />

                            <InputField
                                label="Contact Number"
                                value={
                                    studentForm.contact_number
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        contact_number:
                                            e.target.value,
                                    })
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
                                        setStudentForm({
                                            ...studentForm,
                                            address:
                                                e.target.value,
                                        })
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
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                {editingStudent
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
                            ? "Edit Staff"
                            : "Add New Staff"
                    }
                    onClose={closeStaffForm}
                >
                    <form
                        onSubmit={handleStaffSubmit}
                        className="p-6"
                    >
                        <div className="grid gap-4 md:grid-cols-2">

                            <InputField
                                label="Staff ID"
                                value={
                                    staffForm.staff_id
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        staff_id:
                                            e.target.value,
                                    })
                                }
                                required
                            />

                            <InputField
                                label="First Name"
                                value={
                                    staffForm.first_name
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        first_name:
                                            e.target.value,
                                    })
                                }
                                required
                            />

                            <InputField
                                label="Middle Name"
                                value={
                                    staffForm.middle_name
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        middle_name:
                                            e.target.value,
                                    })
                                }
                            />

                            <InputField
                                label="Last Name"
                                value={
                                    staffForm.last_name
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        last_name:
                                            e.target.value,
                                    })
                                }
                                required
                            />

                            <InputField
                                label="Position"
                                value={
                                    staffForm.position
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        position:
                                            e.target.value,
                                    })
                                }
                                placeholder="Example: Clinic Staff"
                                required
                            />

                            <InputField
                                label="Department"
                                value={
                                    staffForm.department
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        department:
                                            e.target.value,
                                    })
                                }
                            />

                            <SelectField
                                label="Sex"
                                value={
                                    staffForm.sex
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        sex:
                                            e.target.value,
                                    })
                                }
                                options={SEX_OPTIONS}
                            />

                            <InputField
                                label="Birth Date"
                                type="date"
                                value={
                                    staffForm.birth_date
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        birth_date:
                                            e.target.value,
                                    })
                                }
                            />

                            <InputField
                                label="Contact Number"
                                value={
                                    staffForm.contact_number
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        contact_number:
                                            e.target.value,
                                    })
                                }
                            />

                            <div className="md:col-span-2">
                                <InputField
                                    label="Address"
                                    value={
                                        staffForm.address
                                    }
                                    onChange={(e) =>
                                        setStaffForm({
                                            ...staffForm,
                                            address:
                                                e.target.value,
                                        })
                                    }
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
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                {editingStaff
                                    ? "Update Staff"
                                    : "Save Staff"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ================================================================
                FACULTY FORM
            ================================================================ */}

            {showFacultyForm && (
                <Modal
                    title={
                        editingFaculty
                            ? "Edit Faculty"
                            : "Add New Faculty"
                    }
                    onClose={closeFacultyForm}
                >
                    <form
                        onSubmit={handleFacultySubmit}
                        className="p-6"
                    >
                        <div className="grid gap-4 md:grid-cols-2">

                            {/* EMPLOYEE ID */}
                            <InputField
                                label="Employee ID"
                                value={
                                    facultyForm.employee_id
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        employee_id:
                                            e.target.value,
                                    })
                                }
                                required
                                placeholder="Example: FAC-001"
                            />

                            {/* FIRST NAME */}
                            <InputField
                                label="First Name"
                                value={
                                    facultyForm.first_name
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        first_name:
                                            e.target.value,
                                    })
                                }
                                required
                            />

                            {/* MIDDLE NAME */}
                            <InputField
                                label="Middle Name"
                                value={
                                    facultyForm.middle_name
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        middle_name:
                                            e.target.value,
                                    })
                                }
                            />

                            {/* LAST NAME */}
                            <InputField
                                label="Last Name"
                                value={
                                    facultyForm.last_name
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        last_name:
                                            e.target.value,
                                    })
                                }
                                required
                            />

                            {/* POSITION */}
                            <InputField
                                label="Position"
                                value={
                                    facultyForm.position
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        position:
                                            e.target.value,
                                    })
                                }
                                placeholder="Example: Instructor"
                                required
                            />

                            {/* DEPARTMENT */}
                            <InputField
                                label="Department"
                                value={
                                    facultyForm.department
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        department:
                                            e.target.value,
                                    })
                                }
                                placeholder="Example: College of Information Technology"
                            />

                            {/* SEX */}
                            <SelectField
                                label="Sex"
                                value={
                                    facultyForm.sex
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        sex:
                                            e.target.value,
                                    })
                                }
                                options={SEX_OPTIONS}
                            />

                            {/* BIRTH DATE */}
                            <InputField
                                label="Birth Date"
                                type="date"
                                value={
                                    facultyForm.birth_date
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        birth_date:
                                            e.target.value,
                                    })
                                }
                            />

                            {/* CONTACT */}
                            <InputField
                                label="Contact Number"
                                value={
                                    facultyForm.contact_number
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        contact_number:
                                            e.target.value,
                                    })
                                }
                            />

                            {/* ADDRESS */}
                            <div className="md:col-span-2">
                                <InputField
                                    label="Address"
                                    value={
                                        facultyForm.address
                                    }
                                    onChange={(e) =>
                                        setFacultyForm({
                                            ...facultyForm,
                                            address:
                                                e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t pt-5">
                            <button
                                type="button"
                                onClick={
                                    closeFacultyForm
                                }
                                disabled={saving}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                {editingFaculty
                                    ? "Update Faculty"
                                    : "Save Faculty"}
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
                                    label="Full Name"
                                    value={getFullName(
                                        viewingStudent
                                    )}
                                />

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
                            {Array.isArray(
                                viewingStudent.clinic_visits
                            ) &&
                            viewingStudent
                                .clinic_visits.length > 0 ? (
                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Visit Date
                                                </th>

                                                <th className="px-4 py-3">
                                                    Reason
                                                </th>

                                                <th className="px-4 py-3">
                                                    Nurse
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {viewingStudent.clinic_visits.map(
                                                (
                                                    visit,
                                                    index
                                                ) => (
                                                    <tr
                                                        key={
                                                            visit.id ||
                                                            index
                                                        }
                                                    >
                                                        <td className="px-4 py-3">
                                                            {formatDate(
                                                                visit.visit_date
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {visit.reason ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-4 py-3">
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
                    title="Staff Information"
                    onClose={() =>
                        setViewingStaff(null)
                    }
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
                                    label="Full Name"
                                    value={getFullName(
                                        viewingStaff
                                    )}
                                />

                                <InfoItem
                                    label="Staff ID"
                                    value={
                                        viewingStaff.staff_id
                                    }
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
                                        viewingStaff.department
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
                FACULTY VIEW
            ================================================================ */}

            {viewingFaculty && (
                <Modal
                    title="Faculty Information"
                    onClose={() =>
                        setViewingFaculty(null)
                    }
                >
                    <div className="p-6">

                        <div className="mb-6 rounded-xl bg-blue-50 px-5 py-4">
                            <p className="text-lg font-semibold text-gray-800">
                                {getFullName(
                                    viewingFaculty
                                )}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                {viewingFaculty.position ||
                                    "-"}
                            </p>

                            <span className="mt-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                Employee ID:{" "}
                                {
                                    viewingFaculty.employee_id
                                }
                            </span>
                        </div>

                        <RecordSection
                            icon="🧑"
                            title="Personal Information"
                        >
                            <div className="grid gap-3 sm:grid-cols-2">
                                <InfoItem
                                    label="Full Name"
                                    value={getFullName(
                                        viewingFaculty
                                    )}
                                />

                                <InfoItem
                                    label="Employee ID"
                                    value={
                                        viewingFaculty.employee_id
                                    }
                                />

                                <InfoItem
                                    label="Sex"
                                    value={
                                        viewingFaculty.sex
                                    }
                                />

                                <InfoItem
                                    label="Birth Date"
                                    value={formatDate(
                                        viewingFaculty.birth_date
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
                                        viewingFaculty.position
                                    }
                                />

                                <InfoItem
                                    label="Department"
                                    value={
                                        viewingFaculty.department
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
                                        viewingFaculty.contact_number
                                    }
                                />

                                <InfoItem
                                    label="Address"
                                    value={
                                        viewingFaculty.address
                                    }
                                />
                            </div>
                        </RecordSection>
                    </div>
                </Modal>
            )}

            {/* ================================================================
                CONFIRMATION
            ================================================================ */}

            {confirmation && (
                <ConfirmationModal
                    open={Boolean(confirmation)}
                    title={confirmation.title}
                    message={confirmation.message}
                    confirmText={
                        confirmation.confirmText
                    }
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
