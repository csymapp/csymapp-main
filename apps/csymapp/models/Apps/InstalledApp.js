'use strict'
module.exports = (sequelize, DataTypes) => {
	const InstalledApp = sequelize.define('InstalledApp', {
		InstalledAppId: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		}
	},
	{
		hooks: {
			
		}
	})

	InstalledApp.associate = function (models) {
	    InstalledApp.belongsTo(models.App, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
        });
        InstalledApp.belongsTo(models.Family, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: true
			}
	    });

	}
    return InstalledApp;
}
