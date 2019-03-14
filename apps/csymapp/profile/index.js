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
	
	async addGithubProfile(req,res) {

		let err, care, dontcare
		;[err, care, dontcare] = []
		
		let redirectUrl = req.query.redirecturl || req.query.redirect
		let token = req.query.token
		let isAuthorization = (req.headers.authorization || token)?true:false
		let returned = req.params.v2 === callback?true:false

		let __promisifiedPassportAuthentication = async function () {
		    return new Promise((resolve, reject) => {
				
		        passport.authenticate('github', { session:false}, async (errinner, user, info) => {
					if(errinner) return reject(errinner)
					// if(returned) {
						// let err = err1
						if(err) {
							if(err.message === 'jwt expired' || err.message === 'invalid token' || (err.message==='jwt malformed' && isAuthorization)) throw err 
							;[err, care] = await to (Familyfe.EmailProfile.whichPersonwithEmailProfile({Email:user.emails[0].value.toLowerCase()}))
							if(err) throw (err)
							personuid = care.uid
							if (care === null) { // create user
								;[err, care] = await to (Familyfe.Person.beget({
									Name:user.displayName, 
									Gender: "Male",
									Githubs:{
										Email:user.emails[0].value.toLowerCase(), 
										gituid:user.id,
										IsActive:true,
										},
									IsActive:true,
									Families: [2]
								
								}))
								if(err) 
									if (err.msg !== 'PRIMARY must be unique') 
										return reject(err)
								// maybe account already exists...
							} else {
								if(Object.keys(care).length === 0) {
									let password = entropy.string();
									;[err, care] = await to (Familyfe.Person.beget({
										Name:user.displayName, 
										Gender: "Male",
										Emailprofiles:{
											Email:user.emails[0].value.toLowerCase(), 
											Password:password,
											Cpassword:password, 
											IsActive:false,
											},
										Githubs:{
											Email:user.emails[0].value.toLowerCase(), 
											gituid:user.id,
											IsActive:true,
											ProfilePic: user.photos[0].value
											},
										IsActive:true,
										Families: [2]
									
									}))
									if(err) throw(err)
								}
								let profile = {
									Email:user.emails[0].value.toLowerCase(), 
									gituid:user.id,
									IsActive:true,
									PersonUid:care.uid,
									ProfilePic: user.photos[0].value
								}
								personuid = care.uid;
								;[err, care] = await to (Familyfe.GitProfile.addProfile(profile))
								if(err) 
									if (err.msg !== 'PRIMARY must be unique') 
										return reject(err)
							}
							

						} else {
							// user is logged in. Add profile to this user
							let profile = {
								Email:user.emails[0].value.toLowerCase(), 
								gituid:user.id,
								IsActive:true,
								PersonUid:care.uid,
								ProfilePic: user.photos[0].value
							}
							;[err, care] = await to (Familyfe.GitProfile.addProfile(profile))
							if(err) 
								if (err.msg !== 'PRIMARY must be unique') 
									return reject(err)
						}

						// create token for this user
						// res.json(user)

						;[err, care] =  await to (Familyfe.EmailProfile.whichPerson(personuid))
						if(err)return reject(err)
						let person = care
						person = JSON.parse(JSON.stringify(person))
						let token = passport.generateToken({id:person.uid});
						person.token = token

						// log login
						;[err, care] = await to(Familyfe.GitProfile.whichGitProfile({Email: user.emails[0].value.toLowerCase()}))
						self.LogloginAttempt(req, {Success: true, "PersonUid": person.uid, "GithubGituid": care.gituid})

						if(redirectUrl) {
							(redirectUrl.indexOf('?') > -1)?redirectUrl += `&`: redirectUrl += `?`
							redirectUrl += `token=${token}`
							res.redirect(`${redirectUrl}`);
						}
						else res.json(person)
					// } 
					
					
		        })(req, res, next) 

		    })
		}
		return __promisifiedPassportAuthentication().catch((err)=>{
			// console.log(err)
			// return Promise.reject(err)
			throw(err)

		})
		res.json(care)

	}
    
    async createNew(req, res) {
		let self = this;
		let uid = req.params.v2
		let profileType = req.params.v1
		console.log(req.params)
		// let profileType = req.params.v2
		let [err, care] = []

		let isLogged ;
		let body = req.body

		;[err, care] = await to(self.isAuthenticated(res, req))
		if(err) throw err;
		// console.log(care)
		let myuid = care.uid;
		req.query.uid=uid;

		if (uid !== myuid) {
			throw ({ status:422, message:"can't set for another user"})
		}

		switch(profileType){
			case "github":
				self.addGithubProfile(req);
		}


		
		// if(err)  {
		// 	if(err.message === 'jwt expired' || err.message === 'invalid token' || err.message==='jwt malformed') throw err
		// 	// 
		// 	;[err, care] = await to (Familyfe.Person.beget({
		// 		Name: body.Name || "Anonymous User", 
		// 		Gender: body.Gender || "Male",
		// 		Emailprofiles:{
		// 			Email:body.email.toLowerCase() || '', 
		// 			Password:body.password, 
		// 			Cpassword:body.cpassword, 
		// 			IsActive:true,
		// 			},
		// 		IsActive:true,
		// 		Families: [2]
		// 	}))
		// 	if(err) throw err
		// 	let useruid = care.uid;
		// 	console.log('creating Roles in World for new usert');
		// 	;[err, care] = await to(Familyfe.Family.getMember(1, useruid))
		// 	if(err) throw (err)
		// 	let memberId = care
		// 	;[err, care] = await to(Familyfe.Family.getspecificMemberRoleforFamily(1, "nobody"))
		// 	if(err){
		// 		// console.log(err)
		// 		throw (err)
		// 	}
		// 	let tmproles = care
		// 	let roles = [];
		// 	if(err){
		// 		console.log(err)
		// 		throw (err)
		// 	}
		// 	for(let i in tmproles){
		// 		for(let j in tmproles[i].App.Roles)
		// 			roles.push(tmproles[i].App.Roles[j].RoleId)
		// 	}
		// 	;[err, care] = await to(Familyfe.Family.getspecificMemberRoleforFamily(1, "user"))
		// 	if(err){
		// 		throw (err)
		// 	}
		// 	tmproles = care
		// 	for(let i in tmproles){
		// 		for(let j in tmproles[i].App.Roles)
		// 			roles.push(tmproles[i].App.Roles[j].RoleId)
		// 	}

		// 	console.log(roles)
		// 	;[err, care] = await to(Familyfe.Family.createRolesforMember(memberId, roles))
		// 	if(err){
		// 		throw (err)
		// 	}

		// 	;[err, care] = await to (Familyfe.EmailProfile.whichPerson(useruid))
		// 	if(err) throw (err)
		// 	res.json(care)
		// } else { 

		// 	let myuid = care.uid 
		// 	let addtoUser = req.params.v1
		// 	if (addtoUser !== myuid) {
		// 		throw ({ status:422, message:"can't set for another user"})
		// 	}
		// 	if(addtoUser) {
		// 		// this user has to be yourself,,, unless of course you are an admin in csystem family...
		// 		// 
		// 		;[err, care] = await to (Familyfe.EmailProfile.addProfile({
		// 			Email:body.email.toLowerCase() || '', 
		// 			Password:body.password, 
		// 			Cpassword:body.cpassword, 
		// 			IsActive:true,
		// 			PersonUid: myuid
		// 		}))
		// 		if(err)throw err
		// 		;[err, care] = await to (Familyfe.EmailProfile.whichPerson(myuid))
		// 		if(err) throw (err)
		// 		res.json(care)
		// 	}

		// }
		
    }

    async main(req, res){
		// res.send("type")
		let self = this;
		let method = req.method;
		let [err, care] = [];

		console.log("inside ...........")
			
		switch(method) {
			// case 'POST':
			// 	;[err, care] = await to(self.createNew(req, res));
			// 	if (err) throw err
			// 	res.json(care)	
			// 	break;
			// case 'GET':
			// 	;[err, care] = await to(self.getGatewayTypes(req, res));
			// 	break;
			// case 'PATCH':
			// 	;[err, care] = await to(self.patchGatewayTypes(req, res));
			// 	if(err) throw(err)
			// 	break;
			case 'DELETE':
				;[err, care] = await to(self.createNew(req, res));
				if (err) throw err
				res.json(care)	
				break;
			default:
				res.status(422).json({error:{method:`${method} not supported`}});
		}
    }
    



}

module.exports = new Profile();