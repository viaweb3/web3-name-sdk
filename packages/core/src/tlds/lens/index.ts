const baseUrl = 'https://api-v2.lens.dev/'

export class LensProtocol {
  static async getDomainName(address: string) {
    const gql = `
  query defaultProfile($request: DefaultProfileRequest!) {
    defaultProfile(request: $request) {
      id
      handle{
        namespace
        localName
      }
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
          request: {
            for: address,
          }

        },
      }),
    }).then((res) => res.json())
    return res.data.defaultProfile.handle.localName + '.' + res.data.defaultProfile.handle.namespace
  }

  static async getAddress(domain: string) {
    const gql = `
      query Profile($forHandle: Handle, $forProfileId: ProfileId) {
        profile(request: { forHandle: $forHandle, forProfileId: $forProfileId }) {
            id
            ownedBy {
              address
              chainId
            }
  }
}`
    const newDomain = domain.split('.')[0]
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: gql,
        variables: {
          forHandle: `lens/${newDomain}`,
        },
      }),
    }).then((res) => res.json())

    return res.data.profile.ownedBy.address
  }
}
