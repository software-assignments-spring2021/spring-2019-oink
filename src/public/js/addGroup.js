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

function addUserToSelectList(username){
  document.querySelector("#select-friends div.friends").appendChild(createElement("h4", {"id": username}, username));
}


function addUserToGroup(username){

  /*
  <div class="userBlock">
      <div class="small-profile-pic"><img src="../images/no_profile_picture.png" /></div>
      <h4>Jessica</h4>
  </div>

  */
  removeUserFromSelectList(username);
  document.getElementById("splitWith").value += username + ",";
  // clear user search bar
  document.getElementById("searchUser").value = "";


  

  const members = document.querySelector("#groupUsers");


  const userDiv = createElement("div", {"class": "userBlock", "id": `${username}Block`});
  const userH4 = createElement("h4", {}, username);
  const minusSign = createElement("i", {"class":"fas fa-minus"});
  const removeButton = createElement("button", {}, " Remove");
  console.log(removeButton)

  removeButton.insertBefore(minusSign, removeButton.childNodes[0]);



  const profilePicDiv = createElement("div", {"class": "small-profile-pic"});
  const profilePic = createElement("img", {});


  const xml = new XMLHttpRequest();
  xml.open('post', '/api/image', true);
  xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xml.addEventListener('load', () => {
      profilePic.src = xml.responseText;
  });
  xml.send("username="+username); 

  profilePicDiv.appendChild(profilePic);


  removeButton.onclick = function(){
    //remove the div
    document.querySelector(`#${username}Block`)
    //remove from the split with list
    const users = splitWith.value.split(',');
    //console.log(users);
    let newString = "";
    for(let i = 0; i < users.length; i++){
      if(users[i] != username && users[i] != '')
        newString += users[i] + ',';
    }
    splitWith.value = newString;
    //add back to the list
    addUserToSelectList(username);
  }

  userDiv.appendChild(profilePicDiv);
  userDiv.appendChild(userH4);
  userDiv.appendChild(removeButton);

  members.appendChild(userDiv);


} 


function addNewUserToGroup(username, id){
  const div = document.createElement("div");
  div.class = "changeable";
  div.setAttribute("id", username);
  const input = document.createElement("input");
  input.type = "text";
  input.class = "changeableUsers";
  input.value = username;
  input.readonly = true;

  div.appendChild(input);

  const req = new XMLHttpRequest();
  req.open('post', '/group/add-member', true);
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.addEventListener('load', () => {
    const button = document.createElement("button");
    button.textContent = "Remove";
    button.onclick = function(){
      const req = new XMLHttpRequest();
      req.open('post', '/group/remove-member', true);
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      req.send("member=" + username + "&group=" + id);
      
      div.parentNode.removeChild(div);
    }
    div.appendChild(button);

    const groupMembers = document.getElementById("groupMembers");
    groupMembers.appendChild(div);
  });
  req.send("member=" + username + "&group=" + id);
}