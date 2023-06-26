const baseUrl = 'https://api.lens.dev/'

export class LensProtocol {
  static async getDomainName(address: string) {
    const gql = `
      query Profile($ethereumAddress: EthereumAddress!) {
        defaultProfile(request: { ethereumAddress: $ethereumAddress }) {
          id
          handle
        }
      }
    `
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: gql,
        variables: {
          ethereumAddress: address,
        },
      }),
    }).then((res) => res.json())

    return res.data.defaultProfile.handle
  }

  static async getAddress(domain: string) {
    const gql = `
      query Profile ($handle: Handle!) {
        profile(request: { handle: $handle }) {
          id
          ownedBy
        }
      }
    `
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: gql,
        variables: {
          handle: domain,
        },
      }),
    }).then((res) => res.json())

    return res.data.profile.ownedBy
  }
}
