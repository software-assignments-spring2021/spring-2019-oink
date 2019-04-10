function searchUserFilter() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("searchUser");
  filter = input.value.toUpperCase();
  div = document.getElementById("friendsDropdown");
  a = div.getElementsByTagName("a");
  console.log(a);
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

function onClickUsername(username){
  const input = document.getElementById("searchUser");
  input.value = username;
}

function searchUser(username){
  
}