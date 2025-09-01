"use client";

import useAuth from "@/utils/useAuth";
import { LogOut, Shield } from "lucide-react";

function MainComponent() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with WeCare Branding */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center mb-4">
            <img
              src="https://ucarecdn.com/13123e4d-64f7-4483-aa2a-f17ab9fe1d41/-/format/auto/"
              alt="WeCare Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain mb-4"
            />
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Thank you for using our health tracking system
          </p>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            We are here always whenever you need in emergency
          </p>
        </div>

        {/* Sign Out Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center">
            <LogOut className="h-6 w-6 mr-2 text-red-600" />
            Sign Out
          </h2>

          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Are you sure you want to sign out of your WeCare account?
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center text-blue-700">
                  <Shield className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    Your health data will remain secure
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
            >
              <div className="flex items-center justify-center">
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </div>
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Changed your mind?{" "}
                <a
                  href="/"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Back to Dashboard
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="mt-8 bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 text-center">
            Thank You for Using WeCare
          </h3>
          <div className="space-y-2 text-xs sm:text-sm text-gray-600 text-center">
            <p>Your health journey matters to us.</p>
            <p>We're here always whenever you need emergency care.</p>
            <div className="mt-4">
              <a
                href="/account/signin"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign back in anytime →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
