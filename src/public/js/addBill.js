function onClickAddUserToBill(){
  // clear user search bar
  const input = document.getElementById("searchUser");
  const username = input.value;
  input.textContent = "";
  // add username to list of Friends to add to a bill
  addUserToBill(username);
} 

function removeUser(username){
  
  const div = document.getElementById(username + "Block");

  div.parentNode.removeChild(div);
  const splitWith = document.getElementById('splitWith');
  const users = splitWith.split(',');
  let newString = "";
  for(let i = 0; i < user.length; i++){
    if(user[i] != username)
      newString += user[i] + ',';
  }
  splitWith.value = newString;
}

function addUserToBill(username){
    const div = document.createElement("div");
    div.setAttribute("id", username + "Block");
    div.className = "userBlock";
    const parentDiv = document.getElementById("userAmounts");

    const usernameField = document.createTextNode(username); // CREATE / APPEND USERNAME
    div.appendChild(usernameField);

    const valueText = document.createElement("input"); // CREATE / APPEND TEXT FIELD
    valueText.type = "text";
    valueText.value = 0;
    valueText.name = username;
    valueText.placeholder = "$0.00";
    valueText.setAttribute("class", "transactionValue");
    div.appendChild(valueText);

    // DETERMINE WHETHER USER IS A FRIEND

    let friends = false;
    const req = new XMLHttpRequest();
    req.open('post', '/api/is-friend', true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.addEventListener('load', () => {
      if(req.responseText === 'friends')
        friends = true;

      //IF NOT FRIENDS, INCLUDE "ADD FRIEND" BUTTON
      if(!friends){
        const addFriend = document.createElement("button");
        addFriend.innerHTML = "Add Friend";
        addFriend.setAttribute("id", "addFriend");
        addFriend.type = "button";
        div.appendChild(addFriend);
      }
    });
    req.send("username="+username);

    // CREATE DELETE BUTTON TO REMOVE USER FROM BILL BEFORE ITS CREATED

    const delButton = document.createElement("button");
    delButton.innerHTML = "Remove";
    delButton.setAttribute("id", "deleteUser");
    delButton.type = "button";

    div.appendChild(delButton);

    const br = document.createElement("br");
    div.appendChild(br);

    parentDiv.appendChild(div);

    const txt = username + ',';
    const splitWith = document.getElementById("splitWith");
    splitWith.value += txt;

    const addFriend2 = document.getElementById("addFriend");
    if(addFriend2){
        const friend = addFriend2.parentElement.textContent.split("Add Friend")[0];
        addFriend2.addEventListener("click", function(){
          handleAddFriend(friend);
          addFriend2.style.visibility = "hidden";
          addFriend2.disabled = true;
        });
    }

    delButton.onclick = function() {
      const users = splitWith.value.split(',');
      let newString = "";
      for(let i = 0; i < users.length; i++){
        if(users[i] != username && users[i] != '')
          newString += users[i] + ',';
      }
      splitWith.value = newString;
      div.parentNode.removeChild(div);
    }

}

function calculateTip(){
  const pretip = document.getElementById("pretip");
  const tip = document.getElementById("tip");
  const total = document.getElementById("amount");

  total.value = (pretip.value * ((tip.value * .01) + 1)).toFixed(2);
}

function noTip() {
  const tip = document.getElementById("tip");
  tip.value = 0;

  calculateTip();
}

function handleAddFriend(friend){
  const req = new XMLHttpRequest();
  req.open('post', '/api/add-friend/', true);
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.send("username="+friend);
}

function handleAddGroup(req, user){
  const group = JSON.parse(req.responseText);
  for(let i = 0; i < group.inGroup.length; i++){
    const username = group.inGroup[i];
    if(username !== user){
      addUserToBill(username);
    }
  }
}

function onClickAddGroup(id, user){
  const req = new XMLHttpRequest();
  console.log(user);
  req.open('get', '/group/' + id, true);
  req.addEventListener('load', () => {handleAddGroup(req, user);});
  req.send();
}

function checkValuesWithSum(){
  
  const vals = document.getElementsByClassName("transactionValue");
  const sum = parseInt(document.getElementById("amount").value);
  let inc = 0;
  for(let i = 0; i < vals.length; i++){
    inc += parseInt(vals[i].value);
  }
  const addBill = document.getElementById("addBillButton");
  if(inc !== sum || sum === 0){
    addBill.disabled = true;
  }
  if(inc === sum && sum !== 0){
    addBill.disabled = false;
  }

}

function onClickSplitType(icon) {

const symbol = document.getElementById("typeOfPayment");
symbol.value = icon;

}




//setInterval(checkValuesWithSum, 30);
