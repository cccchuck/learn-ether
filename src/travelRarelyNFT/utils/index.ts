import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'
import { ContractInterface, ethers } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const { Etherscan_Key } = process.env

/**
 * 获取函数 ID
 * @param {string} func 函数签名
 * @returns
 */
const getMethodID = (func: string) => {
  const bf = Buffer.from(func)
  return ethers.utils.keccak256(bf).substring(0, 10)
}

/**
 * 获取 mint 的数据
 * @param {string} func 函数签名
 * @param {number} _count mint 的数量
 * @returns
 */
const getData = (func: string, _count: number) => {
  // 获取 Method ID
  const methodID = getMethodID(func)
  // 获取 16 进制数量并补零
  const count = ethers.utils.hexValue(_count).substring(2, 10).padStart(64, '0')
  return methodID + count
}

/**
 * 获取合约 ABI
 * @param address Contract Address
 * @param Etherscan_Key Etherscan API Private Key
 * @returns
 */
const getContractABI = async (address: string) => {
  const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${Etherscan_Key}`

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
 * @param address Contract Address
 * @param provider Ethereum Provider
 */
const createContract = async (
  address: string,
  provider: Provider,
  abi?: ContractInterface
) => {
  if (abi) {
    return new ethers.Contract(address, abi, provider)
  } else {
    try {
      const abi = await getContractABI(address)
      return new ethers.Contract(address, abi, provider)
    } catch (error) {
      console.log('Get Contract ABI Error: ', error)
      throw new Error('Create Contract Failed')
    }
  }
}

export { getContractABI, createContract, getMethodID, getData }
