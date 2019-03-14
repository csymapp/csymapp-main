'use strict'
module.exports = (sequelize, DataTypes) => {
	const Role = sequelize.define('Role', {
		RoleId: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		UniqueRole: {
			type: DataTypes.STRING(32), 
			allowNull: false,
			unique:true
		},
		Role: {
			type: DataTypes.STRING(32), 
			allowNull: false,
            validate: {
            	 len: {
                    args: [3, 32],
                    msg: 'Please give us a valid role'
                }
            }
		},
		canUninstall: {
			type:DataTypes.BOOLEAN,
			allowNull: false, 
			defaultValue: false
		}
	},
	{
		hooks: {
			
		}

	})

	Role.associate = function (models) {
	    Role.hasMany(models.MemberRole, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });
	    Role.belongsTo(models.App, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
        });
        Role.belongsTo(models.Family, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: true
			}
	    });
    }
    return Role;
}
