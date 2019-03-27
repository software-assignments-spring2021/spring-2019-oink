const mongoose = require('mongoose');
require('../../schemas');
const User = mongoose.model("User");
const Group = mongoose.model("Group");

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