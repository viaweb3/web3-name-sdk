import { Contract, Signer } from 'ethers'
import registrarController from '@siddomains/sid-contracts/build/contracts/IRegistrarController.json'

export function getRegistrarControllerContract({
  address,
  signer,
}: {
  address: string
  signer: Signer
}) {
  return new Contract(address, registrarController, signer)
}
