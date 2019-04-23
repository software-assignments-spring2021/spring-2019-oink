const mongoose = require('mongoose');
const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
const Friend = mongoose.model("Friend");
const Transaction = mongoose.model("Transaction");

class transactionsIterator {
    // class methods
    constructor(transactionIDs) {
        transactionIDs = transactionIDs;
    }

    hasNext(index){
        if (transactionIDs[index + 1] != undefined)
             return true;
        return false;
    }

    next(index) {
        return transactionIDs[index + 1];
    }
}

module.exports = {
    transactionsIterator: transactionsIterator
}