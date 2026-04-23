export const ATTENDANCE_KEY = 'shanel_attendance_v1';
export const LAST_SAVED_ATTENDANCE_DATE_KEY = 'shanel_last_saved_attendance_date_v1';

const safeParse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const loadAttendanceStore = () => {
  return safeParse(localStorage.getItem(ATTENDANCE_KEY), {});
};

export const getAttendanceForDate = (date) => {
  const store = loadAttendanceStore();
  return store?.[date] || {};
};

export const setAttendanceForDate = (date, attendanceByEmployeeId) => {
  const store = loadAttendanceStore();
  store[date] = attendanceByEmployeeId || {};
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event('attendance-updated'));
};

export const getLastSavedAttendanceDate = () => {
  const storedDate = localStorage.getItem(LAST_SAVED_ATTENDANCE_DATE_KEY);
  return storedDate || '';
};

export const setLastSavedAttendanceDate = (date) => {
  if (!date) return;
  localStorage.setItem(LAST_SAVED_ATTENDANCE_DATE_KEY, date);
  window.dispatchEvent(new Event('attendance-saved'));
};

