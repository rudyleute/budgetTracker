export const groupBy = (data, columnName, functor = null) => {
  const keys = [];
  const groups = {};
  const getKey = functor || ((value) => value);

  data.forEach(item => {
    const newKey = getKey(item[columnName]);

    if (newKey in groups) {
      groups[newKey].push(item);
    } else {
      keys.push(newKey);
      groups[newKey] = [item];
    }
  });

  return { keys, groups };
};

export const getDatetime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const getDate = (date, options = {}) => { return (new Date(date)).toLocaleDateString("en-CA", {hour12: false, ...options})}

export const createTimeFilters = (setValues, uuidv4) => {
  const getDateRange = (label) => {
    const today = new Date();
    const formatDate = (date) => getDate(date, {year: "numeric", month: "2-digit", day: "2-digit"});

    switch (label) {
      case "Today":
        return {
          from: formatDate(today),
          to: formatDate(today)
        };
      case "Yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          from: formatDate(yesterday),
          to: formatDate(yesterday)
        };
      }
      case "This week": {
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so go back 6 days
        startOfWeek.setDate(today.getDate() - daysFromMonday);
        return {
          from: formatDate(startOfWeek),
          to: formatDate(today)
        };
      }
      case "Last week": {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - daysFromMonday - 1); // Last Sunday

        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6); // Go back 6 days to Monday

        return {
          from: formatDate(lastWeekStart),
          to: formatDate(lastWeekEnd)
        };
      }
      case "This month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          from: formatDate(startOfMonth),
          to: formatDate(today)
        };
      }
      case "Last month": {
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          from: formatDate(lastMonthStart),
          to: formatDate(lastMonthEnd)
        };
      }
      case "Last three months": {
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        return {
          from: formatDate(threeMonthsAgo),
          to: formatDate(today)
        };
      }
      case "This year": {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return {
          from: formatDate(startOfYear),
          to: formatDate(today)
        };
      }
      case "Last year": {
        const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        return {
          from: formatDate(lastYearStart),
          to: formatDate(lastYearEnd)
        };
      }

      default:
        return { from: "", to: "" };
    }
  };

  const formOption = (label) => {
    const {from, to} = getDateRange(label);
    setValues(prev => ({ ...prev, from, to }))
  }

  return [
    { label: "Today", func: () => formOption("Today") },
    { label: "Yesterday", func: () => formOption("Yesterday") },
    { label: "This week", func: () => formOption("This week") },
    { label: "Last week", func: () => formOption("Last week") },
    { label: "This month", func: () => formOption("This month") },
    { label: "Last month", func: () => formOption("Last month") },
    { label: "Last three months", func: () => formOption("Last three months") },
    { label: "This year", func: () => formOption("This year") },
    { label: "Last year", func: () => formOption("Last year") },
  ]
}