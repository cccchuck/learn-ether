const path = require('path')
const axios = require('axios').default
const { ethers, BigNumber } = require('ethers')

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const { Provider, Etherscan_Key, Private_Key } = process.env

// 创建 Provider
const provider = new ethers.providers.JsonRpcProvider(Provider)

const contractAddress = '0xe17827609ac34443b3987661f4e037642f6bd9ba'

let contract = null

let wallet = new ethers.Wallet(Private_Key)

/**
 * 获取 Etherscan 接口的 URL
 * @param {string} address 合约地址
 * @returns {string} 接口 URL
 */
function getEtherScanUrl(address) {
  return `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${Etherscan_Key}`
}

/**
 * 获取合约 ABI
 * @param {string} address 合约地址
 * @returns {string[]} 合约 ABI
 */
async function getContractABI(address) {
  const url = getEtherScanUrl(address)

  try {
    const resp = await axios.get(url)

    if (resp.status === 200) return resp.data.result

    return []
  } catch (error) {
    console.log('Request Error: ', error)
    return []
  }
}

/**
 * 创建合约实例
 * @param {string} address 合约地址
 * @param {string[]} ABI 合约 ABI
 * @param {unknown} providerOrSigner provider or signer
 * @returns 返回合约实例
 */
function createContract(address, ABI, providerOrSigner) {
  return new ethers.Contract(address, ABI, providerOrSigner)
}

async function createTransaction(to) {
  const feeData = await provider.getFeeData()
  const nonce = await provider.getTransactionCount(wallet.address)
  const maxFeePerGas = ethers.utils.formatUnits(feeData.maxFeePerGas, 'gwei')
  const maxPriorityFeePerGas = ethers.utils.formatUnits(
    feeData.maxPriorityFeePerGas,
    'gwei'
  )

  const tx = {
    to,
    nonce,
    maxFeePerGas,
    maxPriorityFeePerGas,
    from: wallet.address,
    value: ethers.utils.parseEther("0"),
  }

  const gasLimit = await provider.estimateGas(tx)
  console.log('Gas: ', gasLimit)

  tx.gasLimit = gasLimit
  return tx
}

async function sendTransaction() {
  const to = '0xf07B2bc7dc938BA39a029187E256b495747bc935'
  const signer = await wallet.connect(provider)

  const feeData = await provider.getFeeData()
  const nonce = await provider.getTransactionCount(wallet.address)

  const tx = {
    nonce,
    from: wallet.address,
    to: to,
    value: ethers.utils.parseEther('0.01'),
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
  }

  const gasLimit = await provider.estimateGas(tx)

  tx.gasLimit = gasLimit

  const transaction = await signer.sendTransaction(tx)

  const hash = await transaction.wait()

  console.log('Hash: ', hash)
}

async function main() {
  await sendTransaction()

  process.exit()
}

main()
