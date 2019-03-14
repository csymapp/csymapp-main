'use strict'
const Promise = require('bluebird')

module.exports = (sequelize, DataTypes) => {
	const TwitterProfile = sequelize.define('TwitterProfile', {
		tuid: {
			type: DataTypes.STRING(126),
			primaryKey: true
		},
		token: DataTypes.STRING,
		Name: DataTypes.STRING,
		Email: DataTypes.STRING,
		ProfilePic: DataTypes.STRING,
		IsActive: {
			type: DataTypes.BOOLEAN, 
			allowNull: false, 
			defaultValue: false
		},
	},
	{
		hooks: {
			// 
		}
	})

	TwitterProfile.associate = function (models) {
	    TwitterProfile.hasMany(models.LoginAttempt, {
	    	onDelete: "CASCADE",
	      foreignKey: {
	        allowNull: true
				}
			});
			TwitterProfile.belongsTo(models.Family, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
				foreignKey: {
					allowNull: true
				}
	    });
	}
	return TwitterProfile;
}
