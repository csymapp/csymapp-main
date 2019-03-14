/*
 *
 * Node Implementation of Familyfe @ https://github.com/csybersystems/familyfe
 * Author: 	Brian Onang'o
 * Date: 	October 2017
 * Company: Csyber Systems
 * Website: https://csybersytems.cseco.co.ke 
 * Github: 	https://github.com/csybersystems/node-familyfe
 */

'use strict'
// const Async = require('async');
// const MongoModels = require('mongo-models');
const validator = require('validator');
const Objlen = require('object-length');
const sentenceCase = require('sentence-case');
const Bcrypt = require('bcrypt');
const to = require('await-to-js').to;
const randomstring = require('randomstring');
const async = require('async'), moment = require('moment'), config = require(__dirname + '/../../config/config.system'), isphone = require('phone'), mailer = require(__dirname + '/../../apps/csystem/mailer')
// const {ObjectId} = require('mongodb');
// const safeObjectId = s => ObjectId.isValid(s) ? new ObjectId(s) : null;


/*
 * Familyfe class
 */
class familyfe {

	constructor(sequelize) {
		let self = this;
		self.sequelize = sequelize
		// self.MongoModels = MongoModels;
		// self.
	}
	connect(callback) {
		let self = this;
		self.dbDriver = process.env.DBDRIVER || "mongo"
		let dbDriver = self.dbDriver
		switch (dbDriver) {
			case "mysql":
				const mysql_d = require("./drivers/mysql")
				break;
			case "mongo": //mongo is default
			default:
				const mongo_d = new(require("./drivers/mongo"))(function () {
					callback();
				})

		}
	}
	setCollection(collection) {
		this.MongoModels.collection = collection;
		this.collection = collection
	}

	generatePasswordHash(password, callback) {

		Async.auto({
			salt: function (done) {

				Bcrypt.genSalt(10, done);
			},
			hash: ['salt', function (results, done) {

				Bcrypt.hash(password, results.salt, done);
			}]
		}, (err, results) => {

			if (err) {
				return callback(err);
			}

			callback(null, {
				password,
				hash: results.hash
			});
		});
	}

	extend(val, ery) {
		let extended = {}
		let index = 0;
		let keyisNumeric = true;
		for (let key in val) {
			keyisNumeric = parseInt(key).toString() === "NaN" ? false : true;
			keyisNumeric === true ? extended[index++] = val[key] : extended[key] = val[key];
		}
		for (let key in ery) {
			keyisNumeric = parseInt(key).toString() === "NaN" ? false : true;
			let bri = JSON.parse(JSON.stringify(ery))
			if (typeof bri[key] == "object") {
				try {
					let tmp = this.extend(extended[key], ery[key])
					keyisNumeric === true ? extended[index++] = tmp : extended[key] = tmp;
				} catch (err) {
					keyisNumeric === true ? extended[index++] = ery[key] : extended[key] = ery[key];
				}
			} else keyisNumeric === true ? extended[index++] = ery[key] : extended[key] = ery[key];
		}


		return extended;
	}

	join(obj, joiner) {
		let joined = "";
		let count = 0
		for (let i in obj) {
			if (count === 0) joined = obj[i];
			else joined += joiner + obj[i];
			count++
		}
		return joined;
	}

}

class abstractWorld {
	constructor() {

	}

	destroy(callback) {
		let self = this
		self.Familyfe.MongoModels.collection = self.Familyfe.collection
		self.Familyfe.MongoModels.deleteMany(callback);
	}
}


class abstractProfile extends abstractWorld {
	constructor() {
		super();
	}

}


class Profile extends abstractProfile {
	constructor(sequelize) {
		super()
		let self = this;
		self.sequelize = sequelize
		self.socialLogins = [{
				model: self.sequelize.models.Github
			},
			{
				model: self.sequelize.models.Google
			},
			{
				model: self.sequelize.models.Facebook
			},
			{
				model: self.sequelize.models.Twitter
			}
		]
	}

	async add(profile) {
		let self = this;
		let [err, care, dontcare] = [];
		let thisProfile = {
			...profile
		}
		for (const inner in thisProfile) {
			let parts = inner.split(' ')
			if (parts.length > 1) {
				let toupper = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
				thisProfile[parts[0]] === undefined ? thisProfile[parts[0]] = {} : thisProfile[parts[0]][toupper] = thisProfile[inner];
				thisProfile[parts[0]][toupper] = thisProfile[inner]

			}
		}

		let profiles = {};
		for (let key in thisProfile) {
			if (typeof thisProfile[key] === 'object') {
				thisProfile[key].UserUid = thisProfile['uid']
				profiles[key] = thisProfile[key]
			}
		}

		for (let key in profiles) {
			;
			[err, care] = await to(self.sequelize.models[key.slice(0, -1)].create(profiles[key]))
		}

		if (err) {
			let {
				a
			} = err.message || err.msg
			return Promise.reject({
				msg: err.msg || err.errors[0].message || err.message || err,
				code: err.code || 422,
				status: 422
			})
		}
		return JSON.parse(JSON.stringify(care));
	}

	async updateEmail(profile) {
		let self = this;
		let [err, care, dontcare] = [];
		let thisProfile = {
			...profile
		}
		for (const inner in thisProfile) {
			let parts = inner.split(' ')
			if (parts.length > 1) {
				let toupper = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
				thisProfile[parts[0]] === undefined ? thisProfile[parts[0]] = {} : thisProfile[parts[0]][toupper] = thisProfile[inner];
				thisProfile[parts[0]][toupper] = thisProfile[inner]

			}
		}

		let profiles = {};
		for (let key in thisProfile) {
			if (typeof thisProfile[key] === 'object') {
				thisProfile[key].UserUid = thisProfile['uid']
				profiles[key] = thisProfile[key]
			}
		}

		let uid;
		for (let key in profiles) {
			let model = key.slice(0, -1)
			uid = profiles[key].UserUid;
			[err, care] = await to(self.sequelize.models[model].update(profiles[key], {
				where: {
					UserUid: profiles[key].UserUid,
					Email: profiles[key].Oldemail
				}
			}))
			// console.log(care)
		}

		// ;[err, care] = await to(self.sequelize.models.Person.findOne({where: {uid:uid}} ))
		if (err) {
			let {
				a
			} = err.message || err.msg
			return Promise.reject({
				msg: err.msg || err.errors[0].message || err.message || err,
				code: err.code || 422,
				status: 422
			})
		}
		return JSON.parse(JSON.stringify(care));
	}

	async dropEmail(profile) {
		let self = this;
		let [err, care, dontcare] = [];
		let thisProfile = {
			...profile
		}
		for (const inner in thisProfile) {
			let parts = inner.split(' ')
			if (parts.length > 1) {
				let toupper = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
				thisProfile[parts[0]] === undefined ? thisProfile[parts[0]] = {} : thisProfile[parts[0]][toupper] = thisProfile[inner];
				thisProfile[parts[0]][toupper] = thisProfile[inner]

			}
		}

		let profiles = {};
		for (let key in thisProfile) {
			if (typeof thisProfile[key] === 'object') {
				thisProfile[key].UserUid = thisProfile['uid']
				profiles[key] = thisProfile[key]
			}
		}

		let uid;
		for (let key in profiles) {
			let model = key.slice(0, -1)
			uid = profiles[key].UserUid;
			[err, care] = await to(self.sequelize.models[model].destroy({
				where: {
					UserUid: profiles[key].UserUid,
					Email: profiles[key].Oldemail
				}
			}))
			// console.log(care)
		}

		if (err) {
			let {
				a
			} = err.message || err.msg
			return Promise.reject({
				msg: err.msg || err.errors[0].message || err.message || err,
				code: err.code || 422,
				status: 422
			})
		}
		return JSON.parse(JSON.stringify(care));
	}


}


class abstractPerson extends abstractWorld {
	constructor() {
		super();
	}

	expandPerson(person) {
		let thisPerson = {
			...person
		}
		for (const inner in person) {
			// console.log(inner)
			let parts = inner.split(' ')
			if (parts.length > 1) {
				thisPerson[parts[0]] === undefined ? thisPerson[parts[0]] = {} : thisPerson[parts[0]][parts[1].charAt(0).toUpperCase() + parts[1].slice(1)] = person[inner];
				thisPerson[parts[0]][parts[1].charAt(0).toUpperCase() + parts[1].slice(1)] = person[inner]


			}
		}
		return thisPerson;
	}
}

class Person extends abstractPerson {
	constructor(sequelize) {
		super();
		let self = this;
		self.attributes = ['uid', 'Name', 'Email', 'IsActive']
		self.sequelize = sequelize
		self.socialLogins = [{
				model: self.sequelize.models.Github
			},
			{
				model: self.sequelize.models.Google
			},
			{
				model: self.sequelize.models.Facebook
			},
			{
				model: self.sequelize.models.Telephone
			},
			{
				model: self.sequelize.models.Twitter
			}
		]
		self.Family = new Family(sequelize)
	}

	addEmails(person, Emails) {
		let self = this;
		let emails = person.Contacts.Email
		let newEmails = {}
		let emailcount = Objlen(emails)
		let j = 0;
		for (let i in emails) newEmails[j++] = emails[i];

		let emailsToAdd = {}
		if (typeof Emails == "object")
			for (let i in Emails) newEmails[j++] = Emails[i];
		else
		if (typeof Emails == "string")
			newEmails[j] = Emails;

		person.Contacts.Email = newEmails;
		return person
	}

	setAttributes(person) {
		let self = this
		person.Username = (person.Username !== null && person.Username !== undefined) ? sentenceCase(person.Username) : person.Email.toLowerCase();
		person.Email = person.Email.toLowerCase();
		person.Gender = sentenceCase(person.Gender);
		person.Name = {
			first: (person.Name.split(" ")[0] !== undefined) ? sentenceCase(person.Name.split(" ")[0]) : "",
			middle: (person.Name.split(" ")[1] !== undefined) ? sentenceCase(person.Name.split(" ")[1]) : "",
			last: (person.Name.split(" ")[2] !== undefined) ? sentenceCase(person.Name.split(" ")[2]) : "",
			other: (person.Name.split(" ")[3] !== undefined) ? sentenceCase(person.Name.split(" ")[3]) : "",
		}
		person = self.addEmails(person, [person.Email])
		self.Attributes = person
		return person
	}

	fullName() {
		let self = this
		let fullName = self.familyfe.join(self.Attributes.Name, " ")
		self.Attributes.name = fullName
		/*
		 * backward compatibility
		 */
		self.Attributes.email = self.Attributes.Email
		return fullName
	}

	addFamily(family) {
		let self = this
		let familyid = family._id;
		let newFamily = {
			Families: {
				0: familyid
			}
		}
		let person = self.familyfe.extend(self.Attributes, newFamily)
		self.Attributes = person;
		return person;
	}

	async common(options, action) {
		let self = this;
		let [err, care, dontcare] = [];
		let githubOptions = {
			model: self.sequelize.models.Github
		}

		if (options.github !== undefined) {
			githubOptions.where = Object.assign({}, options.github);
			delete options.github
		}

		// let mainOptions = { attributes:self.attributes,
		let mainOptions = {
			include: [
				githubOptions,
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Emailprofile
				},
				{
					model: self.sequelize.models.Telephone
				},
				{
					model: self.sequelize.models.Twitter
				}
			]
		}

		if (Object.keys(options).length > 0) mainOptions.where = options

		switch (action) {
			case "which":
				;
				[err, care] = await to(self.sequelize.models.Person.findOne(mainOptions))
				break;
			case "whichwithPwd":
				self.attributes.push('Password')
				// console.log(options)
				;
				[err, care] = await to(self.sequelize.models.Person.findOne({
					where: options,
					attributes: self.attributes
				}))
				break;
			case "update":
				options = self.expandPerson(options)
				// console.log(options)
				;
				[err, care] = await to(self.sequelize.models.Person.update(options, {
					where: {
						uid: options.uid
					},
					fields: options
				}, mainOptions));
				[err, care] = await to(self.sequelize.models.Emailprofile.update(options.Emailprofiles, {
					where: {
						UserUid: options.uid,
						Email: options.Emailprofiles.Oldemail
					},
					fields: options
				}, mainOptions))
				// ;[err, care] = await to(self.sequelize.models.Person.findOne(mainOptions));
				break;
			case "destroy":
				;
				[err, care] = await to(self.sequelize.models.Person.destroy({
					where: {
						uid: options.uid
					}
				}))
				break;

		}
		if (err) return Promise.reject({
			msg: err.msg || err,
			code: err.code || 422,
			status: 422
		})
		care = care || {}
		// return JSON.parse(JSON.stringify(care))
		return care
	}

	/*
	 * Check if user exists
	 */
	async which(options) {
		let self = this;
		let [err, care, dontcare] = [];;
		[err, care] = await to(self.common(options, "which"))
		if (err) return Promise.reject({
			msg: err.msg || err,
			code: err.code || 422,
			status: 422
		})
		return care;
	}

	async whichwithPwd(options) {
		let self = this;
		let [err, care, dontcare] = [];;
		[err, care] = await to(self.common(options, "whichwithPwd"))
		if (err) return Promise.reject({
			msg: err.msg || err,
			code: err.code || 422,
			status: 422
		})
		return care;
	}

	async update(options) {
		let self = this;
		let [err, care, dontcare] = [];;
		[err, care] = await to(self.common(options, "update"))
		if (err) return Promise.reject({
			msg: err.msg || err,
			code: err.code || 422,
			status: 422
		})
		return care;
	}

	async update_v1(data, where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Person.update(data, {
			where: where,
			// individualHooks: true
		}))
		if (err) throw (err)
		if (care === null || care === undefined) return {}
		return care[0] || 0
	}

	async destroy(options) {
		let self = this;
		let [err, care, dontcare] = [];;
		[err, care] = await to(self.common(options, "destroy"))
		if (err) return Promise.reject({
			msg: err.msg || err,
			code: err.code || 422,
			status: 422
		})
		return care;
	}


	async beget(person) {
		let self = this;
		let [err, care, dontcare] = [];
		let thisPerson = {
			...person
		}
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

		;[err, care] = await to(self.sequelize.models.Family.create({
			FamilyName:name,
			hierarchyLevel:1,
			parentFamilyId: 1,
			FamilyFamilyId: 1
		}))
		if(err) throw(err)
		let myFamilyId = care.dataValues.FamilyId;
		;[err, care] = await to(self.sequelize.models.Family.update({FamilyFamilyId: myFamilyId}, {
			where: {FamilyId: myFamilyId},
			individualHooks: true
		}))
		thisPerson.FamilyFamilyId = myFamilyId
		for(let i in thisPerson) {
			typeof thisPerson[i] === 'object'?thisPerson[i].FamilyFamilyId = myFamilyId: false
		}
		;[err, care] = await to(imports.apps.installAppsforFamily({
			FamilyId:myFamilyId,
	    	Apps:'all'
		}))
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
		// let [err1, care1 ] = await to(imports.Role.allRolesForApp('csystem'))
		let [err1, care1 ] = await to(imports.Role.singleRoleForApp('csystem', 'root'))
		let RootRoleId = care1[0].RoleId
		console.log(RootRoleId)
		;[err1, care1 ] = await to(imports.Role.singleRoleForApp('csystem', 'user'))
		let UserRoleId = care1[0].RoleId
		console.log(UserRoleId)
		let uid = care.dataValues.uid

		// Add to World
		;[err1, care1] = await to(self.Family.addMember(1, uid))
		let WorldMemberId = care1.dataValues.FamilyMemberId;

		// Put as user for all apps installed for family...
		console.log(care1)

		//Put as root for own family

		let Families = person.Families || [];
		let promises = Families.map(function (family) {
			return self.Family.addMember(family, uid)
		});
		[err1, care1] = await to(Promise.all(promises));
		return JSON.parse(JSON.stringify(care));
	}

	async begetIn(person, place) /*try doing this in one step*/ {
		let self = this;
		let [err, care, dontcare] = [];

		//check if name||Name key exists for all
		let password = randomstring.generate(20);
		let firstPerson = {
			Email: "testEmail@gmail.com" || person.email || person.Email,
			Name: person.name || person.Name,
			Password: password,
			Cpassword: password,
		}

		// self.sequelize.models.Person.Github = self.sequelize.models.Github.belongsTo(self.sequelize.models.Person)
		;
		[err, care] = await to(self.sequelize.models.Person.create(firstPerson))

		// console.log(person)
		// console.log("Now going to create user....")
		// console.log(care)
		// console.log(err)
		// console.log(care)

		if (err) {
			let {
				a
			} = err.message || err.msg
			return Promise.reject({
				msg: err.msg || err.errors[0].message || err.message || err,
				code: err.code || 422,
				status: 422
			})
		}

		let uid = care.dataValues.uid
		let otherPerson = {}
		switch (place) {
			case "github":
				otherPerson.GithubUid = care.dataValues.uid;
				otherPerson.gituid = person.id;
				otherPerson.Name = "had some name....";;
				[err, care] = await to(self.sequelize.models.Github.create(otherPerson))
				break;
		}

		return JSON.parse(JSON.stringify(care));
	}

	identify(options, callback) {
		let self = this;
		options.Email === undefined ? options.Email = "" : false;
		let errors = {}
		validator.isEmpty(options.Email) === true ? errors["Email"] = {
			err: "Please enter email to log in."
		} : false;;
		let len = Objlen(errors)
		if (len > 0) return callback(errors, false)

		self.familyfe.MongoModels.collection = self.familyfe.collection
		self.familyfe.MongoModels.findOne({
			Email: options.Email
		}, function (err, user) {
			if (err || user === null || Objlen(user) < 1) {
				errors["email"] = {
					err: "Email not found"
				};
				return callback(errors, false);
			}
			self.__comparepassword({
				user: user,
				Password: options.Password
			}, function (err, isMatch) {
				if (err || isMatch === false) {
					errors["password"] = {
						err: "Wrong password."
					};
					return callback(errors, false)
				}
				self.isActive({
					user: user
				}, function (err, active) {
					if (active === false) {
						errors["person"] = {
							err: "Person is disabled. Please activate."
						};
						return callback(errors, false)
					}
					user.id = user._id;
					return callback(null, user) //no errors
				})
			})

		});
	}

	__comparepassword(options, callback) {
		let password = options.Password,
			user = options.user;
		// console.log(options)
		Async.auto({
			start: function (dones) {
				let syspass = JSON.parse(JSON.stringify(user)).Password;
				Bcrypt.compare(password, syspass, dones);
			}
		}, (err, results) => {

			if (err) return callback(err, false)
			callback(err, results.start);

		});
	}

	isActive(options, callback) {
		let user = options.user;

		callback(null, user.IsActive);
	}

	async getApps(personId) {
		let self = this,
		[err, care] = [];

		;[err, care] = await to(self.sequelize.models.Family.findAll({
			include: [{
					model: self.sequelize.models.FamilyMember,
					attributes: [],
					where: {
						PersonUid: personId
					}
				},
				{
					model: self.sequelize.models.InstalledApp,
					// where:{
					// 	FamilyFamilyId:family
					// },
					attributes: ["InstalledAppId"],
					include: [{
						model: self.sequelize.models.App,
						// where: {AppName: app},
						attributes: ['AppId', 'AppName'],
						include: [{
							model: self.sequelize.models.Role,
							// where:{Role: role},
							attributes: ['RoleId', 'Role']
						}]
					}]
				}
			]
		}))
		if (err) throw err
		// console.log(care[0].dataValues.InstalledApps[0].dataValues.App.dataValues.Roles)
		if (care === null) return {}
		return care;
	}
	async hasRole(role, app, personId, family) {
		let self = this,
			[err, care] = [];;
		[err, care] = await to(self.sequelize.models.Family.findAll({
			include: [{
					model: self.sequelize.models.FamilyMember,
					where: {
						PersonUid: personId
					}
				},
				{
					model: self.sequelize.models.InstalledApp,
					where: {
						FamilyFamilyId: family
					},
					attributes: ["InstalledAppId"],
					include: [{
						model: self.sequelize.models.App,
						where: {
							AppName: app
						},
						attributes: ['AppId', 'AppName'],
						include: [{
							model: self.sequelize.models.Role,
							where: {
								Role: role
							},
							attributes: ['RoleId', 'Role']
						}]
					}]
				}
			]
		}))
		if (err) throw err
		if (care === null) return {}
		return JSON.parse(JSON.stringify(care));
	}

	async delete (uid) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Person.destroy({
			where: {uid:uid}
		}));
		if (err) throw (err)
		if (care === null) return {}
		return care
	}

}

class abstractFamily extends abstractWorld {
	constructor() {
		super();
	}

	extendFamilyRoles(oldRoles, NewRoles) {
		let tmpobj = {}
		let roles = []
		for (let i in oldRoles) tmpobj[oldRoles[i]] = true;
		for (let i in NewRoles) tmpobj[NewRoles[i]] = true;
		for (let role in tmpobj) roles.push(role)
		return roles;
	}
}

class Family extends abstractFamily {
	constructor(sequelize) {
		super();
		let self = this;
		self.sequelize = sequelize

	}


	async create(options) {
		let self = this
		let FamilyName = options.FamilyName || ''
		let hierarchyLevel = options.hierarchyLevel
		let parentFamilyId = options.parentFamilyId
		let FamilyFamilyId = options.FamilyFamilyId

		if (FamilyName === 'World' || FamilyName === 'Csystem') {
			hierarchyLevel = 1;
			parentFamilyId = null;
		} else {
			if (hierarchyLevel < 2) hierarchyLevel = 2
			if (parentFamilyId === null) parentFamilyId = 1
		}
		let [err, care] = await to(self.sequelize.models.Family.create({
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
		if (care === null) throw 'Missing familyId'
		return care.dataValues.FamilyId;
	}

	async getFamilyHierarchy(FamilyId) {
		let self = this
		let [err, care] = [];
		;[err, care] = await to(self.sequelize.models.Family.findOne({
			where: {
				FamilyId
			},
			attributes: ["hierarchyLevel"]
		}, ))
		if (err) throw err;
		if (care === null)return false
		return care.dataValues.hierarchyLevel
	}

	async update(data, where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Family.update(data, {
			where: where,
			individualHooks: true
		}))
		if (err){
			if(err.errors[0].message){
				throw {message:err.errors[0].message, status:422}
			}
			else throw err
		}
		if (care === null) return {}
		return care
	}
	async delete(where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Family.destroy({where}))
		if (err){
			throw err
		}
		if (care === null) return {}
		return care
	}

	deepSearch (object, key, predicate) {
		let self = this
		if (object.hasOwnProperty(key) && predicate(key, object[key]) === true) return object
	
		for (let i = 0; i < Object.keys(object).length; i++) {
		  if (typeof object[Object.keys(object)[i]] === "object") {
			let o = self.deepSearch(object[Object.keys(object)[i]], key, predicate)
			if (o != null) return o
		  }
		}
	
		return null
	}

	search (needle, haystack, found = []) {
		let self = this
		Object.keys(haystack).forEach((key) => {
		  if(key === needle){
			found.push(haystack[key]);
			return found;
		  }
		  if(typeof haystack[key] === 'object'){
			self.search(needle, haystack[key], found);
		  }
		});
		return found;
	  };

	async memberHasRoleinFamilyforApp(app, role, family, uid){
		let self = this
		family = parseInt(family)
		
		/// get entire hierarchy as a flat list
		// let [err, care] = await to(self.sequelize.models.Family.findAll())

		// get entire hierarchy as a nested tree
		// let [err, care] = await to(self.sequelize.models.Family.findAll({ hierarchy: true }))


		// let [err, care] = await to(self.sequelize.models.FamilyMember.findAll(
		// 		{
		// 			where: {
		// 				PersonUid: uid,
		// 				// FamilyFamilyId: family
		// 			},
					// include:[
					// 	{
					// 		model:self.sequelize.models.Family,
					// 		// where: { FamilyId: family },
					// 		// hierarchy:true,
					// 		include: {
					// 			model: self.sequelize.models.Family,
					// 			as: 'descendents',
					// 			hierarchy: true,
					// 			where: { FamilyId: family }
					// 		}
					// 	}
					// ]
		// 		}
		// 	))

		let [err, care] = await to(self.sequelize.models.MemberRole.findAll({
			include: [
				{
					model: self.sequelize.models.Role,
					where: {
						Role: role
					},
					include: [{
						model: self.sequelize.models.App,
						where: app
					}]
				},
				{
					model: self.sequelize.models.FamilyMember,
					where: {
						PersonUid: uid
					},
					include:[
						{
							model:self.sequelize.models.Family,
							include: [{
								model: self.sequelize.models.Family,
								as: 'descendents',
								hierarchy: true,
								// where: { FamilyId: family }
							}]
						}
					]
				}
			]
		}, ))

		if(err) throw err
		let tmp = JSON.parse(JSON.stringify(care)),
		ret
		tmp = JSON.parse(JSON.stringify(tmp, (k,v) => (k === 'parentFamilyId')? undefined : v))
		// try{
			ret = self.deepSearch(tmp, 'FamilyId',  (k, v) => v === family)
		// }catch(err){console.log(err)}
		if(ret === null) return false
		return true

	}

	async getChildren(family) {
		let self = this
		family = parseInt(family)
		// get all the descendents of a particular item
		let [err, care] = await to(self.sequelize.models.Family.findAll(
			{
				where: { FamilyId: family},
				include: {
					model: self.sequelize.models.Family,
					as: 'descendents',
					hierarchy: true,
					// where: { FamilyId: family}
				}
			}
		))
		if(err) throw err

		return care
		
	}
	async getFathers(family) {
		let self = this
		//get all the ancestors (i.e. parent and parent's parent and so on)
		// let [err, care] = await to(self.sequelize.models.Family.find(
		// 		{
		// 			where: { FamilyId: 4 },
		// 			include: {
		// 				model: self.sequelize.models.Family,
		// 				as: 'ancestors',
		// 			},
		// 			order: [ [ { model: self.sequelize.models.Family, as: 'ancestors' }, 'hierarchyLevel' ] ]
		// 		}
		// ))
		let [err, care] = await to(self.sequelize.models.Family.findAll(
			{
				where: { FamilyId: family },
				include: {
					model: self.sequelize.models.Family,
					as: 'ancestors',
				},
				order: [ [ { model: self.sequelize.models.Family, as: 'ancestors' }, 'hierarchyLevel' ] ]
			}
		))
		if(err) throw err
		return care
	}

	async getApps(family) {
		let self = this
		let [err, care] = [];;
		[err, care] = await to(self.sequelize.models.InstalledApp.findAll({
			where: {
				FamilyFamilyId: family
			},
			attributes: ["InstalledAppId"],
			include: [{
				model: self.sequelize.models.App,
				attributes: ['AppId', 'AppName'],
				include: [{
					model: self.sequelize.models.Role,
					attributes: ['RoleId', 'Role']
				}]
			}]
		}, ))
		let ret = [];
		// console.log(err)
		if (err) throw (err)
		if (care === null) throw "nothing found"
		// console.log(err)
		// console.log(JSON.stringify(care))
		for (let i in care)
			ret.push(care[i].dataValues)
		return JSON.parse(JSON.stringify(ret))
	}



	async getspecificMemberRoleforFamily(family, specificRole) {
		let self = this
		let [err, care] = [];;
		[err, care] = await to(self.sequelize.models.InstalledApp.findAll({
			where: {
				FamilyFamilyId: family
			},
			attributes: ["InstalledAppId"],
			include: [{
				model: self.sequelize.models.App,
				attributes: ['AppId', 'AppName'],
				include: [{
					model: self.sequelize.models.Role,
					attributes: ['RoleId', 'Role'],
					where: {
						Role: specificRole
					}
				}]
			}]
		}, ))
		let ret = [];
		if (err) throw (err)
		if (care === null) throw "nothing found"
		for (let i in care)
			ret.push(care[i].dataValues)
		return JSON.parse(JSON.stringify(ret))
	}

	async memberHasRoleinFamilyforApp_vold(app, role, family, uid) {
		let self = this
		let [err, care] = [];
		[err, care] = await to(self.sequelize.models.MemberRole.findOne({
			include: [
				{
					model: self.sequelize.models.Role,
					where: {
						Role: role
					},
					include: [{
						model: self.sequelize.models.App,
						where: app
					}]
				},
				{
					model: self.sequelize.models.FamilyMember,
					where: {
						PersonUid: uid,
						FamilyFamilyId: family
					}
				}
			]
		}, ))

		if (care === null) return false
		if (!care.dataValues.FamilyMember) return false
		return true
	}


	async getspecificMemberRoleforFamilyforApp(family, specificRole, app) {
		let self = this
		let [err, care] = [];;
		[err, care] = await to(self.sequelize.models.InstalledApp.findOne({
			where: {
				FamilyFamilyId: family
			},
			attributes: ["InstalledAppId"],
			include: [{
				model: self.sequelize.models.App,
				where: app,
				attributes: ['AppId', 'AppName'],
				include: [{
					model: self.sequelize.models.Role,
					attributes: ['RoleId', 'Role'],
					where: {
						Role: specificRole
					}
				}]
			}]
		}, ))
		let ret = [];
		if (err) throw (err)
		if (care === null) return false
		for (let i in care)
			ret.push(care[i].dataValues)
		return JSON.parse(JSON.stringify(ret))
	}

	async addMember(family, member) {
		let self = this
		let [err, care] = []

		;
		[err, care] = await to(self.sequelize.models.FamilyMember.findOne({
			where: {
				"PersonUid": member,
				"FamilyFamilyId": family
			}
		}))

		if (err) throw (err);
		if (care === null) {
			[err, care] = await to(self.sequelize.models.FamilyMember.create({
				"PersonUid": member,
				"FamilyFamilyId": family
			}));
			if (err) throw (err)
		}
		return care;
	}

	
	async deleteMember(family, member) {
		let self = this
		let [err, care] = []
		;[err, care] = await to(self.sequelize.models.FamilyMember.destroy({where: {
				"PersonUid": member,
				"FamilyFamilyId": family
		}}))

		if (err) throw (err);
		return care;
	}



	async getMembers(family) {
		let self = this
		let [err, care] = []

		;
		[err, care] = await to(self.sequelize.models.FamilyMember.findAll({
			where: {
				"FamilyFamilyId": family
			},
			attributes: ['FamilyMemberId', 'PersonUid']
		}))

		if (err) throw (err);
		if (care === null) throw err("nothing found")

		let ret = [];
		for (let i in care) {
			ret.push(care[i].dataValues)
		}

		return JSON.parse(JSON.stringify(ret));
	}

	async getMember(family, Person) {
		let self = this
		let [err, care] = []

		;
		[err, care] = await to(self.sequelize.models.FamilyMember.findOne({
			where: {
				"FamilyFamilyId": family,
				"PersonUid": Person
			},
			attributes: ['FamilyMemberId']
		}))



		if (err) throw (err);
		if (care === null) throw ("nothing found")

		return care.dataValues.FamilyMemberId
	}

	async memberBelongstoFamily(family, member){
		let self = this
		let [err, care] = []

		;[err, care] = await to(self.sequelize.models.FamilyMember.findOne({
			where: {
				"FamilyMemberId": member,
				"FamilyFamilyId": family
			},
			
		}))
		if (err) throw (err);
		if (care === null) return false
		return care
	}

	async getMemberRoles(familymemberId, whereRole = true) {
		let self = this
		let [err, care] = []

	// 	console.log("start")
	// 	try{
	// 	;[err, care] = await to(self.sequelize.models.FamilyMember.findAll({
			
	// 		include:[ {
	// 			model:	self.sequelize.models.MemberRole,
	// 			where: {
	// 				"FamilyMemberFamilyMemberId": familymemberId
	// 			},
	// 			attributes: ['FamilyMemberFamilyMemberId'],
	// 			include: [
	// 				{
	// 					model:self.sequelize.models.Role,
	// 					where: whereRole,
	// 					attributes: ['RoleId', 'Role'],
	// 					include: [
	// 						{
	// 							model: self.sequelize.models.App,
	// 							attributes: ['AppName', 'AppId']
	// 						}
	// 					]
	// 				},
	// 				{
	// 					model:self.sequelize.models.FamilyMember,
	// 					attributes: ['FamilyMemberId'],
	// 					include: [
	// 						{
	// 							model: self.sequelize.models.Family,
	// 							attributes: ['FamilyId', 'FamilyName']
	// 						}
	// 					]
	// 				}
	// 			]
	// 		}]
	// 	}))
	// }catch(error){console.log(error)}
	// 	console.log(err)
		;[err, care] = await to(self.sequelize.models.MemberRole.findAll({
			where: {
				"FamilyMemberFamilyMemberId": familymemberId
			},
			attributes: ['FamilyMemberFamilyMemberId'],
			include: [
				{
					model:self.sequelize.models.Role,
					where: whereRole,
					attributes: ['RoleId', 'Role'],
					include: [
						{
							model: self.sequelize.models.App,
							attributes: ['AppName', 'AppId']
						}
					]
				},
				{
					model:self.sequelize.models.FamilyMember,
					attributes: ['FamilyMemberId'],
					include: [
						{
							model: self.sequelize.models.Family,
							attributes: ['FamilyId', 'FamilyName']
						}
					]
				}
			]
		}))

		if (err) throw (err);
		if (care === null) return false
		if (care.length === 0) return false
		return care
	}

	async appisInstalledforFamily(family, RoleId){
		let self = this,
		[err,care] = []
		;[err, care] = await to(self.sequelize.models.App.find({
			include: [
				{
					model:self.sequelize.models.Role,
					where: {RoleId},
					// attributes: ['RoleId', 'Role'],
					// include: [
					// 	{
					// 		model: self.sequelize.models.App,
					// 		attributes: ['AppName', 'AppId']
					// 	}
					// ]
				},
				{
					model:self.sequelize.models.InstalledApp,
					where: {
						FamilyFamilyId: family
					}
				}
			]
		}))

		if (err) throw (err);
		if (care === null) return false
		if (care.length === 0) return false
		return care
	}

	
	async deleteRoleforMember(member, role) {
		let self = this;
		let [err, care] = await to(self.sequelize.models.MemberRole.destroy({where:{
			"FamilyMemberFamilyMemberId": member,
			"RoleRoleId": role
		}}))

		if (err) throw (err)
		return care
	}

	
	async createRoleforMember(member, role) {
		let self = this;
		let [err, care] = await to(self.sequelize.models.MemberRole.create({
			"FamilyMemberFamilyMemberId": member,
			"RoleRoleId": role
		}))

		if (err) throw (err)
		return care.dataValues
	}


	async createRolesforMember(member, roles) {
		let self = this;
		// try{
		let promises = roles.map(function (role) {
			return self.createRoleforMember(member, role)
		})
		let [err, care] = await to(Promise.all(promises));
		if (err) throw (err)
		return care;
		// }catch(error) {
		// 	console.log(error)
		// }
	}


	async addMembers(family, members) {
		let self = this
		let [err, care] = [];

		let promises = members.map(function (member) {
			return self.addMember(member, family);
		});
		[err, care] = await to(Promise.all(promises));
		return care;
	}
}

class abstractFamilyMembers extends abstractWorld {
	constructor() {
		super();
	}
}
class familyMembers extends abstractFamilyMembers {
	constructor() {
		super();
		let self = this;
		// self.Familyfe = new familyfe();
		// self.Familyfe.setCollection("FamilyMembers");
	}
}

/*
 * World
 */
class World extends abstractWorld {
	constructor(sequelize) {
		super();
		let self = this;
		self.sequelize = sequelize;
		self.People = self.Person = new Person(sequelize);
		// self.Families = self.Family = new family;
		// self.FamilyMembers = self.familyMembers = new familyMembers;
	}

	/*
	 * What relation has the world to everyother thing??????
	 */
	async parade() {
		let self = this;
		let [err, care, dontcare] = [];
		// [err, care] = await to(self.sequelize.models.Person.findAll({attributes: self.Person.attributes}))//or user .id
		[err, care] = await to(self.sequelize.models.Person.findAll({
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Emailprofile
				},
				{
					model: self.sequelize.models.Telephone
				},
				{
					model: self.sequelize.models.Twitter
				}
			]
		})) //or user .id
		if (err) return Promise.reject({
			msg: err.msg || err,
			code: err.code || 422,
			status: 422
		})
		care = care || {}
		return JSON.parse(JSON.stringify(care))
	}

	async destroyWorld() {
		return true; // records have been deleted already

		// let self = this;
		// // 
		// let model, models;
		// models = [];
		// for(model in self.sequelize.models){
		// 	models.push(model)
		// }
		// return new Promise((resolve, reject) => {
		//   	async.each(models, function(model, callback) {
		// 		console.log(`Model: ${model}`)
		// 	    self.sequelize.models[model].destroy({
		// 		  		where: {},
		// 		 		truncate: false
		// 			})
		// 	    .then(function(){
		// 			  callback();
		// 		})
		// 	    .catch((err)=>{
		// 	    	// we can assume error for now
		// 	    	// console.log(err)
		// 	    	callback(err);
		// 	    })			    
		// 		}, function(err) {
		// 	    //
		// 	    if(err) return reject(err)
		// 	    resolve(true)
		// 	});
		// });

	}

	async create(adam, callback) {
		let [err, care, dontcare] = [];
		let self = this
		//self.destroyWorld().catch((err)=>console.log(err)).then(()=>console.log('finished'));
		;
		[err, care] = await to(self.destroyWorld());
		if (err) return Promise.reject({
			msg: err.mg || err.message || err,
			code: err.code || 1000
		});
		[err, care] = await to(self.Person.beget(adam))
		if (err) return Promise.reject({
			msg: err.mg || err.message || err,
			code: err.code || 1000
		})
		return care;
	}
}

class EmailProfile {
	constructor(sequelize) {
		// super();
		let self = this;
		self.sequelize = sequelize;
		// self.People = self.Person = new Person(sequelize);
		// self.Families = self.Family = new family;
		// self.FamilyMembers = self.familyMembers = new familyMembers;
	}

	async emailActivation(code, toEmail, activationpath) {
		let self = this
		let {
			Code,
			EmailprofileEmailuid
		} = code,
		data = code;
		await self.createEmailCode(data)

		let [err, care] = [];;
		[err, care] = await to(mailer({
			from: config.get('/mail/accountsman'),
			to: toEmail
		}, {
			subject: 'Account Activation',
			content: `Please use this code: <b>${Code}</b> to activate your account. Or click on <a href=${activationpath}>this link</a> to active`,
		}))
		if (err) throw (err)
		return care
	}

	async createEmailCode(data) {
		let self = this
		// await self.removeOldCodes();
		let [err, care] = await to(self.sequelize.models.EmailCode.create(data));
		if (err) throw (err)
		if (care === null) return {}
		return care
	}

	async deleteCode(Code) {
		let self = this
		let [err, care] = await to(self.sequelize.models.EmailCode.destroy({
			where: {
				Code
			}
		}));
		if (err) throw (err)
		if (care === null) return {}
		return care
	}

	async removeOldCodes() {
		let self = this,
			select = {};

		select['createdAt'] = {
			lte: moment().subtract(config.get('/CodeTTL'), 'minutes').toDate()
		}
		let [err, care] = await to(self.sequelize.models.EmailCode.destroy({
			where: select
		}));
		if (err) throw (err)
		if (care === null) return {}
		return care
	}

	async whichEmailProfile(profile) {

		let self = this
		let [err, care] = await to(self.sequelize.models.Emailprofile.findOne({
			where: profile
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care
	}

	async whichEmailProfileforCode(code) {

		let self = this
		let [err, care] = await to(self.sequelize.models.Emailprofile.findOne({
			include: [{
				model: self.sequelize.models.EmailCode,
				where: {
					Code: code
				}
			}]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care
	}

	async whichPersonwithEmailProfile(profile) {

		let self = this
		let [err, care] = await to(self.sequelize.models.Person.findOne({

			include: [{
				model: self.sequelize.models.Emailprofile,
				where: profile
			}]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care
	}

	async whichPerson(uid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			where: {
				uid
			},
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Telephone,
					attributes: ['Telephone', 'IsActive', 'puid', 'ProfilePic']
				},
				{
					model: self.sequelize.models.Emailprofile,
					attributes: ['Email', 'IsActive', 'emailuid', 'ProfilePic']
				}
			]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}
	async everyOne(uid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findAll({
			// where: {
			// 	uid
			// },
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Telephone,
					attributes: ['Telephone', 'IsActive', 'puid', 'ProfilePic']
				},
				{
					model: self.sequelize.models.Emailprofile,
					attributes: ['Email', 'IsActive', 'emailuid', 'ProfilePic']
				}
			]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care
	}


	async update(data, where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Emailprofile.update(data, {
			where: where,
			individualHooks: true
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}


	async delete(where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Emailprofile.destroy({
			where
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}



	async whichPersonwithEmailid(emailid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Telephone
				},
				{
					model: self.sequelize.models.Emailprofile,
					attributes: ['Email', 'IsActive', 'emailuid', 'ProfilePic'],
					where: {
						emailuid: emailid
					}
				}
			]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async addProfile(profile) {
		let self = this;
		let [err, care] = [];
		[err, care] = await to(self.sequelize.models.Emailprofile.create(profile))

		if (err) {
			let {
				a
			} = err.message || err.msg
			return Promise.reject({
				msg: err.msg || err.errors[0].message || err.message || err,
				code: err.code || 422,
				status: 422
			})
		}
		return care;
	}
}

class TelephoneProfile {
	constructor(sequelize) {
		// super();
		let self = this;
		self.sequelize = sequelize;
		// self.People = self.Person = new Person(sequelize);
		// self.Families = self.Family = new family;
		// self.FamilyMembers = self.familyMembers = new familyMembers;
	}

	async whichTelephoneProfile(profile) {

		let self = this
		let [err, care] = await to(self.sequelize.models.Telephone.findOne({
			where: profile,
			include: [{
					model: self.sequelize.models.TelephoneCode
				}

			],
			attributes: [
				"puid",
				"Telephone",
				"IsActive",
				"ProfilePic"
			]

		}))
		if (err) throw (err)
		if (care === null) return {}
		return care
	}

	async whichPersonfromTelephone(profile) {
		console.log("started")
		let self = this
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			include: [{
					model: self.sequelize.models.Telephone,
					where: profile,
					attributes: [
						"puid",
						"Telephone",
						"IsActive",
						"ProfilePic"
					]
				}

			]

		}))
		console.log(err)
		if (err) throw (err)
		if (care === null) return {}
		return care
	}


	async createTelephoneCode(data) {
		let self = this
		await self.removeOldCodes();
		data.Telephone = isphone(data.Telephone)[0]
		let [err, care] = await to(self.sequelize.models.TelephoneCode.create(data));
		if (err) throw (err)
		if (care === null) return {}
		return care
	}


	async removeOldCodes() {
		let self = this,
			select = {};

		select['createdAt'] = {
			lte: moment().subtract(config.get('/CodeTTL'), 'minutes').toDate()
		}
		// console.log(select)
		let [err, care] = await to(self.sequelize.models.TelephoneCode.destroy({
			where: select
		}));
		if (err) throw (err)
		if (care === null) return {}
		return care
	}


	async deleteCode(Code) {
		let self = this
		let [err, care] = await to(self.sequelize.models.TelephoneCode.destroy({
			where: {
				Code
			}
		}));
		if (err) throw (err)
		if (care === null) return {}
		return care
	}

	async whichPersonwithTelephoneProfile(profile) {

		let self = this
		let [err, care] = await to(self.sequelize.models.Person.findOne({

			include: [{
				model: self.sequelize.models.Telephone,
				where: profile
			}]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care
	}


	async whichTelephoneProfilewithCode(profile, code) {

		let self = this
		let [err, care] = await to(self.sequelize.models.Telephone.findOne({
			where: profile,
			include: [{
				model: self.sequelize.models.TelephoneCode,
				where: {
					Code: code
				}
			}]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care
	}



	async whichPerson(uid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			where: {
				uid
			},
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Emailprofile
				},
				{
					model: self.sequelize.models.Telephone,
					attributes: ['Telephone', 'IsActive', 'puid', 'ProfilePic']
				}
			]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}


	async update(data, where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Telephone.update(data, {
			where: where,
			individualHooks: true
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}


	async delete(where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Telephone.destroy({
			where
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}



	async whichPersonwithTelephoneid(Telephoneid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Emailprofile
				},
				{
					model: self.sequelize.models.Telephone,
					attributes: ['Telephone', 'IsActive', 'puid', 'ProfilePic'],
					where: {
						puid: Telephoneid
					}
				}
			]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async addProfile(profile) {
		let self = this;
		let [err, care] = [];
		[err, care] = await to(self.sequelize.models.Telephone.create(profile))

		if (err) {
			let {
				a
			} = err.message || err.msg
			return Promise.reject({
				msg: err.msg || err.errors[0].message || err.message || err,
				code: err.code || 422,
				status: 422
			})
		}
		return care;
	}
}


class GitProfile {
	constructor(sequelize) {
		// super();
		let self = this;
		self.sequelize = sequelize;
		// self.People = self.Person = new Person(sequelize);
		// self.Families = self.Family = new family;
		// self.FamilyMembers = self.familyMembers = new familyMembers;
	}

	async whichGitProfile(profile) {

		let self = this
		let [err, care] = await to(self.sequelize.models.Github.findOne({
			where: profile
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async whichPerson(uid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			where: {
				uid
			},
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Telephone
				},
				{
					model: self.sequelize.models.Emailprofile,
					attributes: ['Email', 'IsActive', 'emailuid', 'ProfilePic']
				}
			]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async addProfile(profile) {
		let self = this;
		let [err, care] = [];
		[err, care] = await to(self.sequelize.models.Github.create(profile))

		if (err) {
			console.log(err)
			let {
				a
			} = err.message || err.msg
			return Promise.reject({
				msg: err.msg || err.errors[0].message || err.message || err,
				code: err.code || 422,
				status: 422
			})
		}
		return care;
	}

	async whichPersonwithGituid(guid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Emailprofile
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Telephone
				},
				{
					model: self.sequelize.models.Github,
					attributes: ['Name', 'Email', 'IsActive', 'ProfilePic', 'gituid'],
					where: {
						gituid: guid
					}
				}
			]
		}))
		// console.log(err)
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async update(data, where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Github.update(data, {
			where: where,
			individualHooks: true
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}


	async delete(where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Github.destroy({
			where
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}
}

class GoogleProfile {
	constructor(sequelize) {
		// super();
		let self = this;
		self.sequelize = sequelize;
		// self.People = self.Person = new Person(sequelize);
		// self.Families = self.Family = new family;
		// self.FamilyMembers = self.familyMembers = new familyMembers;
	}

	async whichGoogleProfile(profile) {

		let self = this
		let [err, care] = await to(self.sequelize.models.Google.findOne({
			where: profile
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async whichPerson(uid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			where: {
				uid
			},
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Telephone
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Emailprofile,
					attributes: ['Email', 'IsActive', 'emailuid', 'ProfilePic']
				}
			]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async whichPersonwithGuid(guid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Emailprofile
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Telephone
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Google,
					attributes: ['Name', 'Email', 'IsActive', 'ProfilePic', 'guid'],
					where: {
						guid: guid
					}
				}
			]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async update(data, where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Google.update(data, {
			where: where,
			individualHooks: true
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}


	async delete(where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Google.destroy({
			where
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async addProfile(profile) {
		let self = this;
		let [err, care] = [];
		[err, care] = await to(self.sequelize.models.Google.create(profile))

		if (err) {
			console.log(err)
			let {
				a
			} = err.message || err.msg
			return Promise.reject({
				msg: err.msg || err.errors[0].message || err.message || err,
				code: err.code || 422,
				status: 422
			})
		}
		return care;
	}
}

class TwitterProfile {
	constructor(sequelize) {
		// super();
		let self = this;
		self.sequelize = sequelize;
		// self.People = self.Person = new Person(sequelize);
		// self.Families = self.Family = new family;
		// self.FamilyMembers = self.familyMembers = new familyMembers;
	}

	async whichTwitterProfile(profile) {

		let self = this
		let [err, care] = await to(self.sequelize.models.Twitter.findOne({
			where: profile
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async whichPerson(uid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			where: {
				uid
			},
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Telephone
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Emailprofile,
					attributes: ['Email', 'IsActive', 'emailuid', 'ProfilePic']
				}
			]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async whichPersonwithTuid(guid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Emailprofile
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Telephone
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Twitter,
					attributes: ['Name', 'Email', 'IsActive', 'ProfilePic', 'tuid'],
					where: {
						tuid: guid
					}
				}
			]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async update(data, where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Twitter.update(data, {
			where: where,
			individualHooks: true
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}


	async delete(where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Twitter.destroy({
			where
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async addProfile(profile) {
		let self = this;
		let [err, care] = [];
		[err, care] = await to(self.sequelize.models.Twitter.create(profile))

		if (err) {
			console.log(err)
			let {
				a
			} = err.message || err.msg
			return Promise.reject({
				msg: err.msg || err.errors[0].message || err.message || err,
				code: err.code || 422,
				status: 422
			})
		}
		return care;
	}
}

class FbProfile {
	constructor(sequelize) {
		// super();
		let self = this;
		self.sequelize = sequelize;
		// self.People = self.Person = new Person(sequelize);
		// self.Families = self.Family = new family;
		// self.FamilyMembers = self.familyMembers = new familyMembers;
	}

	async whichFbProfile(profile) {

		let self = this
		let [err, care] = await to(self.sequelize.models.Facebook.findOne({
			where: profile
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care
	}

	async whichPerson(uid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			where: {
				uid
			},
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Telephone
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Emailprofile,
					attributes: ['Email', 'IsActive', 'emailuid', 'ProfilePic']
				}
			]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async whichPersonwithFbuid(guid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Emailprofile
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Telephone
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Facebook,
					attributes: ['Name', 'Email', 'IsActive', 'ProfilePic', 'fbuid'],
					where: {
						fbuid: guid
					}
				}
			]
		}))
		console.log(guid)
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async update(data, where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Facebook.update(data, {
			where: where,
			individualHooks: true
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}


	async delete(where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Facebook.destroy({
			where
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async addProfile(profile) {
		let self = this;
		let [err, care] = [];
		[err, care] = await to(self.sequelize.models.Facebook.create(profile))

		if (err) {
			console.log(err)
			let {
				a
			} = err.message || err.msg
			return Promise.reject({
				msg: err.msg || err.errors[0].message || err.message || err,
				code: err.code || 422,
				status: 422
			})
		}
		return care;
	}
}

class LinkedinProfile {
	constructor(sequelize) {
		// super();
		let self = this;
		self.sequelize = sequelize;
		// self.People = self.Person = new Person(sequelize);
		// self.Families = self.Family = new family;
		// self.FamilyMembers = self.familyMembers = new familyMembers;
	}

	async whichLinkedinProfile(profile) {

		let self = this
		let [err, care] = await to(self.sequelize.models.Linkedin.findOne({
			where: profile
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care
	}

	async whichPerson(uid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			where: {
				uid
			},
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Telephone
				},
				{
					model: self.sequelize.models.Linkedin
				},
				{
					model: self.sequelize.models.Emailprofile,
					attributes: ['Email', 'IsActive', 'emailuid', 'ProfilePic']
				}
			]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async whichPersonwithLuid(guid, moreAttributes) {
		let self = this
		let attributes = {
			person: ['uid', 'Name', 'Gender', 'IsActive']
		}
		let [err, care] = await to(self.sequelize.models.Person.findOne({
			attributes: attributes.person,
			include: [{
					model: self.sequelize.models.Github
				},
				{
					model: self.sequelize.models.Emailprofile
				},
				{
					model: self.sequelize.models.Google
				},
				{
					model: self.sequelize.models.Twitter
				},
				{
					model: self.sequelize.models.Telephone
				},
				{
					model: self.sequelize.models.Facebook
				},
				{
					model: self.sequelize.models.Linkedin,
					attributes: ['Name', 'Email', 'IsActive', 'ProfilePic', 'luid'],
					where: {
						luid: guid
					}
				}
			]
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async update(data, where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Linkedin.update(data, {
			where: where,
			individualHooks: true
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}


	async delete(where) {
		let self = this
		let [err, care] = await to(self.sequelize.models.Linkedin.destroy({
			where
		}))
		if (err) throw (err)
		if (care === null) return {}
		return care.dataValues
	}

	async addProfile(profile) {
		let self = this;
		let [err, care] = [];
		[err, care] = await to(self.sequelize.models.Linkedin.create(profile))

		if (err) {
			console.log(err)
			let {
				a
			} = err.message || err.msg
			return Promise.reject({
				msg: err.msg || err.errors[0].message || err.message || err,
				code: err.code || 422,
				status: 422
			})
		}
		return care;
	}
}

class Role {
	constructor(sequelize) {
		let self = this;
		self.sequelize = sequelize;
	}

	async allRolesForApp(app){
		let self = this
		, [err, care] = []

		;[err, care] =  await to(self.sequelize.models.InstalledApp.findOne({
			include: [
				{
					model:self.sequelize.models.App,
					where:{AppName: app}
				}
			]
		}))
		if(err)throw err
		let AppId = care.dataValues.App.AppId;
		;[err, care] =  await to(self.sequelize.models.Role.findAll({
					where:{AppAppId: AppId}
		}))

		let roles = []
		for(let i in care){
			roles.push(care[i].dataValues)
		}

		return roles
	}

	
	async singleRoleForApp(app, role){
		let self = this
		, [err, care] = []

		;[err, care] =  await to(self.sequelize.models.InstalledApp.findOne({
			include: [
				{
					model:self.sequelize.models.App,
					where:{AppName: app}
				}
			]
		}))
		if(err)throw err
		let AppId = care.dataValues.App.AppId;
		;[err, care] =  await to(self.sequelize.models.Role.findAll({
					where:{AppAppId: AppId, Role: role}
		}))

		let roles = []
		for(let i in care){
			roles.push(care[i].dataValues)
		}

		return roles
	}



}


const appsConfig = require('./apps.js')

let imports = {
	
}

module.exports = (sequelize) => {
	let module = {Familyfe : new familyfe(sequelize)
		,World : new World(sequelize)
		,Person : new Person(sequelize)
		,Family : new Family(sequelize)
		,Profile : new Profile(sequelize)
		,apps : new appsConfig(sequelize)
		,Apps : new appsConfig(sequelize)
		,EmailProfile : new EmailProfile(sequelize)
		,TelephoneProfile : new TelephoneProfile(sequelize)
		,GitProfile : new GitProfile(sequelize)
		,FbProfile : new FbProfile(sequelize)
		,GoogleProfile : new GoogleProfile(sequelize)
		,TwitterProfile : new TwitterProfile(sequelize)
		,LinkedinProfile : new LinkedinProfile(sequelize)
		,Role : new Role(sequelize)
	};
	imports = module
	module.Familyfe = new familyfe(sequelize)
	module.World = new World(sequelize)
	module.Person = new Person(sequelize)
	module.Family = new Family(sequelize)
	module.Profile = new Profile(sequelize)
	module.apps = new appsConfig(sequelize);
	module.Apps = new appsConfig(sequelize);
	module.EmailProfile = new EmailProfile(sequelize);
	module.TelephoneProfile = new TelephoneProfile(sequelize);
	module.GitProfile = new GitProfile(sequelize);
	module.FbProfile = new FbProfile(sequelize);
	module.GoogleProfile = new GoogleProfile(sequelize);
	module.TwitterProfile = new TwitterProfile(sequelize);
	module.LinkedinProfile = new LinkedinProfile(sequelize);
	module.Role = new Role(sequelize);
	// World: new World(sequelize),
	// Person: new Person(sequelize),
	// Family: new Family(sequelize)
	return module
}