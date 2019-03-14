const   csymapp         = require(__dirname+'/../csymapp')
,       AbstractFamily  = require(__dirname+'/AbstractFamily')
,       to              = require('await-to-js').to

class FamilyMember extends AbstractFamily {
    constructor(Sequelize) {
        super(Sequelize)
        let self = this
        self.MemberRole = require(__dirname+'/../App/MemberRole')(self.sequelize, false)
        self.Role = require(__dirname+'/../App/Role')(self.sequelize, false)
    }
    async create(uid, application, role, familytoCreateFor) {
		let self = this
        , [err, care] = [],
        familyId = familytoCreateFor
        ;[err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to familyMember:create for Family ${familytoCreateFor} as ${role}`}})
        ;[err, care] = await to(self.rbac.can(role, 'familyMember:create'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to familyMember:create for Family ${familytoCreateFor} as ${role}`}})
        ;[err, care] = await to(self.sequelize.models.FamilyMember.create({PersonUid:uid, FamilyFamilyId: familytoCreateFor}))
        if(err) throw err
        let [err1, care1] = await to(self.allMyApplications({FamilyId:familytoCreateFor},uid, application, role, familytoCreateFor))
        if(err1)throw err1
        if(!err1){
            let myApps = [];
            let myInstalledApps = [];
            for(let i in care1){
                myInstalledApps.push(care1[i].dataValues.InstalledAppId)
                myApps.push(care1[i].dataValues.AppAppId)
            }
            let MemberId = care.dataValues.FamilyMemberId;
            let promises = myApps.map( function(x) { return self.Role.getRoleId({Role:'user', AppAppId: x}, uid, application, role, familyId); })
            ;[err1, care1] = await to(Promise.all(promises));
 
            if(err1) throw err1
            let appdata = [];
            for(let i in myInstalledApps)appdata.push([myInstalledApps[i], myApps[i],care1[i]])
            // console.log(appdata)
            promises = appdata.map( function(x) { return self.MemberRole.createMemberRole({RoleRoleId:x[2],
                FamilyMemberFamilyMemberId: MemberId,
                FamilyFamilyId:familyId,
                InstalledAppInstalledAppId:x[0]},uid, application, role, familyId); })
            ;[err1, care1] = await to(Promise.all(promises));
            if(err1) throw err1
        }
        return care.dataValues;
    }
    
    async allMyApplications(options, uid, application, role, familytoCreateFor) {
        let self = this
        , [err, care] = [],
        familyId = options.FamilyId
        ;[err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to familyApps:listAll for Family ${familytoCreateFor} as ${role}`}})
        ;[err, care] = await to(self.rbac.can(role, 'familyApps:listAll'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to familyApps:listAll for Family ${familytoCreateFor} as ${role}`}})
        
        ;[err, care] = await to(self.sequelize.models.InstalledApp.findAll({
            where:{FamilyFamilyId:familyId},
            // include: [
            //    {
            //         model: self.sequelize.models.App
            //    }
            // ]
        
        }))
        if(err) throw err
        return care
    }
    async allMembersofFamily(uid, application, role, familytoCreateFor) {
		let self = this
        , [err, care] = []
        ;[err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err

        if(!care)throw({message:{Permission:`You are not allowed to familyMember:create for Family ${familytoCreateFor} as ${role}`}})
        ;[err, care] = await to(self.rbac.can(role, 'familyMember:create'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to familyMember:create for Family ${familytoCreateFor} as ${role}`}})
        ;[err, care] = await to(self.sequelize.models.FamilyMember.create({PersonUid:uid, FamilyFamilyId: familytoCreateFor}))
		if(err) throw err
		return care.dataValues;
	}
}

module.exports = (Sequelize) => {return new FamilyMember(Sequelize)}