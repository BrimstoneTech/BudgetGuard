export interface SeasonalReminder {
    id: number;
    name: string;
    description: string;
    date: string;
    repeatAnnually: boolean;
    enabled: boolean;
    userCreated: boolean;
    daysBeforeReminder: number;
}

export const DEFAULT_SEASONAL_REMINDERS = [
    {
        id: 1,
        name: 'New Year Planning',
        description: 'Review your financial goals for the new year',
        date: '01-01',
        repeatAnnually: true,
        enabled: false,
        userCreated: false,
        daysBeforeReminder: 7
    },
    {
        id: 2,
        name: 'Tax Season',
        description: 'Prepare for annual tax obligations if applicable',
        date: '03-31',
        repeatAnnually: true,
        enabled: false,
        userCreated: false,
        daysBeforeReminder: 30
    },
    {
        id: 3,
        name: 'Mid-Year Review',
        description: 'Review your spending patterns and adjust budgets',
        date: '06-30',
        repeatAnnually: true,
        enabled: false,
        userCreated: false,
        daysBeforeReminder: 14
    },
    {
        id: 4,
        name: 'Year-End Planning',
        description: 'Plan for holiday season spending',
        date: '12-01',
        repeatAnnually: true,
        enabled: false,
        userCreated: false,
        daysBeforeReminder: 30
    }
];

export const shouldShowReminder = (reminder, today = new Date()) => {
    if (!reminder.enabled) return false;
    
    const [month, day] = reminder.date.split('-');
    
    if (reminder.repeatAnnually) {
        const reminderDate = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
        const daysDiff = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= reminder.daysBeforeReminder;
    }
    
    const todayStr = today.toISOString().split('T')[0];
    return todayStr === reminder.date;
};

export const getTodaysReminders = (reminders) => {
    return reminders.filter(r => shouldShowReminder(r));
};

export const getUpcomingReminders = (reminders, today = new Date()) => {
    const upcoming = [];
    
    reminders.forEach(reminder => {
        if (!reminder.enabled) return;
        
        const [month, day] = reminder.date.split('-');
        let reminderDate;
        
        if (reminder.repeatAnnually) {
            reminderDate = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
            if (reminderDate < today) {
                reminderDate = new Date(today.getFullYear() + 1, parseInt(month) - 1, parseInt(day));
            }
        } else {
            reminderDate = new Date(reminder.date);
        }
        
        const daysDiff = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 0 && daysDiff <= 30) {
            upcoming.push({ ...reminder, daysUntil: daysDiff });
        }
    });
    
    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
};

export const createSeasonalReminder = (name, description, date, repeatAnnually = true, daysBeforeReminder = 7) => {
    return {
        id: Date.now(),
        name,
        description,
        date,
        repeatAnnually,
        enabled: true,
        userCreated: true,
        daysBeforeReminder
    };
};

export const generateReminderMessage = (reminder, daysUntil) => {
    if (daysUntil === 0) {
        return reminder.name + ': ' + reminder.description;
    }
    return 'In ' + daysUntil + ' day' + (daysUntil > 1 ? 's' : '') + ': ' + reminder.name + ' - ' + reminder.description;
};
