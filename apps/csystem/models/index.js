'use strict'
const fse = require('fs-extra');
const path = require('path')
const Sequelize = require('sequelize-hierarchy')();

const globalConfig = require(__dirname+'/../../../config/config.system');

const db = {}

const whichDB = globalConfig.get('/databaseType');

const sequelize = new Sequelize(
	globalConfig.get(`/database/${whichDB}/DBNAME`),
	globalConfig.get(`/database/${whichDB}/USER`),
	globalConfig.get(`/database/${whichDB}/PASS`),
	{
		dialect: globalConfig.get('/databaseType'),
		host: globalConfig.get(`/database/${whichDB}/HOST`),
		port: globalConfig.get(`/database/${whichDB}/PORT`) || 3306,
		logging: false
	} 

)

/*
 * read all folders in apps
 * 		go to their models folders and load all the models
 */
fse
.readdirSync(__dirname+'/../../')
.forEach((file)=>{
	let appFolder = path.join(__dirname+'/../../', file, 'models')
	try
	{
		fse
		.readdirSync(appFolder)
		.filter((modelfile) =>
			modelfile !=='index.js'
		)
		.forEach((modelfile)=>{
			console.log(`++++++++++>>>>${modelfile}`)
			try
			{
				let model = sequelize.import(path.join(appFolder, modelfile))
				db[model.name] = model
			}catch(error)
			{
				console.log(`error reading model: ${error} for ${modelfile}. Checking if for models inside it`)
				fse
				.readdirSync(path.join(appFolder, modelfile))
				.filter((modelfileInner) =>
					modelfileInner !=='index.js'
				)
				.forEach((modelfileInner)=>{
					console.log(`++++++++++>>>>${modelfileInner}`)
					try
					{
						let model = sequelize.import(path.join(path.join(appFolder, modelfile), modelfileInner))
						db[model.name] = model
					}catch(error)
					{
						console.log(`error reading model: ${error} for ${modelfile}.`)
						
					}	
				})
			}		
		})

	}catch(err){}

	// /api/app/models
	let innerApp = path.join(__dirname+'/../../', file);
	fse
	.readdirSync(innerApp)
	.forEach((file)=>{
		appFolder = path.join(innerApp, file, 'models')
		console.log(`checking files in ${appFolder}`)
		try
		{
			fse
			.readdirSync(appFolder)
			.filter((modelfile) =>
				modelfile !=='index.js'
			)
			.forEach((modelfile)=>{
				try
				{
					let model = sequelize.import(path.join(appFolder, modelfile))
					db[model.name] = model
				}catch(error)
				{
					console.log(`error reading model: ${error} for ${modelfile}`)
				}		
			})
		}catch(err){}
	})
})

Object.keys(db).forEach(function (modelName) {
	if('associate' in db[modelName]){
		// console.log(`associate ${modelName}`)
		try {
			db[modelName].associate(db)
		} catch(err) {
			console.log(err)
		}
	}
})

db.sequelize = sequelize
db.Sequelize= Sequelize

module.exports = db