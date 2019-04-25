function onClickAddUserToGroup(){
  // clear user search bar
  const input = document.getElementById("searchUser");
  const username = input.value;
  input.textContent = "";
  // add username to list of Friends to add to a bill

  const div = document.getElementById("members");

  const userDiv = document.createElement("div");
  userDiv.setAttribute("id", username + "Block");

  const ul = div.childNodes[2];

  const li = document.createElement("li");
  li.textContent = username;

  const txt = username + ',';
  const splitWith = document.getElementById("splitWith");
  splitWith.value += txt;

  const button = document.createElement("button");
  button.textContent = "Remove";
  li.appendChild(button);
  userDiv.appendChild(li);
  ul.appendChild(userDiv);

  button.onclick = function(){
    while(userDiv.firstChild)
      userDiv.removeChild(userDiv.firstChild);
    const users = splitWith.value.split(',');
    console.log(users);
    let newString = "";
    for(let i = 0; i < users.length; i++){
      if(users[i] != username && users[i] != '')
        newString += users[i] + ',';
    }
    splitWith.value = newString;
  }
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