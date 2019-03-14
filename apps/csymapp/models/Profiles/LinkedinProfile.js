'use strict'
const Promise = require('bluebird')

module.exports = (sequelize, DataTypes) => {
	const LinkedinProfile = sequelize.define('LinkedinProfile', {
		luid: {
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

	LinkedinProfile.associate = function (models) {
	    LinkedinProfile.hasMany(models.LoginAttempt, {
	    	onDelete: "CASCADE",
	      foreignKey: {
	        allowNull: true
				}
			});
			LinkedinProfile.belongsTo(models.Family, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
				foreignKey: {
					allowNull: true
				}
	    });
	}
	return LinkedinProfile;
}
