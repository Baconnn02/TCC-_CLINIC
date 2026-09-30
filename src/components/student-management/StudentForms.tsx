import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { Modal, InputField, SelectField } from "./FieldsAndModals";

export interface StudentFormValues { student_id: string; first_name: string; middle_name: string; last_name: string; course: string; year_level: string; section: string; sex: string; birth_date: string; contact_number: string; address: string; }
export interface StaffFormValues { staff_id: string; first_name: string; middle_name: string; last_name: string; position: string; department: string; sex: string; birth_date: string; contact_number: string; address: string; }
export interface FacultyFormValues { employee_id: string; first_name: string; middle_name: string; last_name: string; position: string; department: string; sex: string; birth_date: string; contact_number: string; address: string; }

const COURSES = ["BSIT", "BSBA", "MidWifery", "BSHM", "BLIS", "BSED", "BSCRIM"];
const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SEX_OPTIONS = ["Male", "Female"];

type StudentFormsProps = { showStudentForm: boolean; editingStudent: boolean; closeStudentForm: () => void; handleStudentSubmit: React.FormEventHandler<HTMLFormElement>; studentForm: StudentFormValues; setStudentForm: React.Dispatch<React.SetStateAction<StudentFormValues>>; saving: boolean; showStaffForm: boolean; editingStaff: boolean; closeStaffForm: () => void; handleStaffSubmit: React.FormEventHandler<HTMLFormElement>; staffForm: StaffFormValues; setStaffForm: React.Dispatch<React.SetStateAction<StaffFormValues>>; showFacultyForm: boolean; editingFaculty: boolean; closeFacultyForm: () => void; handleFacultySubmit: React.FormEventHandler<HTMLFormElement>; facultyForm: FacultyFormValues; setFacultyForm: React.Dispatch<React.SetStateAction<FacultyFormValues>>; };

export function StudentForms({ showStudentForm, editingStudent, closeStudentForm, handleStudentSubmit, studentForm, setStudentForm, saving, showStaffForm, editingStaff, closeStaffForm, handleStaffSubmit, staffForm, setStaffForm, showFacultyForm, editingFaculty, closeFacultyForm, handleFacultySubmit, facultyForm, setFacultyForm }: StudentFormsProps) {
    return (
        <>
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
                                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
                            >
                                {editingStudent
                                    ? "Update Student"
                                    : "Save Student"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}





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
                                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
                            >
                                {editingStaff
                                    ? "Update Staff"
                                    : "Save Staff"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}





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
                                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
                            >
                                {editingFaculty
                                    ? "Update Faculty"
                                    : "Save Faculty"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}


        </>
    );
}
