
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { AttendanceRecord, WeeklyReport } from '../types/attendance';

export async function generateExcelReport(attendance: AttendanceRecord[]): Promise<string> {
  try {
    console.log('Generating Excel report...');
    
    // Get current week dates
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Prepare data for Excel
    const excelData = attendance.map(record => ({
      'Worker Name': record.workerName,
      'Monday': record.monday ? 'Present' : 'Absent',
      'Tuesday': record.tuesday ? 'Present' : 'Absent',
      'Wednesday': record.wednesday ? 'Present' : 'Absent',
      'Thursday': record.thursday ? 'Present' : 'Absent',
      'Friday': record.friday ? 'Present' : 'Absent',
      'Saturday': record.saturday ? 'Present' : 'Absent',
      'Sunday': record.sunday ? 'Present' : 'Absent',
      'Total Days Present': [
        record.monday,
        record.tuesday,
        record.wednesday,
        record.thursday,
        record.friday,
        record.saturday,
        record.sunday
      ].filter(Boolean).length,
    }));

    // Add summary row
    const totalWorkers = attendance.length;
    const totalPossibleDays = totalWorkers * 7;
    const totalPresentDays = attendance.reduce((sum, record) => {
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

    excelData.push({
      'Worker Name': 'SUMMARY',
      'Monday': '',
      'Tuesday': '',
      'Wednesday': '',
      'Thursday': '',
      'Friday': '',
      'Saturday': '',
      'Sunday': '',
      'Total Days Present': `${totalPresentDays}/${totalPossibleDays}`,
    });

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Weekly Attendance');

    // Add header with week dates
    const headerData = [
      [`Weekly Attendance Report`],
      [`Week: ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [''], // Empty row
    ];

    const headerSheet = XLSX.utils.aoa_to_sheet(headerData);
    XLSX.utils.sheet_add_json(headerSheet, excelData, { origin: 'A5' });
    
    // Replace the worksheet with the one that includes headers
    workbook.Sheets['Weekly Attendance'] = headerSheet;

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    
    // Save to file system
    const fileName = `attendance_report_${startOfWeek.toISOString().split('T')[0]}.xlsx`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Excel file created at:', fileUri);
    return fileUri;
  } catch (error) {
    console.log('Error generating Excel report:', error);
    throw error;
  }
}

export async function emailReport(fileUri: string, recipientEmail: string = 'eddy.rxwl@hotmail.com') {
  try {
    console.log('Preparing to email report...');
    
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      console.log('Mail composer not available, using sharing instead');
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Share Weekly Attendance Report',
      });
      return;
    }

    const now = new Date();
    const weekStart = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);

    await MailComposer.composeAsync({
      recipients: [recipientEmail],
      subject: `Weekly Attendance Report - Week of ${weekStart.toLocaleDateString()}`,
      body: `Please find attached the weekly attendance report for the week of ${weekStart.toLocaleDateString()}.\n\nGenerated on: ${new Date().toLocaleString()}`,
      attachments: [fileUri],
    });

    console.log('Email composer opened successfully');
  } catch (error) {
    console.log('Error emailing report:', error);
    // Fallback to sharing
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Share Weekly Attendance Report',
    });
  }
}
