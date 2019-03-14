'use strict'
const Promise = require('bluebird')

module.exports = (sequelize, DataTypes) => {
	const FacebookProfile = sequelize.define('FacebookProfile', {
		fbuid: {
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

	FacebookProfile.associate = function (models) {
	    FacebookProfile.hasMany(models.LoginAttempt, {
	    	onDelete: "CASCADE",
	      foreignKey: {
	        allowNull: true
				}
			});
			FacebookProfile.belongsTo(models.Family, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
				foreignKey: {
					allowNull: true
				}
	    });
	}
	return FacebookProfile;
}
