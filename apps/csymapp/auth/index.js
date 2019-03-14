'use strict'
const to = require('await-to-js').to,
	passport = require('passport'),
	csystem = require(__dirname + "/../../csystem").csystem,
	{
		sequelize
	} = require(__dirname + "/../../csystem").models,
	Familyfe = require(__dirname + '/../../../modules/node-familyfe')(sequelize),
	moment = require('moment'),
	{
		Entropy
	} = require('entropy-string'),
	entropy = new Entropy({
		total: 1e6,
		risk: 1e9
	}),
	base64url = require('base64url');

/*
 * log in
 * log out
 * link accounts
 * unlink accounts
 */

class Auth extends csystem {

	constructor() {
		super()
	}

	getIp(req) {
		let ip = (req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress)

		ip = ip.split(",")[0]
		ip = ip.split(':').slice(-1)[0];
		return ip;
	}

	async LogloginAttempt(req, data) {
		let self = this
		let ip = (req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress).split(",")[0]

		ip = ip.split(':').slice(-1)[0];
		data.FromIP = ip
		sequelize.models.LoginAttempt.create(data)

	}

	async loginUsingEmailProfile(req, res, next) {
		let self = this,
			body = req.body

		let tbody = {
				...body
			},
			ttbody = {},
			i
		for (i in tbody) ttbody[i.toLowerCase()] = tbody[i]
		if (!ttbody.email) throw ({
			"message": {
				"email": "Please provide an email address",
				status: 422
			}
		})
		if (!ttbody.password) throw ({
			"message": {
				"password": "Please provide a password",
				status: 422
			}
		})
		let __promisifiedPassportAuthentication = function () {
			return new Promise((resolve, reject) => {
				passport.authenticate('email', {
					session: false
				}, (err, user, info) => {
					if (user === false) return reject({
						"message": "No information given",
						status: 422
					});
					if (err) {
						if (err.emailid) {
							self.LogloginAttempt(req, {
								Success: false,
								"PersonUid": err.uid,
								"EmailprofileEmailuid": err.emailid
							})
						}
						return reject(err)
					}
					let emailid = user.emailid
					user = user.person
					self.LogloginAttempt(req, {
						Success: true,
						"PersonUid": user.uid,
						"EmailprofileEmailuid": emailid
					})
					res.json(user)
					//
				})(req, res, next)
			})
		}

		return __promisifiedPassportAuthentication().catch((err) => {
			// return Promise.reject(err)
			throw (err)
		})
	}

	async postedData(req, res, next) {
		let self = this;
		let body = req.body,
			path = req.params.v1;
		let [err, care] = []

		switch (path) {
			case "login":
				// if(req.body.email) {
				[err, care] = await to(self.loginUsingEmailProfile(req, res, next));
				if (err) throw err
				// }
				break;

		}
	}

	async token(req, res, next) {
		let self = this
		let [err, care, dontcare] = []
		req.headers['content-type'] = 'application/json'
		// console.log(req.headers)
		if (!req.headers.Authorization && !req.headers.authorization)
			if (req.query.token)
				req.headers['authorization'] = `bearer ${req.query.token}`
		else if (req.body.token)
			req.headers['authorization'] = `bearer ${req.body.token}`
		// console.log(req.query)
		// console.log(req.body)
		;
		[err, care] = await to(self.isAuthenticated(res, req))

		if (err) throw (err)

		let person = JSON.parse(JSON.stringify(care))
		let token = passport.generateToken({
			id: person.uid
		});
		person.token = token
		res.json(person)
	}


	async github(req, res, next) {
		let self = this
		let err, care, dontcare;
		[err, care, dontcare] = []

		let redirectUrl = req.query.redirecturl || req.query.redirect
		let token = req.query.token
		let returned = req.params.v2

		let isAuthorization = (req.headers.authorization || token) ? true : false
		req.headers['content-type'] = 'application/json'
		req.headers['authorization'] = req.headers.authorization || `bearer ${token}`;
		[err, care] = await to(self.isAuthenticated(res, req))
		let loggedInPerson;
		if (care) loggedInPerson = care.uid
		// console.log(req.headers)
		let personuid;
		let ip = self.getIp(req)
		req.query.ip = ip;

		let __promisifiedPassportAuthentication = async function () {
			return new Promise((resolve, reject) => {

				passport.authenticate('github', {
					session: false
				}, async (errinner, user, info) => {
					if (errinner) return reject(errinner)
					// if(returned) {
					// let err = err1
					if (err) {
						if (err.message === 'jwt expired' || err.message === 'invalid token' || (err.message === 'jwt malformed' && isAuthorization)) throw err;
						[err, care] = await to(Familyfe.EmailProfile.whichPersonwithEmailProfile({
							Email: user.emails[0].value.toLowerCase()
						}))
						if (err) throw (err)
						personuid = care.uid
						if (care === null) { // create user
							let password = entropy.string();;
							[err, care] = await to(Familyfe.Person.beget({
								Name: user.displayName || 'Some Anon User',
								Gender: "Male",
								Emailprofiles: {
									Email: user.emails[0].value.toLowerCase(),
									Password: password,
									Cpassword: password,
									IsActive: false,
								},
								Githubs: {
									Email: user.emails[0].value.toLowerCase(),
									gituid: user.id,
									IsActive: true,
									ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
								},
								IsActive: true,
								Families: [1]

							}))
							if (err)
								if (err.msg !== 'PRIMARY must be unique')
									return reject(err)
								// maybe account already exists...
						} else {
							if (Object.keys(care).length === 0) {
								let password = entropy.string();;
								[err, care] = await to(Familyfe.Person.beget({
									Name: user.displayName || 'Some Anon User',
									Gender: "Male",
									Emailprofiles: {
										Email: user.emails[0].value.toLowerCase(),
										Password: password,
										Cpassword: password,
										IsActive: false,
									},
									Githubs: {
										Email: user.emails[0].value.toLowerCase(),
										gituid: user.id,
										IsActive: true,
										ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
									},
									IsActive: true,
									Families: [1]

								}))
								if (err) throw (err)
							}
							let profile = {
								Email: user.emails[0].value.toLowerCase(),
								gituid: user.id,
								IsActive: true,
								PersonUid: care.uid,
								ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
							}
							personuid = care.uid;;
							[err, care] = await to(Familyfe.GitProfile.addProfile(profile))
							if (err)
								if (err.msg !== 'PRIMARY must be unique')
									return reject(err)
						}
					} else {
						// user is logged in. Add profile to this user
						personuid = care.uid
						let profile = {
							Email: user.emails[0].value.toLowerCase(),
							gituid: user.id,
							IsActive: true,
							PersonUid: care.uid,
							ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
						};
						[err, care] = await to(Familyfe.GitProfile.addProfile(profile))
						if (err)
							if (err.msg !== 'PRIMARY must be unique')
								return reject(err)
					}
					// create token for this user
					// res.json(user)

					;
					[err, care] = await to(Familyfe.EmailProfile.whichPerson(personuid))
					if (err) return reject(err)
					let person = care
					person = JSON.parse(JSON.stringify(person))
					let token = passport.generateToken({
						id: person.uid
					});
					person.token = token

					// log login
					;
					[err, care] = await to(Familyfe.GitProfile.whichGitProfile({
						Email: user.emails[0].value.toLowerCase()
					}))
					self.LogloginAttempt(req, {
						Success: true,
						"PersonUid": person.uid,
						"GithubGituid": care.gituid
					})

					if (redirectUrl) {
						(redirectUrl.indexOf('?') > -1) ? redirectUrl += `&`: redirectUrl += `?`
						redirectUrl += `token=${token}`
						res.redirect(`${redirectUrl}`);
					} else res.json(person)
					// } 


				})(req, res, next)

			})
		}
		return __promisifiedPassportAuthentication().catch((err) => {
			// console.log(err)
			// return Promise.reject(err)
			throw (err)

		})
	}

	async facebook(req, res, next) {
		let self = this
		let [err, care, dontcare] = []

		let state = req.query.state || ''
		let tmp = base64url.decode(state)
		try {
			tmp = JSON.parse(tmp)
		} catch (error) {
			tmp = {}
		}

		let returned = req.params.v2
		let redirecturl1; // = req.query.redirecturl || req.query.redirect || tmp.redirecturl || tmp.redirect 
		let token; // = req.query.token || tmp.token
		if (returned) {
			redirecturl1 = tmp.redirecturl || tmp.redirect
			token = tmp.token
		} else {
			redirecturl1 = req.query.redirecturl || req.query.redirect
			token = req.query.token
		}
		let isAuthorization = (req.headers.authorization || token) ? true : false
		req.headers['content-type'] = 'application/json'
		req.headers['authorization'] = `bearer ${token}`

		;
		[err, care] = await to(self.isAuthenticated(res, req))

		let personuid;

		// let token1 = req.query.token
		let token1 = token
		// let redirecturl1 = req.query.redirect
		let extra = {};

		if (token1) {
			extra.token = token1
		}
		if (redirecturl1) {
			extra.redirecturl = redirecturl1
		}
		state = base64url.encode(JSON.stringify(extra))

		let __promisifiedPassportAuthentication = async function () {
			return new Promise((resolve, reject) => {
				passport.authenticate('facebook', {
					session: false,
					state: state,
					scope: ['email']
				}, async (errinner, user, info) => {
					if (errinner) return reject(errinner)
					// if(returned) {
					// let err = err1
					if (err) {
						if (err.message === 'jwt expired' || err.message === 'invalid token' || (err.message === 'jwt malformed' && isAuthorization)) throw err;
						[err, care] = await to(Familyfe.EmailProfile.whichPersonwithEmailProfile({
							Email: user.emails[0].value.toLowerCase()
						}))
						if (err) throw (err)
						personuid = care.uid
						if (care === null) { // create user
							let password = entropy.string();;
							[err, care] = await to(Familyfe.Person.beget({
								Name: user.displayName || 'Some Anon User',
								Gender: "Male",
								Emailprofiles: {
									Email: user.emails[0].value.toLowerCase(),
									Password: password,
									Cpassword: password,
									IsActive: false,
								},
								Facebooks: {
									Email: user.emails[0].value.toLowerCase(),
									fbuid: user.id,
									IsActive: true,
									ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
								},
								IsActive: true,
								Families: [1]

							}))
							if (err)
								if (err.msg !== 'PRIMARY must be unique')
									return reject(err)
								// maybe account already exists...
						} else {
							if (Object.keys(care).length === 0) {
								let password = entropy.string();;
								[err, care] = await to(Familyfe.Person.beget({
									Name: user.displayName || 'Some Anon User',
									Gender: "Male",
									Emailprofiles: {
										Email: user.emails[0].value.toLowerCase(),
										Password: password,
										Cpassword: password,
										IsActive: false,
									},
									Facebooks: {
										Email: user.emails[0].value.toLowerCase(),
										fbuid: user.id,
										IsActive: true,
										ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
									},
									IsActive: true,
									Families: [1]

								}))
								if (err) throw (err)
							}
							let profile = {
								Email: user.emails[0].value.toLowerCase(),
								fbuid: user.id,
								IsActive: true,
								PersonUid: care.uid,
								ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
							}
							personuid = care.uid;;
							[err, care] = await to(Familyfe.FbProfile.addProfile(profile))
							if (err)
								if (err.msg !== 'PRIMARY must be unique')
									return reject(err)
						}


					} else {
						// user is logged in. Add profile to this user
						personuid = care.uid
						let profile = {
							Email: user.emails[0].value.toLowerCase(),
							fbuid: user.id,
							IsActive: true,
							PersonUid: care.uid,
							ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
						};
						[err, care] = await to(Familyfe.FbProfile.addProfile(profile))
						// console.log(care)
						if (err)
							if (err.msg !== 'PRIMARY must be unique')
								return reject(err)
					}

					// create token for this user
					// res.json(user)

					;
					[err, care] = await to(Familyfe.EmailProfile.whichPerson(personuid))
					if (err) return reject(err)
					let person = care
					person = JSON.parse(JSON.stringify(person))
					let token = passport.generateToken({
						id: person.uid
					});
					person.token = token

					// log login
					;
					[err, care] = await to(Familyfe.FbProfile.whichFbProfile({
						Email: user.emails[0].value.toLowerCase()
					}))
					self.LogloginAttempt(req, {
						Success: true,
						"PersonUid": person.uid,
						"FacebookFbuid": care.fbuid
					})


					state = req.query.state || ''
					let tmp = base64url.decode(state)
					// console.log(tmp)
					try {
						tmp = JSON.parse(tmp)
					} catch (error) {
						tmp = {}
					}
					let redirectUrl = tmp.redirecturl
					if (redirectUrl) {
						(redirectUrl.indexOf('?') > -1) ? redirectUrl += `&`: redirectUrl += `?`
						redirectUrl += `token=${token}`
						res.redirect(`${redirectUrl}`);
					} else res.json(person)


				})(req, res, next)

			})
		}

		return __promisifiedPassportAuthentication().catch((err) => {
			// console.log(err)
			// return Promise.reject(err)
			throw (err)

		})

	}
	async google(req, res, next) {
		let self = this
		let [err, care, dontcare] = []

		let state = req.query.state || ''
		let tmp = base64url.decode(state)
		try {
			tmp = JSON.parse(tmp)
		} catch (error) {
			tmp = {}
		}

		let returned = req.params.v2
		let redirecturl1; // = req.query.redirecturl || req.query.redirect || tmp.redirecturl || tmp.redirect 
		let token; // = req.query.token || tmp.token
		if (returned) {
			redirecturl1 = tmp.redirecturl || tmp.redirect
			token = tmp.token
		} else {
			redirecturl1 = req.query.redirecturl || req.query.redirect
			token = req.query.token
		}
		let isAuthorization = (req.headers.authorization || token) ? true : false
		req.headers['content-type'] = 'application/json'
		req.headers['authorization'] = `bearer ${token}`;
		[err, care] = await to(self.isAuthenticated(res, req))


		let personuid;

		let token1 = token
		let extra = {};

		if (token1) {
			extra.token = token1
		}
		if (redirecturl1) {
			extra.redirecturl = redirecturl1
		}
		state = base64url.encode(JSON.stringify(extra))

		let __promisifiedPassportAuthentication = async function () {
			return new Promise((resolve, reject) => {
				passport.authenticate('google', {
					session: false,
					scope: 'https://www.googleapis.com/auth/userinfo.email',
					state: state
				}, async (errinner, user, info) => {
					if (errinner) return reject(errinner)
					// if(returned) {
					// let err = err1
					if (err) {
						if (err.message === 'jwt expired' || err.message === 'invalid token' || (err.message === 'jwt malformed' && isAuthorization)) throw err;
						[err, care] = await to(Familyfe.EmailProfile.whichPersonwithEmailProfile({
							Email: user.emails[0].value.toLowerCase()
						}))
						if (err) throw (err)
						personuid = care.uid
						if (care === null) { // create user
							let password = entropy.string();;
							[err, care] = await to(Familyfe.Person.beget({
								Name: user.displayName || 'Some Anon User',
								Gender: "Male",
								Emailprofiles: {
									Email: user.emails[0].value.toLowerCase(),
									Password: password,
									Cpassword: password,
									IsActive: false,
								},
								Googles: {
									Email: user.emails[0].value.toLowerCase(),
									gituid: user.id,
									IsActive: true,
									ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
								},
								IsActive: true,
								Families: [1]

							}))
							if (err)
								if (err.msg !== 'PRIMARY must be unique')
									return reject(err)
								// maybe account already exists...
						} else {
							if (Object.keys(care).length === 0) {
								let password = entropy.string();;
								[err, care] = await to(Familyfe.Person.beget({
									Name: user.displayName || 'Some Anon User',
									Gender: "Male",
									Emailprofiles: {
										Email: user.emails[0].value.toLowerCase(),
										Password: password,
										Cpassword: password,
										IsActive: false,
									},
									Googles: {
										Email: user.emails[0].value.toLowerCase(),
										guid: user.id,
										IsActive: true,
										ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
									},
									IsActive: true,
									Families: [1]

								}))
								if (err) throw (err)
							}
							let profile = {
								Email: user.emails[0].value.toLowerCase(),
								guid: user.id,
								IsActive: true,
								PersonUid: care.uid,
								ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
							}
							personuid = care.uid;;
							[err, care] = await to(Familyfe.GoogleProfile.addProfile(profile))
							if (err)
								if (err.msg !== 'PRIMARY must be unique')
									return reject(err)
						}


					} else {
						// user is logged in. Add profile to this user
						personuid = care.uid
						let profile = {
							Email: user.emails[0].value.toLowerCase(),
							guid: user.id,
							IsActive: true,
							PersonUid: care.uid,
							ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
						};
						[err, care] = await to(Familyfe.GoogleProfile.addProfile(profile))
						// console.log(care)
						if (err)
							if (err.msg !== 'PRIMARY must be unique')
								return reject(err)
					}

					// create token for this user
					// res.json(user)

					;
					[err, care] = await to(Familyfe.EmailProfile.whichPerson(personuid))
					if (err) return reject(err)
					let person = care
					person = JSON.parse(JSON.stringify(person))
					let token = passport.generateToken({
						id: person.uid
					});
					person.token = token

					// log login
					;
					[err, care] = await to(Familyfe.GoogleProfile.whichGoogleProfile({
						Email: user.emails[0].value.toLowerCase()
					}))
					self.LogloginAttempt(req, {
						Success: true,
						"PersonUid": person.uid,
						"GithubGituid": care.guid
					})


					state = req.query.state || ''
					let tmp = base64url.decode(state)
					// console.log(tmp)
					try {
						tmp = JSON.parse(tmp)
					} catch (error) {
						tmp = {}
					}
					let redirectUrl = tmp.redirecturl
					if (redirectUrl) {
						(redirectUrl.indexOf('?') > -1) ? redirectUrl += `&`: redirectUrl += `?`
						redirectUrl += `token=${token}`
						res.redirect(`${redirectUrl}`);
					} else res.json(person)


				})(req, res, next)

			})
		}

		return __promisifiedPassportAuthentication().catch((err) => {
			// console.log(err)
			// return Promise.reject(err)
			throw (err)

		})

	}


	async linkedin(req, res, next) {
		let self = this
		let [err, care, dontcare] = []

		let state = req.query.state || ''
		let tmp = base64url.decode(state)
		try {
			tmp = JSON.parse(tmp)
		} catch (error) {
			tmp = {}
		}

		let returned = req.params.v2
		let redirecturl1; // = req.query.redirecturl || req.query.redirect || tmp.redirecturl || tmp.redirect 
		let token; // = req.query.token || tmp.token
		if (returned) {
			redirecturl1 = tmp.redirecturl || tmp.redirect
			token = tmp.token
		} else {
			redirecturl1 = req.query.redirecturl || req.query.redirect
			token = req.query.token
		}
		let isAuthorization = (req.headers.authorization || token) ? true : false
		req.headers['content-type'] = 'application/json'
		req.headers['authorization'] = `bearer ${token}`;
		[err, care] = await to(self.isAuthenticated(res, req))


		let personuid;

		let token1 = token
		let extra = {};

		if (token1) {
			extra.token = token1
		}
		if (redirecturl1) {
			extra.redirecturl = redirecturl1
		}
		state = base64url.encode(JSON.stringify(extra))

		let __promisifiedPassportAuthentication = async function () {
			return new Promise((resolve, reject) => {
				passport.authenticate('linkedin', {
					session: false,
					state: state
				}, async (errinner, user, info) => {
					if (errinner) return reject(errinner)
					// if(returned) {
					// let err = err1
					if (err) {
						if (err.message === 'jwt expired' || err.message === 'invalid token' || (err.message === 'jwt malformed' && isAuthorization)) throw err;
						[err, care] = await to(Familyfe.EmailProfile.whichPersonwithEmailProfile({
							Email: user.emails[0].value.toLowerCase()
						}))
						if (err) throw (err)
						personuid = care.uid
						if (care === null) { // create user
							let password = entropy.string();;
							[err, care] = await to(Familyfe.Person.beget({
								Name: user.displayName || 'Some Anon User',
								Gender: "Male",
								Emailprofiles: {
									Email: user.emails[0].value.toLowerCase(),
									Password: password,
									Cpassword: password,
									IsActive: false,
								},
								Linkedins: {
									Email: user.emails[0].value.toLowerCase(),
									luid: user.id,
									IsActive: true,
									ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
								},
								IsActive: true,
								Families: [1]

							}))
							if (err)
								if (err.msg !== 'PRIMARY must be unique')
									return reject(err)
								// maybe account already exists...
						} else {
							if (Object.keys(care).length === 0) {
								let password = entropy.string();;
								[err, care] = await to(Familyfe.Person.beget({
									Name: user.displayName || 'Some Anon User',
									Gender: "Male",
									Emailprofiles: {
										Email: user.emails[0].value.toLowerCase(),
										Password: password,
										Cpassword: password,
										IsActive: false,
									},
									Linkedins: {
										Email: user.emails[0].value.toLowerCase(),
										luid: user.id,
										IsActive: true,
										ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
									},
									IsActive: true,
									Families: [1]

								}))
								if (err) throw (err)
							}
							let profile = {
								Email: user.emails[0].value.toLowerCase(),
								luid: user.id,
								IsActive: true,
								PersonUid: care.uid,
								ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
								//
							}
							personuid = care.uid;;
							[err, care] = await to(Familyfe.LinkedinProfile.addProfile(profile))
							if (err)
								if (err.msg !== 'PRIMARY must be unique')
									return reject(err)
						}


					} else {
						// user is logged in. Add profile to this user
						personuid = care.uid
						let profile = {
							Email: user.emails[0].value.toLowerCase(),
							luid: user.id,
							IsActive: true,
							PersonUid: care.uid,
							ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
						};
						[err, care] = await to(Familyfe.LinkedinProfile.addProfile(profile))
						// console.log(care)
						if (err)
							if (err.msg !== 'PRIMARY must be unique')
								return reject(err)
					}

					// create token for this user
					// res.json(user)

					;
					[err, care] = await to(Familyfe.EmailProfile.whichPerson(personuid))
					if (err) return reject(err)
					let person = care
					person = JSON.parse(JSON.stringify(person))
					let token = passport.generateToken({
						id: person.uid
					});
					person.token = token

					// log login
					;
					[err, care] = await to(Familyfe.LinkedinProfile.whichLinkedinProfile({
						Email: user.emails[0].value.toLowerCase()
					}))
					self.LogloginAttempt(req, {
						Success: true,
						"PersonUid": person.uid,
						"LinkedinLuid": care.luid
					})


					state = req.query.state || ''
					let tmp = base64url.decode(state)
					// console.log(tmp)
					try {
						tmp = JSON.parse(tmp)
					} catch (error) {
						tmp = {}
					}
					let redirectUrl = tmp.redirecturl
					if (redirectUrl) {
						(redirectUrl.indexOf('?') > -1) ? redirectUrl += `&`: redirectUrl += `?`
						redirectUrl += `token=${token}`
						res.redirect(`${redirectUrl}`);
					} else res.json(person)


				})(req, res, next)

			})
		}

		return __promisifiedPassportAuthentication().catch((err) => {
			// console.log(err)
			// return Promise.reject(err)
			throw (err)

		})

	}


	async twitter(req, res, next) {
		let self = this
		let [err, care, dontcare] = []

		let state = req.query.state || ''
		let tmp = base64url.decode(state)
		try {
			tmp = JSON.parse(tmp)
		} catch (error) {
			tmp = {}
		}

		// let returned = req.params.v2
		// let redirecturl1;// = req.query.redirecturl || req.query.redirect || tmp.redirecturl || tmp.redirect 
		// let token;// = req.query.token || tmp.token
		// if(returned) {
		// 	redirecturl1 = tmp.redirecturl || tmp.redirect 
		// 	token = tmp.token
		// } else {
		// 	redirecturl1 = req.query.redirecturl || req.query.redirect
		// 	token =  req.query.token
		// }

		let redirecturl1 = req.query.redirecturl || req.query.redirect
		let token = req.query.token
		let returned = req.params.v2

		let isAuthorization = (req.headers.authorization || token) ? true : false
		req.headers['content-type'] = 'application/json'
		req.headers['authorization'] = `bearer ${token}`;
		[err, care] = await to(self.isAuthenticated(res, req))


		let personuid;

		let token1 = token
		let extra = {};

		if (token1) {
			extra.token = token1
		}
		if (redirecturl1) {
			extra.redirecturl = redirecturl1
		}
		state = base64url.encode(JSON.stringify(extra))

		let __promisifiedPassportAuthentication = async function () {
			return new Promise((resolve, reject) => {
				passport.authenticate('twitter', {
					session: false,
					state: state
				}, async (errinner, user, info) => {
					if (errinner) return reject(errinner)
					// if(returned) {
					if (err) {
						if (err.message === 'jwt expired' || err.message === 'invalid token' || (err.message === 'jwt malformed' && isAuthorization)) throw err;
						[err, care] = await to(Familyfe.EmailProfile.whichPersonwithEmailProfile({
							Email: user.emails[0].value.toLowerCase()
						}))
						if (err) throw (err)
						personuid = care.uid
						if (care === null) { // create user
							let password = entropy.string();;
							[err, care] = await to(Familyfe.Person.beget({
								Name: user.displayName || 'Some Anon User',
								Gender: "Male",
								Emailprofiles: {
									Email: user.emails[0].value.toLowerCase(),
									Password: password,
									Cpassword: password,
									IsActive: false,
								},
								Twitters: {
									Email: user.emails[0].value.toLowerCase(),
									tuid: user.id,
									IsActive: true,
									ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
								},
								IsActive: true,
								Families: [1]

							}))
							if (err)
								if (err.msg !== 'PRIMARY must be unique')
									return reject(err)
								// maybe account already exists...
						} else {
							if (Object.keys(care).length === 0) {
								let password = entropy.string();;
								[err, care] = await to(Familyfe.Person.beget({
									Name: user.displayName || 'Some Anon User',
									Gender: "Male",
									Emailprofiles: {
										Email: user.emails[0].value.toLowerCase(),
										Password: password,
										Cpassword: password,
										IsActive: false,
									},
									Twitters: {
										Email: user.emails[0].value.toLowerCase(),
										tuid: user.id,
										IsActive: true,
										ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
									},
									IsActive: true,
									Families: [1]

								}))
								if (err) throw (err)
							}
							let profile = {
								Email: user.emails[0].value.toLowerCase(),
								tuid: user.id,
								IsActive: true,
								PersonUid: care.uid,
								ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
							}
							personuid = care.uid;;
							[err, care] = await to(Familyfe.TwitterProfile.addProfile(profile))
							if (err)
								if (err.msg !== 'PRIMARY must be unique')
									return reject(err)
						}


					} else {
						// user is logged in. Add profile to this user
						personuid = care.uid
						let profile = {
							Email: user.emails[0].value.toLowerCase(),
							tuid: user.id,
							IsActive: true,
							PersonUid: care.uid,
							ProfilePic: user.photos ? user.photos[0] ? user.photos[0].value : '' : ''
						};
						[err, care] = await to(Familyfe.TwitterProfile.addProfile(profile))
						// console.log(care)
						if (err)
							if (err.msg !== 'PRIMARY must be unique')
								return reject(err)
					}

					// create token for this user
					// res.json(user)

					;
					[err, care] = await to(Familyfe.EmailProfile.whichPerson(personuid))
					if (err) return reject(err)
					let person = care
					person = JSON.parse(JSON.stringify(person))
					let token = passport.generateToken({
						id: person.uid
					});
					person.token = token

					// log login
					;
					[err, care] = await to(Familyfe.TwitterProfile.whichTwitterProfile({
						Email: user.emails[0].value.toLowerCase()
					}))
					self.LogloginAttempt(req, {
						Success: true,
						"PersonUid": person.uid,
						"TwitterTuid": care.tuid
					})


					// state = req.query.state || ''
					// let tmp = base64url.decode(state)
					// // console.log(tmp)
					// try{
					// 	tmp = JSON.parse(tmp)
					// }catch(error){
					// 	tmp = {}
					// }
					// let redirectUrl = tmp.redirecturl
					// if(redirectUrl) {
					// 	(redirectUrl.indexOf('?') > -1)?redirectUrl += `&`: redirectUrl += `?`
					// 	redirectUrl += `token=${token}`
					// 	res.redirect(`${redirectUrl}`);
					// }
					// else res.json(person)
					// try{
					let redirectUrl = redirecturl1
					if (redirectUrl) {
						(redirectUrl.indexOf('?') > -1) ? redirectUrl += `&`: redirectUrl += `?`
						redirectUrl += `token=${token}`
						res.redirect(`${redirectUrl}`);
					} else res.json(person)
					// }catch(error){console.log(error)}


				})(req, res, next)

			})
		}

		return __promisifiedPassportAuthentication().catch((err) => {
			// console.log(err)
			// return Promise.reject(err)
			throw (err)

		})

	}


	async getRq(req, res, next) {
		let self = this;
		let body = req.body,
			path = req.params.v1;
		let [err, care] = []

		switch (path) {
			case "github":
				[err, care] = await to(self.github(req, res, next));
				if (err) throw (err)
				break;
			case "google":
				[err, care] = await to(self.google(req, res, next));
				if (err) throw (err)
				break;
			case "facebook":
				[err, care] = await to(self.facebook(req, res, next));
				if (err) throw (err)
				break;
			case "twitter":
				[err, care] = await to(self.twitter(req, res, next));
				if (err) throw (err)
				break;
			case "linkedin":
				[err, care] = await to(self.linkedin(req, res, next));
				if (err) throw (err)
				break;

			case "token":
				[err, care] = await to(self.token(req, res, next));
				if (err) throw (err)
				break;
		}
	}

	async main(req, res, next) {
		let self = this;
		let method = req.method;
		let [err, care] = [];

		let ip = (req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress).split(",")[0].split(':').slice(-1)[0];

		// // console.log(method)
		switch (method) {
			case 'POST':
				;
				[err, care] = await to(self.postedData(req, res, next));
				// console.log(err)
				if (err) throw err
				res.json(care)
				break;
			case 'GET':
				;
				[err, care] = await to(self.getRq(req, res, next));
				if (err) throw err
				res.json(care)
				break;
			default:
				res.status(422).json({
					error: {
						method: `${method} not supported`
					}
				});
		}
	}




}

module.exports = new Auth();