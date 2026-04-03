import {TransactionsRequestQuery} from "@app/shared";

export type DateInput = ConstructorParameters<typeof Date>[0];
export const getDate = (date: DateInput, options: Intl.DateTimeFormatOptions = {}): string => new Date(date).toLocaleDateString("en-CA", {hour12: false, ...options})
export const formatTimestamp = (timestamp: DateInput, options: Intl.DateTimeFormatOptions): string => new Date(timestamp).toLocaleString("en-UK", { hour12: false, ...options })

export const getDatetimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function daysUntilDateOnly(dateString: string) {
    const now = new Date();
    const target = new Date(dateString);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());

    const diffMs = targetDay.getTime() - today.getTime();

    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export const createTimeFilters = (setValues: (from: TransactionsRequestQuery["from"], to: TransactionsRequestQuery["to"]) => unknown) => {
    const getDateRange = (label: string) => {
        const today = new Date();
        const formatDate = (date: DateInput) => getDate(date, {year: "numeric", month: "2-digit", day: "2-digit"});

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
            case "Last four months": {
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

    const formOption = (label: string) => {
        const {from, to} = getDateRange(label);
        setValues(from, to);
    }

    return [
        { id: "1", label: "Today", func: () => formOption("Today") },
        { id: "2", label: "Yesterday", func: () => formOption("Yesterday") },
        { id: "3", label: "This week", func: () => formOption("This week") },
        { id: "4", label: "Last week", func: () => formOption("Last week") },
        { id: "5", label: "This month", func: () => formOption("This month") },
        { id: "6", label: "Last month", func: () => formOption("Last month") },
        { id: "7", label: "Last four months", func: () => formOption("Last four months") },
        { id: "8", label: "This year", func: () => formOption("This year") },
        { id: "9", label: "Last year", func: () => formOption("Last year") },
    ]
}