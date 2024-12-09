import { Address, encodeFunctionData, parseEther, PublicClient, WalletClient, zeroAddress } from 'viem'

import { RegisterOptionsV3, SIDRegisterOptionsV3 } from './types'
import { calculateDuration, getBufferedPrice, encodeExtraData, validateNameV3 } from './utils/registerV3'
import { sidV3CtrlAbi } from './abi/sidCtrlV3'

export default class SIDRegisterV3 {
  private readonly publicClient: PublicClient
  private readonly walletClient: WalletClient
  private readonly identifier: bigint
  private readonly controllerAddr: Address
  private readonly resolverAddr: Address
  private readonly simulateAccount: Address
  private readonly simulateValue: bigint

  constructor(options: SIDRegisterOptionsV3) {
    const { publicClient, walletClient, identifier, controllerAddr } = options
    this.publicClient = publicClient
    this.walletClient = walletClient
    this.identifier = BigInt(identifier)
    this.controllerAddr = controllerAddr
    this.resolverAddr = options.resolverAddr
    this.simulateAccount = options.simulateAccount ?? zeroAddress
    this.simulateValue = parseEther(options.simulateValue ?? '500')
  }

  private validateName(name: string) {
    const res = validateNameV3(name)
    if (res !== name) throw new Error('unnormailzed name')
  }

  /**
   * Get the rent price for a name in wei.
   * @param label
   * @param year number of registration years
   * @param options.referrer optional parameter. the referrer domain.
   * @param options.usePoint optional parameter. use gift card points to pay for the domain.
   * @param options.setPrimaryName optional parameter. register and set the domain as primary name.
   */
  async getRentPrice(label: string, year: number, options?: RegisterOptionsV3) {
    this.validateName(label)

    const extraData = encodeExtraData(options?.usePoint ?? false, options?.referrer)
    try {
      await this.publicClient.simulateContract({
        address: this.controllerAddr,
        abi: sidV3CtrlAbi,
        account: this.simulateAccount,
        functionName: 'bulkRegisterSimulate',
        args: [
          this.identifier,
          [label],
          this.resolverAddr,
          calculateDuration(year),
          this.resolverAddr,
          false,
          [extraData],
        ] as any,
        value: this.simulateValue,
      })
    } catch (e: any) {
      const msg = e.metaMessages as string[]
      if (msg[0] === 'Error: SimulatePrice(uint256 realPrice)') {
        const value = msg[1]?.trim().slice(1, -1)
        return BigInt(value)
      } else {
        throw e
      }
    }
  }

  /**
   * check if the domain is available for registration
   * @param label
   */
  async getAvailable(label: string): Promise<boolean> {
    this.validateName(label)
    return await this.publicClient.readContract({
      address: this.controllerAddr,
      abi: sidV3CtrlAbi,
      functionName: 'available',
      args: [this.identifier, label],
    })
  }

  /**
   * register a domain
   * @param label
   * @param address the address to register
   * @param year
   * @param options.referrer optional parameter. the referrer domain. only work for .bnb and .arb domain
   * @param options.usePoint optional parameter. use gift card points to pay for the domain.
   * @param options.setPrimaryName optional parameter. register and set the domain as primary name.
   */
  async register(label: string, address: Address, year: number, options?: RegisterOptionsV3): Promise<string> {
    this.validateName(label)
    const setPrimaryName = options?.setPrimaryName ?? false
    const normalizedName = label
    const duration = calculateDuration(year)
    const extraData = [encodeExtraData(options?.usePoint ?? false, options?.referrer)]

    const priceRes = await this.getRentPrice(normalizedName, year)
    if (priceRes === undefined) {
      throw new Error('Failed to get rent price')
    }
    const bufferedPrice = getBufferedPrice(priceRes)

    const data = encodeFunctionData({
      abi: sidV3CtrlAbi,
      functionName: 'bulkRegister',
      args: [this.identifier, [normalizedName], address, duration, this.resolverAddr, setPrimaryName, extraData],
    })

    let gasLimit = await this.publicClient.estimateGas({
      account: address,
      to: this.controllerAddr,
      data,
      value: bufferedPrice,
    })
    if (gasLimit > 0) {
      gasLimit = (gasLimit * BigInt(12)) / BigInt(10)
    }
    const txHash = await this.walletClient.sendTransaction({
      account: address,
      to: this.controllerAddr,
      value: bufferedPrice,
      data,
      gas: gasLimit,
      chain: null,
    })
    await this.publicClient.waitForTransactionReceipt({ hash: txHash })
    return txHash
  }
}
