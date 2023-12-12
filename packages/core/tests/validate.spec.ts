import { expect } from 'chai'
import { countCharacters } from '../src/utils/validate'

describe('toArray', () => {
  it('should convert strings to arrays', () => {
    expect(countCharacters('αβγδεζηθ')).to.equal(8)
  })

  it('should convert strings to arrays', () => {
    expect(countCharacters('🥰🐤')).to.equal(2)
  })
  it('should convert strings to arrays', () => {
    expect(countCharacters('âéïò')).to.equal(4)
  })
  it('should convert strings to arrays', () => {
    expect(countCharacters('中文')).to.equal(2)
  })
  it('should convert strings to arrays', () => {
    expect(countCharacters('ěẽ')).to.equal(2)
  })
  it('should convert strings to arrays', () => {
    expect(countCharacters('👩‍👩‍👧‍👧')).to.equal(7)
  })
})
