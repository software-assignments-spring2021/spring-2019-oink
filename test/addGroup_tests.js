const chai = require('chai');
const expect = chai.expect; 
//const api = require("../src/public/js/addGroup.js");

const mongoose = require('mongoose');
require('../src/schemas');
const User = mongoose.model("User");
const Group = mongoose.model("Group");
/*
describe('Add Group Tests', function(){

    describe('onClickAddUserToGroup', function(){

        it('returns true if user search bar is cleared'), function(){
            const input = document.getElementById("searchUser").value;
            
        }

        it('returns true ')


    })


})*/

