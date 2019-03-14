
const   csymapp         = require(__dirname+'/../csymapp')
,       App  = require(__dirname+'/App')
,       to              = require('await-to-js').to
,       path              = require('path')
,       fse              = require('fs-extra')

class CsystemApp extends App {
    constructor(Sequelize) {
        super(Sequelize)
    }

    async getConfigFiles() {
        let _root = path.join(__dirname,"/../../../apps/");
		let configFiles = []
		fse
		.readdirSync(_root)
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

    async setupallapps(uid, application, role, familytoCreateFor = 1)
    {
        let self = this;
        let _root = __dirname+"/../../apps/";
        let [err, care] = [],
        FamilyId = familytoCreateFor

        ;[err, care] = await to(self.getConfigFiles())
		if(err) throw err
		let configFiles = care;

		console.log(configFiles)
		let promises = configFiles.map(function(path){return self.createApps(path, uid, application, role, familytoCreateFor)})
		;[err, care] = await to(Promise.all(promises));
		console.log(err)
		if (err) throw (err)
		return true;
        
    }
    

    async  createApps(path, uid, application, role, familytoCreateFor) {
		let self = this
        ,[err, care] = [],
        familfyId = familytoCreateFor
		let thisappconfig = require(path);
		let appname = thisappconfig.get("/name")
		let groups = thisappconfig.get("/groups")
		let canuninstall = thisappconfig.get("/canuninstall")
		let enabled = thisappconfig.get("/enabled")
		let Enabled = thisappconfig.get("/Enabled")
        let AutoInstall = thisappconfig.get("/AutoInstall")
        
		;[err, care] = await to(self.csystemCreate({
			AppName:appname,
			AutoInstall: AutoInstall,
			Enabled: Enabled,
        }, uid, application, role, familytoCreateFor))
		if (err) throw (err);
        let AppId = care;	// for a single app
        
		if(AutoInstall === true) {
			console.log('installing for all families')
			;[err, care] = await to(self.installSingleAppforAllFamilies({
				Apps:AppId
			},  uid, application, role, familytoCreateFor))
		}
		else {
			console.log('installing for single family')
			;[err, care] = await to(self.installSingleAppforSingleFamily({
				Apps:AppId,
				family: familfyId
			}, uid, application, role, familytoCreateFor))
        }

        if(err) throw err
        let installedAppIds = []
        for(let i in care){
            installedAppIds.push(care[i][0].dataValues.InstalledAppId)
        }
        
		let promises = groups.map( function(x) { return self.Role.createRoles({_role:x, appId:AppId, appName:appname, canuninstall},uid, application, role, familytoCreateFor); })
        ;[err, care] = await to(Promise.all(promises));
        if(err) throw err
        ;[err, care] = await to(self.Role.getRoleId({Role:'user', AppAppId: AppId}, uid, application, role, familfyId))
        if(err) throw err
        let roleId = care

        promises = installedAppIds.map( function(x) { return self.MemberRole.createAllforAppforFamily({roleId, InstalledAppInstalledAppId: x},uid, application, role, familfyId); })
        ;[err, care] = await to(Promise.all(promises));
        if (err) throw (err)
		return care;
	}

    
}

module.exports = (Sequelize) => {return new CsystemApp(Sequelize)}