export type Unit = 'none' | 'whole' | 'ml' | 'g'

export default function formatAmount (amount: number, unit: Unit): string {
  switch (unit) {
    case 'none':
    case 'whole':
      return amount.toString()
    case 'ml':
    case 'g':
      return `${amount}${unit}`
  }
}
