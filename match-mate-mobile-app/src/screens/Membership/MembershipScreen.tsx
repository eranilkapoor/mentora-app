import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MembershipScreen() {
  const [tab, setTab] = useState<"self" | "assisted">("self");
  const [selectedPlan, setSelectedPlan] = useState("Pro");

  const plans = [
    { name: "Pro Lite", price: "₹1,999", contacts: 0 },
    { name: "Pro", price: "₹3,999", contacts: 25 },
    { name: "Pro Max", price: "₹6,999", contacts: 50, best: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === "self" && styles.activeTab]}
            onPress={() => setTab("self")}
          >
            <Text style={tab === "self" ? styles.activeText : styles.tabText}>
              Self-Service
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tab === "assisted" && styles.activeTab]}
            onPress={() => setTab("assisted")}
          >
            <Text
              style={tab === "assisted" ? styles.activeText : styles.tabText}
            >
              Assisted
            </Text>
          </TouchableOpacity>
        </View>

        {/* Refund Banner */}
        <View style={styles.refund}>
          <Text style={styles.refundText}>
            🔁 30-day full refund guarantee*
          </Text>
          <Text style={styles.refundSub}>*Conditions apply</Text>
        </View>

        {/* Plan Cards */}
        <View style={styles.planRow}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.name}
              style={[
                styles.planCard,
                selectedPlan === plan.name && styles.selectedPlan,
              ]}
              onPress={() => setSelectedPlan(plan.name)}
            >
              {plan.best && <Text style={styles.bestTag}>Top Seller</Text>}
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.price}>{plan.price}</Text>
              <View
                style={[
                  styles.radio,
                  selectedPlan === plan.name && styles.radioActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureRow label="Unlimited calls & chat" />
          <FeatureRow label="Engage+" />
          <FeatureRow label="Advanced Search" />
          <FeatureRow
            label="View Contact Numbers"
            values={["0", "25", "50"]}
          />
          <FeatureRow
            label="Super Interest"
            values={["0", "0", "50"]}
          />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.cta}>
        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaText}>Get Pro Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const FeatureRow = ({
  label,
  values,
}: {
  label: string;
  values?: string[];
}) => (
  <View style={styles.featureRow}>
    <Text style={styles.featureLabel}>{label}</Text>
    <View style={styles.featureValues}>
      {(values || ["✔", "✔", "✔"]).map((v, i) => (
        <Text key={i} style={styles.featureValue}>
          {v}
        </Text>
      ))}
    </View>
  </View>
);
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: { flexDirection: "row", alignItems: "center" },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e53935",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  
  avatarText: { color: "#fff", fontWeight: "700" },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  needHelp: { color: "#e53935", fontWeight: "600" },

  tabs: {
    flexDirection: "row",
    margin: 16,
    borderRadius: 8,
    backgroundColor: "#f3f3f3",
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },

  tabText: { color: "#777" },
  activeText: { color: "#e53935", fontWeight: "600" },

  refund: {
    backgroundColor: "#e8f5e9",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },

  refundText: { color: "#2e7d32", fontWeight: "600" },
  refundSub: { fontSize: 11, color: "#388e3c" },

  planRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },

  planCard: {
    width: "30%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },

  selectedPlan: {
    borderColor: "#e53935",
    backgroundColor: "#fdecea",
  },

  bestTag: {
    backgroundColor: "#4caf50",
    color: "#fff",
    fontSize: 10,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 4,
  },

  planName: { fontWeight: "600" },
  price: { marginVertical: 6, fontSize: 16, color: "#e53935" },

  radio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#aaa",
  },

  radioActive: {
    backgroundColor: "#e53935",
    borderColor: "#e53935",
  },

  features: {
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  featureRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  featureLabel: { flex: 1, fontSize: 13 },
  featureValues: {
    flexDirection: "row",
    width: "45%",
    justifyContent: "space-around",
  },

  featureValue: { fontWeight: "600" },

  cta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  ctaBtn: {
    backgroundColor: "#e53935",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },

  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
