'use strict'
const to = require('await-to-js').to
,passport = require('passport')
,csystem = require(__dirname+"/../../csystem").csystem
,{sequelize} = require(__dirname+"/../../csystem").models
,Familyfe = require(__dirname+'/../../../modules/node-familyfe')(sequelize)
,moment = require('moment')

class Profile extends csystem{

	constructor() {
		super()
	}
    
    async patchLinkedInProfile(req, res) {
		let self = this;
		let luid = req.params.v1
		if(!luid)throw ({ status:422, message:{luid: "Please provide luid to modify"}})

		let [err, care] = []
		;[err, care] = await to(self.isAuthenticated(res, req))
		if(err) throw err;
		let authuid = care.uid
		// console.log(req.params)
		;[err, care] = await to (Familyfe.LinkedinProfile.whichPersonwithLuid(luid))
		if(err)throw ({ status:422, message:{Permission: "You are not allowed to modify that account"}})
		if(Object.keys(care).length === 0)throw ({ status:422, message:{github: "Profile not found"}})
		let uidtoMod = care.uid;
		if (authuid !== uidtoMod) {
			let [_err,csyAdmin] = await to(Familyfe.Family.memberHasRoleinFamilyforApp({AppName:"csystem"}, "root", 1, authuid))
			if(_err)throw ({ status:422, message:{Permission: "You are not allowed to modify that account"}})

			if(!csyAdmin)
				throw ({ status:422, message:{Permission: "You are not allowed to modify that account"}})
		}

		
		let data = JSON.parse(JSON.stringify(req.body))
		;[err, care] = await to (Familyfe.LinkedinProfile.update(data, {luid:luid}))
		if(err) throw (err)
		;[err, care] = await to (Familyfe.EmailProfile.whichPerson(uidtoMod))
		if(err) throw (err)
		res.json(care)
    }

	
    async deleteLinkedinProfile(req, res) {
		let self = this;
		let luid = req.params.v1
		if(!luid)throw ({ status:422, message:{luid: "Please provide luid to modify"}})

		let [err, care] = []
		;[err, care] = await to(self.isAuthenticated(res, req))
		if(err) throw err;
		let authuid = care.uid
		;[err, care] = await to (Familyfe.LinkedinProfile.whichPersonwithLuid(luid))
		if(err)throw ({ status:422, message:{Permission: "You are not allowed to delete that account"}})
		if(Object.keys(care).length === 0)throw ({ status:422, message:{github: "Profile not found"}})
		let uidtoMod = care.uid;
		
		if (authuid !== uidtoMod) {
			let [_err,csyAdmin] = await to(Familyfe.Family.memberHasRoleinFamilyforApp({AppName:"csystem"}, "root", 1, authuid))
			if(_err)throw ({ status:422, message:{Permission: "You are not allowed to delete that account"}})

			if(!csyAdmin)
				throw ({ status:422, message:{Permission: "You are not allowed to delete that account"}})
		}

		let data = JSON.parse(JSON.stringify(req.body))
		;[err, care] = await to (Familyfe.LinkedinProfile.delete({luid:luid}))

		;[err, care] = await to (Familyfe.EmailProfile.whichPerson(uidtoMod))
		// console.log(care)
		if(err) throw (err)
		res.json(care)
    }



    async main(req, res){
		let self = this;
		let method = req.method;
		let [err, care] = [];
			
		switch(method) {
			case 'PATCH':
				;[err, care] = await to(self.patchLinkedInProfile(req, res));
				if (err) throw err
				res.json(care)	
				break;			
			case 'DELETE':
				;[err, care] = await to(self.deleteLinkedinProfile(req, res));
				if (err) throw err
				res.json(care)	
				break;
			
			default:
				res.status(422).json({error:{method:`${method} not supported`}});
		}
    }
    



}

module.exports = new Profile();