/**
 * Uganda-Specific Expense Categories
 * These categories are tailored for Ugandan users and their spending patterns
 */

export const UGANDA_CATEGORIES: Record<string, string[]> = {
    'Food & Drinks': [
        'Groceries',
        'Restaurant/Food Vendor',
        'Street Food',
        'Alcohol/Entertainment'
    ],
    'Transport': [
        'Boda Boda',
        'Taxi/Matatu',
        'Fuel',
        'Car Maintenance',
        'Parking'
    ],
    'Airtime & Data': [
        'MTN Airtime',
        'Airtel Airtime',
        'Data Bundles',
        'Voice Bundles'
    ],
    'Utilities': [
        'Electricity (UMEME/Yaka)',
        'Water (NWSC)',
        'TV Subscription',
        'Garbage Collection'
    ],
    'Rent & Housing': [
        'Rent',
        'Repairs',
        'Household Items',
        'Furniture'
    ],
    'Family & Social': [
        'School Fees',
        'Remittance to Family',
        'Gifts',
        'Church/Mosque Contribution',
        'Weddings',
        'Funerals',
        'Community Contributions'
    ],
    'Health': [
        'Hospital/Clinic',
        'Pharmacy',
        'Health Insurance',
        'Traditional Medicine'
    ],
    'Business': [
        'Stock/Inventory',
        'Supplier Payment',
        'Tools/Equipment',
        'Business Fees',
        'Marketing'
    ],
    'Savings & Investments': [
        'SACCO',
        'PAWA/ROSCA',
        'Mobile Money Savings',
        'Bank Savings',
        'Investments'
    ],
    'Personal Care': [
        'Hair/Salon',
        'Clothing',
        'Cosmetics',
        'Toiletries'
    ],
    'Entertainment': [
        'Sports Betting',
        'Events',
        'Movies',
        'Music/Streaming',
        'Hobbies'
    ],
    'Mobile Money Fees': [
        'Withdrawal Charges',
        'Transfer Fees',
        'Agent Commission'
    ]
};

/**
 * Flattened list of all categories for dropdowns
 */
export const ALL_CATEGORIES = Object.keys(UGANDA_CATEGORIES);

/**
 * Get all subcategories for a given category
 */
export const getSubcategories = (category: string): string[] => {
    return UGANDA_CATEGORIES[category] || [];
};

/**
 * Auto-categorize based on merchant/recipient name
 * This uses Uganda-specific patterns
 */
export const autoCategorize = (name: string): { category: string; subcategory?: string } | null => {
    const lowerName = name.toLowerCase();
    
    // Check for Mobile Money providers
    if (lowerName.includes('mtn') || lowerName.includes('momo')) {
        return { category: 'Airtime & Data', subcategory: 'MTN Airtime' };
    }
    if (lowerName.includes('airtel') || lowerName.includes('airtel money')) {
        return { category: 'Airtime & Data', subcategory: 'Airtel Airtime' };
    }
    
    // Utilities
    if (lowerName.includes('umeme') || lowerName.includes('yaka')) {
        return { category: 'Utilities', subcategory: 'Electricity (UMEME/Yaka)' };
    }
    if (lowerName.includes('nwsc') || lowerName.includes('water')) {
        return { category: 'Utilities', subcategory: 'Water (NWSC)' };
    }
    
    // Transport
    if (lowerName.includes('boda') || lowerName.includes('boda boda')) {
        return { category: 'Transport', subcategory: 'Boda Boda' };
    }
    if (lowerName.includes('taxi') || lowerName.includes('matatu')) {
        return { category: 'Transport', subcategory: 'Taxi/Matatu' };
    }
    
    // Common merchants
    if (lowerName.includes('supermarket') || lowerName.includes('shop')) {
        return { category: 'Food & Drinks', subcategory: 'Groceries' };
    }
    if (lowerName.includes('restaurant') || lowerName.includes('hotel') || lowerName.includes('cafe')) {
        return { category: 'Food & Drinks', subcategory: 'Restaurant/Food Vendor' };
    }
    if (lowerName.includes('school') || lowerName.includes('fees')) {
        return { category: 'Family & Social', subcategory: 'School Fees' };
    }
    if (lowerName.includes('hospital') || lowerName.includes('clinic') || lowerName.includes('pharmacy')) {
        return { category: 'Health', subcategory: 'Hospital/Clinic' };
    }
    if (lowerName.includes('church') || lowerName.includes('mosque')) {
        return { category: 'Family & Social', subcategory: 'Church/Mosque Contribution' };
    }
    if (lowerName.includes('fuel') || lowerName.includes('petrol') || lowerName.includes('shell') || lowerName.includes('total')) {
        return { category: 'Transport', subcategory: 'Fuel' };
    }
    
    // Mobile Money fees
    if (lowerName.includes('fee') || lowerName.includes('charge') || lowerName.includes('commission')) {
        return { category: 'Mobile Money Fees', subcategory: 'Transfer Fees' };
    }
    
    // Default to first category if we can't determine
    return null;
};

/**
 * Default category for new users
 */
export const DEFAULT_CATEGORY = 'Food & Drinks';
