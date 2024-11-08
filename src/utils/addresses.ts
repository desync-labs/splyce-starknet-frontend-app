// Token addresses
const TEST_TOKEN_PUBLIC_KEY_DEV = 'ABAqkKoLh6sHvTGjjyYeoQUvXrEFrSMSiMt26KBnyjvQ'
const TEST_TOKEN_PUBLIC_KEY_MAINNET =
  '4N37FD6SU35ssX6yTu2AcCvzVbdS6z3YZTtk5gv7ejhE'

export const TEST_TOKEN_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_ENV === 'prod'
    ? TEST_TOKEN_PUBLIC_KEY_MAINNET
    : TEST_TOKEN_PUBLIC_KEY_DEV

export const USDC_MINT_ADDRESSES = [
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'.toLowerCase(),
  '5aa3HkBenNLtJwccrNDYri1FrqfB7U2oWQsRanbGRHot'.toLowerCase(),
]

export const USDC_MINT_ADDRESSES_SHARED = [
  '5aa3HkBenNLtJwccrNDYri1FrqfB7U2oWQsRanbGRHot'.toLowerCase(),
]
