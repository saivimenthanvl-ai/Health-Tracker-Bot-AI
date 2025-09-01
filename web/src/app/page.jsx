"use client";

import React, { useState, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Heart,
  Pill,
  Calendar,
  Activity,
  Bot,
  Plus,
  User,
  AlertCircle,
  TrendingUp,
  Clock,
  LogOut,
} from "lucide-react";
import useUser from "@/utils/useUser";
import useAuth from "@/utils/useAuth";

const queryClient = new QueryClient();

function MedicalTrackerApp() {
  const { data: currentUser, loading: userLoading } = useUser();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const queryClientInstance = useQueryClient();

  // Always call hooks at the top level
  const { data: vitalSigns = [], isLoading: vitalsLoading } = useQuery({
    queryKey: ["vital-signs", currentUser?.id],
    queryFn: async () => {
      const response = await fetch(
        `/api/vital-signs?userId=${currentUser.id}&limit=30`,
      );
      if (!response.ok) throw new Error("Failed to fetch vital signs");
      return response.json();
    },
    enabled: !!currentUser?.id,
  });

  const { data: medications = [], isLoading: medsLoading } = useQuery({
    queryKey: ["medications", currentUser?.id],
    queryFn: async () => {
      const response = await fetch(
        `/api/medications?userId=${currentUser.id}&isActive=true`,
      );
      if (!response.ok) throw new Error("Failed to fetch medications");
      return response.json();
    },
    enabled: !!currentUser?.id,
  });

  const { data: consultations = [] } = useQuery({
    queryKey: ["consultations", currentUser?.id],
    queryFn: async () => {
      const response = await fetch(
        `/api/ai-consultation?userId=${currentUser.id}&limit=10`,
      );
      if (!response.ok) throw new Error("Failed to fetch consultations");
      return response.json();
    },
    enabled: !!currentUser?.id,
  });

  const addVitalsMutation = useMutation({
    mutationFn: async (vitals) => {
      const response = await fetch("/api/vital-signs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUser.id, ...vitals }),
      });
      if (!response.ok) throw new Error("Failed to add vital signs");
      return response.json();
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({
        queryKey: ["vital-signs", currentUser.id],
      });
    },
  });

  const addMedicationMutation = useMutation({
    mutationFn: async (medication) => {
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUser.id, ...medication }),
      });
      if (!response.ok) throw new Error("Failed to add medication");
      return response.json();
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({
        queryKey: ["medications", currentUser.id],
      });
    },
  });

  const aiConsultationMutation = useMutation({
    mutationFn: async ({ symptoms, consultationType }) => {
      const response = await fetch("/api/ai-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          symptoms,
          consultation_type: consultationType,
        }),
      });
      if (!response.ok) throw new Error("Failed to get AI consultation");
      return response.json();
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({
        queryKey: ["consultations", currentUser.id],
      });
    },
  });

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  // Show sign in message if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center justify-center mb-6">
            <img
              src="https://ucarecdn.com/13123e4d-64f7-4483-aa2a-f17ab9fe1d41/-/format/auto/"
              alt="WeCare Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain mb-4"
            />
          </div>
          <p className="text-gray-600 mb-4">
            Please sign in to access your health dashboard
          </p>
          <p className="text-gray-500 text-sm mb-6">
            We are here always whenever you need in emergency
          </p>
          <div className="space-y-3">
            <a
              href="/account/signin"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors block text-center"
            >
              Sign In
            </a>
            <a
              href="/account/signup"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors block text-center"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = vitalSigns
    .slice(0, 10)
    .reverse()
    .map((vital, index) => ({
      date: new Date(vital.recorded_at).toLocaleDateString(),
      bloodPressure: vital.blood_pressure_systolic,
      heartRate: vital.heart_rate,
      weight: vital.weight,
      temperature: vital.temperature,
    }));

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Medications</p>
              <p className="text-2xl font-bold text-gray-900">
                {medications.length}
              </p>
            </div>
            <Pill className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Latest BP</p>
              <p className="text-2xl font-bold text-gray-900">
                {vitalSigns[0]
                  ? `${vitalSigns[0].blood_pressure_systolic}/${vitalSigns[0].blood_pressure_diastolic}`
                  : "N/A"}
              </p>
            </div>
            <Heart className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Heart Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {vitalSigns[0] ? `${vitalSigns[0].heart_rate} bpm` : "N/A"}
              </p>
            </div>
            <Activity className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">AI Consultations</p>
              <p className="text-2xl font-bold text-gray-900">
                {consultations.length}
              </p>
            </div>
            <Bot className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Vital Signs Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="bloodPressure"
                stroke="#3B82F6"
                name="Systolic BP"
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="#EF4444"
                name="Heart Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Pill className="h-5 w-5 mr-2" />
            Current Medications
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {medications.map((med) => (
              <div
                key={med.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{med.medication_name}</p>
                  <p className="text-sm text-gray-600">
                    {med.dosage} - {med.frequency}
                  </p>
                </div>
                <div className="text-sm text-gray-500">{med.prescribed_by}</div>
              </div>
            ))}
            {medications.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No active medications
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const VitalsForm = () => {
    const [vitals, setVitals] = useState({
      blood_pressure_systolic: "",
      blood_pressure_diastolic: "",
      heart_rate: "",
      temperature: "",
      weight: "",
      blood_sugar: "",
    });

    const handleSubmit = useCallback(
      (e) => {
        e.preventDefault();
        const filteredVitals = Object.fromEntries(
          Object.entries(vitals).filter(([_, value]) => value !== ""),
        );
        addVitalsMutation.mutate(filteredVitals);
        setVitals({
          blood_pressure_systolic: "",
          blood_pressure_diastolic: "",
          heart_rate: "",
          temperature: "",
          weight: "",
          blood_sugar: "",
        });
      },
      [vitals],
    );

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Record Vital Signs</h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Systolic BP (mmHg)
            </label>
            <input
              type="number"
              value={vitals.blood_pressure_systolic}
              onChange={(e) =>
                setVitals((prev) => ({
                  ...prev,
                  blood_pressure_systolic: e.target.value,
                }))
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diastolic BP (mmHg)
            </label>
            <input
              type="number"
              value={vitals.blood_pressure_diastolic}
              onChange={(e) =>
                setVitals((prev) => ({
                  ...prev,
                  blood_pressure_diastolic: e.target.value,
                }))
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heart Rate (bpm)
            </label>
            <input
              type="number"
              value={vitals.heart_rate}
              onChange={(e) =>
                setVitals((prev) => ({ ...prev, heart_rate: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature (°F)
            </label>
            <input
              type="number"
              step="0.1"
              value={vitals.temperature}
              onChange={(e) =>
                setVitals((prev) => ({ ...prev, temperature: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (lbs)
            </label>
            <input
              type="number"
              step="0.1"
              value={vitals.weight}
              onChange={(e) =>
                setVitals((prev) => ({ ...prev, weight: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Sugar (mg/dL)
            </label>
            <input
              type="number"
              value={vitals.blood_sugar}
              onChange={(e) =>
                setVitals((prev) => ({ ...prev, blood_sugar: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={addVitalsMutation.isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addVitalsMutation.isLoading ? "Recording..." : "Record Vitals"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const AIConsultation = () => {
    const [symptoms, setSymptoms] = useState("");
    const [consultationType, setConsultationType] = useState("general");

    const handleConsultation = useCallback(
      (e) => {
        e.preventDefault();
        if (!symptoms.trim()) return;

        aiConsultationMutation.mutate({ symptoms, consultationType });
        setSymptoms("");
      },
      [symptoms, consultationType],
    );

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            AI Medical Assistant
          </h3>

          <form onSubmit={handleConsultation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Type
              </label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="general">General Health Advice</option>
                <option value="medicine_suggestion">
                  Medicine Suggestions
                </option>
                <option value="doctor_advice">
                  Doctor Consultation Advice
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Describe your symptoms or health concerns
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your symptoms, pain level, duration, etc..."
              />
            </div>

            <button
              type="submit"
              disabled={aiConsultationMutation.isLoading || !symptoms.trim()}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiConsultationMutation.isLoading
                ? "Consulting AI..."
                : "Get AI Consultation"}
            </button>
          </form>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
              <div className="text-sm text-yellow-800">
                <strong>Disclaimer:</strong> This AI assistant provides general
                health information only. Always consult with qualified
                healthcare professionals for medical advice, diagnosis, or
                treatment.
              </div>
            </div>
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent AI Consultations
          </h3>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-purple-600 capitalize">
                    {consultation.consultation_type.replace("_", " ")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(consultation.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Symptoms:</strong> {consultation.symptoms}
                </p>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {consultation.ai_response}
                </div>
              </div>
            ))}
            {consultations.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No consultations yet
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="https://ucarecdn.com/13123e4d-64f7-4483-aa2a-f17ab9fe1d41/-/format/auto/"
                alt="WeCare Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain mr-3"
              />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                WeCare
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">
                  {currentUser.name || currentUser.email}
                </span>
                <span className="sm:hidden">
                  {(currentUser.name || currentUser.email).slice(0, 10)}...
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("vitals")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "vitals"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Record Vitals
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "ai"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              AI Assistant
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "vitals" && <VitalsForm />}
        {activeTab === "ai" && <AIConsultation />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MedicalTrackerApp />
    </QueryClientProvider>
  );
}
