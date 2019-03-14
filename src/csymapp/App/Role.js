
const   csymapp         = require(__dirname+'/../csymapp')
,       AbstractApp  = require(__dirname+'/AbstractApp')
,       to              = require('await-to-js').to

class Role extends AbstractApp {
    constructor(Sequelize) {
        super(Sequelize)
        let self = this
        self.Family = require(__dirname+'/../Family/Family')(self.sequelize)
    }
    async createRoles(options,uid, application, role, familytoCreateFor = 1) {
        let self = this
        let {_role, appId, appName, canuninstall} = options
        ,[err,care] = []
        ;[err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to role:create for Family ${familytoCreateFor} as ${role}`}})
        
        ;[err, care] = await to(self.rbac.can(role, 'role:create'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to role:create for Family ${familytoCreateFor} as ${role}`}})


		;[err, care] = await to(self.sequelize.models.Role.create({
			Role:_role,
			AppAppId: appId,
			UniqueRole: `${appName}${_role}`,
            canUninstall:canuninstall[_role],
            FamilyFamilyId: familytoCreateFor
		}))
		let roleId;
		if (err) {	// role already exists
			;[err, care] = await to(self.sequelize.models.Role.findOne({where:{Role:_role}}));
			roleId = care.dataValues.RoleId;
		} else {
			roleId = care.dataValues.RoleId;
		}
		let ret = {};
		ret[roleId] = _role;
		return ret;
    }
    
    async getRoleId(options,uid, application, role, familytoCreateFor = 1) {
        let self = this
        // let {_role, appId, appName, canuninstall} = options
        ,[err,care] = []
        ;[err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to roleId:get for Family ${familytoCreateFor} as ${role}`}})
        
        ;[err, care] = await to(self.rbac.can(role, 'roleId:get'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to roleId:get for Family ${familytoCreateFor} as ${role}`}})


		;[err, care] = await to(self.sequelize.models.Role.findOne({where:options}))
		if(err)throw err
		return care.dataValues.RoleId;
    }
    
}

module.exports = (sequelize) => {return new Role(sequelize)}