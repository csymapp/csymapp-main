
const   csymapp         = require(__dirname+'/../csymapp')
,       AbstractApp  = require(__dirname+'/AbstractApp')
,       to              = require('await-to-js').to

class MemberRole extends AbstractApp {
    constructor(Sequelize, imports = true) {
        super(Sequelize)
        let self = this
        if(imports) {
            self.Family = require(__dirname+'/../Family/Family')(self.sequelize)
            self.FamilyMember = require(__dirname+'/../Family/FamilyMember')(self.sequelize)
        }
    }

    async createAllforAppforFamily(options,uid, application, role, familytoCreateFor = 1) {
        let self = this
        let {roleId, InstalledAppInstalledAppId} = options
        ,[err,care] = []
        ;[err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to memberRole:createAllforAppforFamily for Family ${familytoCreateFor} as ${role}`}})
        
        ;[err, care] = await to(self.rbac.can(role, 'memberRole:createAllforAppforFamily'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to memberRole:createAllforAppforFamily for Family ${familytoCreateFor} as ${role}`}})

        ;[err, care] = await to (self.FamilyMember.allMembersofFamily(uid, application, role, familytoCreateFor))
        care = care || []

        let promises = care.map( function(x) { return self.createMemberRole({RoleRoleId:roleId,
			FamilyMemberFamilyMemberId: x,
            InstalledAppInstalledAppId,
            FamilyFamilyId: familfyId
        },uid, application, role, familfyId); })
        ;[err, care] = await to(Promise.all(promises));
        if(err) throw err		
		return care;
    }
    
    async createMemberRole(options,uid, application, role, familytoCreateFor) {
        let self = this
        let {RoleRoleId, FamilyMemberFamilyMemberId,FamilyFamilyId, InstalledAppInstalledAppId} = options
        ,[err,care] = []
        ;[err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to memberRole:create for Family ${familytoCreateFor} as ${role}`}})
        
        ;[err, care] = await to(self.rbac.can(role, 'memberRole:create'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to memberRole:create for Family ${familytoCreateFor} as ${role}`}})

        ;[err, care] = await to(self.sequelize.models.MemberRole.create({
			RoleRoleId,
			FamilyMemberFamilyMemberId,
			InstalledAppInstalledAppId,
			FamilyFamilyId
        }))
        if(err) throw err
        return care
    }
}

module.exports = (sequelize, imports) => {return new MemberRole(sequelize, imports)}