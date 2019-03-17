const mongoose = require('mongoose');
require('../../schemas');
const User = mongoose.model("User");
const Group = mongoose.model("Group");

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

function onClickUserDropdown(username){
  // clear user search bar
  const input = document.getElementById("searchUser");
  input.textContent = "";
  // add username to list of Friends to add to a bill
  const txt = username + ',';
  const splitWith = document.getElementById("splitWith");
  splitWith.value += txt;
} 

function addFriend(username, cb){
  if(username == null)
    return false;

  User.findOne({'username': username}, function(err, user, count){
    if(user != null){
      return cb(true);
    }
    else{
      return cb(false);
    }
  });
}

function addGroup(name, cb){
  if(name == null){
    return false;
  }
  Group.findOne({'name': name}, function(err, group, count){
    if(group != null){
      return cb(false);
    }
    else{
      return cb(true);
    }
  });

}

module.exports = {
  addFriend: addFriend,
  addGroup: addGroup
}