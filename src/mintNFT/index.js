const path = require('path')
const axios = require('axios').default
const { ethers } = require('ethers')

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const { Provider, Etherscan_Key, Private_Key } = process.env

// 创建 Provider
const provider = new ethers.providers.JsonRpcProvider(Provider)

let wallet = new ethers.Wallet(Private_Key)

/**
 * 获取函数 ID
 * @param {string} func 函数签名
 * @returns
 */
function getMethodID(func) {
  const bf = Buffer.from(func)
  return ethers.utils.keccak256(bf).substring(0, 10)
}

/**
 * 获取 mint 的数据
 * @param {string} func 函数签名
 * @param {number} count mint 的数量
 * @returns
 */
function getData(func, count) {
  // 获取 Method ID
  const methodID = getMethodID(func)
  // 获取 16 进制数量并补零
  count = ethers.utils.hexValue(count).substring(2, 10).padStart(64, '0')
  return methodID + count
}

/**
 * 获取 Etherscan 接口的 URL
 * @param {string} address 合约地址
 * @returns
 */
function getEtherScanUrl(address) {
  return `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${Etherscan_Key}`
}

/**
 * 获取合约 ABI
 * @param {string} address 合约地址
 * @returns
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
 * @returns
 */
function createContract(address, ABI, providerOrSigner) {
  return new ethers.Contract(address, ABI, providerOrSigner)
}

/**
 * 创建交易
 * @param {string} to 接受地址
 * @param {string} value ETH 数量
 * @param {string} data 其他数据
 * @returns
 */
async function createTransaction({ to, value, data = null, _tx = {} }) {
  const feeData = await provider.getFeeData()
  const nonce = await provider.getTransactionCount(wallet.address)

  let tx = {
    nonce,
    data,
    from: wallet.address,
    to: to,
    value: ethers.utils.parseEther(value),
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
  }

  // 合并某些参数，如 gasLimit
  tx = Object.assign(tx, _tx)

  if (!tx.gasLimit) tx.gasLimit = await provider.estimateGas(tx)

  return tx
}

async function sendTransaction({ to, value, data = null, _tx = {} }) {
  const signer = await wallet.connect(provider)

  console.log(
    `开始创建交易\n目标地址: ${to} \n交易价值: ${value}\n交易数据: ${data}\n`
  )
  const tx = await createTransaction({ to, value, data, _tx })

  console.log('创建交易成功，开始准备发送交易')
  const transaction = await signer.sendTransaction(tx)

  console.log('交易发送成功，正在等待交易确认')
  const hash = await transaction.wait()

  console.log('交易确认成功，交易信息如下: ')
  console.log(`交易哈希: ${hash.transactionHash}`)
  console.log(`确认区块: ${hash.blockNumber}`)
  console.log(`燃料消费: ${parseInt(hash.gasUsed)}`)
}

async function contractAction(contractAddress) {
  // contractAddress = '0xDFC552E7a3Fb2641A0c39cdBf92b7044B0f5bB40'
  const signer = await wallet.connect(provider)
  const contractABI = await getContractABI(contractAddress)
  const contract = await createContract(contractAddress, contractABI, signer)
  console.log('Contract: ', contract)
  await contract.mint(2)

  process.exit()
}

async function main() {
  /**
   * Usage:
   * 1. 无需传入 Data
   * 直接调用 sendTransaction，传入 to 和 value 即可
   * 2. 需要传入 Data
   * 调用 sendTransaction，提前准备好 data 并传入
   *
   * tip: 预留了 _tx 参数，可以用来合并某些参数，如 gasLimit
   */

  // 1. 无需传入 Data
  // sendTransaction({
  //   to: '0xf07B2bc7dc938BA39a029187E256b495747bc935',
  //   value: '0.02',
  // })

  // 2. 需要传入 Data
  const data = getData('mint(uint8)', 5)
  const _tx = {
    gasLimit: ethers.BigNumber.from('150000'),
  }
  sendTransaction({
    to: '0xDFC552E7a3Fb2641A0c39cdBf92b7044B0f5bB40',
    value: '0',
    data,
    _tx,
  })
}

main()
