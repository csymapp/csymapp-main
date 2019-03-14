'use strict'

module.exports = (sequelize, DataTypes) => {
	const TelephoneProfileCode = sequelize.define('TelephoneProfileCode', {
		TelephoneProfileCodeId: {
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
			type: DataTypes.ENUM('Auto-login', 'Activate'),
			allowNull: false, 
			defaultValue: 'Auto-login'
		}
	},
	{
		hooks: {
			// 
		}
	})
	return TelephoneProfileCode;
}
