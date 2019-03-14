'use strict'
const Promise = require('bluebird')

module.exports = (sequelize, DataTypes) => {
	const GoogleProfile = sequelize.define('GoogleProfile', {
		guid: {
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

	GoogleProfile.associate = function (models) {
	    GoogleProfile.hasMany(models.LoginAttempt, {
	    	onDelete: "CASCADE",
	      foreignKey: {
	        allowNull: true
				}
			});
			GoogleProfile.belongsTo(models.Family, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
				foreignKey: {
					allowNull: true
				}
	    });
	}

	return GoogleProfile;
}
