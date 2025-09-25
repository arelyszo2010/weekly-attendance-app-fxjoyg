
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';

export default function InstructionsCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How to Use</Text>
      <View style={styles.instructionItem}>
        <Text style={styles.stepNumber}>1.</Text>
        <Text style={styles.stepText}>Add workers using the form above</Text>
      </View>
      <View style={styles.instructionItem}>
        <Text style={styles.stepNumber}>2.</Text>
        <Text style={styles.stepText}>Tap on each day to mark attendance (✓ = Present, ✗ = Absent)</Text>
      </View>
      <View style={styles.instructionItem}>
        <Text style={styles.stepNumber}>3.</Text>
        <Text style={styles.stepText}>Click "Email Weekly Report" to generate and send Excel report</Text>
      </View>
      <View style={styles.instructionItem}>
        <Text style={styles.stepNumber}>4.</Text>
        <Text style={styles.stepText}>Report will be sent to: eddy.rxwl@hotmail.com</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 8,
    minWidth: 20,
  },
  stepText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
});
