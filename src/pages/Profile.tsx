import { useEffect, useState } from "react";
import { Camera, Save, User } from "lucide-react";
import api from "../services/api";

function Profile() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    const [profilePicture, setProfilePicture] = useState(null);
    const [preview, setPreview] = useState(null);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    const getImageUrl = (path) => {
        if (!path) return null;

        if (
            path.startsWith("http://") ||
            path.startsWith("https://") ||
            path.startsWith("data:")
        ) {
            return path;
        }

        const normalizedPath = path.startsWith("/")
            ? path
            : `/${path}`;

        return `http://127.0.0.1:8000${normalizedPath}`;
    };

    useEffect(() => {
        loadProfile();
    }, []);


    const loadProfile = async () => {
        try {
            setError("");
            setMessage("");

            const response = await api.get("/me");
            const user = response.data.user;

            setName(user.name || "");
            setEmail(user.email || "");
            setRole(user.role || "");

            if (user.profile_picture) {
                setPreview(getImageUrl(user.profile_picture));
            } else {
                setPreview(null);
            }


            localStorage.setItem("user", JSON.stringify(user));
        } catch (err) {
            console.error("Load profile error:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to load profile."
            );
        }
    };


    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setMessage("");
        setError("");


        if (file.size > 2 * 1024 * 1024) {
            setError("Image must be less than 2MB.");


            e.target.value = "";
            return;
        }


        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Only PNG, JPG, JPEG, and WEBP images are allowed."
            );


            e.target.value = "";
            return;
        }

        setProfilePicture(file);


        const reader = new FileReader();

        reader.onload = () => {
            setPreview(reader.result);
        };

        reader.onerror = () => {
            setProfilePicture(null);
            setPreview(null);
            setError("Failed to read the selected image.");
        };

        reader.readAsDataURL(file);
    };


    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage("");
            setError("");







            const formData = new FormData();

            formData.append("name", name);
            formData.append("email", email.trim().toLowerCase());

            if (profilePicture instanceof File) {
                formData.append("avatar", profilePicture);
            }



            formData.append("_method", "PUT");

            const response = await api.post("/profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const updatedUser = response.data.user;

            if (updatedUser) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );

                setName(updatedUser.name || "");
                setEmail(updatedUser.email || "");
                setRole(updatedUser.role || "");

                if (updatedUser.profile_picture) {
                    setPreview(
                        getImageUrl(updatedUser.profile_picture)
                    );
                }
            }

            setProfilePicture(null);


            const fileInput = document.getElementById("profile-image") as HTMLInputElement | null;
            if (fileInput) {
                fileInput.value = "";
            }

            setMessage(
                response.data.message ||
                    "Profile updated successfully."
            );
        } catch (err) {
            console.error("Update profile error:", err);
            console.error(
                "Server response:",
                err.response?.data
            );

            const firstValidationError = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat()[0]
                : null;

            const serverMessage =
                firstValidationError ||
                err.response?.data?.message ||
                err.response?.data?.error;

            setError(
                serverMessage ||
                    (err.response?.data
                        ? JSON.stringify(err.response.data)
                        : null) ||
                    err.message ||
                    "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="tcc-module-page min-h-screen p-5 sm:p-6">
            <div className="mx-auto max-w-3xl">


                <div className="tcc-module-header mb-5">
                    <h1 className="text-2xl font-bold tracking-tight text-[#3d3329]">
                        My Profile
                    </h1>

                    <p className="mt-1 text-stone-500">
                        Manage your account information
                    </p>
                </div>


                <div className="rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-8">


                    <div className="mb-8 flex flex-col items-center">
                        <div className="relative">


                            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-stone-200 shadow">

                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            console.error(
                                                "Image failed to load:",
                                                e.currentTarget.src
                                            );

                                            e.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                ) : (
                                    <User
                                        size={60}
                                        className="text-stone-400"
                                    />
                                )}
                            </div>


                            <label
                                htmlFor="profile-image"
                                className="absolute bottom-0 right-0 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#8a6f50] text-white shadow-md transition hover:bg-[#735a40]"
                            >
                                <Camera size={19} />
                            </label>


                            <input
                                id="profile-image"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>

                        <p className="mt-3 text-sm text-stone-500">
                            Click the camera icon to change your photo
                        </p>

                        <p className="mt-1 text-xs text-stone-400">
                            Maximum file size: 2MB
                        </p>
                    </div>


                    {message && (
                        <div className="mb-5 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
                            {message}
                        </div>
                    )}


                    {error && (
                        <div className="mb-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}


                    <div className="mb-5">
                        <label className="mb-2 block text-sm font-medium text-stone-700">
                            Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-[#8a6f50] focus:ring-2 focus:ring-[#8a6f50]/20"
                            placeholder="Enter your name"
                        />
                    </div>


                    <div className="mb-5">
                        <label className="mb-2 block text-sm font-medium text-stone-700">
                            Email
                        </label>

                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-[#8a6f50] focus:ring-2 focus:ring-[#8a6f50]/20"
                            placeholder="name@gmail.com"
                        />
                    </div>


                    <div className="mb-8">
                        <label className="mb-2 block text-sm font-medium text-stone-700">
                            Role
                        </label>

                        <input
                            type="text"
                            value={role}
                            readOnly
                            className="w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-stone-500"
                            aria-describedby="profile-role-help"
                        />
                        <p id="profile-role-help" className="mt-2 text-xs text-stone-500">
                            Your role is assigned by a clinic account manager.
                        </p>
                    </div>


                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-[#8a6f50] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#735a40] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Save size={18} />

                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Profile;
