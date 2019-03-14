'use strict'
const to = require('await-to-js').to
,passport = require('passport')
,csystem = require(__dirname+"/../../csystem").csystem
,{sequelize} = require(__dirname+"/../../csystem").models
,Familyfe = require(__dirname+'/../../../modules/node-familyfe')(sequelize)
,moment = require('moment')
, { Entropy, charset8 } = require('entropy-string')
, entropy = new Entropy({ total: 1e6, risk: 1e9 })
,isphone = require('phone')
// ,moment = require('moment')

class Profile extends csystem{

	constructor() {
		super()
	}
    
    async patchTelephoneProfile(req, res) {
		let self = this;
		let phoneid = req.params.v1
		,body = req.body
		body.Code = body.code || body.Code
		body.code = body.Code
		let [err, care] = []

		;[err, care] = await to(self.isAuthenticated(res, req))
		if(err) throw err;
		let authuid = care.uid
		if(!phoneid)throw ({ status:422, message:{phoneid: "Please provide phoneid to modify"}})
		;[err, care] = await to (Familyfe.TelephoneProfile.whichPersonwithTelephoneProfile({puid:phoneid}))
		if(care === null) throw ({ status:422, message:"can't set for another user"})
		let uidtoMod = care.uid;
		// if(authuid !== uidtoMod)throw ({ status:422, message:"can't set for another user"})

		let [_err,csyAdmin] = [];
		if (authuid !== uidtoMod) {
			// throw ({ status:422, message:"can't set for another user"})
			[_err,csyAdmin] = await to(Familyfe.Family.memberHasRoleinFamilyforApp({AppName:"csystem"}, "root", 1, authuid))
			if(_err)throw ({ status:422, message:{Permission: "You are not allowed to modify that account"}})

			if(!csyAdmin)
				throw ({ status:422, message:{Permission: "You are not allowed to modify that account"}})
		}

		let data;
		// console.log(body)
		if(body.IsActive === true) {
			if(!csyAdmin){
				if(!body.Code)throw ({ status:422, message:{code: "Please provide code to activate"}})
				;[err, care] = await to (Familyfe.TelephoneProfile.whichTelephoneProfilewithCode({puid:phoneid},body.Code))
				if(care === null || !Object.keys(care).length) throw ({ status:422, message:{code:"Wrong Code"}})
			}
		}
		
		data = JSON.parse(JSON.stringify(req.body))

		let tbody = {... body},ttbody = {},i
		for(i in tbody)ttbody[i.toLowerCase()] = tbody[i]
		data = {}
		// if(ttbody.IsActive)data["IsActive"] = ttbody.IsActive
		if(ttbody.isactive !== undefined)data["IsActive"] = ttbody.isactive
		if(ttbody.pin)data["Pin"] = ttbody.pin
		if(ttbody.cpin)data["Cpin"] = ttbody.pin

		;[err, care] = await to (Familyfe.TelephoneProfile.update(data, {puid:phoneid}))
		await to (Familyfe.TelephoneProfile.deleteCode(body.Code))
		if(err) throw (err)
		;[err, care] = await to (Familyfe.TelephoneProfile.whichPerson(uidtoMod))
		
		if(err) throw (err)
		res.json(care)
    }

	
    async deleteTelephoneProfile(req, res) {
		let self = this;
		let puid = req.params.v1
		if(!puid)throw ({ status:422, message:{phoneid: "Please provide phoneid to modify"}})
		
		let [err, care] = []
		;[err, care] = await to(self.isAuthenticated(res, req))
		if(err) throw err;
		let authuid = care.uid
		;[err, care] = await to (Familyfe.TelephoneProfile.whichPersonwithTelephoneProfile({puid:puid}))
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
		;[err, care] = await to (Familyfe.TelephoneProfile.delete({puid:puid}))

		;[err, care] = await to (Familyfe.TelephoneProfile.whichPerson(uidtoMod))
		// console.log(care)
		if(err) throw (err)
		res.json(care)
    }
    async getTelephoneProfile(req, res) {
		let self = this;
		let phone = req.params.v1
		phone = isphone(phone)
		
		let [err, care] = []
        ;[err, care] = await to (Familyfe.TelephoneProfile.whichTelephoneProfile({Telephone:phone}))
        if(err) throw err;
        if(care === null) throw ({ status:422, message:{phone: "Account does not exist"}})
		if(Object.keys(care).length === 0) throw ({ status:422, message:{phone: "Account does not exist"}})
		let puid = care.puid;

        entropy.use(charset8)
        let Code = entropy.string().substring(0, 6);

        ;[err, care] = await to (Familyfe.TelephoneProfile.createTelephoneCode({TelephonePuid:puid, Code}))
        if(err) throw err;
        
		return {puid}
	}
	
	
    async PostTelephoneProfile(req, res) {
		let self = this;
		let body = req.body
		let [err, care] = []

		body.type = body.type || 'register'
		// console.log(body)

		body.phone = isphone(body.phone)[0]

		let tbody = {... body},ttbody = {}, i
		for(i in tbody)ttbody[i.toLowerCase()] = tbody[i]

		if(body.type === 'login') {
			if(!ttbody.phone)throw ({ status:422, message:{code: "Please provide a phone number"}})
			if(!ttbody.pin)throw ({ status:422, message:{code: "Please provide your pin"}})
			if(!ttbody.code)throw ({ status:422, message:{code: "Please provide also the code received"}})
			;[err, care] = await to (Familyfe.TelephoneProfile.whichTelephoneProfilewithCode({Telephone:body.phone}, body.code))
			if(err) throw { message: {code:'Wrong code.'}}
			if(!Object.keys(care).length) throw { message: {code:'Wrong code.'}}
			;[err, care] = await to(care.comparePin(body.pin))
			if(err) throw { message: {pin:'Wrong pin.'}}
			if(care === false) throw { message: {pin:'Wrong pin.'}}

			;[err, care] = await to (Familyfe.TelephoneProfile.whichTelephoneProfile({Telephone:body.phone}))

			if(!care.IsActive) {
				// activate
				await to (Familyfe.TelephoneProfile.update({IsActive:true}, {Telephone:body.phone}))
			}
			// console.log(care)
			;[err, care] =  await to (Familyfe.TelephoneProfile.whichPersonfromTelephone({Telephone:body.phone}))
			if(err) throw err
			;[err, care] =  await to (Familyfe.EmailProfile.whichPerson(care.uid))
			let person = care
			person = JSON.parse(JSON.stringify(person))

			let token = passport.generateToken({id:person.uid});
			person.token = token
			await to (Familyfe.TelephoneProfile.deleteCode(body.code))
			res.json(person)
		}
		
		else {  // get code
			if(!ttbody.phone)throw ({ status:422, message:{phone: "Please provide a phone number"}})
			// if(!ttbody.pin)throw ({ status:422, message:{pin: "Please provide a pin"}})
			
			;[err, care] = await to (Familyfe.TelephoneProfile.whichTelephoneProfile({Telephone:body.phone}))
			if(err) throw err;
			if(care === null) throw ({ status:422, message:{phone: "Account does not exist"}})
			if(Object.keys(care).length === 0) throw ({ status:422, message:{phone: "Account does not exist"}})
			let puid = care.puid;

			entropy.use(charset8)
			let Code = entropy.string().substring(0, 6);

			;[err, care] = await to (Familyfe.TelephoneProfile.createTelephoneCode({TelephonePuid:puid, Code}))
			if(err) throw err;
			
			// 
			res.json({puid})
		}
	}

    async main(req, res){
		let self = this;
		let method = req.method;
		let [err, care] = [];
			
		switch(method) {
            case 'GET': 
                ;[err, care] = await to(self.getTelephoneProfile(req, res));
                if (err) throw err
                res.json(care)	
                break;		
                break;
			case 'PATCH':
				;[err, care] = await to(self.patchTelephoneProfile(req, res));
				if (err) throw err
				res.json(care)	
				break;	
					
			case 'POST':
				;[err, care] = await to(self.PostTelephoneProfile(req, res));
				if (err) throw err
				res.json(care)	
				break;	
					
			case 'DELETE':
				;[err, care] = await to(self.deleteTelephoneProfile(req, res));
				if (err) throw err
				res.json(care)	
				break;
			
			default:
				res.status(422).json({error:{method:`${method} not supported`}});
		}
    }
    



}

module.exports = new Profile();