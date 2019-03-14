/*
 * file: User.js
 * Required to read users
 */
//const bcrypt = require('bcrypt-nodejs');
// const crypto = require('crypto');
// const MongoModels = require('mongo-models');
// const mongoose = require('mongoose');
const fse = require('fs-extra');
// const Joi = require('joi');
const Async = require('async');
const path = require('path');
const to = require('await-to-js').to;

// var Schema = mongoose.Schema,
//     ObjectId = Schema.ObjectId;


// const allappsSchemao = new Schema({
//     appname:{
//         type: String, 
//         unique: true 
//     },
//     enabled: [{
//         group:String,
//         enabled:Boolean
//     }]
// })

// const allappsSchema = Joi.object().keys({
//     _id: Joi.object(),
//     appname: Joi.string().required(),
//     enabled: Joi.object().keys({
//         group: Joi.string(),
//         enabled: Joi.boolean()
//     }),
//     timeCreated: Joi.date()
// });




class appsConfig
{

	constructor (sequelize) {
		let self = this;
		self.sequelize = sequelize
	}

	async listAllApps() {
		let self = this;
        let _root = __dirname+"/../../apps/";
        let [err, care] = [];
        let configFiles = []

        fse
		.readdirSync(__dirname+'/../../apps/')
		.forEach((file)=>{
			let configFolder = path.join(_root, file, 'config')
			
			try
			{
				fse
				.readdirSync(configFolder)
				.filter((configfile) =>
					configfile === 'index.js'
				)
				.forEach((configfile)=>{
					configFiles.push(path.join(configFolder, configfile));
				})
			} catch(err){}

			let innerConfig = path.join(_root, file);
			fse
			.readdirSync(innerConfig)
			.forEach((file)=>{
				configFolder = path.join(innerConfig, file, 'config')
				try
				{
					fse
					.readdirSync(configFolder)
					.filter((configfile) =>
						configfile === 'index.js'
					)
					.forEach((configfile)=> {
						configFiles.push(path.join(configFolder, configfile));
					})
				}catch(err){}
			})
		})


		async function readConfigs(path) {
			let thisappconfig = require(path);
		    let appname = thisappconfig.get("/name")
		    let groups = thisappconfig.get("/groups")
		    let canuninstall = thisappconfig.get("/canuninstall")
		    let enabled = thisappconfig.get("/enabled")
		    let Enabled = thisappconfig.get("/Enabled")
		    let AutoInstall = thisappconfig.get("/AutoInstall")
			
			return {
		    	AppName:appname,
		    	AutoInstall: AutoInstall,
				Enabled: Enabled,
				InstalledApps: [],
				SetUp: false
		    }
		}

		let promises = configFiles.map(function(path){return readConfigs(path)})
		;[err, care] = await to(Promise.all(promises));
		let configs = care;
		let apps = []
		for(let i in configFiles) {
			let parts = configFiles[i].split('/');
				parts = parts.slice(-3)[0]
				apps.push(parts)
		}
		// read apps from system
		;[err, care] = await to(self.getAllApps(true))
		if(err) throw err
		let ret = {}
		for(let i in apps) {
			for(let j in configs) {
				if(configs[j].AppName === apps[i])
				ret[apps[i]] = configs[j];
			}
		}

		for(let i in care) {
			let appName = care[i].dataValues.AppName
			ret[appName] = care[i].dataValues
		}

		return ret;
	}

	async update(data, where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.App.update(data, {where: where, individualHooks: true}))
		if(err) throw (err)
		if(care === null) return {}
		return care
	}

	async delete(where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.App.destroy({where}))		
		if(err) throw (err)
		if(care === null) return {}
		return care.dataValues
	}

	async getConfigFiles() {
		let _root = __dirname+"/../../apps/";
		let configFiles = []
		fse
		.readdirSync(__dirname+'/../../apps/')
		.forEach((file)=>{
			let configFolder = path.join(_root, file, 'config')
			
			try
			{
				fse
				.readdirSync(configFolder)
				.filter((configfile) =>
					configfile === 'index.js'
				)
				.forEach((configfile)=>{
					configFiles.push(path.join(configFolder, configfile));
				})
				console.log(`ConfigFolder: ${configFolder}`)

			} catch(err){}

			let innerConfig = path.join(_root, file);
			fse
			.readdirSync(innerConfig)
			.forEach((file)=>{
				configFolder = path.join(innerConfig, file, 'config')
				// console.log(`checking files in ${configFolder}`)
				try
				{
					fse
					.readdirSync(configFolder)
					.filter((configfile) =>
						configfile === 'index.js'
					)
					.forEach((configfile)=> {
						configFiles.push(path.join(configFolder, configfile));
					})
					console.log(`ConfigFolder: ${configFolder}`)
				}catch(err){}
			})
		})
		return configFiles
	}

	async  createApps(path, familyId) {
		let self = this
		,[err, care] = []
		let thisappconfig = require(path);
		let appname = thisappconfig.get("/name")
		let groups = thisappconfig.get("/groups")
		let canuninstall = thisappconfig.get("/canuninstall")
		let enabled = thisappconfig.get("/enabled")
		let Enabled = thisappconfig.get("/Enabled")
		let AutoInstall = thisappconfig.get("/AutoInstall")
		// console.log(enabled)
		// console.log(Enabled)

		;[err, care] = await to(self.sequelize.models.App.create({
			AppName:appname,
			AutoInstall: AutoInstall,
			Enabled: Enabled,
			FamilyFamilyId:familyId
		}))

		if (err) throw (err.errors);
		let AppId = care.dataValues.AppId;	// for a single app
		if(AutoInstall === true) {
			console.log('installing for all family')
			;[err, care] = await to(self.installSingleAppforAllFamilies({
				Apps:AppId
			}))
		}
		else {
			console.log('installing for single family')
			;[err, care] = await to(self.installSingleAppforSingleFamily({
				Apps:AppId,
				family: 1
			}))
		}

		//AutoInstall
		
		// console.log(appname)
		// console.log(groups)
		// console.log(canuninstall)
	   
		// let promises = groups.map(createRoles);
		let promises = groups.map( function(x) { return self.createRoles(x, AppId, appname, canuninstall); })
		;[err, care] = await to(Promise.all(promises));

		if (err) throw (err)

		let tmpGroups = {};
		for(let i in care) {
			for (let j in care[i]) {
				tmpGroups[j] = care[i][j];
			}
		}

		let groupNames = [], groupIds = [];
		
		for( let i in tmpGroups) {
			groupIds.push(i)
			groupNames.push(care[i])
		}
		 return true;
	}

	async createRoles(role, appId, appName, canuninstall) {
		let self = this
		,[err,care] = []
		;[err, care] = await to(self.sequelize.models.Role.create({
			Role:role,
			AppAppId: appId,
			UniqueRole: `${appName}${role}`,
			canUninstall:canuninstall[role]
		}))
		// console.log('role')
		let roleId;
		if (err) {	// role already exists
			;[err, care] = await to(self.sequelize.models.Role.findOne({where:{Role:role}}));
			roleId = care.dataValues.RoleId;
		} else {
			roleId = care.dataValues.RoleId;
		}
		let ret = {};
		ret[roleId] = role;
		return ret;
		// return {groupId:role};
	 }

    async setupSingleapp(app, FamilyId)
    {
        let self = this;
        let [err, care] = [];
        //console.log("setting up all apps")
		;[err, care] = await to(self.getConfigFiles())
		if(err) throw err
		let configFiles = care;

		console.log('Now setting up apps');
		let tmp = [...configFiles];
		configFiles = [];
		let appNames = [];

		for(let i in tmp) {
			let parts = tmp[i].split('/');
			parts = parts.slice(-3)[0]
			appNames.push(parts)
		}

		// console.log(tmp)

		for(let i in appNames) 
			if(appNames[i] === app)
				configFiles.push(tmp[i])

		let promises = configFiles.map(function(path){return self.createApps(path, FamilyId)})
		;[err, care] = await to(Promise.all(promises));
		// install for all families
		console.log(err)
		if (err) throw (err)
		return true;
        
	}
	
    async setupallapps(FamilyId)
    {
        let self = this;
        let _root = __dirname+"/../../apps/";
        let [err, care] = [];
        //console.log("setting up all apps")

        ;[err, care] = await to(self.getConfigFiles())
		if(err) throw err
		let configFiles = care;

		console.log('Now setting up apps');
		console.log(configFiles)
		let promises = configFiles.map(function(path){return self.createApps(path, FamilyId)})
		;[err, care] = await to(Promise.all(promises));
		console.log(err)
		if (err) throw (err)
		return true;
        
	}
	
	async getAllAppsv1(where, whereInner) {
		let self = this;
		let appIds = []
		if(!where) where = true
		let [err, care] = await to(self.sequelize.models.App.findAll(
			{
			attributes:["AppId", "AppName", "AutoInstall", "Enabled", "FamilyFamilyId"],
			where:where,
			include: [
				{
					model:self.sequelize.models.Role,
					attributes:["RoleId", "Role", "canUninstall"],
					// include : [
					// 	{
					// 		model: self.sequelize.models.MemberRole
					// 	}
					// ]
				},
				{
					model:self.sequelize.models.InstalledApp,
					attributes:["InstalledAppId","FamilyFamilyId"],
					where: whereInner
					
				}
			]
			}
		));
		if(err) throw err;
		return care
	}

	async installforFamily(appid, FamilyId) {
		//
		// console.log(`${FamilyId}::${appid}`)
		let [err, care] = [],
		self = this
		// try{
		
		;[err, care] = await to(self.sequelize.models.InstalledApp.findOne({where:{
			AppAppId:appid,
			FamilyFamilyId:FamilyId
			}
		}))
		if(err) throw err
		if(care === null) {
			;[err, care] = await to(self.sequelize.models.InstalledApp.create({
				AppAppId:appid,
				FamilyFamilyId:parseInt(FamilyId)
			}))
			if(err) throw err
			return care
		}
		return false
	}

	
	async deletefromFamily(appid, FamilyId) {
		let [err, care] = [],
		self = this
		
		;[err, care] = await to(self.sequelize.models.InstalledApp.destroy({where:
			{AppAppId:appid,
			FamilyFamilyId:parseInt(FamilyId)
		}}))
		if(err) throw err

		let [err1, care1] = await to(self.sequelize.models.Role.findAll({
			where:
			{
				AppAppId:appid
			},
			include: [
				{
					model: self.sequelize.models.MemberRole
				}
			]
		}))
		let memberRoles = []
		care1 = JSON.parse(JSON.stringify(care1))
		try{
			for(let i in care1){
				for(let j in care1[i].MemberRoles)
					memberRoles.push(care1[i].MemberRoles[j].MemberRoleId)
			}
		}catch(error){}
		;[err1, care1] = await to(self.sequelize.models.FamilyMember.findAll({
			where:
			{
				FamilyFamilyId:FamilyId
			}
		}))
		let familyMembers = []
		try{
			for(let i in care1){
				familyMembers.push(care1[i].FamilyMemberId)
			}
		}catch(error){}

		let deleteSingleMemberRole = async (role, familyMember) => {
			await to(self.sequelize.models.MemberRole.destroy({where:{FamilyMemberFamilyMemberId:familyMember, RoleRoleId: role}}))
		}

		let deleteMemberRole = async (role, familyMembers)=> {
			
			let promises = familyMembers.map(function (familyMember) {
				return deleteSingleMemberRole(role, familyMember)
			});
			;[err1, care1] = await to(Promise.all(promises));
		}

		let promises = memberRoles.map(function (role) {
			return deleteMemberRole(role, familyMembers)
		});
		;[err1, care1] = await to(Promise.all(promises));

		return care;			
	}

    async getAllApps (everything, where, where1={}) {
		let self = this;
		let appIds = []
		if(!where) where = true
		let [err, care] = await to(self.sequelize.models.App.findAll(
			{
			attributes:["AppId", "AppName", "AutoInstall", "Enabled", "FamilyFamilyId"],
			where:where,
			include: [
				{
					model:self.sequelize.models.Role,
					attributes:["RoleId", "Role", "canUninstall"],
					include : [
						{
							model: self.sequelize.models.MemberRole
						}
					]
				},
				{
					model:self.sequelize.models.InstalledApp,
					attributes:["FamilyFamilyId"],
					
				}
			]
			}
		));
		// console.log(where1)
		let [err1, care1] = await to(self.sequelize.models.Family.findAll(
			{
				include: [
					{
						model: self.sequelize.models.FamilyMember
						,attributes: []
						, where: where1.Person
					},
				{
					model: self.sequelize.models.InstalledApp,
					// where:{
					// 	FamilyFamilyId:family
					// },
					attributes: ["InstalledAppId"],
					include: 
						[
							{
								model:self.sequelize.models.App,
								// where: {AppName: app},
								attributes: ['AppId', 'AppName'],
								include:[
									{
										model:self.sequelize.models.Role,
										// where:{Role: role},
										attributes: ['RoleId', 'Role']
								}]
							}
						]
				}
				]
			}
		))
		// console.log(care1)
		if(care===null) care = {}
		let ret = [],
		apps = []
		for(let i in care1) {
			let installedApps = care1[i].dataValues.InstalledApps;
			for(let j in installedApps) {
				let appName = installedApps[j].App.dataValues.AppName
				apps.push(appName)
			}
		}
		// console.log(apps)
		for(let i in care) {
			let appName = care[i].AppName
			if(apps.indexOf(appName) > -1) {
				ret.push(care[i])
			}
			// console.log(care[i].AppName)
		}
		care = ret
		if(everything) return care;
	
		for(let i in care) {
			appIds.push(care[i].dataValues.AppId)
		}
		return appIds
	}


    async installAppsforFamily(options){
    	let self = this;
    	let app = options.Apps;
    	let FamilyId = options.FamilyId
    	let appIds = [];
    	if(app === 'all') {
			let [err, care] = await to(self.getAllApps());
    		appIds = care;
    	} else {
    		if (typeof app === 'number')
    			appIds.push(app)
    		else appIds = app
    	}

    	async function installforFamily(appid, FamilyId) {
    		//
    		// console.log(`${FamilyId}::${appid}`)
    		let [err, care] = []
    		// try{
    		
    		;[err, care] = await to(self.sequelize.models.InstalledApp.findOne({where:{
    			AppAppId:appid,
    			FamilyFamilyId:FamilyId
    			}
    		}))
    		if(care === null) {
				;[err, care] = await to(self.sequelize.models.InstalledApp.create({
					AppAppId:appid,
					FamilyFamilyId:FamilyId
				}))
			}
    	}
    	let promises = appIds.map(function(appid){return installforFamily(appid, FamilyId)})
		let [err, care] = await to(Promise.all(promises))
		return [err, care];
	}
	
	
    async autoinstallAppsforFamily(options){
    	let self = this;
    	let app = options.Apps;
    	let FamilyId = options.FamilyId
    	let appIds = [];
    	if(app === 'all') {
			let [err, care] = await to(self.getAllApps(true));
			for(let i in care) {
			let autoInstall = (care[i].dataValues.AutoInstall)

			if(autoInstall)
				appIds.push(care[i].dataValues.AppId);
			}
    	} else {
    		if (typeof app === 'number')
    			appIds.push(app)
    		else appIds = app
		}
		console.log(appIds)

    	async function installforFamily(appid, FamilyId) {
    		//
    		// console.log(`${FamilyId}::${appid}`)
    		let [err, care] = []
    		// try{
    		
    		;[err, care] = await to(self.sequelize.models.InstalledApp.findOne({where:{
    			AppAppId:appid,
    			FamilyFamilyId:FamilyId
    			}
    		}))
    		if(care === null) {
				;[err, care] = await to(self.sequelize.models.InstalledApp.create({
					AppAppId:appid,
					FamilyFamilyId:FamilyId
				}))
			}
    	}
    	let promises = appIds.map(function(appid){return installforFamily(appid, FamilyId)})
		let [err, care] = await to(Promise.all(promises))
		return [err, care];
	}
	


    async getAllFamilies() {
    	let self = this;
		let familyIds = []
    	let [err, care] = await to(self.sequelize.models.Family.findAll());
		for(let i in care) {
			familyIds.push(care[i].dataValues.FamilyId)
		}
		return familyIds
    }

    async installAppsforAllFamilies(options) {
    	let self = this;
    	let familyIds = [];
    	let [err, care] = [];
    	
       	;[err, care] = await to(self.getAllFamilies());
    	familyIds = care;
    	
    	let promises = familyIds.map(function(familyId){ options.FamilyId=familyId; return self.installAppsforFamily(options)})
		;[err, care] = await to(Promise.all(promises))
		return [err, care];
	}
	
    async installSingleAppforSingleFamily(options) {
		// if autoInstall
    	let self = this;
    	let familyIds = [];
    	let [err, care] = [];
    	
       	// ;[err, care] = await to(self.getAllFamilies());
		familyIds = [options.family];
		console.log(familyIds)
    	//options.Apps
    	let promises = familyIds.map(function(familyId){ options.FamilyId=familyId; return self.installAppsforFamily(options)})
		;[err, care] = await to(Promise.all(promises))
		return [err, care];
	}
	
	
    async installSingleAppforAllFamilies(options) {
		// if autoInstall
    	let self = this;
    	let familyIds = [];
    	let [err, care] = [];
    	
       	;[err, care] = await to(self.getAllFamilies());
    	familyIds = care;
    	//options.Apps
    	let promises = familyIds.map(function(familyId){ options.FamilyId=familyId; return self.installAppsforFamily(options)})
		;[err, care] = await to(Promise.all(promises))
		return [err, care];
	}
	


    async createAppGroupsofuser(whichuser, whichApp, whichGroups){
    	let self = this;
    	let groups = typeof whichGroups === 'string'? [whichGroups] : whichGroups;
    	// which app???
    	let appIds = [];
    	if (whichApp === 0) {
    		let [err, care] = await to(self.sequelize.models.App.findAll());
    		for(let i in care) {
    			appIds.push(care[i].dataValues.AppId)
    		}
    		// console.log(err)
    		// console.log(care)

    	} else {
    		let [err, care] = await to(self.sequelize.models.App.findOne({where:{AppName: whichApp}}))
    		appIds.push(care.dataValues.AppId)
    	}

    	// create groups for each app
    	async function createGroupsforApp (appid) {

    		async function appGroups(group) {
	    		// find the groupid to use
	    		let [err, care] = [];
	    		// try{
	    		;[err, care] = await to(self.sequelize.models.Role.find({where: {Group: group}, 
	    			include: [{
				        model: self.sequelize.models.AppGroup,
				        where: {'AppAppId': appid},
				        attributes: ['AppGroupId']
				    }], 

	    		}))
	    		let AppGroupId = care.dataValues.AppGroups[0].dataValues.AppGroupId


	    		let data = {
	    			AppGroupAppGroupId: AppGroupId,
	    			UserUid: whichuser,
	    			Installed: true
	    		}

	    		// get appId
	    		;[err, care] = await to(self.sequelize.models.AppUser.create(data));
				// console.log(err)
				return [err, care];
	    	}

    		let promises = groups.map(appGroups)
    		let [err, care] = await to(Promise.all(promises))
    		return [err, care];
    	}

    	// async function getAppIds() {

    	// } 

       	let promises = appIds.map(createGroupsforApp);
    	let [err, care] = await to(Promise.all(promises));
    	return [err, care];

    }
    
    static setuponeapps(app, callback)
    {
        let self = this;
        let _root = __dirname+"/../../../config/";

        self.collection = 'allapps';
        self.schema = allappsSchema;


        Async.auto({//
            drop: function(done){
               done()
            },
            create:["drop", function(results, done){
                let items = fse.readdirSync(_root);
                while(items.pop());
                items.push(app)
                Async.eachSeries(Object.keys(items), function (i, next){ 
                    if(items[i] == "." || items[i] == "..")next();
                    if(items[i].split(".").length > 1)next();
                    let appname = items[i];

                    let thisappconfig = require(_root + appname+"/config.js")
                    let enabled = thisappconfig.get("/enabled")
                    let displayname = thisappconfig.get("/displayname")
                    const document = {
                            appname: appname,
                            enabled: enabled,
                            timeCreated: new Date()
                        };
                    self.insertOne(document, function(err, results){
                        next()
                    });
                 }, function(err) {
                   done();
                }); 
            }]
        }, (err, results) => {
            if (err) {
                return callback(err);
            }

            callback(null);
        });

        
    }
}


module.exports = appsConfig;