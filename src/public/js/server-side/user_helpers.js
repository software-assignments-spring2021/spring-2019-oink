const mongoose = require('mongoose');
const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
const Group = mongoose.model("Group");
const Transaction = mongoose.model("Transaction");
const async = require('async');

function inSession(user){
	if(user)
		return true;
	else
		return false;
}

function addUser(req, cb){
	const img = {};
	img.src = '/images/no_profile_picture.png';
	img.contentType = '/image/png';
	img.rawSRC = __dirname + '/../public/images/no_profile_picture.png';
	user = {username: req.body.username, email: req.body.email, 'img': img, 'defaultTip': 20};

	if(user.email != ""){
		User.register(new User(user), req.body.password, function(err, user){
			if(err){
				console.log(err);
				//res.render('registration', {error: err.message});
				return cb({error: err.message});
				// If error, reload page with error message
			}
			else{
				return cb('/user/index');
			}
		});
	}
	else{
		//res.render('registration', {error: "No Email Provided"});
		return cb({error: "No Email Provided"});
	}
}

function getLogin(user){
	if(user)
		return '/user/index';
	else
		return 'Login';
}

function getTransactions(user, cb){
	Transaction.find({"paidBy": user.username}, (err, transactions) => {
		const unpaid = [];
		const paid = [];
		for (let i = 0 ; i < transactions.length; i++){
			if(transactions[i].isPaid === true)
				paid.push(transactions[i]);
			else
				unpaid.unshift(transactions[i]);
		}
		//res.render('my-transactions', {"paid": paid, "unpaid": unpaid});
		return cb({"paid": paid, "unpaid": unpaid});	
	});
}

function payTransaction(id, cb){
	Transaction.findById(id, (err, transaction) => {
		if(transaction){
			transaction.isPaid = true;
			transaction.save();
			console.log("Transaction paid");

			// UPDATE BALANCES
			User.findOne({"username": transaction.paidBy}, (error, user) => {
				for(let i = 0; i < user.friends.length; i++){
					if(user.friends[i].user === transaction.paidTo){
						user.friends[i].balance += transaction.amount;
						user.markModified('friends');
						user.save();
					}
				}
			});
			//res.send("ok");
			return cb('ok');
			
		}
		else{
			console.log(err);
			//res.send("error");
			return cb('error');
		}
	});
}

function getIndex(sessionUser, req, cb){
	User.find({"username": { $ne: sessionUser.username}}, function(err, users, count){
		User.findOne({"username": sessionUser.username}, function(err, user){
			
			const transactionIDs = user.transactions;
			let found = false;
			let notification;

			async.forEach(transactionIDs, function(item, callback){
				Transaction.findById(item, (err, transaction) => {
					if(transaction){
						if(!transaction.isPaid && !found){
							notification = transaction;
							found = true;
						}
					}
					callback();
				});
			}, function(err){
				const groups = [];
				for(let i = 0; i < user.groups.length; i++){
					Group.findById(user.groups[i], (err, group) => {
						if(group)
							groups.push(group);
					});
				}
				if(req.query.error == undefined){
					if(notification !== undefined){
						//res.render('user', {"user": user, "friends": users, "groups": groups, "notification": notification});
						return cb({"user": user, "friends": users, "groups": groups, "notification": notification});
					}
					else{
						//res.render('user', {"user": user, "friends": users, "groups": groups});
						return cb({"user": user, "friends": users, "groups": groups});
					}
				}
				else{
					let error = "Error Processing Bill";
					if(req.query.error == "error1")
						error = "Incorrect Number of Users";
					else if(req.query.error == "error2")
						error = "Bill Portions do not add up to total";

					if(notification !== undefined){
						//res.render('user', {"user": user, "friends": users, "groups": groups, "notification": notification, 'error': error});
						return cb({"user": user, "friends": users, "groups": groups, "notification": notification, 'error': error});
					}
					else{
						//res.render('user', {"user": user, "friends": users, "groups": groups, 'error': error});
						return cb({"user": user, "friends": users, "groups": groups, 'error': error});
					}

				}
			});					
		});
	});
}

function myBills(username, cb){
	User.findOne({"username": username}, (err, user) => {
		if(user){
			const bills = user.bills;

			//in this format so that we can also sort by date
			Bill.find({"_id":{$in:bills}}).exec((err, docs)=>{
				//console.log(docs);
				//res.render("allUserBills", {"bills":docs});
				return cb({"bills":docs});

			});
		}
		else
			return cb('error');
	});
}

function myBalances(user, cb){
	User.findOne({"username": user.username}, (err, sessionUser) => {
		if(sessionUser){
			//res.render('my-balances', {friends: sessionUser.friends});
			return cb({friends: sessionUser.friends});
		}
		else
			return cb('error');
	});
}

function getAllUsers(usernames, cb){
	User.find({username: {$nin: usernames}}, (err, users) => {
		//res.json(users);
		return cb(users);
	});
}

function getUserProfile(req, user, sessionUser, cb){
	User.findOne({"username": user}, (err, foundUser) => {
		if(!foundUser){
			//res.redirect('/user/index');
			return cb('/user/index');
		}

		else{
			//get all groups
			const groups = [];
			const adminGroups = [];
			const allGroups = [];
			Group.find({"_id":{$in:foundUser.groups}}).exec((err, docs)=>{
				if(docs){
					
					docs.forEach((doc)=>{
						allGroups.push(doc);

						if (doc.administrator === sessionUser.username){
							adminGroups.push(doc);
						}
						else{
							groups.push(doc);
						}
					});
				}

			});
			//get all bills
			const allBills = []
			Bill.find({"_id":{$in:foundUser.bills}}).exec((err, docs)=>{
				//console.log(docs);
				docs.forEach((doc)=>{allBills.push(doc)});

			});

			//get all transactions
			const paid = []
			const unpaid = []

			Transaction.find({"_id":{$in:foundUser.transactions}}).exec((err, docs)=>{
				docs.forEach((doc)=>{
					//console.log(doc);
					if (doc.isPaid){
						paid.push(doc);
					}
					else{
						unpaid.push(doc);
					}
				});

			});

			if(user === sessionUser.username){

				return cb(
					{
						"user": foundUser.username, 
						"bills": allBills,
						"paid":paid,
						"unpaid":unpaid,
						"adminGroups":adminGroups, 
						"groups":groups, 
						"friends": foundUser.friends, 
						"image": foundUser.img, 
						"tip": req.query.error == undefined ? foundUser.defaultTip : "Number Needed for Tip"
					}
				)
				
			}

			else{


				let friend = false;
				console.log(sessionUser);

				for(let i = 0; i < sessionUser.friends.length; i++){
					console.log(sessionUser.friends[i].user)
					if(sessionUser.friends[i].user == user)
						friend = true;
				}

				return cb(
					{
						"user": user, 
						"bills":allBills,
						"groups": allGroups, 
						"friends": foundUser.friends, 
						"addFriend": friend,  
						"image": foundUser.img
					}
				)
			}
		}
	});
}

module.exports = {
	inSession: inSession,
	addUser: addUser,
	getLogin: getLogin,
	getTransactions: getTransactions,
	payTransaction: payTransaction,
	getIndex: getIndex,
	myBills: myBills,
	myBalances: myBalances,
	getAllUsers: getAllUsers,
	getUserProfile: getUserProfile
}