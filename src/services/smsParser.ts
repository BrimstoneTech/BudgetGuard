/**
 * SMS Parser for Ugandan Mobile Money Providers
 * Parses MTN MoMo and Airtel Money transaction SMS messages
 */

export interface ParsedTransaction {
    type: 'RECEIVE' | 'SEND' | 'WITHDRAW' | 'DEPOSIT' | 'AIRTIME' | 'BILL_PAYMENT' | 'MERCHANT_PAYMENT' | 'UNKNOWN';
    amount: number;
    currency: string;
    from?: string;
    fromPhone?: string;
    to?: string;
    toPhone?: string;
    transactionId?: string;
    balanceAfter?: number;
    fee?: number;
    message?: string;
    timestamp?: Date;
    provider: 'MTN MoMo' | 'Airtel Money' | 'UNKNOWN';
}

/**
 * Parse amount string to number
 */
export const parseAmount = (amountStr: string): number => {
    return parseFloat(amountStr.replace(/,/g, ''));
};

/**
 * Format phone number to standard Uganda format
 */
export const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        return '256' + cleaned.substring(1);
    }
    if (cleaned.length === 9) {
        return '256' + cleaned;
    }
    return cleaned;
};

/**
 * Parse MTN Mobile Money SMS
 */
export const parseMTNMoMoSMS = (sms: string): ParsedTransaction | null => {
    const text = sms.trim();
    
    const receivePattern = /You have received (UGX|USD)\s*([\d,]+)\s+from\s+(\d+)\s*[-]?\s*([A-Z\s]+)\.?\s*Transaction ID:\s*(\d+)\s*\.?\s*Your new balance is (UGX|USD)\s*([\d,]+)/i;
    const receiveMatch = text.match(receivePattern);
    if (receiveMatch) {
        return {
            type: 'RECEIVE',
            amount: parseAmount(receiveMatch[2]),
            currency: receiveMatch[1],
            from: receiveMatch[4].trim(),
            fromPhone: formatPhoneNumber(receiveMatch[3]),
            transactionId: receiveMatch[5],
            balanceAfter: parseAmount(receiveMatch[7]),
            provider: 'MTN MoMo'
        };
    }
    
    return null;
};

export const parseAirtelMoneySMS = (sms: string): ParsedTransaction | null => {
    return null;
};

export const parseSMS = (sms: string): ParsedTransaction | null => {
    const mtnResult = parseMTNMoMoSMS(sms);
    if (mtnResult) return mtnResult;
    const airtelResult = parseAirtelMoneySMS(sms);
    if (airtelResult) return airtelResult;
    return null;
};

export const toBudgetGuardTransaction = (parsed: ParsedTransaction, category?: string) => {
    const isIncome = parsed.type === 'RECEIVE' || parsed.type === 'DEPOSIT';
    const isExpense = parsed.type === 'SEND' || parsed.type === 'WITHDRAW' || parsed.type === 'AIRTIME' || parsed.type === 'BILL_PAYMENT' || parsed.type === 'MERCHANT_PAYMENT';
    
    return {
        name: parsed.to || parsed.from || parsed.provider,
        amount: isIncome ? parsed.amount : -parsed.amount,
        originalAmount: parsed.amount,
        originalCurrency: parsed.currency || 'UGX',
        date: new Date(),
        category: category || (isIncome ? 'Income' : 'Mobile Money'),
        subcategory: parsed.type,
        paymentMethod: parsed.provider === 'MTN MoMo' ? 'MTN MoMo' : 'Airtel Money',
        transactionType: isIncome ? 'Income' : isExpense ? 'Expense' : 'Transfer',
        transactionId: parsed.transactionId,
        recipient: parsed.to || parsed.from,
        recipientPhone: parsed.toPhone || parsed.fromPhone,
        fee: parsed.fee,
        balanceAfter: parsed.balanceAfter,
        note: parsed.message || parsed.provider + ' ' + parsed.type,
        isMobileMoney: true
    };
};
