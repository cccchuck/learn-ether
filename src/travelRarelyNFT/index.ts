import axios from 'axios'
import path from 'path'
import { ethers } from 'ethers'
import dotenv from 'dotenv'
import IERC721 from './IERC721.json'

interface ICommonConfig {
  CID: string
  MAX: number
  GATEWAY: string
  address: string
  funcSignature: string
  rarelyProperty: string[]

  Provider: string
  Etherscan_Key: string
  Private_Key: string
}

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const { Provider, Etherscan_Key, Private_Key } = process.env

const config: ICommonConfig = {
  CID: 'QmNhKs1EvYUSUvxp4pNgi22cptYWHNzSkazJEoPqbErLkR',
  MAX: 2500,
  GATEWAY: 'https://opensea.mypinata.cloud/ipfs',
  address: '0x28881d1683c6a8Dc6079Ebf3b0E9D414e9cf9150',
  funcSignature: 'publicMint',
  rarelyProperty: [],

  Provider: Provider as string,
  Etherscan_Key: Etherscan_Key as string,
  Private_Key: Private_Key as string,
}

const provider = new ethers.providers.JsonRpcProvider(Provider)

const contract = new ethers.Contract(config.address, IERC721)

/**
 * 获取 NFT Image URL
 * @param data IPFS 返回的 NFT JSON 数据
 * @returns
 */
const getImageUrl = <T extends { image: string }>(data: T): string => {
  const { GATEWAY } = config
  let image = data.image
  return `${GATEWAY}/${image.split('//').pop()}`
}

/**
 * 遍历当前 ID 及之后所有包含稀有属性的 NFT
 * @param tokenID 当前 mint 的 ID
 * @returns
 */
const travelRarelyNFT = async (tokenID: number): Promise<number[]> => {
  const { GATEWAY, CID, MAX, rarelyProperty } = config

  const rarelyID: number[] = []

  for (let i = tokenID; i <= MAX; i++) {
    try {
      let url: string = `${GATEWAY}/${CID}/${i}`

      let resp = await axios.get(url)

      if (resp.status === 200) {
        const attribute = resp.data['attribute']

        // 找到稀有属性的 NFT ID
        if (attribute in rarelyProperty) rarelyID.push(i)
      }
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  return rarelyID
}

travelRarelyNFT(1)
