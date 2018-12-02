var util = require('./web3Util');
var web3 = util.initWeb3();
const coinContractGanacheAddress = "0xA0Cb19E36c1A8dC4F0E33A185F76aF0e4De9C48b"; //deploy locally  through ganache
var contract = util.initContract(web3, "./Coin.json", coinContractGanacheAddress);
var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};
//customer to specific point id
var customerToPoint = (address, pointId) => {
    return new Promise((resolve, reject) => {
        contract.methods.customerToPoint(address, pointId).call().then((result) => {
            resolve(result);
        }, (error) => {
            reject(`can't find customer to point ${error}`);
        })
    })

}

// handle promises
var recursion = (address, result, count) => {
    return new Promise((resolve, reject) => {
        count = parseInt(count);
        if (count === -1) {
            
            resolve(result)
        }
        if (typeof count !== typeof 2) {
            reject(`error type of count, count must be a number ${error}`)
        } else {
            customerToPoint(address, count).then((pointInfo) => {
                if (pointInfo.currentAmount !== '0') {
                    var pointIf = {
                        pointID: pointInfo.pointID,
                        name: pointInfo.name,
                        symbol: pointInfo.symbol,
                        currentAmount: pointInfo.currentAmount,
                    }
                    result.push(pointIf);
                }
                return recursion(address, result, count - 1).then((result) => {
                    resolve(result);
                }, (error) => {
                    reject(`recursion error! ${error}`);
                });
            });
        }
})

}
// customer's wallet, return a Promise with result = array of point info || = [] if empty
var customerWallet = (address, contract) => {
    return new Promise((resolve, reject) => {
        contract.methods.pointCount().call().then((count) => {
            recursion(address, [], count).then((result) => {
                resolve(result);
            }, (error) => {
                reject(`error: ${error}`);
            });
        })
    })

}


// contract owner call this, require private key
var expiredTrading = (publisher, pointPublisherID, pointPublisherAmount, privateKey, contract) => {
    return new Promise((resolve, reject) => {
        util.executeSendMethod(contract.methods.expiredTrading(publisher, pointPublisherID, pointPublisherAmount),privateKey, contract)
        .then((result) => {
            //save parameters + transaction hash => database for later uses.
            resolve(`success, give money back to publisher`)
        }, (error) => {
            reject(`can not pay money back to publisher ${error}`);
        })
    })
}

//----------------------------------------------------//
// front - end
//----------------------------------------------------//

// <1> customer calling this, require private key
var customerSendPointTrading = (publisher, pointPublisherID, pointTraderID, pointPublisherAmount, pointTraderAmount, privateKey, contract) => {
    return new Promise((resolve, reject) => {
        util.executeSendMethod(contract.methods.customerSendPointTrading(publisher, pointPublisherID, pointTraderID, pointPublisherAmount, pointTraderAmount),
        privateKey, contract).then((result) => {
            //save parameters + transaction hash => database for later uses.
            resolve(`success, transaction hash:  ${result.transactionHash}`)
        }, (error) => {
            reject(`can not publish this point ${error}`);
        })
    })
}

// <2> trader calling this, require private key
var traderApproveTrading = (trader, publisher, pointPublisherID, pointTraderID, pointPublisherAmount, pointTraderAmount, privateKey, contract) => {
    return new Promise((resolve, reject) => {
        util.executeSendMethod(contract.methods.traderApproveTrading(trader, publisher, pointPublisherID, pointTraderID, pointPublisherAmount, pointTraderAmount),privateKey, contract)
        .then((result) => {
            //save parameters + transaction hash => database for later uses.
            resolve(result.transactionHash)
        }, (error) => {
            reject(`can not trade this point ${error}`);
        })
    })
}
// <3> customer calling this, require private key. 
var customerTransferPointToCustomer = (to, pointID, pointsTransfer, privateKey, contract) => {
    return new Promise((resolve, reject) => {
        util.executeSendMethod(contract.methods.customerTransferPointToCustomer(to, pointID, pointsTransfer), privateKey, contract)
            .then((result) => {
                resolve(result)
            }, (error) => {
                reject(error);
            })
    })
}
// <4> customer calling this, require private key. 
var customerTransferPointToShop = (to, pointID, pointsTransfer, privateKey, contract) => {
    return new Promise((resolve, reject) => {
        util.executeSendMethod(contract.methods.customerTransferPointToCustomer(to, pointID, pointsTransfer), privateKey, contract)
            .then((result) => {
                resolve(result)
            }, (error) => {
                reject(error);
            })
    })
}


