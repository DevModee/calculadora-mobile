import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

const BUTTONS = [
  ["⌫", "+/-", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

export default function App() {
  const [display, setDisplay] = useState("0");
  const [first, setFirst] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecond, setWaitingForSecond] = useState(false);
  const [history, setHistory] = useState<{ exp: string; res: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const resetAll = () => {
    setDisplay("0");
    setFirst(null);
    setOperator(null);
    setWaitingForSecond(false);
  };

  const handleNumber = (num: string) => {
    if (waitingForSecond) {
      setDisplay(num);
      setWaitingForSecond(false);
    } else {
      if (display === "0" && num === "0") return;
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleDot = () => {
    if (waitingForSecond) {
      setDisplay("0.");
      setWaitingForSecond(false);
      return;
    }
    if (!display.includes(".")) setDisplay(display + ".");
  };

  const handleBackspace = () => {
    if (display.length === 1 || (display.length === 2 && display.startsWith("-"))) {
      setDisplay("0");
      return;
    }
    setDisplay(display.slice(0, -1));
  };

  const toggleSign = () => {
    if (display === "0") return;
    setDisplay((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
  };

  const percent = () => {
    const val = parseFloat(display);
    const res = (val / 100).toString();
    setDisplay(formatResult(res));
    if (waitingForSecond) setWaitingForSecond(false);
  };

  const handleOperator = (op: string) => {
    if (first === null) {
      setFirst(display);
      setOperator(op);
      setWaitingForSecond(true);
    } else {
      if (!waitingForSecond) {
        const result = computeResult();
        setFirst(result);
        setDisplay(formatResult(result));
        setOperator(op);
        setWaitingForSecond(true);
      } else {
        setOperator(op);
      }
    }
  };

  const computeResult = () => {
    if (first === null || operator === null) return display;
    const a = parseFloat(first);
    const b = parseFloat(display);
    let res = 0;

    switch (operator) {
      case "+": res = a + b; break;
      case "-": res = a - b; break;
      case "×": res = a * b; break;
      case "÷": if (b === 0) return "Error"; res = a / b; break;
      default: res = b;
    }

    const formatted = res.toString();
    const result = formatResult(formatted);
    const operation = `${a} ${operator} ${b}`;
    setHistory((prev) => [{ exp: operation, res: result }, ...prev.slice(0, 4)]);
    return formatted;
  };

  const handleEqual = () => {
    if (first === null || operator === null) return;
    const result = computeResult();
    setDisplay(formatResult(result));
    setFirst(null);
    setOperator(null);
    setWaitingForSecond(false);
  };

  const onPress = (label: string) => {
    if (label >= "0" && label <= "9") {
      handleNumber(label);
      return;
    }
    switch (label) {
      case "⌫": handleBackspace(); break;
      case "+/-": toggleSign(); break;
      case "%": percent(); break;
      case ".": handleDot(); break;
      case "+": case "-": case "×": case "÷": handleOperator(label); break;
      case "=": handleEqual(); break;
      default: break;
    }
  };

  const formatResult = (value: string) => {
    if (value === "Error") return "Error";
    let num = Number(value);
    if (!isFinite(num) || Number.isNaN(num)) return "Error";
    let str = num.toPrecision(12);
    str = parseFloat(str).toString();
    if (str.length > 14) str = num.toExponential(6);
    return str;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Botón para mostrar historial */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowHistory(!showHistory)}>
            <MaterialIcons
              name={showHistory ? "expand-less" : "expand-more"}
              size={28}
              color="#bbb"
            />
          </TouchableOpacity>

          {showHistory && (
            <TouchableOpacity onPress={() => setHistory([])} style={styles.clearButton}>
              <MaterialIcons name="delete-outline" size={24} color="#bbb" />
            </TouchableOpacity>
          )}
        </View>

        {/* Historial */}
        {showHistory && (
          <ScrollView
            style={styles.historyScroll}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {history.length === 0 ? (
              <Text style={{ color: "#aaa", textAlign: "center" }}>Sin historial</Text>
            ) : (
              history.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyText}>
                    {item.exp} = {item.res}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* Display */}
        <View style={styles.displayContainer}>
          <Text numberOfLines={1} style={styles.displayText}>
            {display}
          </Text>
        </View>

        {/* Botones */}
        <View style={styles.buttonsContainer}>
          {BUTTONS.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((label) => {
                const isZero = label === "0";
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => onPress(label)}
                    activeOpacity={0.7}
                    style={[
                      styles.button,
                      (["+", "-", "×", "÷", "="].includes(label)) && styles.operatorButton,
                      isZero && styles.zeroButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        (["+", "-", "×", "÷", "="].includes(label)) && styles.operatorText,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b0b0b" },
  container: { flex: 1, backgroundColor: "#0b0b0b", paddingHorizontal: 20, paddingBottom: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  clearButton: { padding: 4 },
  historyScroll: {
    backgroundColor: "#222",
    maxHeight: 150,
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
  },
  historyItem: {
    marginBottom: 6,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  historyText: {
    color: "#fff",
    fontSize: 16,
    flexShrink: 1,
  },
  displayContainer: { flex: 1, justifyContent: "flex-end", paddingVertical: 30 },
  displayText: {
    color: "#fff",
    fontSize: 54,
    textAlign: "right",
    fontWeight: "300",
    flexShrink: 1,
  },
  buttonsContainer: {},
  row: { flexDirection: "row", marginBottom: 12 },
  button: {
    flex: 1,
    marginHorizontal: 8,
    height: 78,
    borderRadius: 18,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  zeroButton: { flex: 2, alignItems: "flex-start", paddingLeft: 28 },
  operatorButton: { backgroundColor: "#7e29d9" },
  buttonText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
  },
  operatorText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
});
