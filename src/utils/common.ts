export const encodeStr = (str?: string, showNum = 3, dotNum = 2) => {
  if (!str) return ''
  return [
    str.slice(0, showNum),
    '.'.repeat(dotNum),
    str.slice(-1 * showNum),
  ].join('')
}

export function bigintToStringHex(element: bigint | undefined): string {
  if (element === undefined) return ''

  const hex = element.toString(16)
  return element < 0 ? `-0x${hex.slice(1)}` : `0x${hex}`
}
