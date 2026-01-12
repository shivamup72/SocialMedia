/**
 * Formats a date string into a human-readable format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string (e.g., 'Jul 11, 2025, 3:45 PM')
 */
export const formatDate = dateString => {
  if (!dateString) return '';

  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formats a time string to 12-hour format with AM/PM
 * @param {string} timeString - The time string to format (e.g., '14:30:00')
 * @returns {string} Formatted time string (e.g., '2:30 PM')
 */
export const formatTimeToAMPM = timeString => {
  if (!timeString) return '';

  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateTimeWithTime = dateTimeString => {
  if (!dateTimeString) return '';

  const date = new Date(dateTimeString);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert 24h to 12h format

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${formattedHours}:${minutes} ${ampm}, ${day}/${month}/${year}`;
};

export const formatDateInMonth = isoString => {
  const date = new Date(isoString);
  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-GB', options);
};

export const DiffrenceIndates = (date1, date2) => {
  const date1Obj = new Date(date1);
  const date2Obj = new Date(date2);
  const timeDifference = date2Obj - date1Obj;
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  return days;
};

export const ExportformatTime = dateString => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit',
    hour12: true,
  });
};

export const FormatYYYYMMDD = dateString => {
  if (!dateString) return '';

  // If format is DD/MM/YYYY
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const FormatYYYYMMDDHHMM = dateString => {
  // const date = new Date(dateString);
  // const year = date.getFullYear();
  // const month = String(date.getMonth() + 1).padStart(2, '0');
  // const day = String(date.getDate()).padStart(2, '0');
  const [day, month, year] = dateString.split('-');
  // const hours = String(date.getHours()).padStart(2, '0');
  // const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const FormatDDMMYYYY = dateString => {
  if (!dateString) return '';

  if (dateString.includes('/')) {
    console.log('date string data -=-=------>', dateString);
    const [day, month, year] = dateString.split('/');
    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
  }

  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

export const FormatDDMMYYYwithoutLine = date1 => {
  const date = new Date(date1);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const FormatYYYYMMDDToDDMMYYYYY = dataString => {
  const [day, month, year] = dataString.split('-');
  // console.log('date string -=-=-=-=-=--------->', day, month, year, '\n', '\n');

  return `${year}-${month}-${day}`;
};

export const FormatDDMMYYYYToYYYYMMDD = dataString => {
  const [day, month, year] = dataString.split('-');
  // console.log('date string -=-=-=-=-=--------->', day, month, year, '\n', '\n');

  return `${year}-${month}-${day}`;
};
