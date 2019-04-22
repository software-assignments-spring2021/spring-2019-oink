function searchUserFilter() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("search");
  filter = input.value.toUpperCase();
  div = document.getElementById("usersDropdown");
  a = div.getElementsByTagName("a");
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

function showMainDropDown(){
  const friends = document.getElementsByClassName("users");
  for(let i = 0; i < friends.length; i++){
    friends[i].removeAttribute("hidden");
  }
}

function contains(element, target){
  if(target.id == 'search')
    return true;
  var node = target.parentNode;
  while (node != null) {
       if (node == element) {
           return true;
       }
       node = node.parentNode;
   }
   return false;
}

function hideOnClickOutside(element) {
    const outsideClickListener = event => {
        if (!contains(element, event.target)) { // or use: event.target.closest(selector) === null
          element.style.display = 'none'
          //removeClickListener()
        }
        else{
          element.style.display = "inline";
        }
    }

    const removeClickListener = () => {
        document.removeEventListener('click', outsideClickListener)
    }

    document.addEventListener('click', outsideClickListener)
}

const a = document.getElementsByClassName("users");
for(let i = 0 ; i < a.length; i++)
  hideOnClickOutside(a[i]);
//const dropdown = document.getElementById('usersDropdown');
//hideOnClickOutside(dropdown);


function openSearch(){
  document.querySelector(".search-bar #search").style.width = "100%";
  document.querySelector(".search-bar #search").placeholder = "Search..."

}