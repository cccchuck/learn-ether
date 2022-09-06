import { getBaseConfig, getContract } from '../utils'

interface IBaseConfig {
  Provider: string
  Private_Key: string
  Etherscan_Key: string
}

interface IContractConfig {
  CID?: string
  endWithJSON?: boolean

  MAX: number
  EVENT: string
  VALUE: number
  GATEWAY: string
  address: string
  funcSignature: string
  rarelyValue: string[]
}

type IConfig = IBaseConfig & IContractConfig

const baseConfig: IBaseConfig = getBaseConfig()

const contractConfig: IContractConfig = {
  MAX: 2500,
  EVENT: 'Transfer',
  VALUE: 0,
  GATEWAY: 'https://opensea.mypinata.cloud/ipfs',
  address: '0x28881d1683c6a8Dc6079Ebf3b0E9D414e9cf9150',
  funcSignature: 'publicMint',
  rarelyValue: [],
}

const loadContractConfig = async <T extends IContractConfig>(
  contractConfig: T
): Promise<IContractConfig> => {
  const { address } = contractConfig

  try {
    const contract = await getContract(address)
    const IPFSAddress: string = await contract.tokenURI(1)
    const endWithJSON = IPFSAddress.endsWith('.json')
    const CID = IPFSAddress.split('/')[2]
    return { ...contractConfig, CID, endWithJSON }
  } catch (error) {
    console.log('loadContractConfig Error: ', error)
    return contractConfig
  }
}

const getConfig = async (): Promise<IConfig> => {
  const _baseConfig = baseConfig
  const _contractConfig = await loadContractConfig(contractConfig)
  return { ...baseConfig, ..._contractConfig }
}

export { getConfig, IConfig }
