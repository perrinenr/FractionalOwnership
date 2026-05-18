import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    setErrors((prev) => ({
      ...prev,
      email: "",
    }));

    setServerError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);

    setErrors((prev) => ({
      ...prev,
      password: "",
    }));

    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    const isValid = validateForm();
    if (!isValid) return;

    try {
      setLoading(true);

      const res = await API.post(
        "/users/login", /////////// LOGIN ROUTE
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Response:", res.data);

      const role = res.data.user.role || res.data.user.userType;
      const normalizedRole = role?.toUpperCase();
      const token = res.data.token;

      localStorage.setItem("token", token);
      localStorage.setItem("role", normalizedRole);

      if (normalizedRole === "INVESTOR") {
        navigate("/InvestorDashboard"); ///////////
      } else if (normalizedRole === "ADMIN") {
        navigate("/admin-dashboard"); ///////////
      } else if (normalizedRole === "BUSINESS_OWNER") {
        navigate("/company-dashboard"); ///////////
      } else {
        navigate("/"); ///////////
      }
    } catch (err) {
      console.log(err);

      if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (fieldName) =>
    `w-full px-4 py-4 rounded-xl bg-gray-100 focus:bg-white outline-none transition border ${
      errors[fieldName]
        ? "border-red-500 focus:border-red-500"
        : "border-transparent focus:border-blue-300"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fafd] font-sans overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-blue-200/40 blur-[120px] rounded-full"></div>
        <div className="absolute top-40 right-0 w-[300px] h-[300px] bg-green-200/30 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1000px] grid lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#000F22] to-[#0A2540] text-white">
          <div>
            <div className="flex items-center gap-2 mb-10">
              <h1 className="text-2xl font-bold tracking-tight">Fractional</h1>
            </div>

            <h2 className="text-4xl font-bold leading-tight">
              Institutional Grade Assets,
              <span className="text-green-400"> Unbundled.</span>
            </h2>

            <p className="mt-6 text-white/70 text-sm">
              Secure access to structured fractional ownership infrastructure.
            </p>
          </div>

          <p className="text-xs text-white/40">© 2026 Fractional Systems</p>
        </div>

        <div className="p-10 md:p-14 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-[#0a2540]">Welcome Back</h2>

          <p className="text-gray-500 mt-2 mb-8">
            Enter your credentials to access your portfolio
          </p>

          {serverError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Email Address
              </label>

              <div className="mt-2">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@company.com"
                  className={inputClass("email")}
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-xs mt-2">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Password
              </label>

              <div className="mt-2">
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={inputClass("password")}
                />
              </div>

              {errors.password && (
                <p className="text-red-500 text-xs mt-2">{errors.password}</p>
              )}
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
  Don’t have an account?{" "}
  <a
    href="/signup"
    className="text-blue-600 font-semibold hover:underline"
  >
    Create one
  </a>
</p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-[#000F22] to-[#0A2540] hover:opacity-95 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}