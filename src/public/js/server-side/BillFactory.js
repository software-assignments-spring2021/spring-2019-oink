const mongoose = require('mongoose');
const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
const Transaction = mongoose.model("Transaction");

// Returns false only if attempted bill has an integer amount that is
// greater than 0 and each user attached to is taking an integer
// amount of that value. Otherwise, return true to mark error.
function isError(reqBody){
	if(Number.isNaN(parseInt(reqBody.amount))){
		return true;
	}
	if(parseInt(reqBody.amount) == 0)
		return true;
	let total = 0;
	for(let key in reqBody){
		if(reqBody.hasOwnProperty(key)){
			if(key !== "splitWith" && key !== "comment" && key !== 'pretip' && key !== 'tip' &&
					key !== "typeOfPayment" && key !== "amount"){
				if(Number.isNaN(parseInt(reqBody[key])))
					return true;
				else
					total += parseInt(reqBody[key]);
			}
		}
	}

	return false;
}

// Returns false only if at least two members are attached to bill.
// Otherwise, return true to mark an error.
function correctMembersLength(reqBody){
	let count = 0;
	for(let key in reqBody){
		if(reqBody.hasOwnProperty(key)){
			if(key !== "splitWith" && key !== "comment" && key !== 'pretip' && key !== 'tip' &&
					key !== "typeOfPayment" && key !== "amount"){
				count++;
			}
		}
	}
	if(count <= 1)
		return true;
	return false;
}

// Makes sure each user's portion adds up to the correct total stated as the amount of bill.
// Returns false only if all percentages add to 100 or each specific value adds to bill's amount.
// Otherwise, return true to mark an error.
function countTotals(reqBody){
	let total = 0;
	for(let key in reqBody){
		if(reqBody.hasOwnProperty(key)){
			if(key !== "splitWith" && key !== "comment" && key !== 'pretip' && key !== 'tip' &&
					key !== "typeOfPayment" && key !== "amount"){
				if(!Number.isNaN(parseInt(reqBody[key])))
					total += parseInt(reqBody[key]);
			}
		}
	}
	if(reqBody.typeOfPayment == '%'){
		if(total != 100)
			return true;
	}
	else{
		if(total != reqBody.amount)
			return true;
	}
	return false;
}

function viewBill(id, username, cb){
	Bill.findOne({_id: id}, (err, bill)=>{
		if(bill){
			Transaction.find({"bill": id}, (err, transactions) => {
				User.findOne({"username": username}, (err, sessionUser) => {
					const friends = [];
					const nonfriends = [];
					for(let i = 0; i < transactions.length; i++){
						const user = transactions[i].paidBy;
						let isFriend = false;
						for(let j = 0; j < sessionUser.friends.length; j++){
							if(sessionUser.friends[j].user == user){
								isFriend = true;
								friends.push(transactions[i]);
							}
						}

						if(user == sessionUser.username)
							friends.push(transactions[i]);

						else if(!isFriend)
							nonfriends.push(transactions[i]);
					}
					console.log(friends);
					console.log(nonfriends);
					return cb({"amount": bill.amount, "username": bill.splitWith[bill.splitWith.length-1], 
					"date": bill._id.getTimestamp(), "text": bill.comment, "friend-transactions": friends, "non-friend-transactions": 
					nonfriends});
				});
			});
		}
		else{
			console.log(err);
			return cb('error');
		}
	});
}

class BillFactory {
	constructor(body) {
		this.reqBody = body;
	}
	createBill(date, user, friendsToSplit, cb){

		const bill = new Bill({
			amount: this.reqBody.amount,
			splitWith: friendsToSplit,
			comment: this.reqBody.comment,
			dateCreated: date
		});
		let id;
		const reqBody = this.reqBody;
		let isErrorBool = isError(reqBody);
		let correctMembersLengthBool = correctMembersLength(reqBody);
		let countTotalsBool = countTotals(reqBody);
		if(!isErrorBool && !correctMembersLengthBool && !countTotalsBool){
			bill.save((err, addedBill)=>{

				User.findOne({username: user.username}, (err, doc)=>{
					doc.bills.push(mongoose.Types.ObjectId(addedBill._id));
					id = addedBill._id;
					doc.save(function(){
						friendsToSplit = [];
						for(let key in reqBody){
							if(reqBody.hasOwnProperty(key)){
								if(key !== "splitWith" && key !== "comment" && key !== 'pretip' && key !== 'tip' &&
										key !== "typeOfPayment" && key !== "amount"){
									const a = {}
									a.user = key;
									a.amount = reqBody[key];
									friendsToSplit.unshift(a);
								}
							}
						}
						for(let i = 0; i < friendsToSplit.length; i ++){
							let transaction;
							let amount = friendsToSplit[i].amount;
							if (reqBody.typeOfPayment=="%"){
								amount = amount * .01 * reqBody.amount;
							}
							if(i !== friendsToSplit.length-1){
								let isFriends = false;
								for(let j = 0; j < doc.friends.length; j++){
									if(doc.friends[j].user == friendsToSplit[i].user)
										isFriends = true;
								}								
								
								transaction = new Transaction({
									amount:amount,
									paidBy:friendsToSplit[i].user,
									paidTo:friendsToSplit[friendsToSplit.length-1].user,
									isPaid: false,
									bill: id,
									isFriends: isFriends
								});
							}
							else{ // ASSUMES USER CREATING BILL PAYS FOR IT
								transaction = new Transaction({
									amount:amount,
									paidBy:friendsToSplit[i].user,
									paidTo:friendsToSplit[friendsToSplit.length-1].user,
									isPaid: true,
									bill: id,
									isFriends: false
								});
							}

							transaction.save((err, addedTransaction)=>{
								if (err){
									//res.send(err);
									return cb('error');								
								}
								else{
									User.findOne({username: friendsToSplit[i].user}, (err, doc)=>{
										doc.transactions.push(mongoose.Types.ObjectId(addedTransaction._id));
										doc.save();
									});
								}
							});
						}

						// SEE IF ANY USERS ARE FRIENDS OF BILL CREATOR
							// IF YES, UPDATE BALANCES

						for(let i = 0; i < friendsToSplit.length-1; i++){
							const friendName = friendsToSplit[i].user;
							const updateBalance = friendsToSplit[i].amount; // negative of amount to pay

							User.findOne({"username": user.username}, (err, sessionUser) => {
								for(let j = 0; j < sessionUser.friends.length; j++){
									const friend = sessionUser.friends[j];
									if(friend.user == friendName){
										User.findOne({'username': friend.user}, (err, friendUser) => {

											for(let k = 0; k < friendUser.friends.length; k++){
												if(friendUser.friends[k].user == sessionUser.username){
													const newBalance = friendUser.friends[k].balance - updateBalance;
													console.log('test: ' + friendUser.friends[k]);

													User.updateOne({'friends._id': friendUser.friends[k]._id}, {'$set': {
														'friends.$.balance': newBalance
													}}, function(){
														User.findOne({'username': friendUser.username}, (err, tmp) => {
															console.log('test');
															console.log(tmp);
														});
													});											
												}
											}
										});
									}
								}
							});
						}
						//res.redirect(`/bill/view/${id}`);
						return cb(`/bill/view/${id}`);

					});
				});
				
			});
		}
		else{
			if(correctMembersLengthBool){
				//res.redirect('/user/index?error=error1');
				return cb('/user/index?error=error1');
			}
			else if(countTotalsBool){
				//res.redirect('/user/index?error=error2');
				return cb('/user/index?error=error2');
			}
			else if(isErrorBool){
				//res.redirect('/user/index?error=error3');
				return cb('/user/index?error=error3');
			}
		}
	}
}

module.exports = {
	BillFactory: BillFactory,
	isError: isError,
	correctMembersLength: correctMembersLength,
	countTotals: countTotals,
	viewBill: viewBill
}