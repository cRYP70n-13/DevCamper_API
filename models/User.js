const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'please add a name']
	},
	email: {
		type: String,
		required: [true, 'please add an email'],
		unique: true,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			'Please add a valid email'
		]
	},
	role: {
		type: String,
		enum: ['user', 'publisher'],
		default: 'user'
	},
	password: {
		type: String,
		required: [true, 'please add a password'],
		minlength: 6,
		select: false // And this one is used where we wanna return a user in the front end we dont select the password
	},
	resetPasswordToken: String,
	resetPasswordExpire: String,
	createdAd: {
		type: Date,
		default: Date.now
	}
});

// Encrypt The damn pass using bcrypt
// This method runs before the save of our objects in the database
UserSchema.pre('save', async function (next) {

	if (!this.isModified('password')) {
		next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE
	});
}

// Match passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
}

// Get the reset password token
UserSchema.methods.getResetPasswordToken = function() {
	// Generate and hash password token to reset the forgotten password    
	const resetPasswordToken = crypto.randomBytes(20).toString('hex');

	// hash the token and set to resetpasswordField
	this.resetPasswordToken = crypto.createHash('sha256').update(resetPasswordToken).digest('hex');

	// Set the expire date
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

	return resetPasswordToken;
}

module.exports = mongoose.model('User', UserSchema);