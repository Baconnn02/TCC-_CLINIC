import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Briefcase, CheckCircle2, GraduationCap, X } from "lucide-react";
import api from "../services/api";
import { ConfirmationModal, InfoItem, Modal, RecordSection } from "../components/student-management/FieldsAndModals";
import { StudentForms, type StudentFormValues, type StaffFormValues, type FacultyFormValues } from "../components/student-management/StudentForms";







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







function StudentManagement() {






    const [students, setStudents] = useState([]);
    const [studentPagination, setStudentPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 25,
    });
    const [staff, setStaff] = useState([]);
    const [faculties, setFaculties] = useState([]);







    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successToast, setSuccessToast] = useState("");







    const [showTypeChoice, setShowTypeChoice] = useState(false);
    const [showStudentForm, setShowStudentForm] = useState(false);
    const [showStaffForm, setShowStaffForm] = useState(false);
    const [showFacultyForm, setShowFacultyForm] = useState(false);







    const [editingStudent, setEditingStudent] = useState(null);
    const [editingStaff, setEditingStaff] = useState(null);
    const [editingFaculty, setEditingFaculty] = useState(null);







    const [viewingStudent, setViewingStudent] = useState(null);
    const [viewingStaff, setViewingStaff] = useState(null);
    const [viewingFaculty, setViewingFaculty] = useState(null);







    const [confirmation, setConfirmation] = useState(null);







    const [studentForm, setStudentForm] = useState<StudentFormValues>({
        ...EMPTY_STUDENT_FORM,
    });

    const [staffForm, setStaffForm] = useState<StaffFormValues>({
        ...EMPTY_STAFF_FORM,
    });

    const [facultyForm, setFacultyForm] = useState<FacultyFormValues>({
        ...EMPTY_FACULTY_FORM,
    });







    useEffect(() => {
        const timeout = setTimeout(() => fetchData(), 0);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (!successToast) return;
        const timeout = setTimeout(() => setSuccessToast(""), 4500);
        return () => clearTimeout(timeout);
    }, [successToast]);

    const initialStudentSearch = useRef(true);







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

    const loadStudentPage = useCallback(async (page, searchTerm = "") => {
        try {
            const response = await api.get("/students", {
                params: {
                    page,
                    per_page: 25,
                    search: searchTerm.trim() || undefined,
                },
            });

            setStudents(response.data?.data || []);
            setStudentPagination({
                current_page: response.data?.current_page || 1,
                last_page: response.data?.last_page || 1,
                total: response.data?.total || 0,
                per_page: response.data?.per_page || 25,
            });
        } catch (err) {
            console.error("Student loading error:", err);
            setError(
                err.response?.data?.message ||
                    "Unable to load student records."
            );
        }
    }, []);

    useEffect(() => {
        if (initialStudentSearch.current) {
            initialStudentSearch.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            loadStudentPage(1, search);
        }, 250);

        return () => clearTimeout(timeout);
    }, [search, loadStudentPage]);







    async function fetchData() {
        setLoading(true);
        setError("");

        try {
            const [
                studentsResponse,
                staffResponse,
                facultiesResponse,
            ] = await Promise.all([
                api.get("/students", {
                    params: {
                        page: studentPagination.current_page,
                        per_page: studentPagination.per_page,
                        search: search.trim() || undefined,
                    },
                }),
                api.get("/staff"),
                api.get("/faculties"),
            ]);

            const studentData = studentsResponse.data?.data || [];

            const staffData =
                Array.isArray(staffResponse.data)
                    ? staffResponse.data
                    : staffResponse.data?.data || [];

            const facultyData =
                Array.isArray(facultiesResponse.data)
                    ? facultiesResponse.data
                    : facultiesResponse.data?.data || [];

            setStudents(studentData);
            setStudentPagination({
                current_page: studentsResponse.data?.current_page || 1,
                last_page: studentsResponse.data?.last_page || 1,
                total: studentsResponse.data?.total || 0,
                per_page: studentsResponse.data?.per_page || 25,
            });
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
    }







    const filteredStudents = students;







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







    const handleConfirmation = async () => {
        if (!confirmation || saving) {
            return;
        }

        setSaving(true);
        setError("");
        let completedMessage = "";

        try {
            switch (confirmation.type) {






                case "addStudent":
                    await api.post(
                        "/students",
                        studentForm
                    );

                    closeStudentForm();
                    completedMessage = "Patient added successfully.";
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
            if (completedMessage) setSuccessToast(completedMessage);
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







    return (
        <div className="tcc-module-page relative min-h-screen overflow-hidden p-5 sm:p-6">


            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#8f7154]/5 blur-3xl" />

                <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-[#8f7154]/5 blur-3xl" />

                <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-amber-100/40 blur-3xl" />

                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#8f7154 1px, transparent 1px), linear-gradient(90deg, #8f7154 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            <div className="tcc-module-content relative mx-auto max-w-[1500px]">


                <div className="tcc-module-header mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#3d3329]">
                            PATIENT MANAGEMENT
                        </h1>

                        <p className="mt-1 text-sm text-stone-500">
                            Manage patient, staff, and faculty information.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            setShowTypeChoice(true);
                        }}
                        className="rounded-xl bg-[#8a6f50] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#735a40]"
                    >
                        + Add New Record
                    </button>
                </div>


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


                <div className="mb-6 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search patient, staff, or faculty..."
                        className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    />
                </div>

                {loading ? (
                    <div className="rounded-xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
                        Loading records...
                    </div>
                ) : (
                    <>




                        <div className="mb-8 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                            <div className="border-b border-stone-200 px-5 py-4">
                                <h2 className="font-semibold text-stone-800">
                                    Students
                                </h2>

                                <p className="text-sm text-stone-500">
                                    {studentPagination.total} student(s)
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] table-fixed text-left text-sm">
                                    <colgroup>
                                        <col style={{ width: "15%" }} />
                                        <col style={{ width: "25%" }} />
                                        <col style={{ width: "12%" }} />
                                        <col style={{ width: "14%" }} />
                                        <col style={{ width: "12%" }} />
                                        <col style={{ width: "22%" }} />
                                    </colgroup>
                                    <thead className="bg-stone-50 text-xs uppercase text-stone-500">
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

                                    <tbody className="divide-y divide-stone-100">
                                        {filteredStudents.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-5 py-8 text-center text-stone-500"
                                                >
                                                    No students found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStudents.map(
                                                (student) => (
                                                    <tr
                                                        key={student.id}
                                                        className="align-middle hover:bg-stone-50"
                                                    >
                                                        <td className="px-5 py-4 font-medium text-stone-800">
                                                            {student.student_id}
                                                        </td>

                                                        <td className="px-5 py-4 text-stone-700">
                                                            {getFullName(
                                                                student
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-stone-600">
                                                            {student.course ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-stone-600">
                                                            {student.year_level ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-stone-600">
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
                                                                    className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200"
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
                                                                    className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-100"
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
                            <div className="flex flex-col gap-3 border-t border-stone-100 px-5 py-4 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-center sm:text-left">
                                    Page {studentPagination.current_page} of {studentPagination.last_page}
                                </span>
                                <div className="flex justify-center gap-2 sm:justify-end">
                                    <button
                                        type="button"
                                        disabled={studentPagination.current_page <= 1}
                                        onClick={() =>
                                            loadStudentPage(
                                                studentPagination.current_page - 1,
                                                search
                                            )
                                        }
                                        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        type="button"
                                        disabled={studentPagination.current_page >= studentPagination.last_page}
                                        onClick={() =>
                                            loadStudentPage(
                                                studentPagination.current_page + 1,
                                                search
                                            )
                                        }
                                        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>





                        <div className="mb-8 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                            <div className="border-b border-stone-200 px-5 py-4">
                                <h2 className="font-semibold text-stone-800">
                                    Staff
                                </h2>

                                <p className="text-sm text-stone-500">
                                    {filteredStaff.length} staff record(s)
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] table-fixed text-left text-sm">
                                    <colgroup>
                                        <col style={{ width: "15%" }} />
                                        <col style={{ width: "25%" }} />
                                        <col style={{ width: "12%" }} />
                                        <col style={{ width: "14%" }} />
                                        <col style={{ width: "12%" }} />
                                        <col style={{ width: "22%" }} />
                                    </colgroup>
                                    <thead className="bg-stone-50 text-xs uppercase text-stone-500">
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

                                    <tbody className="divide-y divide-stone-100">
                                        {filteredStaff.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-5 py-8 text-center text-stone-500"
                                                >
                                                    No staff found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStaff.map(
                                                (person) => (
                                                    <tr
                                                        key={person.id}
                                                        className="align-middle hover:bg-stone-50"
                                                    >
                                                        <td className="px-5 py-4 font-medium text-stone-800">
                                                            {person.staff_id}
                                                        </td>

                                                        <td className="px-5 py-4 text-stone-700">
                                                            {getFullName(
                                                                person
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-stone-600">
                                                            {person.position ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-stone-600">
                                                            {person.department ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-stone-600">
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
                                                                    className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200"
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
                                                                    className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-100"
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





                        <div className="mb-8 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                            <div className="border-b border-stone-200 px-5 py-4">
                                <h2 className="font-semibold text-stone-800">
                                    Faculty
                                </h2>

                                <p className="text-sm text-stone-500">
                                    {filteredFaculties.length} faculty record(s)
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] table-fixed text-left text-sm">
                                    <colgroup>
                                        <col style={{ width: "15%" }} />
                                        <col style={{ width: "25%" }} />
                                        <col style={{ width: "12%" }} />
                                        <col style={{ width: "14%" }} />
                                        <col style={{ width: "12%" }} />
                                        <col style={{ width: "22%" }} />
                                    </colgroup>
                                    <thead className="bg-stone-50 text-xs uppercase text-stone-500">
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

                                    <tbody className="divide-y divide-stone-100">
                                        {filteredFaculties.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-5 py-8 text-center text-stone-500"
                                                >
                                                    No faculty found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredFaculties.map(
                                                (faculty) => (
                                                    <tr
                                                        key={faculty.id}
                                                        className="align-middle hover:bg-stone-50"
                                                    >
                                                        <td className="px-5 py-4 font-medium text-stone-800">
                                                            {
                                                                faculty.employee_id
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4 text-stone-700">
                                                            {getFullName(
                                                                faculty
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-stone-600">
                                                            {faculty.position ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-stone-600">
                                                            {faculty.department ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-stone-600">
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
                                                                    className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200"
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
                                                                    className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-100"
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





            {showTypeChoice && (
                <Modal
                    title="Choose Record Type"
                    onClose={() =>
                        setShowTypeChoice(false)
                    }
                >
                    <div className="grid gap-4 p-6 md:grid-cols-3">


                        <button
                            type="button"
                            onClick={() =>
                                openStudentForm()
                            }
                            className="rounded-xl border border-stone-200 p-6 text-left transition hover:border-amber-500 hover:bg-amber-50"
                        >
                            <div className="mb-3 flex h-9 items-center text-[#8a6f50]">
                                <GraduationCap size={32} strokeWidth={1.8} aria-hidden="true" />
                            </div>

                            <h3 className="font-semibold text-stone-800">
                                Student
                            </h3>

                            <p className="mt-1 text-sm text-stone-500">
                                Add a new student record.
                            </p>
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                openStaffForm()
                            }
                            className="rounded-xl border border-stone-200 p-6 text-left transition hover:border-amber-500 hover:bg-amber-50"
                        >
                            <div className="mb-3 flex h-9 items-center text-[#8a6f50]">
                                <Briefcase size={30} strokeWidth={1.8} aria-hidden="true" />
                            </div>

                            <h3 className="font-semibold text-stone-800">
                                Staff
                            </h3>

                            <p className="mt-1 text-sm text-stone-500">
                                Add a new staff record.
                            </p>
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                openFacultyForm()
                            }
                            className="rounded-xl border border-stone-200 p-6 text-left transition hover:border-amber-500 hover:bg-amber-50"
                        >
                            <div className="mb-3 flex h-9 items-center text-[#8a6f50]">
                                <BookOpen size={30} strokeWidth={1.8} aria-hidden="true" />
                            </div>

                            <h3 className="font-semibold text-stone-800">
                                Faculty
                            </h3>

                            <p className="mt-1 text-sm text-stone-500">
                                Add a new faculty record.
                            </p>
                        </button>
                    </div>
                </Modal>
            )}





            <StudentForms showStudentForm={showStudentForm} editingStudent={Boolean(editingStudent)} closeStudentForm={closeStudentForm} handleStudentSubmit={handleStudentSubmit} studentForm={studentForm} setStudentForm={setStudentForm} saving={saving} showStaffForm={showStaffForm} editingStaff={Boolean(editingStaff)} closeStaffForm={closeStaffForm} handleStaffSubmit={handleStaffSubmit} staffForm={staffForm} setStaffForm={setStaffForm} showFacultyForm={showFacultyForm} editingFaculty={Boolean(editingFaculty)} closeFacultyForm={closeFacultyForm} handleFacultySubmit={handleFacultySubmit} facultyForm={facultyForm} setFacultyForm={setFacultyForm} />



            {viewingStudent && (
                <Modal
                    title="Student Information"
                    onClose={() =>
                        setViewingStudent(null)
                    }
                    maxWidth="max-w-4xl"
                >
                    <div className="p-6">

                        <div className="mb-6 flex flex-col gap-1 rounded-xl bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-lg font-semibold text-stone-800">
                                    {getFullName(
                                        viewingStudent
                                    )}
                                </p>

                                <p className="text-sm text-stone-500">
                                    {viewingStudent.course ||
                                        "-"}
                                    {" · "}
                                    {viewingStudent.year_level ||
                                        "-"}
                                </p>
                            </div>

                            <span className="inline-flex w-fit items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
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
                                <div className="overflow-hidden rounded-lg border border-stone-200">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-stone-50 text-xs uppercase text-stone-500">
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

                                        <tbody className="divide-y divide-stone-100">
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
                                <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-5 py-8 text-center">
                                    <p className="text-sm font-medium text-stone-600">
                                        No clinic visits recorded.
                                    </p>
                                </div>
                            )}
                        </RecordSection>
                    </div>
                </Modal>
            )}





            {viewingStaff && (
                <Modal
                    title="Staff Information"
                    onClose={() =>
                        setViewingStaff(null)
                    }
                >
                    <div className="p-6">

                        <div className="mb-6 rounded-xl bg-amber-50 px-5 py-4">
                            <p className="text-lg font-semibold text-stone-800">
                                {getFullName(
                                    viewingStaff
                                )}
                            </p>

                            <p className="mt-1 text-sm text-stone-500">
                                {viewingStaff.position ||
                                    "-"}
                            </p>

                            <span className="mt-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
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





            {viewingFaculty && (
                <Modal
                    title="Faculty Information"
                    onClose={() =>
                        setViewingFaculty(null)
                    }
                >
                    <div className="p-6">

                        <div className="mb-6 rounded-xl bg-amber-50 px-5 py-4">
                            <p className="text-lg font-semibold text-stone-800">
                                {getFullName(
                                    viewingFaculty
                                )}
                            </p>

                            <p className="mt-1 text-sm text-stone-500">
                                {viewingFaculty.position ||
                                    "-"}
                            </p>

                            <span className="mt-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
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

            {successToast && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed bottom-6 right-6 z-[100] flex max-w-sm items-start gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3.5 text-sm text-stone-700 shadow-xl shadow-emerald-950/10"
                >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 size={19} aria-hidden="true" />
                    </span>
                    <span className="flex-1">
                        <span className="block font-semibold text-stone-900">Success</span>
                        <span className="mt-0.5 block">{successToast}</span>
                    </span>
                    <button
                        type="button"
                        aria-label="Dismiss notification"
                        onClick={() => setSuccessToast("")}
                        className="rounded-md p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default StudentManagement;
