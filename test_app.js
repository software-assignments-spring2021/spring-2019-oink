function addFriend(friend){
	return true;
}

function addGroup(name, group){
	return true;
}

function addBill(bill){
	return true;
}

function addFriendToGroup(friend){
	return true;
}

function createSession(){
	return true;
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

module.exports = {
	addFriend: addFriend,
	addGroup: addGroup,
	addBill: addBill,
	addFriendToGroup: addFriendToGroup,
	createSession: createSession,
	createUser:createUser,
	findUser:findUser
};