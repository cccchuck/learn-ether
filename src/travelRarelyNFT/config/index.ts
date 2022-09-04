import path from 'path'
import dotenv from 'dotenv'
import { ethers } from 'ethers'
import { createContract } from '../utils'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

interface ICommonConfig {
  CID?: string
  endWithJson?: boolean

  MAX: number
  EVENT: string
  value: number
  GATEWAY: string
  address: string
  funcSignature: string
  rarelyProperty: string[]

  Provider: string
  Etherscan_Key: string
  Private_Key: string
}

const { Provider, Etherscan_Key, Private_Key } = process.env

const provider = new ethers.providers.JsonRpcProvider(Provider)

/**
 * 初始化 Config 对象
 */
const initConfig = async <T extends ICommonConfig>(
  baseConfig: T
): Promise<ICommonConfig> => {
  const { address } = baseConfig

  try {
    const contract = await createContract(address, provider)

    if (contract) {
      const IPFSAddress: string = await contract.tokenURI(1)
      const endWithJSON = IPFSAddress.endsWith('.json')
      const CID = IPFSAddress.split('/')[2]
      return { ...baseConfig, CID, endWithJSON }
    } else {
      return baseConfig
    }
  } catch (error) {
    console.log('Get IPFS Address Error: ', error)
    return baseConfig
  }
}

const baseConfig: ICommonConfig = {
  MAX: 2500,
  value: 0,
  GATEWAY: 'https://opensea.mypinata.cloud/ipfs',
  address: '0x28881d1683c6a8Dc6079Ebf3b0E9D414e9cf9150',
  funcSignature: 'publicMint',
  rarelyProperty: [],
  EVENT: 'Transfer',

  Provider: Provider as string,
  Etherscan_Key: Etherscan_Key as string,
  Private_Key: Private_Key as string,
}

const config: ICommonConfig = { ...baseConfig, ...initConfig(baseConfig) }

export default config
