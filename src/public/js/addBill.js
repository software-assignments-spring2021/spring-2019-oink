function onClickAddUserToBill(){
  // clear user search bar
  const input = document.getElementById("searchUser");
  const username = input.value;
  input.textContent = "";
  // add username to list of Friends to add to a bill
  

  const div = document.createElement("div");
  div.className = "userBlock";
  const parentDiv = document.getElementById("userAmounts");

  const usernameField = document.createTextNode(username); // CREATE / APPEND USERNAME
  div.appendChild(usernameField);

  const valueText = document.createElement("input"); // CREATE / APPEND TEXT FIELD
  valueText.type = "text";
  valueText.name = username;
  valueText.placeholder = "$0.00";
  div.appendChild(valueText);

  const addFriend = document.createElement("button");
  addFriend.innerHTML = "Add Friend";
  addFriend.setAttribute("id", "addFriend");
  addFriend.type = "button";
  div.appendChild(addFriend);

  const br = document.createElement("br");
  div.appendChild(br);

  parentDiv.appendChild(div);

  const txt = username + ',';
  const splitWith = document.getElementById("splitWith");
  splitWith.value += txt;

  const addFriend2 = document.getElementById("addFriend");
  const friend = addFriend2.parentElement.textContent.split("Add Friend")[0];
  addFriend2.addEventListener("click", function(){
    handleAddFriend(friend);
  });
} 

function calculateTip(){
  const pretip = document.getElementById("pretip");
  const tip = document.getElementById("tip");
  const total = document.getElementById("amount");

  total.value = pretip.value * ((tip.value * .01) + 1);
}

function noTip() {
  const tip = document.getElementById("tip");
  tip.value = 0;
}

function handleAddFriend(friend){
  const req = new XMLHttpRequest();
  req.open('post', '/api/add-friend/', true);
  req.send("username="+friend);
}