/*
 * File:     first_time_setup.js
 * Author:   Brian Onang'o
 * Company:  Csyber Systems
 * Website:  http://familyfe.csymapp.com
 * E-mail:   brian@cseco.co.ke, surgbc@gmail.com, brian@csymapp.com
 * Created:	 Feb 2018
 *
 * Description
 * This script is used for setting up the databases and default users when setting up familyfe-challenge for the first time
 *
 T
*/

'use strict'
const dotenv = require('dotenv');
const chalk = require('chalk');
const to = require('await-to-js').to;
const Promptly = require('promptly');

const csystem = require(__dirname+'/../apps/csystem').csystem
, globalConfig = require(__dirname+'/../apps/csystem').globalConfig
, {sequelize} = require(__dirname+'/../apps/csystem').models
, Family = require(__dirname+'/../src/csymapp/Family/Family')(sequelize)
, Person = require(__dirname+'/../src/csymapp/Person')(sequelize)
, CsystemApp = require(__dirname+'/../src/csymapp/App/CsystemApplication')(sequelize)

class firstTimeSetup extends csystem
{
	constructor()
	{
		super()
	}


	async first_time_setup()
	{
		let self = this
		let [err, dontcare, care] = [];

		//sync db
		;[err, dontcare] = await to (self.dbSync(true))
		if(err) throw (err)

		console.log('Setting up csystem families: World')
		;[err, care] = await to(Family.create({
			FamilyName:'World',
			hierarchyLevel:null,
			parentFamilyId: null
		}, false, "csystem", "nobody", 1))
		if(err) throw (err)

		console.log('Setting up Apps');
		;[err, care] = await to(CsystemApp.setupallapps(false, "csystem", "nobody", 1))
		if(err) throw (err)

		console.log(`Creating Users`)
		let rootEmail = globalConfig.get('/rootEmail');
		console.log(`rootEmail: ${rootEmail}`);
		;[err, care] = await to(self.rootPassword())
		if(err)return Promise.reject(err)
		let rootPassword = care;
		console.log(`password: ${rootPassword}`)

		;[err, care] = await to (Person.beget({
			Name:"Brian Onang'o Admin", 
			Gender: "Male",
			EmailProfiles:{
				Email:rootEmail.toLowerCase(), 
				Password:rootPassword, 
				Cpassword:rootPassword, 
				IsActive:true
				},
			IsActive:true,
			// Families: [3, 2, 1] // Test, World, Csystem
		},false, "csystem", "nobody", 1));
		if(err)return Promise.reject(err)
		
		let guestEmail = globalConfig.get('/guestEmail');
		console.log(`guestEmail: ${guestEmail}`);
		;[err, care] = await to (Person.beget({
			Name:"Brian Onang'o Guest", 
			Gender: "Male",
			EmailProfiles:{
				Email:guestEmail.toLowerCase(), 
				Password:guestEmail, 
				Cpassword:guestEmail, 
				IsActive:true,
				},
			IsActive:true,
			// Families: [3, 2, 1] // Test, World, Csystem
		},false, "csystem", "nobody", 1))
		
		if(err)return Promise.reject(err)

		return true
	}

	async rootPassword ()
	{	
		let password, dontcare, err;
		if(process.env.ENV === "development" || process.env.ENV === "dev")
        {
        	password = globalConfig.get('/rootEmail')
            return password
        }
        const validator = function (value) {
		    if (value.length < 5) {
		        throw new Error('Password less than 5 characters');
		    }
		    return value;
		};
		 
		password = await Promptly.password('Root user password(atleast 5 characters): ', { validator});
        return password
	}

	async createAdmin()
	{

	}
}

let setup = async () => {
	let setup = new firstTimeSetup;
	let [err, dontcare] = await to( setup.first_time_setup(false));
	if(err)
	{
		console.log(chalk.red('✗ Set up failed'));
		console.log(err)
		process.exit(1)
	}
	console.log(chalk.green('✓ Done setting up'));
	process.exit(0)
}

setup()
