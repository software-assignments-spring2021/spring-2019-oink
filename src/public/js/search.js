function searchUserFilter() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("searchUser");
  filter = input.value.toUpperCase();
  div = document.getElementsByClassName("friends")[0];
  h4 = div.getElementsByTagName("h4");
  for (i = 0; i < h4.length; i++) {
    txtValue = h4[i].textContent || h4[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      h4[i].style.display = "";
    } else {
      h4[i].style.display = "none";
    }
  }
}

function searchGroupFilter() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("searchGroup");
  filter = input.value.toUpperCase();
  div = document.getElementsByClassName("groups")[0];
  h4 = div.getElementsByTagName("h4");
  for (i = 0; i < h4.length; i++) {
    txtValue = h4[i].textContent || h4[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      h4[i].style.display = "";
    } else {
      h4[i].style.display = "none";
    }
  }
}

function onClickUsername(username){
  const input = document.getElementById("searchUser");
  input.value = username;
}

function showDropDown(){
  const friends = document.getElementsByClassName("friends");
  for(let i = 0; i < friends.length; i++){
    friends[i].removeAttribute("hidden");
  }
}
