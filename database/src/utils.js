import { formatUnits } from 'ethers';

/**
 * Convert wei (BigInt) to decimal USDT value
 * @param {BigInt} weiAmount - Amount in wei
 * @returns {string} Decimal amount (e.g., "100.50")
 */
export function weiToDecimal(weiAmount) {
    if (!weiAmount) return '0';
    return formatUnits(weiAmount, 18);
}

/**
 * Convert wei to decimal with precision limit
 * @param {BigInt} weiAmount - Amount in wei
 * @param {number} decimals - Number of decimal places (default 6)
 * @returns {string} Formatted decimal amount
 */
export function weiToDecimalFixed(weiAmount, decimals = 6) {
    if (!weiAmount) return '0';
    const decimal = formatUnits(weiAmount, 18);
    return parseFloat(decimal).toFixed(decimals);
}
