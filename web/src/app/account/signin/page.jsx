"use client";

import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { Stethoscope, Shield } from "lucide-react";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-in. Please try again or use a different method.",
        OAuthCallback: "Sign-in failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-in method. Try another option.",
        EmailCreateAccount:
          "This email can't be used to create an account. It may already exist.",
        Callback: "Something went wrong during sign-in. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Incorrect email or password. Try again or reset your password.",
        AccessDenied: "You don't have permission to sign in.",
        Configuration:
          "Sign-in isn't working right now. Please try again later.",
        Verification: "Your sign-in link has expired. Request a new one.",
      };

      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with WeCare Branding */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center mb-6">
            <img
              src="https://ucarecdn.com/13123e4d-64f7-4483-aa2a-f17ab9fe1d41/-/format/auto/"
              alt="WeCare Logo"
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain mb-4"
            />
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Sign in to access your health dashboard
          </p>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            We are here always whenever you need in emergency
          </p>
        </div>

        {/* Sign In Form */}
        <form
          noValidate
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">
            Welcome Back
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <input
                  required
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  required
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href={`/account/signup${
                    typeof window !== "undefined" ? window.location.search : ""
                  }`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create Account
                </a>
              </p>
            </div>
          </div>
        </form>

        {/* Features List */}
        <div className="mt-8 bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Stethoscope className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
            WeCare Health Services
          </h3>
          <div className="space-y-2 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
              24/7 Emergency health monitoring
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-3 flex-shrink-0"></div>
              Track medications and appointments
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-3 flex-shrink-0"></div>
              AI-powered health consultations
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-3 flex-shrink-0"></div>
              Secure and private health data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
