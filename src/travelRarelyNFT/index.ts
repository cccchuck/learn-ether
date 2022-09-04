import axios from 'axios'
import { ethers } from 'ethers'
import config from './config/index'
import { createContract, getData } from './utils'

// 创建 provider
const provider = new ethers.providers.JsonRpcProvider(config.Provider)

const wallet = new ethers.Wallet(config.Private_Key, provider)

/**
 * 遍历当前 ID 及之后所有包含稀有属性的 NFT
 * @param tokenID 当前 mint 的 ID
 * @returns
 */
const travelRarelyNFT = async (tokenID: number): Promise<number[]> => {
  const { GATEWAY, CID, MAX, rarelyProperty, endWithJson } = config

  const rarelyID: number[] = []

  for (let i = tokenID; i <= MAX; i++) {
    try {
      let url: string = `${GATEWAY}/${CID}/${i}${endWithJson ? '.json' : ''}`

      let resp = await axios.get(url)

      if (resp.status === 200) {
        const attributes = resp.data['attribute']

        for (const attribute of attributes) {
          const { value } = attribute
          if (value in rarelyProperty) rarelyID.push(i)
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
    value: ethers.utils.parseEther(config.value * count * 1e18 + ''),
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

;(async function () {
  let rarelyID = await travelRarelyNFT(1)
  console.log('Rarely ID List: ', rarelyID)
  const contract = await createContract(config.address, provider)

  console.log(`开始监听 ${config.EVENT} 事件`)
  contract.on(config.EVENT, (from, to, _tokenID) => {
    const tokenID = parseInt(_tokenID)
    console.log(`⚠️ TokenID: ${tokenID} 已被 Mint`, tokenID)
    console.log('\n------------------------\n')

    // 过滤要 Mint 的 ID 列表
    rarelyID = rarelyID.filter((e) => e >= tokenID)

    if (rarelyID[0] === tokenID + 1) {
      // Mint 操作
      mintNFT()
    }
  })
})()
