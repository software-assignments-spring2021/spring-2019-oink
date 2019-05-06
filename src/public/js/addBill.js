
function onClickAddUserToBill(){
  // clear user search bar
  const input = document.getElementById("searchUser");
  const username = input.value;
  input.textContent = "";
  // add username to list of Friends to add to a bill
  addUserToBill(username);
} 

function removeUserFromSelectList(username){
  //remove the name from the full list so it can't be added twice
  if(document.querySelector(`h4#${username}`))
    document.querySelector(`h4#${username}`).remove();
}

function addUserToSelectList(username){
  const userHeader = createElement("h4", {"id": username}, username);
  userHeader.onclick = function(){
    addUserToBill(username, 0);
  }
  document.querySelector("#select-friends div.friends").appendChild(userHeader);
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

function addUserToBill(username, defaultPercentage, isSessionUser){

   /*
    <div class="userBlock">
          <h4>{{ user.username }}</h4>
          <span class="dollar">$</span>
          <input type="text" name='{{ user.username }}' class="transactionValue" value="0" placeholder="0">
          <span class="percent hidden">%</span>
      </div>
    */

  const parentDiv = document.querySelector("#userAmounts");

  let spanDollar;
  let spanPercent;

  if(!document.querySelector('div.userBlock') || document.querySelector('div.userBlock span.percent').classList.contains("hidden")){
      spanDollar = createElement("span", {"class":"dollar"}, "$");
      spanPercent = createElement("span", {"class": "percent hidden"}, "%");
  }
  else{
      spanDollar = createElement("span", {"class":"dollar hidden"}, "$");
      spanPercent = createElement("span", {"class": "percent"}, "%");
  }

  const userh4 = createElement("h4", {}, username);
  const input = createElement("input", {"type":"text", "name":username, "class":"transactionValue", "value":defaultPercentage ? defaultPercentage : "0", "placeholder": "0"});

  const profilePicDiv = createElement("div", {"class": "small-profile-pic"});
  const profilePic = createElement("img", {});

  removeUserFromSelectList(username);

  const xml = new XMLHttpRequest();
  xml.open('post', '/api/image', true);
  xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xml.addEventListener('load', () => {
      profilePic.src = xml.responseText;
  });
  xml.send("username="+username); 

  profilePicDiv.appendChild(profilePic);

  const outerDiv = createElement("div", {"id":`${username}Block`, "class":"userBlock"});

  outerDiv.appendChild(profilePicDiv);
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


      const addFriendButton = createElement("button", {"id": "add-friend", "type":"button"}, " Add Friend");
      const plusSign = createElement("i", {"class": "fas fa-plus"});
      addFriendButton.insertBefore(plusSign, addFriendButton.childNodes[0]);
      console.log(addFriendButton);

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
  if(!isSessionUser){
    const delButton = createElement("button", {"id":"deleteUser", "type":"button"}, " Remove");
    const minusSign = createElement("i", {"class": "fas fa-minus"});
    delButton.insertBefore(minusSign, delButton.childNodes[0]);

    delButton.addEventListener("click", function(){
        addUserToSelectList(username);
        const users = splitWith.value.split(',');
        let newString = "";
        for(let i = 0; i < users.length; i++){
          if(users[i] != username && users[i] != '')
            newString += users[i] + ',';
        }
        splitWith.value = newString;
        parentDiv.removeChild(outerDiv);
    });

    outerDiv.insertBefore(delButton, profilePicDiv);
  }

  //add the username to the split with field
  if(!isSessionUser)
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
  const userBlocks = document.querySelectorAll("div.userBlock");
  for(let i=0; i < userBlocks.length; i++){
    userBlocks[i].remove();
  }

  document.querySelector("#splitWith").value = "";

  const group = JSON.parse(req.responseText);
  console.log(group.inGroup);
  for(let i = 0; i < group.inGroup.length; i++){
    //const username = group.inGroup[i];
    if(user != group.inGroup[i])
      addUserToBill(group.inGroup[i], 0, false);
    else
      addUserToBill(group.inGroup[i], 0, true);
  }
  //switchSymbol('percent');
}

function onClickAddGroup(id, user){
  const req = new XMLHttpRequest();
  console.log(user);
  req.open('get', '/group/get/' + id, true);
  req.addEventListener('load', () => {handleAddGroup(req, user);});
  req.send();
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
    console.log('test2');
    span.classList.remove("hidden");
  });

  document.querySelectorAll(`div.userBlock span.${opposite}`).forEach((span)=>{
    console.log('test3'); 
    span.classList.add("hidden");
  });


}