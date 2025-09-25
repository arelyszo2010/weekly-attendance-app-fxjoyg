
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../styles/commonStyles';
import { AttendanceRecord, DayOfWeek } from '../types/attendance';

interface AttendanceTableProps {
  attendance: AttendanceRecord[];
  onToggleAttendance: (workerId: string, day: DayOfWeek) => void;
  onRemoveWorker: (workerId: string) => void;
}

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

export default function AttendanceTable({ attendance, onToggleAttendance, onRemoveWorker }: AttendanceTableProps) {
  if (attendance.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No workers added yet</Text>
        <Text style={styles.emptySubtext}>Add workers to start tracking attendance</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.cell, styles.nameCell]}>
            <Text style={styles.headerText}>Worker</Text>
          </View>
          {DAYS.map(day => (
            <View key={day.key} style={[styles.cell, styles.dayCell]}>
              <Text style={styles.headerText}>{day.label}</Text>
            </View>
          ))}
          <View style={[styles.cell, styles.actionCell]}>
            <Text style={styles.headerText}>Action</Text>
          </View>
        </View>

        {/* Attendance Rows */}
        {attendance.map(record => (
          <View key={record.workerId} style={styles.row}>
            <View style={[styles.cell, styles.nameCell]}>
              <Text style={styles.workerName} numberOfLines={2}>
                {record.workerName}
              </Text>
            </View>
            
            {DAYS.map(day => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.cell,
                  styles.dayCell,
                  styles.attendanceCell,
                  record[day.key] ? styles.presentCell : styles.absentCell
                ]}
                onPress={() => onToggleAttendance(record.workerId, day.key)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.attendanceText,
                  record[day.key] ? styles.presentText : styles.absentText
                ]}>
                  {record[day.key] ? '✓' : '✗'}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.cell, styles.actionCell, styles.removeButton]}
              onPress={() => onRemoveWorker(record.workerId)}
              activeOpacity={0.7}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
  },
  table: {
    minWidth: 600,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    marginBottom: 2,
    borderRadius: 6,
  },
  cell: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
  },
  nameCell: {
    width: 120,
    alignItems: 'flex-start',
  },
  dayCell: {
    width: 60,
  },
  actionCell: {
    width: 80,
  },
  attendanceCell: {
    borderRadius: 4,
    margin: 2,
  },
  presentCell: {
    backgroundColor: '#4CAF50',
  },
  absentCell: {
    backgroundColor: '#F44336',
  },
  removeButton: {
    backgroundColor: '#FF5722',
    borderRadius: 4,
    margin: 2,
  },
  headerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  workerName: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 14,
  },
  attendanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  presentText: {
    color: '#fff',
  },
  absentText: {
    color: '#fff',
  },
  removeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
