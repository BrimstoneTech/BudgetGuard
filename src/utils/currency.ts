export const CURRENCIES = [
    { code: 'UGX', symbol: 'Shs', rate: 1 },
    { code: 'USD', symbol: '$', rate: 3700 },
    { code: 'EUR', symbol: '€', rate: 4000 },
    { code: 'GBP', symbol: '£', rate: 4700 },
];

export const EXCHANGE_RATES = {
    USD: 3700,
    EUR: 4000,
    GBP: 4700,
    UGX: 1,
};

export const formatMoney = (ugxAmount, code = 'UGX', privacyMode = false) => {
    const currency = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
    if (privacyMode) return currency.symbol + ' ••••';
    const converted = ugxAmount / currency.rate;
    return currency.symbol + ' ' + converted.toLocaleString('en-UG', {
        minimumFractionDigits: currency.code === 'UGX' ? 0 : 2,
        maximumFractionDigits: currency.code === 'UGX' ? 0 : 2,
    });
};

export const formatMoneyInput = (ugxAmount, code = 'UGX') => {
    const currency = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
    const converted = ugxAmount / currency.rate;
    return converted.toLocaleString('en-UG', {
        minimumFractionDigits: currency.code === 'UGX' ? 0 : 2,
        maximumFractionDigits: currency.code === 'UGX' ? 0 : 2,
    });
};

export const parseMoneyInput = (formatted, code = 'UGX') => {
    const currency = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
    const cleanStr = formatted.replace(/[^0-9.]/g, '');
    const amount = parseFloat(cleanStr) || 0;
    return amount * currency.rate;
};

export const getCurrencySymbol = (code) => {
    const currency = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
    return currency.symbol;
};

export const convertCurrency = (amount, fromCode, toCode) => {
    const fromCurrency = CURRENCIES.find(c => c.code === fromCode) || CURRENCIES[0];
    const toCurrency = CURRENCIES.find(c => c.code === toCode) || CURRENCIES[0];
    const ugxAmount = amount * fromCurrency.rate;
    return ugxAmount / toCurrency.rate;
};
