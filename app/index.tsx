
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../styles/commonStyles';
import { useAttendance } from '../hooks/useAttendance';
import AttendanceTable from '../components/AttendanceTable';
import AddWorkerForm from '../components/AddWorkerForm';
import InstructionsCard from '../components/InstructionsCard';
import Button from '../components/Button';
import SimpleBottomSheet from '../components/BottomSheet';
import { generateExcelReport, emailReport } from '../utils/excelExport';

export default function AttendanceApp() {
  const {
    workers,
    attendance,
    loading,
    addWorker,
    removeWorker,
    toggleAttendance,
    clearAllData,
  } = useAttendance();

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleAddWorker = (name: string) => {
    // Check if worker already exists
    const existingWorker = workers.find(worker => 
      worker.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingWorker) {
      Alert.alert('Error', 'A worker with this name already exists');
      return;
    }
    
    addWorker(name);
  };

  const handleRemoveWorker = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;

    Alert.alert(
      'Remove Worker',
      `Are you sure you want to remove ${worker.name}? This will delete all their attendance data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeWorker(workerId)
        },
      ]
    );
  };

  const handleGenerateReport = async () => {
    if (attendance.length === 0) {
      Alert.alert('No Data', 'Please add workers and mark attendance before generating a report.');
      return;
    }

    setIsGeneratingReport(true);
    try {
      console.log('Starting report generation...');
      const fileUri = await generateExcelReport(attendance);
      await emailReport(fileUri);
      
      Alert.alert(
        'Report Generated',
        'The weekly attendance report has been generated and is ready to share via email.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.log('Error generating report:', error);
      Alert.alert(
        'Error',
        'Failed to generate the report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all workers and attendance data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: clearAllData
        },
      ]
    );
  };

  const getCurrentWeekDates = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek.toLocaleDateString(),
      end: endOfWeek.toLocaleDateString(),
    };
  };

  const getTotalPresentDays = () => {
    return attendance.reduce((sum, record) => {
      return sum + [
        record.monday,
        record.tuesday,
        record.wednesday,
        record.thursday,
        record.friday,
        record.saturday,
        record.sunday
      ].filter(Boolean).length;
    }, 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading attendance data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const weekDates = getCurrentWeekDates();
  const totalPresentDays = getTotalPresentDays();
  const totalPossibleDays = workers.length * 7;

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Weekly Attendance Tracker</Text>
            <Text style={styles.weekText}>
              Week: {weekDates.start} - {weekDates.end}
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{workers.length}</Text>
                <Text style={styles.statLabel}>Workers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalPresentDays}</Text>
                <Text style={styles.statLabel}>Days Present</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {totalPossibleDays > 0 ? Math.round((totalPresentDays / totalPossibleDays) * 100) : 0}%
                </Text>
                <Text style={styles.statLabel}>Attendance</Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          {workers.length === 0 && <InstructionsCard />}

          {/* Add Worker Form */}
          <AddWorkerForm onAddWorker={handleAddWorker} />

          {/* Attendance Table */}
          <View style={styles.tableContainer}>
            <AttendanceTable
              attendance={attendance}
              onToggleAttendance={toggleAttendance}
              onRemoveWorker={handleRemoveWorker}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              text={isGeneratingReport ? "Generating Report..." : "📧 Email Weekly Report"}
              onPress={handleGenerateReport}
              style={[
                styles.reportButton,
                isGeneratingReport && styles.disabledButton
              ]}
              textStyle={styles.reportButtonText}
              disabled={isGeneratingReport}
            />
            
            <Button
              text="⚙️ Settings"
              onPress={() => setIsBottomSheetVisible(true)}
              style={styles.settingsButton}
            />
          </View>
        </View>
      </ScrollView>

      {/* Settings Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Settings & Info</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Email Address</Text>
            <Text style={styles.settingValue}>eddy.rxwl@hotmail.com</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Total Workers</Text>
            <Text style={styles.settingValue}>{workers.length}</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Current Week</Text>
            <Text style={styles.settingValue}>{weekDates.start} - {weekDates.end}</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Total Present Days</Text>
            <Text style={styles.settingValue}>{totalPresentDays} / {totalPossibleDays}</Text>
          </View>
          
          <Button
            text="🗑️ Clear All Data"
            onPress={handleClearAllData}
            style={styles.clearButton}
            textStyle={styles.clearButtonText}
          />

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About</Text>
            <Text style={styles.infoText}>
              This app helps you track weekly attendance for your workers. 
              Mark attendance by tapping on each day, then generate and email 
              Excel reports with a single tap.
            </Text>
          </View>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  weekText: {
    fontSize: 16,
    color: colors.grey,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.grey,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  tableContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
    minHeight: 200,
  },
  actionButtons: {
    gap: 12,
  },
  reportButton: {
    backgroundColor: colors.success,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: colors.grey,
    opacity: 0.6,
  },
  settingsButton: {
    backgroundColor: colors.secondary,
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
    color: colors.grey,
  },
  clearButton: {
    backgroundColor: colors.error,
    marginTop: 20,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.grey,
    lineHeight: 20,
  },
});
