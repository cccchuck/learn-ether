import axios from 'axios'

import { ethers } from 'ethers'
import { getConfig, IConfig } from './config/index'
import { getContract, getData, getProvider, getWallet } from './utils'

// 创建 provider
const provider = getProvider()

// 创建 wallet
const wallet = getWallet()

let config: IConfig

/**
 * 遍历当前 ID 及之后所有包含稀有属性的 NFT
 * @param tokenID 当前 mint 的 ID
 * @returns
 */
const travelRarelyNFT = async (tokenID: number): Promise<number[]> => {
  const { GATEWAY, CID, MAX, rarelyValue, endWithJSON } = config

  const rarelyID: number[] = []

  for (let i = tokenID; i <= MAX; i++) {
    try {
      let url: string = `${GATEWAY}/${CID}/${i}${endWithJSON ? '.json' : ''}`
      let resp = await axios.get(url)

      if (resp.status === 200) {
        const attributes = resp.data['attribute']

        for (const attribute of attributes) {
          const { value } = attribute
          if (value in rarelyValue) rarelyID.push(i)
        }
      }
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  return rarelyID
}

const createTrasaction = async (funcSignature: string, count: number) => {
  const data = getData(funcSignature, count)
  const feeData = await provider.getFeeData()
  const nonce = await provider.getTransactionCount(wallet.address)

  let _tx = {
    nonce,
    data,
    from: wallet.address,
    to: config.address,
    value: ethers.utils.parseEther(config.VALUE * count * 1e18 + ''),
    maxFeePerGas: feeData.maxFeePerGas as ethers.BigNumber,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas as ethers.BigNumber,
  }

  let tx = {
    ..._tx,
    gasLimit: await provider.estimateGas(_tx),
  }

  return tx
}

const sendTrasaction = async () => {
  console.log('开始创建交易')
  const tx = await createTrasaction(config.funcSignature, 1)

  console.log('创建交易成功，准备发送交易')
  const transaction = await wallet.sendTransaction(tx)

  console.log('交易发送成功，正在等待确认')
  const hash = await transaction.wait()

  console.log('交易确认成功，交易信息如下: ')
  console.log(`交易哈希: ${hash.transactionHash}`)
  console.log(`确认区块: ${hash.blockNumber}`)
  console.log(`燃料消费: ${hash.gasUsed.toNumber()}`)
}

const mintNFT = async () => {
  await sendTrasaction()
}

const listen = async (rarelyID: number[]) => {
  const contract = await getContract(config.address)

  console.log(`开始监听 ${config.EVENT} 事件`)
  contract.on(config.EVENT, (from, to, tokenID) => {
    const _tokenID = parseInt(tokenID)
    console.log(`⚠️ TokenID: ${_tokenID} 已被 Mint \n`)

    // 过滤要 Mint 的 ID 列表
    rarelyID = rarelyID.filter((e) => e >= _tokenID)

    // Mint 操作
    if (rarelyID[0] === _tokenID + 1) {
      mintNFT()
    }
  })
}

;(async function () {
  // 加载配置文件
  config = await getConfig()

  // 获取稀有 NFT ID
  let rarelyID = await travelRarelyNFT(1)
  console.log('Rarely ID List: ', rarelyID)

  // 监听并 Mint
  await listen(rarelyID)
})()
