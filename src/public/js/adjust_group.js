function deleteGroup(id){
	const xml = new XMLHttpRequest();
	xml.open('post', '/group/delete/'+id, true);
	xml.send();
	location.reload();
}

function editGroup(id){
	const input = document.getElementsByClassName("changeable");
	for(let i = 0; i < input.length; i++){
		const button = document.createElement("button");
		button.textContent = "Remove";
		button.onclick = function(){
			const req = new XMLHttpRequest();
			req.open('post', '/group/remove-member', true);
			req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			req.send("member=" + input[i].id + "&group=" + id);
			
			input[i].parentNode.removeChild(input[i]);
		}
		input[i].appendChild(button);
	}

	// add new search-bar to add users
	const div = document.createElement("div");
	div.setAttribute("id", "friendsDropdown");
	const inp = document.createElement("input");
	inp.type = "text";
	inp.placeholder = "Add Another User to Group...";
	inp.setAttribute("id", "searchUser");
	inp.onkeyup = function(){
		searchUserFilter();
	}

	const req = new XMLHttpRequest();
	req.open('post', '/user/members', true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.addEventListener('load', () => {
		div.appendChild(inp);
		const users = JSON.parse(req.responseText);
		for(let i = 0; i < users.length; i++){
			const h4 = document.createElement("h4");
			h4.textContent = users[i].username;
			h4.onclick = function(){
				addNewUserToGroup(users[i].username, id)
			}
			div.appendChild(h4);
		}
		const groupMembers = document.getElementById("groupMembers");
		groupMembers.appendChild(div);
	});
	const users = document.getElementsByClassName("changeableUsers");
	let str = "";
	for(let i = 0; i < users.length; i++)
		str += users[i].value + ",";
	console.log(str.substring(0, str.length-1));
	req.send("usernames=" + str.substring(0, str.length-1));

}

function leaveGroup(username, id){
	
	const req = new XMLHttpRequest();
	req.open('post', '/group/remove-member', true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.send("member=" + username + "&group=" + id);
	location.reload();
}