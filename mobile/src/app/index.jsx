import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  Heart,
  Pill,
  Activity,
  Bot,
  User,
  AlertCircle,
  TrendingUp,
  Clock,
  LogOut,
  Plus,
} from "lucide-react-native";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";

const queryClient = new QueryClient();

function WeCareApp() {
  const insets = useSafeAreaInsets();
  const { data: currentUser, loading: userLoading } = useUser();
  const { signOut, signIn, isAuthenticated, isReady } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const queryClientInstance = useQueryClient();

  // Fetch user's vital signs
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

  // Fetch medications
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

  // Fetch AI consultations
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

  // Add vital signs mutation
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

  // AI consultation mutation
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
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  // Show loading while checking authentication
  if (!isReady || userLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>
            Loading your health dashboard...
          </Text>
        </View>
      </View>
    );
  }

  // Show sign in screen if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <View
        style={[
          styles.container,
          styles.authContainer,
          { paddingTop: insets.top + 40 },
        ]}
      >
        <StatusBar style="dark" />
        <View style={styles.authContent}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: "https://ucarecdn.com/13123e4d-64f7-4483-aa2a-f17ab9fe1d41/-/format/auto/",
              }}
              style={styles.logoLarge}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.welcomeTitle}>Welcome to WeCare</Text>
          <Text style={styles.welcomeSubtitle}>
            We are here always whenever you need in emergency
          </Text>

          <Pressable style={styles.signInButton} onPress={() => signIn()}>
            <Text style={styles.signInButtonText}>Sign In to Continue</Text>
          </Pressable>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Your Health, Our Priority</Text>

            <View style={styles.featureItem}>
              <Activity size={20} color="#3B82F6" />
              <Text style={styles.featureText}>24/7 Emergency monitoring</Text>
            </View>

            <View style={styles.featureItem}>
              <Pill size={20} color="#10B981" />
              <Text style={styles.featureText}>
                Track medications & appointments
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Bot size={20} color="#8B5CF6" />
              <Text style={styles.featureText}>
                AI-powered health consultations
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Heart size={20} color="#EF4444" />
              <Text style={styles.featureText}>
                Secure health data protection
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const Dashboard = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { borderLeftColor: "#3B82F6" }]}>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>Active Medications</Text>
            <Text style={styles.metricValue}>{medications.length}</Text>
          </View>
          <Pill size={32} color="#3B82F6" />
        </View>

        <View style={[styles.metricCard, { borderLeftColor: "#10B981" }]}>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>Latest BP</Text>
            <Text style={styles.metricValue}>
              {vitalSigns[0]
                ? `${vitalSigns[0].blood_pressure_systolic}/${vitalSigns[0].blood_pressure_diastolic}`
                : "N/A"}
            </Text>
          </View>
          <Heart size={32} color="#10B981" />
        </View>

        <View style={[styles.metricCard, { borderLeftColor: "#EF4444" }]}>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>Heart Rate</Text>
            <Text style={styles.metricValue}>
              {vitalSigns[0] ? `${vitalSigns[0].heart_rate} bpm` : "N/A"}
            </Text>
          </View>
          <Activity size={32} color="#EF4444" />
        </View>

        <View style={[styles.metricCard, { borderLeftColor: "#8B5CF6" }]}>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>AI Consultations</Text>
            <Text style={styles.metricValue}>{consultations.length}</Text>
          </View>
          <Bot size={32} color="#8B5CF6" />
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Pill size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Current Medications</Text>
        </View>
        <View style={styles.medicationsList}>
          {medications.map((med) => (
            <View key={med.id} style={styles.medicationItem}>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{med.medication_name}</Text>
                <Text style={styles.medicationDosage}>
                  {med.dosage} - {med.frequency}
                </Text>
              </View>
              <Text style={styles.medicationDoctor}>{med.prescribed_by}</Text>
            </View>
          ))}
          {medications.length === 0 && (
            <Text style={styles.emptyText}>No active medications</Text>
          )}
        </View>
      </View>
    </ScrollView>
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

    const handleSubmit = useCallback(() => {
      const filteredVitals = Object.fromEntries(
        Object.entries(vitals).filter(([_, value]) => value !== ""),
      );

      if (Object.keys(filteredVitals).length === 0) {
        Alert.alert("Error", "Please enter at least one vital sign");
        return;
      }

      addVitalsMutation.mutate(filteredVitals);
      setVitals({
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        heart_rate: "",
        temperature: "",
        weight: "",
        blood_sugar: "",
      });
      Alert.alert("Success", "Vital signs recorded successfully!");
    }, [vitals]);

    return (
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Record Vital Signs</Text>

          <View style={styles.inputGrid}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Systolic BP (mmHg)</Text>
              <TextInput
                style={styles.input}
                value={vitals.blood_pressure_systolic}
                onChangeText={(value) =>
                  setVitals((prev) => ({
                    ...prev,
                    blood_pressure_systolic: value,
                  }))
                }
                keyboardType="numeric"
                placeholder="120"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Diastolic BP (mmHg)</Text>
              <TextInput
                style={styles.input}
                value={vitals.blood_pressure_diastolic}
                onChangeText={(value) =>
                  setVitals((prev) => ({
                    ...prev,
                    blood_pressure_diastolic: value,
                  }))
                }
                keyboardType="numeric"
                placeholder="80"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Heart Rate (bpm)</Text>
              <TextInput
                style={styles.input}
                value={vitals.heart_rate}
                onChangeText={(value) =>
                  setVitals((prev) => ({ ...prev, heart_rate: value }))
                }
                keyboardType="numeric"
                placeholder="72"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Temperature (°F)</Text>
              <TextInput
                style={styles.input}
                value={vitals.temperature}
                onChangeText={(value) =>
                  setVitals((prev) => ({ ...prev, temperature: value }))
                }
                keyboardType="numeric"
                placeholder="98.6"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={vitals.weight}
                onChangeText={(value) =>
                  setVitals((prev) => ({ ...prev, weight: value }))
                }
                keyboardType="numeric"
                placeholder="150"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Blood Sugar (mg/dL)</Text>
              <TextInput
                style={styles.input}
                value={vitals.blood_sugar}
                onChangeText={(value) =>
                  setVitals((prev) => ({ ...prev, blood_sugar: value }))
                }
                keyboardType="numeric"
                placeholder="100"
              />
            </View>
          </View>

          <Pressable
            style={[
              styles.submitButton,
              addVitalsMutation.isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={addVitalsMutation.isLoading}
          >
            <Text style={styles.submitButtonText}>
              {addVitalsMutation.isLoading ? "Recording..." : "Record Vitals"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  const AIConsultation = () => {
    const [symptoms, setSymptoms] = useState("");
    const [consultationType, setConsultationType] = useState("general");

    const handleConsultation = useCallback(() => {
      if (!symptoms.trim()) {
        Alert.alert("Error", "Please describe your symptoms");
        return;
      }

      aiConsultationMutation.mutate({ symptoms, consultationType });
      setSymptoms("");
    }, [symptoms, consultationType]);

    return (
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Bot size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>AI Medical Assistant</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Describe your symptoms</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={symptoms}
              onChangeText={setSymptoms}
              multiline
              numberOfLines={4}
              placeholder="Describe your symptoms, pain level, duration, etc..."
              textAlignVertical="top"
            />
          </View>

          <Pressable
            style={[
              styles.submitButton,
              styles.aiButton,
              (aiConsultationMutation.isLoading || !symptoms.trim()) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleConsultation}
            disabled={aiConsultationMutation.isLoading || !symptoms.trim()}
          >
            <Text style={styles.submitButtonText}>
              {aiConsultationMutation.isLoading
                ? "Consulting AI..."
                : "Get AI Consultation"}
            </Text>
          </Pressable>

          <View style={styles.disclaimer}>
            <AlertCircle size={16} color="#F59E0B" />
            <Text style={styles.disclaimerText}>
              This AI assistant provides general health information only. Always
              consult with qualified healthcare professionals for medical
              advice.
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#6B7280" />
            <Text style={styles.sectionTitle}>Recent Consultations</Text>
          </View>

          {consultations.map((consultation) => (
            <View key={consultation.id} style={styles.consultationItem}>
              <View style={styles.consultationHeader}>
                <Text style={styles.consultationType}>
                  {consultation.consultation_type.replace("_", " ")}
                </Text>
                <Text style={styles.consultationDate}>
                  {new Date(consultation.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.consultationSymptoms}>
                <Text style={styles.consultationLabel}>Symptoms: </Text>
                {consultation.symptoms}
              </Text>
              <Text style={styles.consultationResponse}>
                {consultation.ai_response}
              </Text>
            </View>
          ))}

          {consultations.length === 0 && (
            <Text style={styles.emptyText}>No consultations yet</Text>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{
              uri: "https://ucarecdn.com/13123e4d-64f7-4483-aa2a-f17ab9fe1d41/-/format/auto/",
            }}
            style={styles.logoSmall}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>WeCare</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.userInfo}>
            <User size={16} color="#6B7280" />
            <Text style={styles.userName}>
              {(currentUser.name || currentUser.email).slice(0, 12)}...
            </Text>
          </View>
          <Pressable onPress={handleSignOut} style={styles.signOutButton}>
            <LogOut size={16} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === "dashboard" && styles.activeTab]}
          onPress={() => setActiveTab("dashboard")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "dashboard" && styles.activeTabText,
            ]}
          >
            Dashboard
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "vitals" && styles.activeTab]}
          onPress={() => setActiveTab("vitals")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "vitals" && styles.activeTabText,
            ]}
          >
            Record Vitals
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "ai" && styles.activeTab]}
          onPress={() => setActiveTab("ai")}
        >
          <Text
            style={[styles.tabText, activeTab === "ai" && styles.activeTabText]}
          >
            AI Assistant
          </Text>
        </Pressable>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "vitals" && <VitalsForm />}
        {activeTab === "ai" && <AIConsultation />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  authContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  authContent: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoLarge: {
    width: 160,
    height: 160,
  },
  logoSmall: {
    width: 32,
    height: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  signInButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    marginBottom: 32,
  },
  signInButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  featuresContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  userName: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  signOutButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#3B82F6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#3B82F6",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  metricsGrid: {
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  medicationsList: {
    gap: 12,
  },
  medicationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: "#6B7280",
  },
  medicationDoctor: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 16,
  },
  inputGrid: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  aiButton: {
    backgroundColor: "#8B5CF6",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  disclaimerText: {
    fontSize: 12,
    color: "#92400E",
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  consultationItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  consultationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  consultationType: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B5CF6",
    textTransform: "capitalize",
  },
  consultationDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  consultationSymptoms: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },
  consultationLabel: {
    fontWeight: "500",
  },
  consultationResponse: {
    fontSize: 14,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 6,
    lineHeight: 20,
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeCareApp />
    </QueryClientProvider>
  );
}
