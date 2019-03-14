
const   csymapp         = require(__dirname+'/csymapp')
,       to              = require('await-to-js').to

class Person extends csymapp {
    constructor(Sequelize) {
        super(Sequelize)
        let self = this
        let opts = {
            nobody: { // Role name
              can: [ // list of allowed operations
                'person:createInWorld'
              ]
            },
            user: { 
              can: [ 
                'person:createInFamily', 
                { 
                    name: 'person:createInFamily',
                    when: async (params) => params.usersFamily === params.familytoCreateIn
                }
              ],
              inherits: ['nobody']
            },
            admin: {
              can: ['rule the server'],
              inherits: ['user']
            }
          }
        self.rbac = new self.RBAC(opts)

        self.Family = require(__dirname+'/Family/Family')(self.sequelize)
        self.FamilyMember = require(__dirname+'/Family/FamilyMember')(self.sequelize)
        self.Role = require(__dirname+'/App/Role')(self.sequelize, false)
        self.MemberRole = require(__dirname+'/App/MemberRole')(self.sequelize, false)
    }

    async beget(person, uid, application, role, familytoCreateFor = 1) {
		let self = this;
		let thisPerson = {
			...person
        }
        let FamilyFamilyId = familytoCreateFor
        , [err, care] = []
        if(familytoCreateFor === 1)
            [err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, "nobody"))
        else 
            [err, care] = await to (self.confirmMemberHasRoleInFamily(uid, familytoCreateFor, application, role))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to person:createInWorld for Family ${familytoCreateFor} as ${role}`}})
        
        ;[err, care] = await to(self.rbac.can(role, 'person:createInWorld'))
        if(err)throw err
        if(!care)throw({message:{Permission:`You are not allowed to person:createInWorld for Family ${familytoCreateFor} as ${role}`}})
        
        thisPerson.FamilyFamilyId = FamilyFamilyId
		for (const inner in person) {
			// console.log(inner)
			let parts = inner.split(' ')
			if (parts.length > 1) {
				let toupper = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
				if (toupper === 'Uid') {
					toupper = 'uid'
				}
				thisPerson[parts[0]] === undefined ? thisPerson[parts[0]] = {} : thisPerson[parts[0]][toupper] = person[inner];
				thisPerson[parts[0]][toupper] = person[inner]

			}
		};
		let name = person.Name;
		if(!name || name===undefined) throw ({message:{"Name": "Please provide a name for the person"}, status:422})

		;[err, care] = await to(self.Family.create({
			FamilyName:name,
			hierarchyLevel:1,
			parentFamilyId: 1,
		},false, "csystem", "nobody", 1))
        if(err) throw(err)
        let myFamilyId = care;

        ;[err, care] = await to(self.Family.update({FamilyFamilyId: myFamilyId},{FamilyId: myFamilyId},uid, application, role, familytoCreateFor))
        if(err)throw err
    
        thisPerson.FamilyFamilyId = myFamilyId
        for(let i in thisPerson) {
			typeof thisPerson[i] === 'object'?thisPerson[i].FamilyFamilyId = myFamilyId: false
		}
		;[err, care] = await to(self.sequelize.models.Person.create(thisPerson, {
			include: [{
					model: self.sequelize.models.EmailProfile
				},
				{
					model: self.sequelize.models.TelephoneProfile
				},
				{
					model: self.sequelize.models.GithubProfile
				},
				{
					model: self.sequelize.models.GoogleProfile
				},
				{
					model: self.sequelize.models.FacebookProfile
				},
				{
					model: self.sequelize.models.TwitterProfile
				},
				{
					model: self.sequelize.models.TelephoneProfile
				}
			]
		}))

		if (err) {
			;await self.sequelize.models.Family.destroy({where: {FamilyId: myFamilyId}})
			let {
				a
			} = err.message || err.msg
			return Promise.reject({
				msg: err.msg || err.errors[0].message || err.message || err,
				code: err.code || 422,
				status: 422
			})
		}
		uid = care.dataValues.uid

		// Add to own family
		let [err1, care1] = await to(self.FamilyMember.create(uid, application, role, myFamilyId))
		if(err1)throw err1
		let MemberId = care1.FamilyMemberId;

		;[err1, care1] = await to(self.FamilyMember.allMyApplications({FamilyId:myFamilyId},uid, application, role, familytoCreateFor))
		if(err1)throw err1
		if(!err1){
				let myApps = [];
				let myInstalledApps = [];
				for(let i in care1){
						myInstalledApps.push(care1[i].dataValues.InstalledAppId)
						myApps.push(care1[i].dataValues.AppAppId)
				}
				
				let promises = myApps.map( function(x) { return self.Role.getRoleId({Role:'root', AppAppId: x}, uid, application, role, familytoCreateFor); })
				;[err1, care1] = await to(Promise.all(promises));

				if(err1) throw err1
				let appdata = [];
				for(let i in myInstalledApps)appdata.push([myInstalledApps[i], myApps[i],care1[i]])
				promises = appdata.map( function(x) { return self.MemberRole.createMemberRole({RoleRoleId:x[2],
						FamilyMemberFamilyMemberId: MemberId,
						FamilyFamilyId:myFamilyId,
						InstalledAppInstalledAppId:x[0]},uid, application, role, myFamilyId); })
				;[err1, care1] = await to(Promise.all(promises));
				if(err1) throw err1
		}
		
		// // put as root in all my applications
		// ;[err1, care1] = await to(self.Role.getRoleId({Role:'root', AppAppId: 1}, uid, application, role, myFamilyId));
		// let rootRoleId = 
		// uid = care.dataValues.uid

		// // Add to World
		// ;[err1, care1] = await to(self.FamilyMember.create(uid, application, role, 1))
		// if(err1)throw err1

		// // let WorldMemberId = care1.FamilyMemberId;

		// // // Put as user for all apps installed for family...
		// // console.log(care1)

		// // //Put as root for own family

		// // let Families = person.Families || [];
		// // let promises = Families.map(function (family) {
		// // 	return self.Family.addMember(family, uid)
		// // });
		// // [err1, care1] = await to(Promise.all(promises));
		return JSON.parse(JSON.stringify(care));
	}
}

module.exports = (Sequelize) => {return new Person(Sequelize)}