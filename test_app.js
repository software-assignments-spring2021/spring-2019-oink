function addFriend(friend){
	if(friend == null)
		return false;
	return true;
}

function addGroup(name, group){
	if(group == null)
		return false;
	return true;
}

function addBill(amount, bill){
	if(bill == null)
		return false;
	return true;
}

function addFriendToGroup(friend){
	return true;
}

function createSession(){
	var express = require('express');
	var session = require('express-session')

	try {
		var app = express();
		app.use(session({
			//genid: function(req) {
		  	//	const id = genuuid(); // use UUIDs for session IDs
			//},
			secret: 'shhh',
			proxy: true,
			resave: true,
			saveUninitialized: true
		}))
		return true;
	}
	finally {
	}
}


function createUser(userObj){

	let saved;
	let password = userObj.hasOwnProperty("password") ? userObj.password : "";
	let username = userObj.hasOwnProperty("username") ? userObj.username : "";

	if(userObj && password && username){
		
		//add to database
		saved = saveToDatabase("User", userObj);

	}

	else{
		saved = false;
	}

	return saved;
}

function findUser(username){
	if(username){
		//query to the database
		//return a fake user for testing 
		let fakeUser = {username:username, friends:[], groups:[], bills:[]}
		return fakeUser;
	}
	else{
		return false;
	}

}

function saveToDatabase(schemaName, object){

	return true;

}

function splitBillEvenly (bill, number) {
	//var totalCost = parseInt(bill);
	//var n =  parseInt(number);
	//var value = totalCost/n;
	//return 25;
	return bill/number;
}

function splitBillUnevenly (bill, percentage) {
	return (bill*(percentage/100));
	//return 50;
}


module.exports = {
	addFriend: addFriend,
	addGroup: addGroup,
	addBill: addBill,
	addFriendToGroup: addFriendToGroup,
	createSession: createSession,
	createUser:createUser,
	findUser:findUser,
	splitBillEvenly: splitBillEvenly,
	splitBillUnevenly: splitBillUnevenly,
};