
//for the front end call to add a friend to the users profile
//add this function to any button that is for adding a friend
//and pass the username of the friend through the function
function addFriend(username){

	const req = new XMLHttpRequest();
	req.open('POST', '/api/add-friend');
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

	req.addEventListener('load', ()=>{
		if(req.responseText === "added"){
			console.log("friend added");
		}
		else{
			console.log("friend not added");
		}
	});

	req.send(`username=${username}`);


}