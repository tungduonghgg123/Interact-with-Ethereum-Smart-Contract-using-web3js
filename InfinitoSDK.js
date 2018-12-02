const { Wallet, CoinType, EthWallet, BchWallet, InfinitoApi, NeoWallet } = require('node-infinito-wallet');
const apiConfig = {
    apiKey: '0dda8e7f-a7b3-445b-80a0-f5ca66339081',
    secret: 'B9JoneDZJdxdEWp2mVXq2qYC9ZWubEYRz6vloHEtUAp1gbyJiXdWvF8Z9bTaCTyo',
    baseUrl: 'https://staging-api-testnet.infinitowallet.io',
    logLevel: 'NONE'
};
const api = new InfinitoApi(apiConfig);
const coinAPI = api.ETH; // instance to interact with API

var genWallet = (privateKey) => {
    const walletConfig = {
        coinType: CoinType.ETH.symbol,  // change for case ETH
        isTestNet: true,
        privateKey: privateKey
    }
    return new EthWallet(walletConfig);
}
var wallet = genWallet('0xF54CD0EA34CD780CEE510BF4DB7DE53DCB83FA8AB49F12736ECCDA190DF85D55')
wallet.setApi(api); //wallet with specific private key

let txParams = {};
txParams.sc = {};
txParams.sc.contractAddress = "0x4729063D74275894231C1467AdCc6FC43392bA84";

txParams.gasLimit = 330946;
var shopTransferPoint = () => {
    txParams.sc.nameFunc = 'shopTransferPoint';
    txParams.sc.typeParams = ['address', 'uint', 'uint'];
    txParams.sc.paramsFuncs = ['0x32dA8eED08D6ae33167b9afb58fae1fCAE1eb1F2', 0, 69];
    console.log(txParams);
}
var createPoint = (_shopAddress, _pointName, _pointSymbol, _pointDecimals, _initialSupply, ownerPrivateKey) => {
    txParams.sc.nameFunc = 'createPoint';
    txParams.sc.typeParams = ['address', 'uint', 'uint'];
    txParams.sc.paramsFuncs = ['0x32dA8eED08D6ae33167b9afb58fae1fCAE1eb1F2', 0, 69];
    console.log(txParams);
}
shopTransferPoint();
createPoint();
async function executeT() {
    let rawTx = await wallet.createRawTx(txParams);
    let result = await wallet.send({
        rawTx: rawTx,
        isBroadCast: true
    });
    return Promise.resolve(result);
}
// executeT().then((result) => {
//     console.log("hihi");
//     console.log(result);
// })


// -- call method
// const data = "0xf8690b850218711a0083050cc2944729063d74275894231c1467adcc6fc43392ba848084ca5610e91ba05434dc36b9a9c67214da80bbfd7ed2ee3d21a39fa2c39165194b4cf3cb3495e7a054d0f6d6d7af1296d1bd02ee2867646677025a57c665087b641abfa80469dde1";
// coinAPI.sendTransaction(data).then((result) => {
//     console.log(result);
// })