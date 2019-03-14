const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const TransactionSchema = new Schema({
	//will be referenced by the bill
	amount:{type: Number, required:true},
	paidBy:{type:String, required:true}, //the person that needs to pay that portion of the bill
	isPaid:{type:Boolean},
	bill:{type: Schema.Types.ObjectId, ref:"Bill"}
});

const BillSchema = new Schema({
	//will be referenced by the user
	amount:{type:Number, required:true},

	//list of users including user that added the bill, 
	//if the two involved will be working on a payback, this will be only two users
	splitWith:[{type:String, required:true}],

	//if the bill is not being split and is added to two users running totals
	
	//if the owner or the person in "splitWith" is paying the full bill on a payback system, this will be true
	// the transactions will just be the full amount to whoever is paying
	notSplit:{type:Boolean, required:false},

	//only matters if not split is true
	paidBy:{type:String, required: false} 

});

const GroupSchema = new Schema({

	name:{type:String, required:true},
	inGroup:[String] //will be usernames

});

const UserSchema = new Schema({
	username:{type: String, unique:true, required:true, index:true},
	email:{type:String, unique:true, index:true},
	password:{type:String},
	groups:[GroupSchema],
	bills:[{type: Schema.Types.ObjectId, ref:"Bill"}],
	transactions:[{type:Schema.Types.ObjectId, ref:"Transaction"}],
	friends:[String]

});

const FriendSchema = new Schema({
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	balance: Number
});

//Plug-Ins
UserSchema.plugin(passportLocalMongoose);

//Models
mongoose.model('Bill', BillSchema);
mongoose.model('Transaction', TransactionSchema);
mongoose.model('Group', GroupSchema);
mongoose.model('User', UserSchema);
mongoose.model('Friend', FriendSchema);


mongoose.connect('mongodb://localhost/oink_dev');