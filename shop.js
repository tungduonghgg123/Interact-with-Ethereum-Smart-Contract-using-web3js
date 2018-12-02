var util = require('./web3Util');
var web3 = util.initWeb3();
const coinContractGanacheAddress = "0xA0Cb19E36c1A8dC4F0E33A185F76aF0e4De9C48b"; //deploy locally  through ganache
var contract = util.initContract(web3, "./Coin.json", coinContractGanacheAddress);
var privateKey = "0x" + "7e66b3cbc31579d076fa9cac7c7e787bac940392ac89fc0d4ff08fd6da5beefd"; // contract owner's private key

var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};
// contract owner call this function
var earnMorePoint = (_pointID, _amount, ownerPrivateKey, contract) => {
    return new Promise((resolve, reject) => {
        util.executeSendMethod(contract.methods.earnMorePoint(_pointID, _amount), ownerPrivateKey, contract)
            .then((result) => {
                resolve("success, transaction hash: " + result.transactionHash);


            }, (error) => {
                reject("error to earn more point");
                //just log "error"
            })
    })

}
//shop call this function
var shopTransferPoint = (to, pointID, amount, shopPrivateKey, contract) => {
    return new Promise((resolve, reject) => {
        util.executeSendMethod(contract.methods.shopTransferPoint(to, pointID, amount), shopPrivateKey, contract)
            .then((result) => {
                console.log("ok");
                resolve("transfer success");
            }, (error) => {
                console.log("not ok");
                reject("Can not transfer");

            })
    })

}
shopTransferPoint("0x2e550c6b93DEdE04ab49D186f8802a3c58f083D8","1","100","0x2b5b6b205a7b2b748dcf0cc7cca0ce43016dd202ebacfb27d9567e62a07d769d", contract)
.then((result) => {
    console.log(result);
}, (error) => {
    console.log("error:", error);
});
// contract owner call this function
var genNewPoint = (_shopAddress, _pointName, _pointSymbol, _pointDecimals, _initialSupply, ownerPrivateKey, contract) => {
    return new Promise((resolve, reject) => {
        util.executeSendMethod(
            contract.methods.createPoint(_shopAddress, _pointName, _pointSymbol, _pointDecimals, _initialSupply),
            ownerPrivateKey,
            contract)
            .then((result) => {

                resolve("generate success");
            }, (error) => {
                reject("Can not generate new point");

            })
    })

}

var shopToPoint = (shopAdr, contract) => {
    return new Promise((resolve, reject) => {
        contract.methods.shopToPoint(shopAdr).call().then((result) => {
            var pointInfo = {
                name: result.name,
                symbol: result.symbol,
                decimals: result.decimals,
                totalSupply: result.totalSupply,
                currentAmount: result.currentAmount,
                pointID: result.pointID

            }
            resolve(pointInfo)

        }, (error) => {
            reject("Can not find point of this shop");
        })
    })



}




// module.exports = {
//     createPoint,
//     shopToPoint,
//     earnMorePoint
// }
