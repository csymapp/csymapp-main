
const   csymapp         = require(__dirname+'/../csymapp')
,       AbstractApp  = require(__dirname+'/AbstractApp')
,       to              = require('await-to-js').to

class App extends AbstractApp {
    constructor(Sequelize, imports = true) {
        super(Sequelize)
        let self = this
        if(imports) {
            self.Family = require(__dirname+'/../Family/Family')(self.sequelize)
            self.FamilyMember = require(__dirname+'/../Family/FamilyMember')(self.sequelize)
            self.Role = require(__dirname+'/../App/Role')(self.sequelize)
            self.MemberRole = require(__dirname+'/../App/MemberRole')(self.sequelize)
        }
    }

    async csystemCreate(options, uid, application, role, familytoCreateFor = 1) {
		let self = this
        , [err, care] = []
        if(familytoCreateFor === 1)
            [err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, "nobody"))
        else 
            [err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to CsystemApp:create for Family ${familytoCreateFor} as ${role}`}})
        
        ;[err, care] = await to(self.rbac.can(role, 'CsystemApp:create'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to CsystemApp:create for Family ${familytoCreateFor} as ${role}`}})

        options.FamilyFamilyId = familytoCreateFor
		;[err, care] = await to(self.sequelize.models.App.create(options))
        if(err) throw err
		return care.dataValues.AppId;
	}

    async installSingleAppforAllFamilies(options,  uid, application, role, familytoCreateFor) {
    	let self = this;
    	let familyIds = [];
    	let [err, care] = [];
    	
        ;[err, care] = await to(self.Family.listAllFamilies(uid, application, role, familytoCreateFor));
        if(err) throw err
        familyIds = care;
        console.log(familyIds)
    	let promises = familyIds.map(function(familyId){ options.FamilyId=familyId; return self.installAppsforFamily(options, uid, application, role, familytoCreateFor)})
        ;[err, care] = await to(Promise.all(promises))
        if(err) throw err
		return care;
    }

    async getAllAppIds(uid, application, role, familytoCreateFor) {
        let self = this
        , [err, care] = []

        ;[err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to App:getAll for Family ${familytoCreateFor} as ${role}`}})
        
        ;[err, care] = await to(self.rbac.can(role, 'App:getAll'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to App:getAll for Family ${familytoCreateFor} as ${role}`}})

        ;[err, care] = await to(self.sequelize.models.App.findAll({attributes:['AppId']}))
        if(err)throw err
        let appIds = [];
        for(let i in care)appIds.push(care[i].dataValues.AppId)
        return appIds
    }
    
    async installAppsforFamily(options,uid, application, role, familytoCreateFor){
    	let self = this;
    	let app = options.Apps;
    	let FamilyId = options.FamilyId || familytoCreateFor
        let appIds = []
        , [err, care] = []

        ;[err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to App:installForFamily for Family ${familytoCreateFor} as ${role}`}})
        
        ;[err, care] = await to(self.rbac.can(role, 'App:installForFamily'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to App:installForFamily for Family ${familytoCreateFor} as ${role}`}})

    	if(app === 'all') {
			[err, care] = await to(self.getAllAppIds(uid, application, role, familytoCreateFor));
    		appIds = care;
    	} else {
    		if (typeof app === 'number')
    			appIds.push(app)
    		else appIds = app
        }
        if(err) throw err

    	async function installforFamily(appid, FamilyId) {
    		let [err, care] = []    		
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
            return care
        }

    	let promises = appIds.map(function(appid){return installforFamily(appid, FamilyId)})
        ;[err, care] = await to(Promise.all(promises))
        if(err)throw err
		return care;
	}

    
}

module.exports = App