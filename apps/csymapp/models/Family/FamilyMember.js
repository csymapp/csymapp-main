'use strict'
module.exports = (sequelize, DataTypes) => {
	const FamilyMember = sequelize.define('FamilyMember', {
		FamilyMemberId: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		}
	},
	{
		hooks: {
			
		}
	})

	FamilyMember.associate = function (models) {
	    FamilyMember.hasMany(models.MemberRole, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });
	    FamilyMember.belongsTo(models.Family, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });
	    FamilyMember.belongsTo(models.Person, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });
	}
	return FamilyMember;
}
