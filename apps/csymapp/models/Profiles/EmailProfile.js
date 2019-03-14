'use strict'
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))
, validator = require('validator')

async function hashPassword(user, options){
	const SALT_FACTOR = 10
	if(!user.changed('Password')){
		return
	}

	if(!user.Cpassword)
		return Promise.reject({code:1002, msg:{cpassword:"Please confirm your password"}});
	if(user.Cpassword)
		if(user.Password !== user.Cpassword)
			return Promise.reject({code:1002, msg:{password:"Passwords don't match", cpassword:"Passwords don't match"}});
	return bcrypt.genSaltAsync(SALT_FACTOR)
		.then((salt)=>bcrypt.hashAsync(user.dataValues.Password,salt, null))
		.then(hash=>{
			user.setDataValue('Password', hash)
		})
}

module.exports = (sequelize, DataTypes) => {
	const EmailProfile = sequelize.define('EmailProfile', {
		emailuid: {
			type: DataTypes.INTEGER,
	        autoIncrement: true,
	        primaryKey: true
		},
		Email:{
			type: DataTypes.STRING(126).BINARY,
			unique: true,
			allowNull: false,
            validate: {
                isUnique: function (value, next) {
                    var self = this;
                    EmailProfile.find({where: {Email: value}})
                        .then(function (user) {
							if(validator.isEmpty(value))
								return next({email:'Please provide an email address'});
							if(!validator.isEmail(value))
								return next({email:'Please provide a valid email'});
							if(!validator.isLength(value, {min:1,max:254}))
								return next({email:'Please enter an email address shorter than 254 characters'});
							if(user)
								return next({email:'Email already in use'});
							else return next();
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                }
            }
		},
		Password: {
			type: DataTypes.STRING, 
			allowNull: false,
            validate: {
            	// isNotNull: {		//deprecated, don't use
	            //      args: true,
	            //      msg: "Please enter a password"
	            // },
            	 len: {
                    args: [6, 32],
                    msg: 'Please make your password at least 6 characters long.'
                }
            }
		},
		Cpassword: {
			type: DataTypes.VIRTUAL
		},
		IsActive: {
			type: DataTypes.BOOLEAN, 
			allowNull: false, 
			defaultValue: false
		},
		ProfilePic: DataTypes.STRING
	},
	{
		hooks: {
			beforeCreate:hashPassword,
			beforeUpdate:hashPassword,
			// beforeSave:hashPassword
		}

	})

	EmailProfile.prototype.comparePass = async function(password){
		return bcrypt.compareAsync(password, this.Password)
	}

	EmailProfile.associate = function (models) {
	    EmailProfile.hasMany(models.LoginAttempt, {
	    	onDelete: "CASCADE",
	      foreignKey: {
	        allowNull: true
			}
		});
		EmailProfile.hasMany(models.EmailProfileCode, {
	    	onDelete: "CASCADE",
	      foreignKey: {
	        allowNull: true
			}
		});
		EmailProfile.belongsTo(models.Family, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: true
			}
	    });
	}
	return EmailProfile;
}
