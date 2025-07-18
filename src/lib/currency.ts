/**
 * Servicio de conversión de moneda para el frontend
 * Mantiene sincronización con el backend
 */

export const CURRENCY_RATES = {
  USD_TO_DOP: 60.5, // 1 USD = 60.5 DOP
  DOP_TO_USD: 0.0165, // 1 DOP = 0.0165 USD
}

export class CurrencyService {
  /**
   * Convierte de USD a DOP
   */
  static convertUSDToDOP(amountUSD: number): number {
    return amountUSD * CURRENCY_RATES.USD_TO_DOP
  }

  /**
   * Convierte de DOP a USD
   */
  static convertDOPToUSD(amountDOP: number): number {
    return amountDOP * CURRENCY_RATES.DOP_TO_USD
  }

  /**
   * Formatea un monto en DOP
   */
  static formatDOP(amount: number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount)
  }

  /**
   * Formatea un monto en USD
   */
  static formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  /**
   * Convierte USD a DOP y formatea para mostrar en la UI
   */
  static formatUSDToDOP(amountUSD: number): string {
    const amountDOP = this.convertUSDToDOP(amountUSD)
    return this.formatDOP(amountDOP)
  }

  /**
   * Formatea mostrando ambas monedas
   */
  static formatWithBothCurrencies(amountUSD: number): string {
    const dopAmount = this.formatUSDToDOP(amountUSD)
    const usdAmount = this.formatUSD(amountUSD)
    return `${dopAmount} (${usdAmount})`
  }
}
