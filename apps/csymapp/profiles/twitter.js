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
    
    async patchTwitterProfile(req, res) {
		let self = this;
		let tuid = req.params.v1
		if(!tuid)throw ({ status:422, message:{tuid: "Please provide tuid to modify"}})
		let [err, care] = []
		;[err, care] = await to(self.isAuthenticated(res, req))
		if(err) throw err;
		let authuid = care.uid
		;[err, care] = await to (Familyfe.TwitterProfile.whichPersonwithTuid(tuid))
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
		;[err, care] = await to (Familyfe.TwitterProfile.update(data, {tuid:tuid}))
		if(err) throw (err)
		;[err, care] = await to (Familyfe.EmailProfile.whichPerson(uidtoMod))
		if(err) throw (err)
		res.json(care)
    }

	
    async deleteTwitterProfile(req, res) {
		let self = this;
		let tuid = req.params.v1
		if(!tuid)throw ({ status:422, message:{tuid: "Please provide tuid to modify"}})
		let [err, care] = []
		;[err, care] = await to(self.isAuthenticated(res, req))
		if(err) throw err;
		let authuid = care.uid
		;[err, care] = await to (Familyfe.TwitterProfile.whichPersonwithTuid(tuid))
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
		;[err, care] = await to (Familyfe.FbProfile.delete({tuid:tuid}))

		;[err, care] = await to (Familyfe.EmailProfile.whichPerson(uidtoMod))
		if(err) throw (err)
		res.json(care)
    }



    async main(req, res){
		let self = this;
		let method = req.method;
		let [err, care] = [];
			
		switch(method) {
			case 'PATCH':
				;[err, care] = await to(self.patchTwitterProfile(req, res));
				if (err) throw err
				res.json(care)	
				break;			
			case 'DELETE':
				;[err, care] = await to(self.deleteTwitterProfile(req, res));
				if (err) throw err
				res.json(care)	
				break;
			
			default:
				res.status(422).json({error:{method:`${method} not supported`}});
		}
    }
    



}

module.exports = new Profile();