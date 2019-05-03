function createElement(elementType, attributes, text){
  const elem = document.createElement(elementType);

  for (let key in attributes){
    if (attributes.hasOwnProperty(key)) {
      elem.setAttribute(key, attributes[key])
    }
  }


  if (text){
    elem.appendChild(document.createTextNode(text));
  }

  //console.log(elem);

  return elem;


}

function removeUserFromSelectList(username){
  //remove the name from the full list so it can't be added twice
  document.querySelector(`h4#${username}`).remove();

}

function addUserToSelectList(username, id){
  const userHeader = createElement("h4", {"id": username}, username);
  userHeader.onclick = function(){
    addNewUserToGroup(username, id);
  }
  document.querySelector("#select-friends div.friends").appendChild(userHeader);
}


function deleteGroup(id){
	const xml = new XMLHttpRequest();
	xml.open('post', '/group/delete/'+id, true);
	xml.send();
	location.reload();
}

function editGroup(id){

	document.querySelector("#editButton").classList.add("hidden");
	document.querySelector("#doneButton").classList.remove("hidden");

	const input = document.getElementsByClassName("changeable");

	
	for(let i = 0; i < input.length; i++){
		const minusSign = createElement("i", {"class":"fas fa-minus"});
		const removeButton = createElement("button", {"id":"removeUser"}, " Remove");
		removeButton.insertBefore(minusSign, removeButton.childNodes[0]);

		removeButton.onclick = function(){
			addUserToSelectList(input[i].id, id);
			const req = new XMLHttpRequest();
			req.open('post', '/group/remove-member', true);
			req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			req.send("member=" + input[i].id + "&group=" + id);
			
			input[i].parentNode.removeChild(input[i]);

			const friendsDiv = document.getElementsByClassName("friends")[0];
			setSearchUsers(friendsDiv);
		}

		input[i].appendChild(removeButton);
	}

	const chooseUsers = createElement("div", {"class":"choose-users"});
	const selectFriends = createElement("div", {"id":"select-friends"});
	const h3 = createElement("h3", {}, "Add A Friend");
	const friendsDiv = createElement("div", {"class": "friends"});
	const searchBar = createElement("input", {"type":"text", "placeholder":"Add another user to the group...", "id":"searchUser", "onkeyup": "searchUserFilter()"});
	friendsDiv.appendChild(searchBar);

	
	const req = new XMLHttpRequest();
	req.open('post', '/user/members', true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.addEventListener('load', () => {
		//div.appendChild(inp);
		const users = JSON.parse(req.responseText);
		for(let i = 0; i < users.length; i++){
			const h4 = createElement("h4", {"id":users[i].username},users[i].username);
			// const h4 = document.createElement("h4");
			// h4.textContent = users[i].username;
			h4.onclick = function(){
				addNewUserToGroup(users[i].username, id)
			}
			friendsDiv.appendChild(h4);
		}
		
	});



	const users = document.getElementsByClassName("changeableUser");
	let str = "";
	for(let i = 0; i < users.length; i++){
		str += users[i].firstChild.nodeValue + ",";
	}
	req.send("usernames=" + str.substring(0, str.length-1));


	selectFriends.appendChild(h3);
	selectFriends.appendChild(friendsDiv);

	chooseUsers.appendChild(selectFriends);

	document.getElementById("groupMembers").appendChild(chooseUsers);

}

function leaveGroup(username, id){
	
	const req = new XMLHttpRequest();
	req.open('post', '/group/remove-member', true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.send("member=" + username + "&group=" + id);
	location.reload();
}


function finishEdit(id){
	//remove all the "remove buttons"

	const removeButtons = document.querySelectorAll("#removeUser");
	for (let i = 0; i< removeButtons.length; i++){
		removeButtons[i].remove();
	}
	

	//remove the friends list
	document.querySelector(".choose-users").remove();

	document.querySelector("#editButton").classList.remove("hidden");
	document.querySelector("#doneButton").classList.add("hidden");

}	