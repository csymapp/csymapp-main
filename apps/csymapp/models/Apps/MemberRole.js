'use strict'
module.exports = (sequelize, DataTypes) => {
	const MemberRole = sequelize.define('MemberRole', {
		MemberRoleId: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		}
	},
	{
		hooks: {
			
		}
	})

	MemberRole.associate = function (models) {
	    MemberRole.belongsTo(models.Role, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });
	    MemberRole.belongsTo(models.FamilyMember, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });
	    MemberRole.belongsTo(models.InstalledApp, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
        });
        MemberRole.belongsTo(models.Family, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: true
			}
	    });
	}
	return MemberRole;
}
