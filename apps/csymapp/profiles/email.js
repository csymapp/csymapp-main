'use strict'
const to = require('await-to-js').to
,passport = require('passport')
,csystem = require(__dirname+"/../../csystem").csystem
,{sequelize} = require(__dirname+"/../../csystem").models
,Familyfe = require(__dirname+'/../../../modules/node-familyfe')(sequelize)
,config = require(__dirname+'/../../../config/config.system')
,moment = require('moment')
, { Entropy, charset8 } = require('entropy-string')
, entropy = new Entropy({ total: 1e6, risk: 1e9 })

class Profile extends csystem{

	constructor() {
		super()
	}
    
    async patchEmailProfile(req, res) {
		let self = this;
		let emailid = req.params.v1,
		body = req.body
		
		let [err, care] = []
		;[err, care] = await to(self.isAuthenticated(res, req))
		if(err) throw err;
		let authuid = care.uid

		if(!emailid)throw ({ status:422, message:{emailid: "Please provide emailid to modify"}})

		;[err, care] = await to (Familyfe.EmailProfile.whichPersonwithEmailid(emailid))
		if(care === null) throw ({ status:422, message:"can't set for another user"})
		let uidtoMod = care.uid;
		if(authuid !== uidtoMod){
			let [_err,csyAdmin] = await to(Familyfe.Family.memberHasRoleinFamilyforApp({AppName:"csystem"}, "root", 1, authuid))
			if(_err)throw ({ status:422, message:{Permission: "You are not allowed to modify that account"}})

			if(!csyAdmin)
				throw ({ status:422, message:{Permission: "You are not allowed to modify that account"}})
		}
		
		let data = JSON.parse(JSON.stringify(req.body))
		// let tdata = {}
		// if(data.IsActive)tdata.IsActive = data.IsActive
		let tbody = {... body},ttbody = {},i
		for(i in tbody)ttbody[i.toLowerCase()] = tbody[i]
		data = {}
		if(ttbody.isactive !== undefined)data["IsActive"] = ttbody.isactive
		if(ttbody.password)data["Password"] = ttbody.password
		if(ttbody.cpassword)data["Cpassword"] = ttbody.cpassword
		;[err, care] = await to (Familyfe.EmailProfile.update(data, {emailuid:emailid}))
		if(err) throw (err)
		;[err, care] = await to (Familyfe.EmailProfile.whichPerson(uidtoMod))
		if(err) throw (err)
		res.json(care)
    }

	
    async deleteEmailProfile(req, res) {
		let self = this;
		let emailid = req.params.v1
		if(!emailid)throw ({ status:422, message:{emailid: "Please provide emailid to modify"}})

		let [err, care] = []
		;[err, care] = await to(self.isAuthenticated(res, req))
		if(err) throw err;
		let authuid = care.uid
		;[err, care] = await to (Familyfe.EmailProfile.whichPersonwithEmailid(emailid))
		// if(care === null) throw ({ status:422, message:"can't set for another user"})
		let uidtoMod = care.uid;
		
		// if(authuid !== uidtoMod)throw ({ status:422, message:"can't set for another user"})
		let [_err,csyAdmin] = [];
		if (authuid !== uidtoMod) {
			[_err,csyAdmin] = await to(Familyfe.Family.memberHasRoleinFamilyforApp({AppName:"csystem"}, "root", 1, authuid))
			if(_err)throw ({ status:422, message:{Permission: "You are not allowed to modify that account"}})

			if(!csyAdmin)
				throw ({ status:422, message:{Permission: "You are not allowed to modify that account"}})
		}

		let data = JSON.parse(JSON.stringify(req.body))
		;[err, care] = await to (Familyfe.EmailProfile.delete({emailuid:emailid}))

		;[err, care] = await to (Familyfe.EmailProfile.whichPerson(uidtoMod))
		// console.log(care)
		if(err) throw (err)
		res.json(care)
    }

	
    async getEmailProfile(req, res) {
	// 	// either for generating Code or activating 
		let code = req.params.v1
		let [err, care] = [];
	// 	// data = JSON.parse(JSON.stringify(req.body))
		if(code) {
			;[err, care] = await to (Familyfe.EmailProfile.whichEmailProfileforCode(code))
			console.log(care)
			if(!(Object.keys(care).length))throw ({ status:422, message:{code: "You have provided an invalid code"}})
			if(err) throw (err)
			let emailid = care.	emailuid
			let data = {
				IsActive: true,
			}
			;[err, care] = await to (Familyfe.EmailProfile.update(data, {emailuid:emailid}));
			await to (Familyfe.EmailProfile.deleteCode(code))
			if(req.query.redirect) {
				res.redirect(`${req.query.redirect}`);
			} else {
				res.json({success:"activated. But we don't know where to redirect you to..."})
			}
		} else {
			let emailid = req.body.emailid
			if(!emailid)throw ({ status:422, message:{emailid: "Please provide either code or emailid to modify"}})
		
			entropy.use(charset8)
			let Code = entropy.string().substring(0, 8);
			;[err, care] = await to (Familyfe.EmailProfile.whichEmailProfile({emailuid:emailid}))
			if(err) throw err;
			if(care === null) throw ({ status:422, message:"User does not exist"})
			let euid = care.emailuid
			, Email = care.Email
			, activationPath = config.get('/APPROOT') + '/csymapp/emailprofile/' + Code 
			, redirect = req.query.redirecturl || req.query.redirect || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress
			activationPath += '?redirect=' + redirect
			;[err, care] = await to ( Familyfe.EmailProfile.emailActivation({Code,EmailprofileEmailuid:euid}, Email, activationPath))
			
			return {euid}
		}
    }

	


    async main(req, res){
		let self = this;
		let method = req.method;
		let [err, care] = [];
			
		switch(method) {
			case 'PATCH':
				;[err, care] = await to(self.patchEmailProfile(req, res));
				if (err) throw err
				res.json(care)	
				break;			
			case 'DELETE':
				;[err, care] = await to(self.deleteEmailProfile(req, res));
				if (err) throw err
				res.json(care)	
				break;
			case 'GET':
				;[err, care] = await to(self.getEmailProfile(req, res));
				if (err) throw err
				res.json(care)	
				break;
			
			
			default:
				res.status(422).json({error:{method:`${method} not supported`}});
		}
    }
    



}

module.exports = new Profile();