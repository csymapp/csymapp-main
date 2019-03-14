'use strict'
const validator = require('validator')

module.exports = (sequelize, DataTypes) => {
	const Person = sequelize.define('Person', {
		uid: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV1,
			primaryKey: true
		},
		Name: {
			type: DataTypes.STRING, 
			allowNull: false,
            validate: {
            	 len: {
                    args: [3, 32],
                    msg: 'Please give us a correct name'
                }
            }
		},
		Gender: {
			type:DataTypes.ENUM('Male', 'Female'),
			defaultValue: 'Male',
			validate: {
				isNotNull: function (value, next){
					if(validator.isEmpty(value)) {
						console.log('No gender')
						return next({gender:'Please provide a gender'})
					}
					value = value.toLowerCase()
					if(value !== 'male' && value !== 'female') {
						return next({gender:'Please provide a valid gender'})
					}
					else return next();
				}
            }
		},
		IsActive: {
			type: DataTypes.BOOLEAN, 
			allowNull: false, 
			defaultValue: false
		}

	},
	{
		hooks: {
			//beforeCreate:hashPassword,
			//beforeUpdate:hashPassword,
			//beforeSave:hashPassword
		}

	})


	Person.associate = function (models) {
	    Person.hasMany(models.GithubProfile, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });
	    
	    Person.hasMany(models.FacebookProfile, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });

	    Person.hasMany(models.GoogleProfile, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
		});
		
	    Person.hasMany(models.TwitterProfile, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
		});
		
		Person.hasMany(models.LinkedinProfile, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });

		Person.hasMany(models.EmailProfile, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
		});
		
		
		Person.hasMany(models.TelephoneProfile, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
		});

	    Person.hasMany(models.FamilyMember, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
		});
		
		Person.hasMany(models.LoginAttempt, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: true
			}
        });
        
        Person.belongsTo(models.Family, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: true
			}
	    });

	}


	return Person;
}
