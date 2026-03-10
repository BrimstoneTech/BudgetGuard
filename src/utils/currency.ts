export const CURRENCIES = [
    { code: 'UGX', symbol: 'Shs', rate: 1 },
    { code: 'USD', symbol: '$', rate: 3700 },
    { code: 'EUR', symbol: '€', rate: 4000 },
    { code: 'GBP', symbol: '£', rate: 4700 },
];

export const EXCHANGE_RATES: Record<string, number> = {
    USD: 3700,
    EUR: 4000,
    GBP: 4700,
    UGX: 1,
};

export const formatMoney = (ugxAmount: number, code: string = 'UGX', privacyMode: boolean = false) => {
    const currency = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
    if (privacyMode) return `${currency.symbol} ••••`;
    const converted = ugxAmount / currency.rate;
    return `${currency.symbol} ${converted.toLocaleString(undefined, {
        minimumFractionDigits: currency.code === 'UGX' ? 0 : 2,
        maximumFractionDigits: currency.code === 'UGX' ? 0 : 2,
    })}`;
};
