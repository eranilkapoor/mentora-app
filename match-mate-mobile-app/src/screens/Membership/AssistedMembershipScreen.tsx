import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AssistedMembershipScreen() {
  const [tab, setTab] = useState<"self" | "assisted">("assisted");
  const [duration, setDuration] = useState(3);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JS</Text>
          </View>
          <Text style={styles.headerTitle}>Upgrade Membership</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.needHelp}>Need help?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* TABS */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === "self" && styles.inactiveTab]}
            onPress={() => setTab("self")}
          >
            <Text style={styles.inactiveText}>Self-Service</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={styles.activeText}>Assisted</Text>
          </TouchableOpacity>
        </View>

        {/* EXCLUSIVE SECTION */}
        <Text style={styles.sectionTitle}>Exclusive</Text>

        <View style={styles.card}>
          <Text style={styles.benefit}>
            ⭐ Benefits of Top Seller + unlimited matches daily
          </Text>
          <Text style={styles.benefit}>
            👩‍💼 Dedicated relationship manager to help you
          </Text>

          <View style={styles.points}>
            <Text style={styles.point}>• Enhance your profile</Text>
            <Text style={styles.point}>
              • Find most relevant & serious matches
            </Text>
            <Text style={styles.point}>
              • Get additional info of the bride & her family
            </Text>
            <Text style={styles.point}>
              • With 3 times faster matching
            </Text>
            <Text style={styles.point}>
              • Set up unlimited meetings with profiles
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.outlineBtn}>
              <Text style={styles.outlineText}>Request Call Back</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.linkText}>Know more ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* OFFER */}
        <Text style={styles.offer}>FLAT 50% OFF ON ALL PLANS</Text>

        {/* DURATION PLANS */}
        <View style={styles.planRow}>
          <Plan
            months={3}
            price="₹16,585"
            oldPrice="₹33,169"
            active={duration === 3}
            onPress={() => setDuration(3)}
          />
          <Plan
            months={6}
            price="₹26,186"
            oldPrice="₹52,372"
            active={duration === 6}
            onPress={() => setDuration(6)}
          />
          <Plan
            months={12}
            price="₹42,373"
            oldPrice="₹84,745"
            active={duration === 12}
            onPress={() => setDuration(12)}
          />
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaText}>Get Exclusive now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------------- Components ---------------- */

const Plan = ({ months, price, oldPrice, active, onPress }: any) => (
  <TouchableOpacity
    style={[styles.planCard, active && styles.activePlan]}
    onPress={onPress}
  >
    <View style={[styles.radio, active && styles.radioActive]} />
    <Text style={styles.planMonths}>{months} months</Text>
    <Text style={styles.planPrice}>{price}</Text>
    <Text style={styles.oldPrice}>{oldPrice}</Text>
  </TouchableOpacity>
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
    marginHorizontal: 16,
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
    borderWidth: 1,
    borderColor: "#e53935",
  },

  inactiveTab: { backgroundColor: "transparent" },
  activeText: { color: "#e53935", fontWeight: "700" },
  inactiveText: { color: "#777" },

  sectionTitle: {
    margin: 16,
    fontSize: 16,
    fontWeight: "700",
  },

  card: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#eee",
  },

  benefit: { fontWeight: "600", marginBottom: 6 },

  points: { marginTop: 6 },
  point: { fontSize: 13, color: "#444", marginVertical: 2 },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  outlineBtn: {
    borderWidth: 1,
    borderColor: "#e53935",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 12,
  },

  outlineText: { color: "#e53935", fontWeight: "600" },
  linkText: { color: "#e53935", fontWeight: "600" },

  offer: {
    textAlign: "center",
    marginVertical: 14,
    fontWeight: "700",
    color: "#e53935",
  },

  planRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  planCard: {
    width: "30%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },

  activePlan: {
    borderColor: "#e53935",
    backgroundColor: "#fdecea",
  },

  radio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#aaa",
    marginBottom: 6,
  },

  radioActive: {
    backgroundColor: "#e53935",
    borderColor: "#e53935",
  },

  planMonths: { fontWeight: "600" },
  planPrice: { color: "#e53935", fontWeight: "700" },
  oldPrice: {
    fontSize: 11,
    textDecorationLine: "line-through",
    color: "#888",
  },

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

  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
