const mongoose = require('mongoose');
const User = mongoose.model("User");
const Transaction = mongoose.model("Transaction");
const Bill = mongoose.model("Bill");
const Friend = mongoose.model("Friend");
const async = require('async');

function addFriend(username, sessionUser, cb){
	const newFriend = new Friend({
		user: username,
		balance: 0.00
	});
	const secondFriend = new Friend({
		user: sessionUser.username,
		balance: 0.00
	});

	
	User.findOne({"username": sessionUser.username},(err, doc)=>{
		if(doc){
			doc.friends.push(newFriend);
			sessionUser.friends.push(newFriend);
			doc.save((err,saved)=>{
				if(err){
					console.log(err);
					return cb(false);
				}
				else{
					//add the friend so it's immediatly accessible
					console.log(doc)
					//req.session.user.friends.push(newFriend);
					User.findOne({"username": username},(err, user)=>{
						user.friends.push(secondFriend);
						
						user.save();
						//console.log(sessionUser);
						return cb(true);
					});
				}
			});
		}
		else
			return cb(false);
	});
}

function isFriend(username, user, cb){
	User.findOne({"username": user.username}, (err, sessionUser) => {
		if(sessionUser){
			let friends = false;
			for(let i = 0;i < sessionUser.friends.length; i++){

				if(sessionUser.friends[i].user == username)
					friends = true;
			}
			if(friends){
				return cb(true);
			}
			else if(username == user.username)
				return cb(true);
			else{
				return cb(false);
			}
		}
		else
			return cb(false);
	});
}

function getImage(username, cb){
	User.findOne({"username": username}, (err, user) => {
		if(user){
			return cb(user.img.src);
		}
		else{
			return cb("error");
		}
	});
}

function getHistory(username, sessionUser, cb){
	Transaction.find({}, (err, transactions) => {
		const response = {};
		const relTransactions = [];
		const dates = [];
		for(let i = 0; i < transactions.length; i++){
			if(transactions[i].paidBy == sessionUser.username && transactions[i].paidTo == username ||
				transactions[i].paidBy == username && transactions[i].paidTo == sessionUser.username){

				if(transactions[i].isFriends == true)
					relTransactions.push(transactions[i]);
			}	
		}
		async.forEach(relTransactions, function(item, cb){
			Bill.findById(item.bill, (err, bill) => {
				dates.push(bill.dateCreated);
				cb();
			});
		}, function(err){
			User.findOne({"username": sessionUser.username}, (err, user) => {
				if(user){
					for(let i = 0; i < user.friends.length; i++){
						if(user.friends[i].user == username){
							response.balance = user.friends[i].balance;
						}
					}
					User.findOne({"username": username}, (err, otherUser) => {
						if(otherUser){
							for(let i = 0; i < otherUser.friends.length; i++){
								if(otherUser.friends[i].user == sessionUser.username){
									response.balance -= otherUser.friends[i].balance;
								}
							}
							response.transactions = relTransactions;
							response.dates = dates;
							return cb(response);
						}
						else
							return cb(undefined);
					});
				}
				else
					return cb(undefined);
			});
		});
	});
}

function removeTransaction(id, cb){
	Transaction.findById(id, (err, transaction) => {
		if(transaction){
			const user = transaction.paidBy;
			User.findOne({"username": user}, (err, foundUser) => {
				for(let i = 0;i < foundUser.friends.length; i++){
					if(foundUser.friends[i].user == transaction.paidTo){
						const newBalance = foundUser.friends[i].balance += transaction.amount;
						User.updateOne({'friends._id': foundUser.friends[i]._id}, {'$set': {
								'friends.$.balance': newBalance
							}}, function(){
								Transaction.deleteOne({_id: id}, (err) => {
									if(err){
										return cb('error');
									}
									else
										return cb('document removed');
								});
						});
					}
				}
			});
		}
		else
			return cb('error');
	});
}

function changeTip(tip, user, cb){
	if(!Number.isNaN(parseInt(tip)) && parseInt(tip) >= 0){
		User.findOne({"username": user}, (err, foundUser) => {
			foundUser.defaultTip = parseInt(tip);
			foundUser.save(function(err, doc){
				return cb('Tip Changed');
			});
			//res.send('Tip Changed');
		});
	}
	else{
		//res.redirect('/user/'+req.session.user.username + "?error=error");
		//res.send("Error");
		return cb("Error");
	}
}

module.exports["addFriend"] = addFriend;
module.exports["isFriend"] = isFriend;
module.exports["getImage"] = getImage;
module.exports['getHistory'] = getHistory;
module.exports['removeTransaction'] = removeTransaction;
module.exports['changeTip'] = changeTip;

module.exports = {
	addFriend: addFriend,
	isFriend: isFriend,
	getImage: getImage,
	getHistory: getHistory,
	removeTransaction: removeTransaction,
	changeTip: changeTip
}

