'use strict'
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs')),
phone = require('phone')
, validator = require('validator')


async function hashPin(user, options){
	const SALT_FACTOR = 10
	if(!user.changed('Pin')){
		return
	}

	if(!user.Cpin)
		return Promise.reject({code:1002, msg:{cpin:"Please confirm your pin"}});
	if(user.Cpin)
		if(user.Pin !== user.Cpin)
			return Promise.reject({code:1002, msg:{pin:"Pins don't match",cpin:"Pins don't match"}});
	return bcrypt.genSaltAsync(SALT_FACTOR)
		.then((salt)=>bcrypt.hashAsync(user.dataValues.Pin,salt, null))
		.then(hash=>{
			user.setDataValue('Pin', hash)
		})
}

module.exports = (sequelize, DataTypes) => {
	const TelephoneProfile = sequelize.define('TelephoneProfile', {
		puid: {
			type: DataTypes.INTEGER,
	        autoIncrement: true,
	        primaryKey: true
		},
		TelephoneProfile:{
			type: DataTypes.STRING(15).BINARY,
			unique: true,
			allowNull: false,
            validate: {
				isNotNull: function (value, next){
					if(validator.isEmpty(value))
						return next({phone:'Please provide a phone number'})
					else return next();
				},
                isUnique: function (value, next) {
					var self = this;
                    TelephoneProfile.find({where: {TelephoneProfile: value}})
                        .then(function (user) {
							if(user)
								return next({phone:'Phone number already in use'});
							else return next();
                        })
                        .catch(function (err) {
                            return next(err);
                        });
				},
				isPhone: function (value, next) {
					// if(phone(value).length === 0 )
					if(!phone(value)[0] ) {
						return next({phone:'Please enter a valid phone number'})
					}
					return next();
				}
            }
		},
		Pin: {
			type: DataTypes.STRING, 
			allowNull: false,
            validate: {
            	//  len: {
                //     args: [4, 4],
                //     msg: 'Pin should be 4 characters.'
				// },
				length: (value, next) => {
					if(validator.isEmpty(value))
						return next({pin:'Please provide a pin.'});
					if(!validator.isLength(value, {min:4,max:4}))
						return next({pin:'Pin should be 4 characters.'});
					else return next();
				},
				isNumeric: function (value, next) {
                    var self = this;
					if(!isNaN(value))return next();
					else next({pin:'Please enter a numeric pin'});
                }
            }
		},
		Code: {
			type: DataTypes.STRING, 
			allowNull: true,
		},
		Cpin: {
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
			beforeCreate:hashPin,
			beforeUpdate:hashPin,
			// beforeSave:hashPin
		}

	})

	TelephoneProfile.prototype.comparePin = async function(pin){
		return bcrypt.compareAsync(pin, this.Pin)
	}

	TelephoneProfile.associate = function (models) {
	    TelephoneProfile.hasMany(models.LoginAttempt, {
	    	onDelete: "CASCADE",
	      foreignKey: {
	        allowNull: true
			}
	    });
	}

	
	TelephoneProfile.associate = function (models) {
	    TelephoneProfile.hasMany(models.TelephoneProfileCode, {
	    	onDelete: "CASCADE",
	      foreignKey: {
	        allowNull: true
			}
		});
		TelephoneProfile.belongsTo(models.Family, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: true
			}
	    });
	}
	return TelephoneProfile;
}
