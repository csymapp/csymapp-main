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
    
    async patchFbProfile(req, res) {
		let self = this;
		let fbuid = req.params.v1
		if(!fbuid)throw ({ status:422, message:{fbuid: "Please provide fbuid to modify"}})

		let [err, care] = []
		;[err, care] = await to(self.isAuthenticated(res, req))
		if(err) throw err;
		let authuid = care.uid
		;[err, care] = await to (Familyfe.FbProfile.whichPersonwithFbuid(fbuid))
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
		;[err, care] = await to (Familyfe.FbProfile.update(data, {fbuid:fbuid}))
		if(err) throw (err)
		;[err, care] = await to (Familyfe.EmailProfile.whichPerson(uidtoMod))
		if(err) throw (err)
		res.json(care)
    }

	
    async deleteFbProfile(req, res) {
		let self = this;
		let fbuid = req.params.v1
		if(!fbuid)throw ({ status:422, message:{fbuid: "Please provide fbuid to modify"}})
		let [err, care] = []
		;[err, care] = await to(self.isAuthenticated(res, req))
		if(err) throw err;
		let authuid = care.uid
		;[err, care] = await to (Familyfe.FbProfile.whichPersonwithFbuid(fbuid))
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
		;[err, care] = await to (Familyfe.FbProfile.delete({fbuid:fbuid}))

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
				;[err, care] = await to(self.patchFbProfile(req, res));
				if (err) throw err
				res.json(care)	
				break;			
			case 'DELETE':
				;[err, care] = await to(self.deleteFbProfile(req, res));
				if (err) throw err
				res.json(care)	
				break;
			
			default:
				res.status(422).json({error:{method:`${method} not supported`}});
		}
    }
    



}

module.exports = new Profile();