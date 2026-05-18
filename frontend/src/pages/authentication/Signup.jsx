import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../api/axios";


export default function Signup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("investor");
  const [showPassword, setShowPassword] = useState(false);

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("");
  const [countriesLoading, setCountriesLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    terms: false,
  });

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountriesLoading(true);
        setServerError("");

        const { data: result } = await API.get(
          "/countries",
          {
            withCredentials: true,
          }
        );

        console.log("countries API result:", result);

        const list = Array.isArray(result.data) ? result.data : [];

        setCountries(list);

        if (list.length > 0) {
          setCountry(list[0]._id);
        }
      } catch (error) {
        console.error("Countries fetch error:", error);
        setServerError(
          error.response?.data?.message || "Unable to load countries."
        );
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (!passwordRegex.test(formData.password)) {
      errors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character.";
    }

    if (!country) {
      errors.country = "Country is required.";
    }

    if (!formData.terms) {
      errors.terms = "You must accept the Terms of Service and Privacy Policy.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");
    setSuccessMessage("");

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      userType: role === "investor" ? "INVESTOR" : "BUSINESS_OWNER",
      country,
    };

    try {
      setIsLoading(true);

      const { data } = await axios.post(
        "http://localhost:5000/users/register",
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("register response:", data);

      setSuccessMessage(data.message || "Account created successfully");

      setTimeout(() => {
        if (payload.userType === "INVESTOR") {
          navigate("/Step1BasicProfile");
        } else if (payload.userType === "BUSINESS_OWNER") {
          navigate("/Step1BasicInfoType");
        } else {
          navigate("/login");
        }
      }, 800);
    } catch (error) {
      console.error("register error:", error);

      const data = error.response?.data;

      if (data?.field) {
        setFieldErrors((prev) => ({
          ...prev,
          [data.field]: data.message,
        }));
      } else {
        setServerError(data?.message || "Unable to connect to server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="bg-surface font-body text-on-surface overflow-x-hidden"
      style={{ minHeight: "max(884px, 100dvh)" }}
    >
      <div className="flex min-h-screen">
        <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-primary-container p-20 lg:flex">
          <div className="absolute inset-0 opacity-40">
            <img
              alt="Architectural structure"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYopttdVMbUhqzEjcY9k64TKy1RM_SSrV15PgsZYvEr04XWe2msbNyyEbOaIzR_otqjAmOFuyy8GB6Ks57Up8FnrAwg4S-SKiLoNE92AqLt7F-YzV4ThhORJG-4ChV9EGXnQhGs7z46JWSdrbKtOhcnC_YBslZvKu1v9IM9_flV3QTh6lrKy1gdh5F40aPq4XIahikWNqdBuN7DdJ74vfK3ths292SSr0SePqGZbHwlIaclB2Yv9aKSkIbXd_w80pytx4d7LDPJJ3I"
            />
          </div>

          <div className="relative z-10 max-w-lg">
            <div className="mb-12">
              <span className="font-headline text-4xl font-extrabold tracking-tighter text-secondary-fixed">
                Fractional
              </span>
            </div>

            <h1 className="mb-6 font-headline text-5xl font-extrabold leading-tight tracking-tight text-white">
              Architecting the Future of{" "}
              <span className="text-secondary-fixed">Ownership.</span>
            </h1>

            <p className="mb-12 text-lg font-light leading-relaxed text-on-primary-container">
              Join an institutional-grade ecosystem designed for high-precision
              asset management and collaborative capital growth.
            </p>
          </div>
        </div>

        <main className="flex w-full items-center justify-center bg-surface-bright p-6 md:p-12 lg:w-1/2 lg:p-24">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-primary">
                Create your profile
              </h2>
              <p className="font-medium text-on-surface-variant">
                Select your account type to begin registration.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {serverError && (
                <div className="rounded-xl bg-error-container px-4 py-3 text-sm font-medium text-error">
                  {serverError}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl bg-secondary-container/30 px-4 py-3 text-sm font-medium text-on-secondary-container">
                  {successMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <label className="group relative cursor-pointer">
                  <input
                    className="peer sr-only"
                    type="radio"
                    value="investor"
                    checked={role === "investor"}
                    onChange={() => setRole("investor")}
                  />
                  <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-transparent bg-surface-container-low p-4 transition-all group-hover:bg-surface-container peer-checked:border-secondary">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-primary">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      Investor
                    </span>
                  </div>
                </label>

                <label className="group relative cursor-pointer">
                  <input
                    className="peer sr-only"
                    type="radio"
                    value="business"
                    checked={role === "business"}
                    onChange={() => setRole("business")}
                  />
                  <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-transparent bg-surface-container-low p-4 transition-all group-hover:bg-surface-container peer-checked:border-secondary">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-primary">
                      <span className="material-symbols-outlined">
                        corporate_fare
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      Business Owner
                    </span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block px-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    First Name
                  </label>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary"
                    placeholder="Alex"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {fieldErrors.firstName && (
                    <p className="px-1 text-xs text-error">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block px-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Last Name
                  </label>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary"
                    placeholder="Sterling"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {fieldErrors.lastName && (
                    <p className="px-1 text-xs text-error">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block px-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Email Address
                </label>
                <input
                  className="w-full rounded-xl border-none bg-surface-container px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary"
                  placeholder="alex@email.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && (
                  <p className="px-1 text-xs text-error">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block px-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-xl border-none bg-surface-container px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="px-1 text-xs text-error">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block px-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Country of Residence
                </label>

                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border-none bg-surface-container px-4 py-3 text-on-surface transition-all focus:ring-2 focus:ring-primary"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={countriesLoading}
                  >
                    <option value="">
                      {countriesLoading ? "Loading countries..." : "Select a country"}
                    </option>

                    {countries.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name || item.countryName || item.country}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>

                {fieldErrors.country && (
                  <p className="px-1 text-xs text-error">{fieldErrors.country}</p>
                )}
              </div>

              <div className="flex items-start gap-3 px-1 pt-2">
                <div className="flex h-5 items-center">
                  <input
                    className="h-5 w-5 cursor-pointer rounded border-outline-variant text-secondary focus:ring-secondary"
                    id="terms"
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                  />
                </div>

                <label
                  className="text-sm leading-tight text-on-surface-variant"
                  htmlFor="terms"
                >
                  I agree to the{" "}
                  <a className="font-semibold text-primary hover:underline" href="#">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a className="font-semibold text-primary hover:underline" href="#">
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              {fieldErrors.terms && (
                <p className="px-1 text-xs text-error">{fieldErrors.terms}</p>
              )}

              <div className="pt-4">
                <button
                  className="gradient-button group flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold text-white shadow-sm transition-all disabled:opacity-60"
                  type="submit"
                  disabled={isLoading || countriesLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                  {!isLoading && (
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  )}
                </button>
              </div>
            </form>

            <div className="flex flex-col items-center gap-6 pt-4">
              <p className="font-medium text-on-surface-variant">
                Already have an account?
                <Link
                  to="/login"
                  className="ml-1 font-bold text-secondary transition-colors hover:text-on-secondary-container"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}