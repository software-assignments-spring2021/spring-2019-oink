function onClickAddUserToGroup(){
  // clear user search bar
  const input = document.getElementById("searchUser");
  const username = input.value;
  input.textContent = "";
  // add username to list of Friends to add to a bill
  

  const div = document.getElementById("members");
  const ul = div.childNodes[2];

  const li = document.createElement("li");
  li.textContent = username;
  ul.appendChild(li);

  const txt = username + ',';
  const splitWith = document.getElementById("splitWith");
  splitWith.value += txt;

} 