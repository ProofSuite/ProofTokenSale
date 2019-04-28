const BigNumber = web3.BigNumber
let chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
var chaiStats = require('chai-stats')
var chaiBigNumber = require('chai-bignumber')(BigNumber)
chai.use(chaiAsPromised).use(chaiBigNumber).use(chaiStats).should()

import { getAddress,
         expectInvalidOpcode } from '../scripts/helpers.js'

import { transferOwnership } from '../scripts/ownershipHelpers.js'

const assert = chai.assert
const should = chai.should()
const expect = chai.expect

const ProofPresaleToken = artifacts.require('./ProofPresaleToken.sol')
const Token = artifacts.require('./Token.sol')
const TokenSale = artifacts.require('./TokenSale.sol')

contract('Crowdsale', (accounts) => {
  let fund = accounts[0]
  let tokenSale
  let Token
  let proofPresaleToken
  let proofPresaleTokenAddress
  let TokenAddress
  let receiver = accounts[2]
  let hacker1 = accounts[3]
  let hacker2 = accounts[4]
  let wallet = accounts[5]
  let proofWalletAddress = accounts[9]

  let startBlock
  let endBlock

  beforeEach(async function() {

    startBlock = web3.eth.blockNumber + 10
    endBlock = web3.eth.blockNumber + 20

    proofPresaleToken = await ProofPresaleToken.new()
    proofPresaleTokenAddress = await getAddress(proofPresaleToken)

    Token = await Token.new(proofPresaleTokenAddress, proofWalletAddress)
    TokenAddress = await getAddress(Token)

    Token = await Token.new(
      '0x0',
      '0x0',
      0,
      'WIRA Token',
      18,
      'WIRA',
      true)

    tokenSale = await TokenSale.new(
      TokenAddress,
      startBlock,
      endBlock)
  })

  describe('Ownership', function () {
    it('should initially belong to contract caller', async function() {
      let owner = await tokenSale.owner.call()
      assert.equal(owner, fund)
    })

    it('should be transferable to another account', async function() {
      let owner = await tokenSale.owner.call()
      await transferOwnership(tokenSale, owner, receiver)
      let newOwner = await tokenSale.owner.call()
      assert.equal(newOwner, receiver)
    })

    it('should not be transferable by non-owner', async function() {
      let owner = await tokenSale.owner.call()
      await expectInvalidOpcode(transferOwnership(tokenSale, hacker1, hacker2))
      const newOwner = await tokenSale.owner.call()
      assert.equal(owner, newOwner)
    })
  })
})
