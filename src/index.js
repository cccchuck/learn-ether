const path = require('path')
const { ethers } = require('ethers')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const provider = new ethers.providers.JsonRpcProvider(process.env.Provider)

async function accountMethodsCollection() {
  // Account Methods
  // ==========================
  // 1. 获取指定区块高度的账户余额，默认区块高度为最新区块高度
  console.log(
    'Balance: ',
    await provider.getBalance('0x4c7f1f1354b03fd1ace3f549977f8e848ec430e4')
  )

  // 2. 获取指定区块高度的地址合约代码，默认区块高度为最新区块高度
  console.log('Code: ', await provider.getCode('registrar.firefly.eth'))

  // 3. 获取指定区块高度的地址 Storage 的 bytes 数据，默认区块高度为最新区块高度
  console.log(
    'Storage: ',
    await provider.getStorageAt('registrar.firefly.eth', 0)
  )

  // 4. 获取指定区块高度的地址交易笔数
  console.log(
    'Transaction count: ',
    await provider.getTransactionCount(
      '0x4c7f1f1354b03fd1ace3f549977f8e848ec430e4'
    )
  )
}

async function blockMethodsCollection() {
  // Block Methods
  // ==========================
  // 1. 获取指定区块的信息，该方法返回结果中的 transactions 是该区块 transaction hash 的合集
  console.log('Block: ', await provider.getBlock(100004))

  // 2. 获取指定区块的信息，该方法返回结果中的 transactions 是该区块 transaction 的详细信息的合集
  console.log('Detail Block: ', await provider.getBlockWithTransactions(100004))
}

async function ENSMethodsCollection() {
  // ENS(Ethereum Naming Service) Methods
  // ==========================
  // 1. 获取 ENS 关联的 avatar 的 URL
  console.log('Avatar URL: ', await provider.getAvatar('eth0000.eth'))

  // 2. 获取 ENS 域名
  console.log(
    'ENS: ',
    await provider.lookupAddress('0x4c7f1f1354b03fd1ace3f549977f8e848ec430e4')
  )

  // 3. 获取 Ethereum 地址
  console.log('Ethereum', await provider.resolveName('eth0000.eth'))
}

async function networkMethodsCollection() {
  // network Methods
  // ==========================
  // 1. 获取当前 provider 连接的 network
  console.log('Network: ', await provider.getNetwork())

  // 2. 获取当前区块
  console.log('Block Number: ', await provider.getBlockNumber())

  // 3. 获取 GasPrice
  const gasPrice = await provider.getGasPrice()
  console.log('Gas Price: ', ethers.utils.formatUnits(gasPrice, 'gwei'))

  // 4. 获取 FeeData
  const feeData = await provider.getFeeData()
  console.log('Gas Price: ', ethers.utils.formatUnits(feeData.gasPrice, 'gwei'))
  console.log(
    'Max Fee Per Gas: ',
    ethers.utils.formatUnits(feeData.maxFeePerGas, 'gwei')
  )
  console.log(
    'Max Priority Fee Per Gas: ',
    ethers.utils.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')
  )

  // 5. 获取 network 状态，可以用于挂起脚本直到 network 平稳运行
  console.log('Ready: ', await provider.ready)
}

async function transactionMethodsCollection() {
  // transaction Methods
  // ==========================
  // 1. 返回本次交易执行的结果，适用于调用合约 getter 的方法
  console.log(
    'Result: ',
    await provider.call({
      // ENS public resolver address
      to: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',

      // `function addr(namehash("ricmoo.eth")) view returns (address)`
      data: '0x3b3b57debf074faa138b72c65adbdcfb329847e4f2c04bde7f7dd7fcad5a52d2f395a558',
    })
  )

  // 2. 预估本次交易的 Gas，仅供参考，不一定准确
  console.log(
    'Estimate Gas: ',
    await provider.estimateGas({
      // Wrapped ETH address
      to: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',

      // `function deposit() payable`
      data: '0xd0e30db0',

      // 1 ether
      value: ethers.utils.parseEther('1.0'),
    })
  )

  // 3. 获取指定 hash 的 Transaction
  console.log(
    'Transaction: ',
    await provider.getTransaction(
      '0x5b73e239c55d790e3c9c3bbb84092652db01bb8dbf49ccc9e4a318470419d9a0'
    )
  )

  // 4. 获取指定 hash 的 TransactionReceipt
  console.log(
    'Receipt: ',
    await provider.getTransactionReceipt(
      '0x5b73e239c55d790e3c9c3bbb84092652db01bb8dbf49ccc9e4a318470419d9a0'
    )
  )

  // 5. 发送交易
  // const signedTx =
  //   "0xf8690401825208945555763613a12d8f3e73be831dff8598089d3dca882b992b75cbeb600080820a95a01727bd07080a5d3586422edad86805918e9772adda231d51c32870a1f1cabffba07afc6be528befb79b9ed250356f6eacd63e853685091e9a3987a3d266c6cb26a";
  // await provider.sendTransaction(signedTx);
}

// accountMethodsCollection();
// blockMethodsCollection();
// ENSMethodsCollection();
// networkMethodsCollection()
// transactionMethodsCollection();

;(async function () {
  const signer = new ethers.Wallet(process.env.Private_Key, provider)
  console.log('Address: ', signer.address)
  // console.log("Balance: ", await signer.getBalance());
  // console.log("ChainID: ", await signer.getChainId());
})()
