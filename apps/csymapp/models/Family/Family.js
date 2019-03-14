'use strict'
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))
, validator = require('validator')

module.exports = (sequelize, DataTypes) => {
	const Family = sequelize.define('Family', {
		FamilyId: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		FamilyName:{
			type: DataTypes.STRING(32).BINARY,
			// unique: true,
			// allowNull: false
            validate: {
				isUnique: function (value, next) {
					var self = this;
					// Family.find({where: {FamilyName: value}})
					// 	.then(function (user) {
					// 		if(user){
					// 			return next({family:'Family already exists'});
					// 		}
					// 		else return next();
					// 	})
					// 	.catch(function (err) {
					// 		console.log(err)
					// 		return next(err);
                    // 	});
                    return next();
					}
				}
		},
	},
	{
		hooks: {
			
		}
	})

	Family.isHierarchy();

	Family.associate = function (models) {
	    Family.hasMany(models.FamilyMember, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });

	    Family.hasMany(models.InstalledApp, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });
	    Family.belongsTo(models.Family, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: true
			}
	    });
	}
	return Family;
}
