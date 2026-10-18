import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, Briefcase, CheckCircle2, ChevronDown, GraduationCap, RotateCcw, Search, X } from "lucide-react";
import api from "../services/api";
import { getCachedRecord, invalidateRecordCache } from "../services/recordCache";
import { ConfirmationModal, InfoItem, Modal, RecordSection } from "../components/student-management/FieldsAndModals";
import { StudentForms, type StudentFormValues, type StaffFormValues, type FacultyFormValues } from "../components/student-management/StudentForms";
import FloatingToast from "../components/common/FloatingToast";
import { addClinicNotification } from "../services/notifications";







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

    const [searchParams, setSearchParams] = useSearchParams();






    const [students, setStudents] = useState([]);
    const [studentPagination, setStudentPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 25,
    });
    const [staff, setStaff] = useState([]);
    const [staffPagination, setStaffPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 25 });
    const [faculties, setFaculties] = useState([]);
    const [facultyPagination, setFacultyPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 25 });







    const [search, setSearch] = useState(
        () => searchParams.get("search") || ""
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successToast, setSuccessToast] = useState("");

    const [sexFilter, setSexFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name_asc");

    const hasActiveFilters = Boolean(
        search.trim() ||
        sexFilter !== "all" ||
        courseFilter !== "all" ||
        sortBy !== "name_asc"
    );

    const resetAllFilters = () => {
        setSearch("");
        setSexFilter("all");
        setCourseFilter("all");
        setSortBy("name_asc");
    };







    const [showAddPatientDropdown, setShowAddPatientDropdown] = useState(false);
    const addPatientDropdownRef = useRef<HTMLDivElement>(null);
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
            const normalizedSearch = searchTerm.trim();
            const response = await getCachedRecord(
                `students:list:${page}:${normalizedSearch}`,
                () => api.get("/students", {
                    params: {
                        page,
                        per_page: 25,
                        search: normalizedSearch || undefined,
                    },
                })
            );

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

    const loadStaffPage = useCallback(async (page, searchTerm = "") => {
        try {
            const normalizedSearch = searchTerm.trim();
            const response = await getCachedRecord(
                `staff:list:${page}:${normalizedSearch}`,
                () => api.get("/staff", {
                    params: { page, per_page: 25, search: normalizedSearch || undefined },
                })
            );
            setStaff(response.data?.data || []);
            setStaffPagination({
                current_page: response.data?.current_page || 1,
                last_page: response.data?.last_page || 1,
                total: response.data?.total || 0,
                per_page: response.data?.per_page || 25,
            });
        } catch (err) {
            console.error("Staff loading error:", err);
            setError(err.response?.data?.message || "Unable to load staff records.");
        }
    }, []);

    const loadFacultyPage = useCallback(async (page, searchTerm = "") => {
        try {
            const normalizedSearch = searchTerm.trim();
            const response = await getCachedRecord(
                `faculties:list:${page}:${normalizedSearch}`,
                () => api.get("/faculties", {
                    params: { page, per_page: 25, search: normalizedSearch || undefined },
                })
            );
            setFaculties(response.data?.data || []);
            setFacultyPagination({
                current_page: response.data?.current_page || 1,
                last_page: response.data?.last_page || 1,
                total: response.data?.total || 0,
                per_page: response.data?.per_page || 25,
            });
        } catch (err) {
            console.error("Faculty loading error:", err);
            setError(err.response?.data?.message || "Unable to load faculty records.");
        }
    }, []);

    useEffect(() => {
        if (initialStudentSearch.current) {
            initialStudentSearch.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            loadStudentPage(1, search);
            loadStaffPage(1, search);
            loadFacultyPage(1, search);
        }, 250);

        return () => clearTimeout(timeout);
    }, [search, loadStudentPage, loadStaffPage, loadFacultyPage]);

    useEffect(() => {
        if (!showAddPatientDropdown) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                addPatientDropdownRef.current &&
                !addPatientDropdownRef.current.contains(event.target as Node)
            ) {
                setShowAddPatientDropdown(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowAddPatientDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showAddPatientDropdown]);

    async function fetchData() {
        setLoading(true);
        setError("");

        try {
            await Promise.all([
                loadStudentPage(1, search),
                loadStaffPage(1, search),
                loadFacultyPage(1, search),
            ]);
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







    const filteredStudents = useMemo(() => {
        return (students || [])
            .filter((s) => {
                if (sexFilter !== "all" && (s.sex || "").toLowerCase() !== sexFilter.toLowerCase()) {
                    return false;
                }
                if (courseFilter !== "all" && s.course !== courseFilter) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                const nameA = `${a.last_name || ""} ${a.first_name || ""}`.toLowerCase();
                const nameB = `${b.last_name || ""} ${b.first_name || ""}`.toLowerCase();
                if (sortBy === "name_asc") return nameA.localeCompare(nameB);
                if (sortBy === "name_desc") return nameB.localeCompare(nameA);
                if (sortBy === "id_asc") return (a.student_id || "").localeCompare(b.student_id || "");
                return 0;
            });
    }, [students, sexFilter, courseFilter, sortBy]);

    const filteredStaff = useMemo(() => {
        return (staff || [])
            .filter((s) => {
                if (sexFilter !== "all" && (s.sex || "").toLowerCase() !== sexFilter.toLowerCase()) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                const nameA = `${a.last_name || ""} ${a.first_name || ""}`.toLowerCase();
                const nameB = `${b.last_name || ""} ${b.first_name || ""}`.toLowerCase();
                if (sortBy === "name_asc") return nameA.localeCompare(nameB);
                if (sortBy === "name_desc") return nameB.localeCompare(nameA);
                if (sortBy === "id_asc") return (a.staff_id || "").localeCompare(b.staff_id || "");
                return 0;
            });
    }, [staff, sexFilter, sortBy]);

    const filteredFaculties = useMemo(() => {
        return (faculties || [])
            .filter((f) => {
                if (sexFilter !== "all" && (f.sex || "").toLowerCase() !== sexFilter.toLowerCase()) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                const nameA = `${a.last_name || ""} ${a.first_name || ""}`.toLowerCase();
                const nameB = `${b.last_name || ""} ${b.first_name || ""}`.toLowerCase();
                if (sortBy === "name_asc") return nameA.localeCompare(nameB);
                if (sortBy === "name_desc") return nameB.localeCompare(nameA);
                if (sortBy === "id_asc") return (a.employee_id || "").localeCompare(b.employee_id || "");
                return 0;
            });
    }, [faculties, sexFilter, sortBy]);







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

        setShowAddPatientDropdown(false);
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

        setShowAddPatientDropdown(false);
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

        setShowAddPatientDropdown(false);
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
            const response = await getCachedRecord(
                `students:detail:${student.id}`,
                () => api.get(`/students/${student.id}`)
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

    const closeStudentProfile = () => {
        setViewingStudent(null);
        setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams);
            nextParams.delete("profile_type");
            nextParams.delete("profile_code");
            return nextParams;
        }, { replace: true });
    };

    useEffect(() => {
        const profileType = searchParams.get("profile_type");
        const profileCode = searchParams.get("profile_code");

        const profileConfig = {
            student: {
                collection: "students",
                identifier: "student_id",
                setProfile: setViewingStudent,
            },
            staff: {
                collection: "staff",
                identifier: "staff_id",
                setProfile: setViewingStaff,
            },
            faculty: {
                collection: "faculties",
                identifier: "employee_id",
                setProfile: setViewingFaculty,
            },
        }[profileType];

        if (!profileCode || !profileConfig) {
            return undefined;
        }

        let cancelled = false;

        const loadAndOpenStudent = async () => {
            try {
                const normalizedProfileCode = profileCode.trim().toLowerCase();
                const personResponse = await getCachedRecord(
                    `${profileConfig.collection}:profile:${normalizedProfileCode}`,
                    () => api.get(`/${profileConfig.collection}`, {
                        params: {
                            search: profileCode,
                            per_page: 100,
                        },
                    })
                );
                const person = personResponse.data?.data?.find(
                    (record) =>
                        String(record[profileConfig.identifier]).trim().toLowerCase() ===
                        profileCode.trim().toLowerCase()
                );

                if (!person) {
                    throw new Error(`${profileType} ID was not found.`);
                }

                const response = await getCachedRecord(
                    `${profileConfig.collection}:detail:${person.id}`,
                    () => api.get(`/${profileConfig.collection}/${encodeURIComponent(person.id)}`)
                );

                if (!cancelled) {
                    setViewingStudent(null);
                    setViewingStaff(null);
                    setViewingFaculty(null);
                    profileConfig.setProfile(response.data);
                }
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error("Student profile loading error:", err);
                setError(
                    getErrorMessage(
                        err,
                        "Unable to load student record."
                    )
                );
            }
        };

        void loadAndOpenStudent();

        return () => {
            cancelled = true;
        };
    }, [searchParams]);







    const viewStaffRecord = async (person) => {
        setError("");

        try {
            const response = await getCachedRecord(
                `staff:detail:${person.id}`,
                () => api.get(`/staff/${person.id}`)
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
            const response = await getCachedRecord(
                `faculties:detail:${faculty.id}`,
                () => api.get(`/faculties/${faculty.id}`)
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
                    completedMessage = "Student added successfully.";
                    addClinicNotification({
                        type: "add",
                        title: "Student Registered",
                        description: `${getFullName(studentForm)} (${studentForm.student_id || "Student"}) registered`,
                        category: "patient",
                    });
                    break;

                case "updateStudent":
                    await api.put(
                        `/students/${editingStudent.id}`,
                        studentForm
                    );

                    closeStudentForm();
                    completedMessage = "Student updated successfully.";
                    addClinicNotification({
                        type: "edit",
                        title: "Student Updated",
                        description: `${getFullName(studentForm)} profile updated`,
                        category: "patient",
                    });
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

                    completedMessage = "Student deleted successfully.";
                    addClinicNotification({
                        type: "delete",
                        title: "Student Deleted",
                        description: `${getFullName(confirmation.person)} removed from student records`,
                        category: "patient",
                    });
                    break;

                case "addStaff":
                    await api.post(
                        "/staff",
                        staffForm
                    );

                    closeStaffForm();
                    completedMessage = "Staff member added successfully.";
                    addClinicNotification({
                        type: "add",
                        title: "Staff Registered",
                        description: `${getFullName(staffForm)} registered`,
                        category: "patient",
                    });
                    break;

                case "updateStaff":
                    await api.put(
                        `/staff/${editingStaff.id}`,
                        staffForm
                    );

                    closeStaffForm();
                    completedMessage = "Staff member updated successfully.";
                    addClinicNotification({
                        type: "edit",
                        title: "Staff Updated",
                        description: `${getFullName(staffForm)} profile updated`,
                        category: "patient",
                    });
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

                    completedMessage = "Staff member deleted successfully.";
                    addClinicNotification({
                        type: "delete",
                        title: "Staff Deleted",
                        description: `${getFullName(confirmation.person)} removed from staff records`,
                        category: "patient",
                    });
                    break;

                case "addFaculty":
                    await api.post(
                        "/faculties",
                        facultyForm
                    );

                    closeFacultyForm();
                    completedMessage = "Faculty member added successfully.";
                    addClinicNotification({
                        type: "add",
                        title: "Faculty Registered",
                        description: `${getFullName(facultyForm)} registered`,
                        category: "patient",
                    });
                    break;

                case "updateFaculty":
                    await api.put(
                        `/faculties/${editingFaculty.id}`,
                        facultyForm
                    );

                    closeFacultyForm();
                    completedMessage = "Faculty member updated successfully.";
                    addClinicNotification({
                        type: "edit",
                        title: "Faculty Updated",
                        description: `${getFullName(facultyForm)} profile updated`,
                        category: "patient",
                    });
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

                    completedMessage = "Faculty member deleted successfully.";
                    addClinicNotification({
                        type: "delete",
                        title: "Faculty Deleted",
                        description: `${getFullName(confirmation.person)} removed from faculty records`,
                        category: "patient",
                    });
                    break;

                default:
                    break;
            }

            setConfirmation(null);

            invalidateRecordCache();
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
                        <h1 className="text-2xl font-bold tracking-tight text-[#3d3329] dark:text-[#f8f3eb]">
                            PATIENT MANAGEMENT
                        </h1>

                        <p className="mt-1 text-sm text-[#887d70] dark:text-[#a99d8f]">
                            Manage patient, staff, and faculty information.
                        </p>
                    </div>

                    <div className="relative" ref={addPatientDropdownRef}>
                        <button
                            type="button"
                            onClick={() => {
                                setError("");
                                setShowAddPatientDropdown((prev) => !prev);
                            }}
                            aria-expanded={showAddPatientDropdown}
                            aria-haspopup="true"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#8a6f50] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#735a40] focus:outline-none focus:ring-2 focus:ring-[#8a6f50]/40"
                        >
                            <span>+ Add Patient</span>
                            <ChevronDown
                                size={16}
                                aria-hidden="true"
                                className={`transition-transform duration-200 ${showAddPatientDropdown ? "rotate-180" : ""}`}
                            />
                        </button>

                        {showAddPatientDropdown && (
                            <div
                                role="menu"
                                aria-orientation="vertical"
                                className="absolute right-0 top-full z-30 mt-2 w-72 divide-y divide-[#eee7de] rounded-xl border border-[#e8dfd4] bg-white p-1.5 shadow-xl dark:divide-[#382f25] dark:border-[#4e4234] dark:bg-[#211c17]"
                            >
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setShowAddPatientDropdown(false);
                                        openStudentForm();
                                    }}
                                    className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition hover:bg-[#fcfaf6] dark:hover:bg-[#2a221a]"
                                >
                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3ebdf] text-[#8a6f50] dark:bg-[#382f25] dark:text-[#d3bca2]">
                                        <GraduationCap size={22} strokeWidth={1.8} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[#3d3329] dark:text-[#f8f3eb]">Student</div>
                                        <div className="mt-0.5 text-xs text-[#887d70] dark:text-[#a99d8f]">Add a new student record.</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setShowAddPatientDropdown(false);
                                        openStaffForm();
                                    }}
                                    className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition hover:bg-[#fcfaf6] dark:hover:bg-[#2a221a]"
                                >
                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3ebdf] text-[#8a6f50] dark:bg-[#382f25] dark:text-[#d3bca2]">
                                        <Briefcase size={20} strokeWidth={1.8} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[#3d3329] dark:text-[#f8f3eb]">Staff</div>
                                        <div className="mt-0.5 text-xs text-[#887d70] dark:text-[#a99d8f]">Add a new staff record.</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setShowAddPatientDropdown(false);
                                        openFacultyForm();
                                    }}
                                    className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition hover:bg-[#fcfaf6] dark:hover:bg-[#2a221a]"
                                >
                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3ebdf] text-[#8a6f50] dark:bg-[#382f25] dark:text-[#d3bca2]">
                                        <BookOpen size={20} strokeWidth={1.8} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[#3d3329] dark:text-[#f8f3eb]">Faculty</div>
                                        <div className="mt-0.5 text-xs text-[#887d70] dark:text-[#a99d8f]">Add a new faculty record.</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
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


                <div className="mb-6 rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-sm sm:p-5 dark:border-[#4e4234] dark:bg-[#211c17]">
                    {/* Search and Filters Controls */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-12">
                        {/* Search Input */}
                        <div className="relative sm:col-span-2 md:col-span-5">
                            <label htmlFor="patient-search" className="sr-only">
                                Search patients by name, ID, course, or department
                            </label>
                            <Search
                                size={18}
                                aria-hidden="true"
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a99d8f] dark:text-[#887d70]"
                            />
                            <input
                                id="patient-search"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, ID, course, or department..."
                                autoComplete="off"
                                className="w-full rounded-xl border border-[#e8dfd4] bg-[#fcfaf6] py-2.5 pl-10 pr-10 text-sm text-[#3d3329] outline-none transition placeholder:text-[#a99d8f] focus:border-[#8a6f50] focus:bg-white focus:ring-4 focus:ring-[#8a6f50]/10 dark:border-[#4e4234] dark:bg-[#261f19] dark:text-[#f8f3eb] dark:placeholder:text-[#887d70] dark:focus:border-[#8a6f50] dark:focus:bg-[#211c17]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                    className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#a99d8f] hover:bg-[#f6f1e9] hover:text-[#3c332a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50] dark:text-[#887d70] dark:hover:bg-[#382f25] dark:hover:text-[#f8f3eb]"
                                >
                                    <X size={15} aria-hidden="true" />
                                </button>
                            )}
                        </div>

                        {/* Sex Filter */}
                        <div className="md:col-span-2">
                            <label htmlFor="sex-filter" className="sr-only">
                                Filter by Sex
                            </label>
                            <select
                                id="sex-filter"
                                value={sexFilter}
                                onChange={(e) => setSexFilter(e.target.value)}
                                aria-label="Filter by Sex"
                                className="w-full rounded-xl border border-[#e8dfd4] bg-[#fcfaf6] px-3.5 py-2.5 text-sm font-medium text-[#3d3329] outline-none transition focus:border-[#8a6f50] focus:bg-white focus:ring-4 focus:ring-[#8a6f50]/10 dark:border-[#4e4234] dark:bg-[#261f19] dark:text-[#f8f3eb] dark:focus:border-[#8a6f50] dark:focus:bg-[#211c17]"
                            >
                                <option value="all">All Sex</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        {/* Course Filter */}
                        <div className="md:col-span-3">
                            <label htmlFor="course-filter" className="sr-only">
                                Filter by Course
                            </label>
                            <select
                                id="course-filter"
                                value={courseFilter}
                                onChange={(e) => setCourseFilter(e.target.value)}
                                aria-label="Filter by Course"
                                className="w-full rounded-xl border border-[#e8dfd4] bg-[#fcfaf6] px-3.5 py-2.5 text-sm font-medium text-[#3d3329] outline-none transition focus:border-[#8a6f50] focus:bg-white focus:ring-4 focus:ring-[#8a6f50]/10 dark:border-[#4e4234] dark:bg-[#261f19] dark:text-[#f8f3eb] dark:focus:border-[#8a6f50] dark:focus:bg-[#211c17]"
                            >
                                <option value="all">All Courses</option>
                                {COURSES.map((course) => (
                                    <option key={course} value={course}>
                                        {course}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Filter */}
                        <div className="md:col-span-2">
                            <label htmlFor="sort-filter" className="sr-only">
                                Sort records
                            </label>
                            <select
                                id="sort-filter"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                aria-label="Sort records"
                                className="w-full rounded-xl border border-[#e8dfd4] bg-[#fcfaf6] px-3.5 py-2.5 text-sm font-medium text-[#3d3329] outline-none transition focus:border-[#8a6f50] focus:bg-white focus:ring-4 focus:ring-[#8a6f50]/10 dark:border-[#4e4234] dark:bg-[#261f19] dark:text-[#f8f3eb] dark:focus:border-[#8a6f50] dark:focus:bg-[#211c17]"
                            >
                                <option value="name_asc">Sort: Name (A-Z)</option>
                                <option value="name_desc">Sort: Name (Z-A)</option>
                                <option value="id_asc">Sort: ID / Code</option>
                            </select>
                        </div>
                    </div>

                    {/* Active Filter Tags */}
                    {hasActiveFilters && (
                        <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-[#eee7de] pt-3 text-xs dark:border-[#4e4234]">
                            <span className="font-semibold text-[#887d70] dark:text-[#a99d8f]">Active filters:</span>
                            {search.trim() && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8dfd4] bg-[#f3ebdf] px-2.5 py-1 font-medium text-[#6d5942] dark:border-[#4e4234] dark:bg-[#382f25] dark:text-[#e5dcd1]">
                                    Search: "{search}"
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        aria-label="Remove search filter"
                                        className="text-[#8a6f50] hover:text-[#3d3329] dark:text-[#d3bca2] dark:hover:text-white"
                                    >
                                        <X size={13} aria-hidden="true" />
                                    </button>
                                </span>
                            )}
                            {sexFilter !== "all" && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8dfd4] bg-[#f3ebdf] px-2.5 py-1 font-medium text-[#6d5942] dark:border-[#4e4234] dark:bg-[#382f25] dark:text-[#e5dcd1]">
                                    Sex: {sexFilter}
                                    <button
                                        type="button"
                                        onClick={() => setSexFilter("all")}
                                        aria-label="Remove sex filter"
                                        className="text-[#8a6f50] hover:text-[#3d3329] dark:text-[#d3bca2] dark:hover:text-white"
                                    >
                                        <X size={13} aria-hidden="true" />
                                    </button>
                                </span>
                            )}
                            {courseFilter !== "all" && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8dfd4] bg-[#f3ebdf] px-2.5 py-1 font-medium text-[#6d5942] dark:border-[#4e4234] dark:bg-[#382f25] dark:text-[#e5dcd1]">
                                    Course: {courseFilter}
                                    <button
                                        type="button"
                                        onClick={() => setCourseFilter("all")}
                                        aria-label="Remove course filter"
                                        className="text-[#8a6f50] hover:text-[#3d3329] dark:text-[#d3bca2] dark:hover:text-white"
                                    >
                                        <X size={13} aria-hidden="true" />
                                    </button>
                                </span>
                            )}
                            {sortBy !== "name_asc" && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8dfd4] bg-[#f3ebdf] px-2.5 py-1 font-medium text-[#6d5942] dark:border-[#4e4234] dark:bg-[#382f25] dark:text-[#e5dcd1]">
                                    Sort: {sortBy === "name_desc" ? "Z-A" : "ID"}
                                    <button
                                        type="button"
                                        onClick={() => setSortBy("name_asc")}
                                        aria-label="Reset sort order"
                                        className="text-[#8a6f50] hover:text-[#3d3329] dark:text-[#d3bca2] dark:hover:text-white"
                                    >
                                        <X size={13} aria-hidden="true" />
                                    </button>
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={resetAllFilters}
                                className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[#8a6f50] transition hover:bg-[#f3ebdf] hover:text-[#735a40] dark:text-[#d3bca2] dark:hover:bg-[#382f25]"
                            >
                                <RotateCcw size={12} aria-hidden="true" />
                                <span>Reset all</span>
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="rounded-xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
                        Loading records...
                    </div>
                ) : (
                    <>




                        <div className="mb-8 overflow-hidden rounded-xl border border-[#e8dfd4] bg-white shadow-sm dark:border-[#4e4234] dark:bg-[#211c17]">
                                <div className="border-b border-[#e8dfd4] bg-white px-5 py-4 dark:border-[#4e4234] dark:bg-[#211c17]">
                                    <h2 className="font-semibold text-[#3d3329] dark:text-[#f8f3eb]">
                                        Students
                                    </h2>

                                    <p className="text-sm text-[#887d70] dark:text-[#a99d8f]">
                                        {filteredStudents.length !== studentPagination.total
                                            ? `${filteredStudents.length} of ${studentPagination.total} student(s)`
                                            : `${studentPagination.total} student(s)`}
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
                                    <thead className="border-b border-[#e8dfd4] bg-[#fcfaf6] text-xs font-bold uppercase tracking-wider text-[#887d70] dark:border-[#4e4234] dark:bg-[#29231d] dark:text-[#c4b5a5]">
                                        <tr>
                                            <th className="px-5 py-3.5">
                                                Student ID
                                            </th>

                                            <th className="px-5 py-3.5">
                                                Name
                                            </th>

                                            <th className="px-5 py-3.5">
                                                Course
                                            </th>

                                            <th className="px-5 py-3.5">
                                                Year Level
                                            </th>

                                            <th className="px-5 py-3.5">
                                                Sex
                                            </th>

                                            <th className="px-5 py-3.5 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-[#eee7de] dark:divide-[#382f25]">
                                        {filteredStudents.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-5 py-8 text-center text-[#887d70] dark:text-[#a99d8f]"
                                                >
                                                    No students found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStudents.map(
                                                (student) => (
                                                    <tr
                                                        key={student.id}
                                                        className="align-middle transition-colors hover:bg-[#fcfaf6] dark:hover:bg-[#2a221a]"
                                                    >
                                                        <td className="px-5 py-4 font-semibold text-[#3d3329] dark:text-[#f8f3eb]">
                                                            {student.student_id}
                                                        </td>

                                                        <td className="px-5 py-4 text-[#3d3329] dark:text-[#f8f3eb]">
                                                            {getFullName(
                                                                student
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-[#766959] dark:text-[#c4b5a5]">
                                                            {student.course ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-[#766959] dark:text-[#c4b5a5]">
                                                            {student.year_level ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-[#766959] dark:text-[#c4b5a5]">
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
                                                                    className="rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] px-3 py-1.5 text-xs font-medium text-[#766959] transition hover:bg-[#f3ebdf] hover:text-[#3d3329] dark:border-[#4e4234] dark:bg-[#2c231a] dark:text-[#e5dcd1] dark:hover:bg-[#382f25]"
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
                                                                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
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
                                                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60"
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
                            <div className="flex flex-col gap-3 border-t border-[#e8dfd4] bg-white px-5 py-4 text-sm text-[#887d70] sm:flex-row sm:items-center sm:justify-between dark:border-[#4e4234] dark:bg-[#211c17] dark:text-[#a99d8f]">
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
                                        className="rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] px-3.5 py-1.5 text-xs font-semibold text-[#766959] transition hover:bg-[#f3ebdf] hover:text-[#3d3329] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#4e4234] dark:bg-[#2c231a] dark:text-[#e5dcd1] dark:hover:bg-[#382f25]"
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
                                        className="rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] px-3.5 py-1.5 text-xs font-semibold text-[#766959] transition hover:bg-[#f3ebdf] hover:text-[#3d3329] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#4e4234] dark:bg-[#2c231a] dark:text-[#e5dcd1] dark:hover:bg-[#382f25]"
                                    >
                                        Next
                                    </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8 overflow-hidden rounded-xl border border-[#e8dfd4] bg-white shadow-sm dark:border-[#4e4234] dark:bg-[#211c17]">
                                <div className="border-b border-[#e8dfd4] bg-white px-5 py-4 dark:border-[#4e4234] dark:bg-[#211c17]">
                                    <h2 className="font-semibold text-[#3d3329] dark:text-[#f8f3eb]">
                                        Staff
                                    </h2>

                                    <p className="text-sm text-[#887d70] dark:text-[#a99d8f]">
                                        {filteredStaff.length !== staffPagination.total
                                            ? `${filteredStaff.length} of ${staffPagination.total} staff record(s)`
                                            : `${staffPagination.total} staff record(s)`}
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
                                    <thead className="border-b border-[#e8dfd4] bg-[#fcfaf6] text-xs font-bold uppercase tracking-wider text-[#887d70] dark:border-[#4e4234] dark:bg-[#29231d] dark:text-[#c4b5a5]">
                                        <tr>
                                            <th className="px-5 py-3.5">
                                                Staff ID
                                            </th>

                                            <th className="px-5 py-3.5">
                                                Name
                                            </th>

                                            <th className="px-5 py-3.5">
                                                Position
                                            </th>

                                            <th className="px-5 py-3.5">
                                                Department
                                            </th>

                                            <th className="px-5 py-3.5">
                                                Sex
                                            </th>

                                            <th className="px-5 py-3.5 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-[#eee7de] dark:divide-[#382f25]">
                                        {filteredStaff.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-5 py-8 text-center text-[#887d70] dark:text-[#a99d8f]"
                                                >
                                                    No staff found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStaff.map(
                                                (person) => (
                                                    <tr
                                                        key={person.id}
                                                        className="align-middle transition-colors hover:bg-[#fcfaf6] dark:hover:bg-[#2a221a]"
                                                    >
                                                        <td className="px-5 py-4 font-semibold text-[#3d3329] dark:text-[#f8f3eb]">
                                                            {person.staff_id}
                                                        </td>

                                                        <td className="px-5 py-4 text-[#3d3329] dark:text-[#f8f3eb]">
                                                            {getFullName(
                                                                person
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-[#766959] dark:text-[#c4b5a5]">
                                                            {person.position ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-[#766959] dark:text-[#c4b5a5]">
                                                            {person.department ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-[#766959] dark:text-[#c4b5a5]">
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
                                                                    className="rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] px-3 py-1.5 text-xs font-medium text-[#766959] transition hover:bg-[#f3ebdf] hover:text-[#3d3329] dark:border-[#4e4234] dark:bg-[#2c231a] dark:text-[#e5dcd1] dark:hover:bg-[#382f25]"
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
                                                                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
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
                                                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60"
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
                            <div className="flex flex-col gap-3 border-t border-[#e8dfd4] bg-white px-5 py-4 text-sm text-[#887d70] sm:flex-row sm:items-center sm:justify-between dark:border-[#4e4234] dark:bg-[#211c17] dark:text-[#a99d8f]">
                                <span className="text-center sm:text-left">Page {staffPagination.current_page} of {staffPagination.last_page}</span>
                                <div className="flex justify-center gap-2 sm:justify-end">
                                    <button type="button" disabled={staffPagination.current_page <= 1} onClick={() => loadStaffPage(staffPagination.current_page - 1, search)} className="rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] px-3.5 py-1.5 text-xs font-semibold text-[#766959] transition hover:bg-[#f3ebdf] hover:text-[#3d3329] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#4e4234] dark:bg-[#2c231a] dark:text-[#e5dcd1] dark:hover:bg-[#382f25]">Previous</button>
                                    <button type="button" disabled={staffPagination.current_page >= staffPagination.last_page} onClick={() => loadStaffPage(staffPagination.current_page + 1, search)} className="rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] px-3.5 py-1.5 text-xs font-semibold text-[#766959] transition hover:bg-[#f3ebdf] hover:text-[#3d3329] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#4e4234] dark:bg-[#2c231a] dark:text-[#e5dcd1] dark:hover:bg-[#382f25]">Next</button>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8 overflow-hidden rounded-xl border border-[#e8dfd4] bg-white shadow-sm dark:border-[#4e4234] dark:bg-[#211c17]">
                                <div className="border-b border-[#e8dfd4] bg-white px-5 py-4 dark:border-[#4e4234] dark:bg-[#211c17]">
                                    <h2 className="font-semibold text-[#3d3329] dark:text-[#f8f3eb]">
                                        Faculty
                                    </h2>

                                    <p className="text-sm text-[#887d70] dark:text-[#a99d8f]">
                                        {filteredFaculties.length !== facultyPagination.total
                                            ? `${filteredFaculties.length} of ${facultyPagination.total} faculty record(s)`
                                            : `${facultyPagination.total} faculty record(s)`}
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
                                    <thead className="border-b border-[#e8dfd4] bg-[#fcfaf6] text-xs font-bold uppercase tracking-wider text-[#887d70] dark:border-[#4e4234] dark:bg-[#29231d] dark:text-[#c4b5a5]">
                                        <tr>
                                            <th className="px-5 py-3.5">
                                                Employee ID
                                            </th>

                                            <th className="px-5 py-3.5">
                                                Name
                                            </th>

                                            <th className="px-5 py-3.5">
                                                Position
                                            </th>

                                            <th className="px-5 py-3.5">
                                                Department
                                            </th>

                                            <th className="px-5 py-3.5">
                                                Sex
                                            </th>

                                            <th className="px-5 py-3.5 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-[#eee7de] dark:divide-[#382f25]">
                                        {filteredFaculties.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-5 py-8 text-center text-[#887d70] dark:text-[#a99d8f]"
                                                >
                                                    No faculty found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredFaculties.map(
                                                (faculty) => (
                                                    <tr
                                                        key={faculty.id}
                                                        className="align-middle transition-colors hover:bg-[#fcfaf6] dark:hover:bg-[#2a221a]"
                                                    >
                                                        <td className="px-5 py-4 font-semibold text-[#3d3329] dark:text-[#f8f3eb]">
                                                            {
                                                                faculty.employee_id
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4 text-[#3d3329] dark:text-[#f8f3eb]">
                                                            {getFullName(
                                                                faculty
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-[#766959] dark:text-[#c4b5a5]">
                                                            {faculty.position ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-[#766959] dark:text-[#c4b5a5]">
                                                            {faculty.department ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-[#766959] dark:text-[#c4b5a5]">
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
                                                                    className="rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] px-3 py-1.5 text-xs font-medium text-[#766959] transition hover:bg-[#f3ebdf] hover:text-[#3d3329] dark:border-[#4e4234] dark:bg-[#2c231a] dark:text-[#e5dcd1] dark:hover:bg-[#382f25]"
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
                                                                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
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
                                                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60"
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
                            <div className="flex flex-col gap-3 border-t border-[#e8dfd4] bg-white px-5 py-4 text-sm text-[#887d70] sm:flex-row sm:items-center sm:justify-between dark:border-[#4e4234] dark:bg-[#211c17] dark:text-[#a99d8f]">
                                <span className="text-center sm:text-left">Page {facultyPagination.current_page} of {facultyPagination.last_page}</span>
                                <div className="flex justify-center gap-2 sm:justify-end">
                                    <button type="button" disabled={facultyPagination.current_page <= 1} onClick={() => loadFacultyPage(facultyPagination.current_page - 1, search)} className="rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] px-3.5 py-1.5 text-xs font-semibold text-[#766959] transition hover:bg-[#f3ebdf] hover:text-[#3d3329] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#4e4234] dark:bg-[#2c231a] dark:text-[#e5dcd1] dark:hover:bg-[#382f25]">Previous</button>
                                    <button type="button" disabled={facultyPagination.current_page >= facultyPagination.last_page} onClick={() => loadFacultyPage(facultyPagination.current_page + 1, search)} className="rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] px-3.5 py-1.5 text-xs font-semibold text-[#766959] transition hover:bg-[#f3ebdf] hover:text-[#3d3329] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#4e4234] dark:bg-[#2c231a] dark:text-[#e5dcd1] dark:hover:bg-[#382f25]">Next</button>
                                </div>
                            </div>
                        </div>

                        {hasActiveFilters &&
                            filteredStudents.length === 0 &&
                            filteredStaff.length === 0 &&
                            filteredFaculties.length === 0 && (
                                <div className="mb-8 rounded-2xl border border-[#e8dfd4] bg-[#fcfaf6] p-10 text-center dark:border-[#4e4234] dark:bg-[#211c17]">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f3ebdf] text-[#8a6f50] dark:bg-[#382f25] dark:text-[#d3bca2]">
                                        <Search size={22} />
                                    </div>
                                    <h3 className="text-base font-semibold text-[#3d3329] dark:text-[#f8f3eb]">
                                        No matching patient records found
                                    </h3>
                                    <p className="mx-auto mt-1 max-w-sm text-sm text-[#887d70] dark:text-[#a99d8f]">
                                        No results match your active search and filter criteria. Try adjusting your query or resetting filters.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={resetAllFilters}
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#8a6f50] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#735a40]"
                                    >
                                        <RotateCcw size={15} />
                                        <span>Reset Filters</span>
                                    </button>
                                </div>
                            )}
                    </>
                )}
            </div>











            <StudentForms showStudentForm={showStudentForm} editingStudent={Boolean(editingStudent)} closeStudentForm={closeStudentForm} handleStudentSubmit={handleStudentSubmit} studentForm={studentForm} setStudentForm={setStudentForm} saving={saving} showStaffForm={showStaffForm} editingStaff={Boolean(editingStaff)} closeStaffForm={closeStaffForm} handleStaffSubmit={handleStaffSubmit} staffForm={staffForm} setStaffForm={setStaffForm} showFacultyForm={showFacultyForm} editingFaculty={Boolean(editingFaculty)} closeFacultyForm={closeFacultyForm} handleFacultySubmit={handleFacultySubmit} facultyForm={facultyForm} setFacultyForm={setFacultyForm} />



            {viewingStudent && (
                <Modal
                    title="Student Information"
                    onClose={closeStudentProfile}
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
                                <div className="overflow-hidden rounded-lg border border-[#e8dfd4] dark:border-[#4e4234]">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b border-[#e8dfd4] bg-[#fcfaf6] text-xs font-bold uppercase tracking-wider text-[#887d70] dark:border-[#4e4234] dark:bg-[#29231d] dark:text-[#c4b5a5]">
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
                                <div className="rounded-lg border border-dashed border-[#d9cebf] bg-[#fcfaf6] px-5 py-8 text-center dark:border-[#4e4234] dark:bg-[#211c17]">
                                    <p className="text-sm font-medium text-[#766959] dark:text-[#c4b5a5]">
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

            <FloatingToast
                message={successToast}
                onClose={() => setSuccessToast("")}
            />
        </div>
    );
}

export default StudentManagement;
