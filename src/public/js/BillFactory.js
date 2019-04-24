const mongoose = require('mongoose');
const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
const Transaction = mongoose.model("Transaction");

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
}

class BillFactory {
	constructor(body) {
		this.reqBody = body;
	}
	createBill(date, user, amount, friendsToSplit, comment, res){

		const bill = new Bill({
			amount: amount,
			splitWith: friendsToSplit,
			comment: comment,
			dateCreated: date
		});
		let id;
		const reqBody = this.reqBody;
		let isErrorBool = isError(reqBody);
		let correctMembersLengthBool = correctMembersLength(reqBody);
		let countTotalsBool = countTotals(reqBody);
		if(!isErrorBool && !correctMembersLengthBool && !countTotalsBool){
			bill.save((err, addedBill)=>{
				if (err){
					res.send(err);
				}
				else{
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
										res.send(err);								
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
							res.redirect(`/bill/view/${id}`);

						});
					});
				}
			});
		}
		else{
			if(correctMembersLengthBool)
				res.redirect('/user/index?error=error1');
			else if(countTotalsBool)
				res.redirect('/user/index?error=error2');
			else if(isErrorBool)
				res.redirect('/user/index?error=error3');
		}
	}
}

module.exports = {
	BillFactory: BillFactory
}