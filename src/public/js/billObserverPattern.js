const mongoose = require('mongoose');
const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
const Transaction = mongoose.model("Transaction");

class billObserverPattern { /* the friendswhosplit (the observers) will recieve a notification of 
                            when a bill (the subject that is observed) is created */
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
				else{ //BILL IS SUCEESSFULLY CREATED
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
							for(let i = 0; i < friendsToSplit.length; i ++){ //THE OBSERVERS RECIEVE NOTIFACTION OF THE TRANSACTION OF THE BILL
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
							res.redirect(`/bill/view/${id}`);

						});
					});
				}
			});
		}
	
	}
}

module.exports = {
	billObserverPattern: billObserverPattern
}