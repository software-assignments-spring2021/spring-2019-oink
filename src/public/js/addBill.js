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

function appendChildren(parent, ...children){
  //NOT WORKING
    for (let child in children){
      parent.appendChild(child);
    }

    //console.log(parent);

    return parent;
}

function addUserToBill(username, defaultPercentage){

   /*

    <div class="userBlock">
          <h4>{{ user.username }}</h4>
          <span class="dollar">$</span>
          <input type="text" name='{{ user.username }}' class="transactionValue" value="0" placeholder="0">
          <span class="percent hidden">%</span>
      </div>
    */

  const parentDiv = document.querySelector("#userAmounts");

  const spanDollar = createElement("span", {"class":"dollar"}, "$");
  const spanPercent = createElement("span", {"class": "percent hidden"}, "%");
  const userh4 = createElement("h4", {}, username);
  const input = createElement("input", {"type":"text", "name":username, "class":"transactionValue", "value":defaultPercentage ? defaultPercentage : "0", "placeholder": "0"});

  const profilePic = createElement("img", {"width":"16px", "height":"16px"});
  const xml = new XMLHttpRequest();
  xml.open('post', '/api/image', true);
  xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xml.addEventListener('load', () => {
      profilePic.src = xml.responseText;
  });
  xml.send("username="+username); 

  const outerDiv = createElement("div", {"id":`${username}Block`, "class":"userBlock"});

  outerDiv.appendChild(profilePic);
  outerDiv.appendChild(userh4);
  outerDiv.appendChild(spanDollar);
  outerDiv.appendChild(input);
  outerDiv.appendChild(spanPercent);
  //console.log(outerDiv);


  // DETERMINE WHETHER USER IS A FRIEND

  let friends = false;
  const req = new XMLHttpRequest();
  req.open('post', '/api/is-friend', true);
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.addEventListener('load', () => {
    if(req.responseText !== 'friends'){


      const addFriendButton = createElement("button", {"id": "addFriend", "type":"button"}, "Add Friend");
      addFriendButton.addEventListener("click", function(){
        handleAddFriend(username);
        addFriendButton.style.display = "none";
        addFriendButton.disabled = true;
      });

      outerDiv.appendChild(addFriendButton);

    }

  });
  req.send("username="+username);

  // CREATE DELETE BUTTON TO REMOVE USER FROM BILL BEFORE ITS CREATED
  const delButton = createElement("button", {"id":"deleteUser", "type":"button"}, "Remove");

  delButton.addEventListener("click", function(){
    const users = splitWith.value.split(',');
      let newString = "";
      for(let i = 0; i < users.length; i++){
        if(users[i] != username && users[i] != '')
          newString += users[i] + ',';
      }
      splitWith.value = newString;
      parentDiv.removeChild(outerDiv);

  });

  outerDiv.insertBefore(delButton, profilePic);

  //add the username to the split with field
  document.querySelector("#splitWith").value += `${username},`

  parentDiv.appendChild(outerDiv);

  //console.log(parentDiv);

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
  // clear current users
  const users = document.getElementById('users');
  while(users.firstChild){
    users.removeChild(users.firstChild);
  }
  const typeOfPayment = document.getElementById("typeOfPayment");
  typeOfPayment.value = "%";
  // then add members of the group, including session user
  const group = JSON.parse(req.responseText);
  for(let i = 0; i < group.inGroup.length; i++){
    const username = group.inGroup[i];
    addUserToBill(username, group.defaultPercentages[i]);
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

function switchSymbol(sym){
  //unhide the equivalent symbol

  const opposite = sym == "dollar" ? "percent" : "dollar"

  document.querySelectorAll(`div.userBlock span.${sym}`).forEach((span)=>{
    console.log(span);
    span.classList.remove("hidden");
  });

  document.querySelectorAll(`div.userBlock span.${opposite}`).forEach((span)=>{
    span.classList.add("hidden");
  });


}




//setInterval(checkValuesWithSum, 30);
