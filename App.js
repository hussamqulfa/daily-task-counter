import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

const TASKS = [
  { key: "retrieval", name: "Retrieval" },
  { key: "battery", name: "Change battery" },
  { key: "move", name: "Move" },
  { key: "service", name: "Service" },
];
const STORE = "@daily_task_counter_v1";
const pad = n => String(n).padStart(2, "0");
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const emptyDay = () => Object.fromEntries(TASKS.map(t => [t.key, { qty: 0, price: 0 }]));
const dateLabel = s => { const [y,m,d] = s.split("-"); return `${d}/${m}/${y}`; };
const money = n => Number(n || 0).toFixed(2);

export default function App() {
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(today());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE);
        if (raw) setRecords(JSON.parse(raw));
      } catch (e) {
        Alert.alert("Error", "Could not load saved records.");
      } finally { setLoaded(true); }
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORE, JSON.stringify(records)).catch(() =>
      Alert.alert("Error", "Could not save records.")
    );
  }, [records, loaded]);

  const current = records[date] || emptyDay();
  function updateTask(key, field, value) {
    setRecords(prev => {
      const day = { ...(prev[date] || emptyDay()) };
      day[key] = { ...(day[key] || {qty:0, price:0}), [field]: value };
      return { ...prev, [date]: day };
    });
  }
  function adjust(key, amount) {
    const task = current[key] || {qty:0, price:0};
    updateTask(key, "qty", Math.max(0, (Number(task.qty)||0) + amount));
  }
  const totalQty = TASKS.reduce((sum,t) => sum + (Number(current[t.key]?.qty)||0), 0);
  const totalMoney = TASKS.reduce((sum,t) => sum + (Number(current[t.key]?.qty)||0) * (Number(current[t.key]?.price)||0), 0);
  function resetDay() {
    Alert.alert("Reset day", `Reset counts and prices for ${dateLabel(date)}?`, [
      {text:"Cancel", style:"cancel"},
      {text:"Reset", style:"destructive", onPress:() => setRecords(prev => ({...prev, [date]:emptyDay()}))}
    ]);
  }
  const savedDates = Object.keys(records).sort().reverse();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Daily Task Counter</Text>
        <Text style={styles.subtitle}>Daily quantities and earnings</Text>

        <View style={styles.panel}>
          <Text style={styles.label}>Date / التاريخ</Text>
          <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" style={styles.dateInput} />
          <Text style={styles.hint}>Enter date as YYYY-MM-DD (example: 2026-10-01)</Text>
        </View>

        {TASKS.map(t => {
          const item = current[t.key] || {qty:0, price:0};
          const amount = (Number(item.qty)||0) * (Number(item.price)||0);
          return (
            <View key={t.key} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.taskName}>{t.name}</Text>
                <View style={styles.qtyControls}>
                  <Pressable style={styles.minus} onPress={() => adjust(t.key, -1)}><Text style={styles.minusText}>−</Text></Pressable>
                  <Text style={styles.qty}>{item.qty || 0}</Text>
                  <Pressable style={styles.plus} onPress={() => adjust(t.key, 1)}><Text style={styles.plusText}>+</Text></Pressable>
                </View>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.label}>Unit price / سعر الوحدة</Text>
                <TextInput
                  keyboardType="decimal-pad"
                  value={String(item.price ?? 0)}
                  onChangeText={v => updateTask(t.key, "price", Math.max(0, Number(v.replace(",", ".")) || 0))}
                  style={styles.priceInput}
                />
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Total for {t.name}</Text>
                <Text style={styles.amount}>{money(amount)}</Text>
              </View>
              <Text style={styles.formula}>{item.qty || 0} × {money(item.price)} = {money(amount)}</Text>
            </View>
          );
        })}

        <View style={styles.totalCard}>
          <Text style={styles.totalCaption}>Daily summary · {dateLabel(date)}</Text>
          <View style={styles.summaryLine}><Text style={styles.summaryLabel}>Total task count</Text><Text style={styles.summaryValue}>{totalQty}</Text></View>
          {TASKS.map(t => (
            <View key={t.key} style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>{t.name}</Text>
              <Text style={styles.summaryValue}>{money((Number(current[t.key]?.qty)||0)*(Number(current[t.key]?.price)||0))}</Text>
            </View>
          ))}
          <View style={styles.grandLine}><Text style={styles.grandLabel}>Total task price</Text><Text style={styles.grandValue}>{money(totalMoney)}</Text></View>
        </View>

        <Pressable style={styles.resetButton} onPress={resetDay}><Text style={styles.resetText}>Reset this day</Text></Pressable>

        <View style={styles.panel}>
          <Text style={styles.historyTitle}>Saved days / الأيام المحفوظة</Text>
          {savedDates.length === 0 ? <Text style={styles.hint}>Saved days will appear here.</Text> :
            savedDates.map(d => {
              const r = records[d] || {};
              const amount = TASKS.reduce((sum,t) => sum + (Number(r[t.key]?.qty)||0)*(Number(r[t.key]?.price)||0), 0);
              return <Pressable key={d} style={styles.historyRow} onPress={() => setDate(d)}>
                <Text style={styles.historyDate}>{dateLabel(d)}</Text><Text style={styles.historyAmount}>{money(amount)}</Text>
              </Pressable>;
            })}
        </View>
        <Text style={styles.footer}>Saved automatically on this device.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#F4F6F8"},
  container:{padding:16,paddingBottom:40},
  title:{fontSize:29,fontWeight:"900",textAlign:"center",color:"#111827",marginTop:12},
  subtitle:{textAlign:"center",color:"#6B7280",marginTop:5,marginBottom:18},
  panel:{backgroundColor:"#fff",borderRadius:16,padding:15,marginBottom:13},
  label:{fontSize:13,fontWeight:"700",color:"#4B5563",marginBottom:7},
  dateInput:{borderWidth:1,borderColor:"#D1D5DB",borderRadius:10,padding:11,fontSize:17,color:"#111827"},
  hint:{fontSize:12,color:"#9CA3AF",marginTop:7},
  card:{backgroundColor:"#fff",borderRadius:17,padding:16,marginBottom:13,elevation:2},
  cardTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",gap:8},
  taskName:{fontSize:18,fontWeight:"800",color:"#111827",flex:1},
  qtyControls:{flexDirection:"row",alignItems:"center",gap:10},
  minus:{width:38,height:38,borderRadius:10,backgroundColor:"#E5E7EB",alignItems:"center",justifyContent:"center"},
  plus:{width:38,height:38,borderRadius:10,backgroundColor:"#2563EB",alignItems:"center",justifyContent:"center"},
  minusText:{fontSize:25,fontWeight:"700",color:"#111827"},
  plusText:{fontSize:25,fontWeight:"700",color:"#fff"},
  qty:{minWidth:30,textAlign:"center",fontSize:22,fontWeight:"900",color:"#2563EB"},
  priceRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:15,gap:10},
  priceInput:{width:120,borderWidth:1,borderColor:"#D1D5DB",borderRadius:9,padding:9,textAlign:"center",fontSize:16},
  amountRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:13,borderTopWidth:1,borderTopColor:"#F3F4F6",paddingTop:12},
  amountLabel:{fontSize:14,color:"#4B5563",fontWeight:"600"},
  amount:{fontSize:21,fontWeight:"900",color:"#2563EB"},
  formula:{fontSize:12,color:"#9CA3AF",textAlign:"right",marginTop:4},
  totalCard:{backgroundColor:"#111827",borderRadius:18,padding:18,marginTop:2},
  totalCaption:{fontSize:16,fontWeight:"800",color:"#D1D5DB",marginBottom:9},
  summaryLine:{flexDirection:"row",justifyContent:"space-between",paddingVertical:6},
  summaryLabel:{color:"#E5E7EB",fontSize:14},
  summaryValue:{color:"#fff",fontSize:15,fontWeight:"800"},
  grandLine:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",borderTopWidth:1,borderTopColor:"#374151",paddingTop:13,marginTop:8},
  grandLabel:{color:"#fff",fontSize:17,fontWeight:"800"},
  grandValue:{color:"#fff",fontSize:27,fontWeight:"900"},
  resetButton:{padding:14,borderRadius:12,borderWidth:1,borderColor:"#EF4444",alignItems:"center",marginVertical:14},
  resetText:{color:"#DC2626",fontWeight:"800",fontSize:15},
  historyTitle:{fontSize:17,fontWeight:"800",marginBottom:8,color:"#111827"},
  historyRow:{flexDirection:"row",justifyContent:"space-between",paddingVertical:12,borderBottomWidth:1,borderBottomColor:"#F3F4F6"},
  historyDate:{fontSize:15,fontWeight:"700",color:"#374151"},
  historyAmount:{fontSize:15,fontWeight:"800",color:"#2563EB"},
  footer:{textAlign:"center",fontSize:12,color:"#9CA3AF",marginTop:8}
});