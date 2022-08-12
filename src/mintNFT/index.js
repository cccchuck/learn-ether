const path = require('path')
const axios = require('axios').default
const { ethers } = require('ethers')

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

async function createTransaction() {
  const feeData = await provider.getFeeData()
  const nonce = await provider.getTransactionCount(wallet.address)
  const gasPrice = ethers.utils.formatUnits(feeData.gasPrice, 'gwei')
  const maxPricePerGas = ethers.utils.formatUnits(feeData.maxFeePerGas, 'gwei')
  const maxPriorityPerGas = ethers.utils.formatUnits(
    feeData.maxPriorityFeePerGas,
    'gwei'
  )
  return {
    nonce,
    gasPrice,
    maxPricePerGas,
    maxPriorityPerGas,
    gasLimit: ethers.utils.hexlify(100000),
    to: contractAddress,
    value: ethers.utils.parseUnits('0.001'),
  }
}

function sendTransaction() {}

async function main() {
  const contractABI = await getContractABI(contractAddress)

  if (contractABI.length) {
    contract = createContract(contractAddress, contractABI, wallet)
    console.log('Signer: ', contract.signer)
  }

  process.exit()
}

// main()

// console.log(wallet)

// async function foo() {
//   wallet = wallet.connect(provider)
//   console.log('Balance: ', await wallet.getBalance())
//   console.log('ChainID: ', await wallet.getChainId())
//   console.log('FeeData: ', await wallet.getFeeData())
//   console.log('GasPrice: ', await wallet.getGasPrice())
//   console.log('TransactionCount: ', await wallet.getTransactionCount())
// }

// foo()

// createTransaction().then((tx) => {
//   console.log(tx)
// })

console.log(ethers.utils.arrayify(ethers.utils.toUtf8CodePoints('mint')))
