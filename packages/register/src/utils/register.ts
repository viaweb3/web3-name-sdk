import { utils, BigNumber } from 'ethers'

export const YEAR_IN_SECONDS = 31556952

export function calculateDuration(years: number) {
  return BigNumber.from(parseInt((years * YEAR_IN_SECONDS).toFixed()))
}

export function genCommitSecret() {
  return utils.hexlify(utils.randomBytes(32))
}

export function getBufferedPrice(price: BigNumber) {
  return price.mul(110).div(100)
}
