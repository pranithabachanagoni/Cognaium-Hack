import React, { useEffect, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, Pressable, FlatList,
  StyleSheet, ActivityIndicator, Alert, ScrollView
} from "react-native";
import { StatusBar } from "expo-status-bar";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

async function api(path, options = {}, token = "") {
  const headers = {"Content-Type": "application/json", ...(options.headers || {})};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {...options, headers});
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

export default function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState("demo");
  const [pass, setPass] = useState("ChainTrace@123");
  const [ship, setShip] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState("dashboard");

  const load = async (t = token) => {
    setLoading(true);
    try {
      const s = await api("/shipments/CT-001", {}, t);
      const a = await api("/shipments/CT-001/audit", {}, t);
      setShip(s);
      setAudit(a);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setLoading(true);
    try {
      const r = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({username: user, password: pass})
      });
      setToken(r.access_token);
      await load(r.access_token);
    } catch (e) {
      Alert.alert("Login failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  const inject = async () => {
    try {
      await api("/shipments/CT-001/simulate-anomaly", {method: "POST"}, token);
      await load();
      Alert.alert("🚨 Anomaly detected", "GPS deviation was recorded in the audit ledger.");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light"/>
        <View style={styles.loginCard}>
          <Text style={styles.logo}>CHAINTRACE</Text>
          <Text style={styles.subtitle}>Shipment Integrity Intelligence</Text>
          <TextInput style={styles.input} value={user} onChangeText={setUser} placeholder="Username" placeholderTextColor="#718096"/>
          <TextInput style={styles.input} value={pass} onChangeText={setPass} placeholder="Password" secureTextEntry placeholderTextColor="#718096"/>
          <Pressable style={styles.button} onPress={login}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>SECURE LOGIN</Text>}
          </Pressable>
          <Text style={styles.hint}>Demo: demo / ChainTrace@123</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light"/>
      <View style={styles.header}>
        <View>
          <Text style={styles.logoSmall}>CHAINTRACE</Text>
          <Text style={styles.headerSub}>Real-time shipment integrity</Text>
        </View>
        <Text style={styles.live}>● LIVE</Text>
      </View>

      {screen === "dashboard" ? (
        <ScrollView contentContainerStyle={styles.content}>
          {loading && <ActivityIndicator/>}
          {ship && <>
            <View style={styles.shipHeader}>
              <View>
                <Text style={styles.shipId}>{ship.shipment_id}</Text>
                <Text style={styles.muted}>{ship.type} • {ship.status}</Text>
              </View>
              <Text style={ship.risk === "HIGH" ? styles.riskHigh : styles.riskLow}>{ship.risk}</Text>
            </View>

            <View style={styles.scoreCard}>
              <Text style={styles.muted}>INTEGRITY SCORE</Text>
              <Text style={ship.integrity < 6 ? styles.scoreBad : styles.score}>{ship.integrity}/10</Text>
              <Text style={styles.muted}>GPS + ML + Identity + Audit evidence</Text>
            </View>

            <View style={styles.grid}>
              <Metric title="GPS" value={ship.risk === "HIGH" ? "⚠ ANOMALY" : "✓ NORMAL"}/>
              <Metric title="IDENTITY" value="✓ VERIFIED"/>
              <Metric title="AUDIT" value="✓ RECORDED"/>
              <Metric title="ROUTE" value={ship.risk === "HIGH" ? "⚠ DEVIATION" : "✓ OK"}/>
            </View>

            <Pressable style={styles.dangerButton} onPress={inject}>
              <Text style={styles.buttonText}>⚡ INJECT GPS ANOMALY</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={() => load()}>
              <Text style={styles.secondaryText}>↻ Refresh Shipment</Text>
            </Pressable>

            <Text style={styles.section}>LATEST EVENTS</Text>
            {audit.slice(-4).reverse().map((e, i) => (
              <View key={i} style={styles.event}>
                <View>
                  <Text style={styles.eventTitle}>{e.event_type}</Text>
                  <Text style={styles.muted}>{e.metadata?.reason || "Integrity check"}</Text>
                </View>
                <Text style={e.risk === "HIGH" ? styles.riskHigh : styles.riskLow}>{e.risk}</Text>
              </View>
            ))}
          </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.section}>BLOCKCHAIN AUDIT TRAIL</Text>
          <View style={styles.verify}><Text style={styles.verifyText}>✓ TAMPER-EVIDENT LEDGER</Text></View>
          {audit.slice().reverse().map((e, i) => (
            <View key={i} style={styles.audit}>
              <Text style={styles.eventTitle}>{e.event_type}</Text>
              <Text style={styles.muted}>Risk: {e.risk} • Score: {e.integrity_score}/10</Text>
              <Text style={styles.hash}>TX {e.tx_id}</Text>
              <Text style={styles.hash}>SHA-256 {e.event_hash.slice(0, 20)}…</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.nav}>
        <Pressable onPress={() => setScreen("dashboard")}><Text style={screen === "dashboard" ? styles.navActive : styles.navText}>Dashboard</Text></Pressable>
        <Pressable onPress={() => setScreen("audit")}><Text style={screen === "audit" ? styles.navActive : styles.navText}>Audit Trail</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

function Metric({title, value}) {
  return <View style={styles.metric}><Text style={styles.muted}>{title}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:"#07111f"},
  loginCard:{margin:24,marginTop:100,padding:24,borderRadius:20,backgroundColor:"#0e1c2f"},
  logo:{fontSize:32,fontWeight:"900",color:"#58a6ff",letterSpacing:3},
  logoSmall:{fontSize:20,fontWeight:"900",color:"#58a6ff",letterSpacing:2},
  subtitle:{color:"#9fb3c8",marginTop:8,marginBottom:30},
  input:{backgroundColor:"#14243a",color:"#fff",padding:15,borderRadius:10,marginBottom:12},
  button:{backgroundColor:"#1769e0",padding:16,borderRadius:10,alignItems:"center",marginTop:6},
  dangerButton:{backgroundColor:"#b42318",padding:16,borderRadius:10,alignItems:"center",marginTop:20},
  secondaryButton:{padding:14,alignItems:"center"},
  buttonText:{color:"#fff",fontWeight:"800"},
  secondaryText:{color:"#58a6ff",fontWeight:"700"},
  hint:{color:"#718096",fontSize:12,marginTop:18,textAlign:"center"},
  header:{padding:18,borderBottomWidth:1,borderBottomColor:"#1b3049",flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  headerSub:{color:"#718096",fontSize:11,marginTop:3},
  live:{color:"#35d07f",fontWeight:"800"},
  content:{padding:18,paddingBottom:100},
  shipHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  shipId:{color:"#fff",fontSize:26,fontWeight:"800"},
  muted:{color:"#718096",fontSize:12},
  riskHigh:{color:"#ff6b6b",fontWeight:"900"},
  riskLow:{color:"#35d07f",fontWeight:"900"},
  scoreCard:{backgroundColor:"#0e1c2f",padding:22,borderRadius:18,marginTop:18,alignItems:"center"},
  score:{color:"#35d07f",fontSize:48,fontWeight:"900",marginVertical:8},
  scoreBad:{color:"#ff6b6b",fontSize:48,fontWeight:"900",marginVertical:8},
  grid:{flexDirection:"row",flexWrap:"wrap",gap:10,marginTop:12},
  metric:{width:"48%",backgroundColor:"#0e1c2f",padding:15,borderRadius:12},
  metricValue:{color:"#e6edf3",fontWeight:"800",marginTop:6,fontSize:12},
  section:{color:"#8da2b8",fontSize:12,fontWeight:"900",letterSpacing:1,marginTop:24,marginBottom:10},
  event:{backgroundColor:"#0e1c2f",padding:14,borderRadius:12,marginBottom:8,flexDirection:"row",justifyContent:"space-between"},
  eventTitle:{color:"#fff",fontWeight:"800",fontSize:13},
  audit:{backgroundColor:"#0e1c2f",padding:15,borderRadius:12,marginBottom:9},
  hash:{color:"#58a6ff",fontSize:11,marginTop:6,fontFamily:"monospace"},
  verify:{padding:12,borderRadius:10,backgroundColor:"#0d2b20"},
  verifyText:{color:"#35d07f",fontWeight:"800"},
  nav:{position:"absolute",bottom:0,left:0,right:0,height:65,backgroundColor:"#0b1829",flexDirection:"row",justifyContent:"space-around",alignItems:"center"},
  navText:{color:"#718096",fontWeight:"700"},
  navActive:{color:"#58a6ff",fontWeight:"900"}
});
