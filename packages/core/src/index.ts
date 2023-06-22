import { providers } from "ethers";

export class SID {
  constructor() {
    console.log("Config constructor");
  }

  getContractAddr(chainId: string) {
    const id = parseInt(chainId);
    if ([97].includes(id)) {
      return "0xfFB52185b56603e0fd71De9de4F6f902f05EEA23";
    } else if ([1, 3, 4, 5].includes(id)) {
      return "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
    } else if ([56].includes(id)) {
      return "0x08CEd32a7f3eeC915Ba84415e9C07a7286977956";
    } else if ([421613].includes(id)) {
      return "0x1f70fc8de5669eaa8C9ce72257c94500DC5ff2E4";
    } else if ([42161].includes(id)) {
      return "0x4a067EE58e73ac5E4a43722E008DFdf65B2bF348";
    }
  }
}

export function createSID({ provider }: { provider: providers.Provider }) {
  return new SID();
}
