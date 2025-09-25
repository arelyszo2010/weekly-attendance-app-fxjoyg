
import { useState, useEffect } from 'react';
import { Worker, AttendanceRecord, DayOfWeek } from '../types/attendance';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKERS_STORAGE_KEY = 'attendance_workers';
const ATTENDANCE_STORAGE_KEY = 'attendance_records';

export function useAttendance() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const workersData = await AsyncStorage.getItem(WORKERS_STORAGE_KEY);
      const attendanceData = await AsyncStorage.getItem(ATTENDANCE_STORAGE_KEY);
      
      if (workersData) {
        const parsedWorkers = JSON.parse(workersData);
        setWorkers(parsedWorkers);
        console.log('Loaded workers:', parsedWorkers);
      }
      
      if (attendanceData) {
        const parsedAttendance = JSON.parse(attendanceData);
        setAttendance(parsedAttendance);
        console.log('Loaded attendance:', parsedAttendance);
      }
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkers = async (newWorkers: Worker[]) => {
    try {
      await AsyncStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(newWorkers));
      console.log('Workers saved successfully');
    } catch (error) {
      console.log('Error saving workers:', error);
    }
  };

  const saveAttendance = async (newAttendance: AttendanceRecord[]) => {
    try {
      await AsyncStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(newAttendance));
      console.log('Attendance saved successfully');
    } catch (error) {
      console.log('Error saving attendance:', error);
    }
  };

  const addWorker = (name: string) => {
    const newWorker: Worker = {
      id: Date.now().toString(),
      name: name.trim(),
    };
    
    const newWorkers = [...workers, newWorker];
    setWorkers(newWorkers);
    saveWorkers(newWorkers);

    // Create initial attendance record for the new worker
    const newAttendanceRecord: AttendanceRecord = {
      workerId: newWorker.id,
      workerName: newWorker.name,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    };

    const newAttendance = [...attendance, newAttendanceRecord];
    setAttendance(newAttendance);
    saveAttendance(newAttendance);
    
    console.log('Added new worker:', newWorker);
  };

  const removeWorker = (workerId: string) => {
    const newWorkers = workers.filter(worker => worker.id !== workerId);
    setWorkers(newWorkers);
    saveWorkers(newWorkers);

    const newAttendance = attendance.filter(record => record.workerId !== workerId);
    setAttendance(newAttendance);
    saveAttendance(newAttendance);
    
    console.log('Removed worker:', workerId);
  };

  const toggleAttendance = (workerId: string, day: DayOfWeek) => {
    const newAttendance = attendance.map(record => {
      if (record.workerId === workerId) {
        return {
          ...record,
          [day]: !record[day],
        };
      }
      return record;
    });
    
    setAttendance(newAttendance);
    saveAttendance(newAttendance);
    console.log(`Toggled attendance for worker ${workerId} on ${day}`);
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.removeItem(WORKERS_STORAGE_KEY);
      await AsyncStorage.removeItem(ATTENDANCE_STORAGE_KEY);
      setWorkers([]);
      setAttendance([]);
      console.log('All data cleared');
    } catch (error) {
      console.log('Error clearing data:', error);
    }
  };

  return {
    workers,
    attendance,
    loading,
    addWorker,
    removeWorker,
    toggleAttendance,
    clearAllData,
  };
}
