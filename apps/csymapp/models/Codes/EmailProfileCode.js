'use strict'

module.exports = (sequelize, DataTypes) => {
	const EmailProfileCode = sequelize.define('EmailProfileCode', {
		EmailProfileCodeId: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		Code: {
			type: DataTypes.STRING(12).BINARY,
			allowNull: false
		},
		Sent: {
			type: DataTypes.BOOLEAN, 
			allowNull: false, 
			defaultValue: false
		},
		Type: {
			type: DataTypes.ENUM('Reset', 'Activate'),
			allowNull: false, 
			defaultValue: 'Activate'
		}
	},
	{
		hooks: {
			
		}

	})

	return EmailProfileCode;
}
