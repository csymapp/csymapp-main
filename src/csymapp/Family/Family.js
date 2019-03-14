
const   csymapp         = require(__dirname+'/../csymapp')
,       AbstractFamily  = require(__dirname+'/AbstractFamily')
,       to              = require('await-to-js').to

class Family extends AbstractFamily {
    constructor(Sequelize) {
		super(Sequelize)
		let self = this
		self.App = new (require(__dirname+'/../App/App'))(self.sequelize, false)
    }

    async create(options, uid, application, role, familytoCreateFor = 1) {
		let self = this
		let FamilyName = options.FamilyName || ''
		let hierarchyLevel = options.hierarchyLevel
		let parentFamilyId = options.parentFamilyId
        let FamilyFamilyId = familytoCreateFor
        , [err, care] = []
        if(familytoCreateFor === 1)
            [err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, "nobody"))
        else 
            [err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to family:createInWorld for Family ${familytoCreateFor} as ${role}`}})
        
        ;[err, care] = await to(self.rbac.can(role, 'family:createInWorld'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to family:createInWorld for Family ${familytoCreateFor} as ${role}`}})

		if (FamilyName === 'World' || FamilyName === 'Csystem') {
			hierarchyLevel = 1;
			parentFamilyId = null;
		} else {
			if (hierarchyLevel < 2) hierarchyLevel = 2
			if (parentFamilyId === null) parentFamilyId = 1
        }
		;[err, care] = await to(self.sequelize.models.Family.create({
			FamilyName,
			hierarchyLevel,
			parentFamilyId,
			FamilyFamilyId
		}))
		if (err){
			if(err.errors[0].message){
				throw {message:err.errors[0].message, status:422}
			}
			else throw err
		}
		
		let familyId = care.dataValues.FamilyId;
		await (self.App.installAppsforFamily({FamilyId:familyId, Apps:'all'}, uid, application, role, familytoCreateFor))
		if (care === null) throw 'Missing familyId'
		return care.dataValues.FamilyId;
	}
    async listAllFamilies(uid, application, role, familytoCreateFor = 1) {
		let self = this
        , [err, care] = []
        if(familytoCreateFor === 1)
            [err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, "nobody"))
        else 
            [err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to family:listAll for Family ${familytoCreateFor} as ${role}`}})
        
        ;[err, care] = await to(self.rbac.can(role, 'family:listAll'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to family:listAll for Family ${familytoCreateFor} as ${role}`}})

	
		;[err, care] = await to(self.sequelize.models.Family.findAll())
		if (err)throw err
		let families = []
		for (let i in care) {
			families.push(care[i].FamilyId)
		}
		return families;
	}
    async update(values, where, uid, application, role, familytoCreateFor = 1) {
		let self = this
        , [err, care] = []
        if(familytoCreateFor === 1)
            [err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, "nobody"))
        else 
            [err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to family:updateSpecific for Family ${familytoCreateFor} as ${role}`}})
        
        ;[err, care] = await to(self.rbac.can(role, 'family:updateSpecific'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to family:updateSpecific for Family ${familytoCreateFor} as ${role}`}})
        
         ;[err, care] = await to(self.sequelize.models.Family.update(values, {
			where,
			individualHooks: true
		}))
		if(err)throw err
		return care;
	}
}

module.exports = (Sequelize) => {return new Family(Sequelize)}