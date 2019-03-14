'use strict'

const {sequelize} = require(__dirname+'/models')
const to = require('await-to-js').to,
	sentenceCase = require('sentence-case'),
	passport = require('passport'),
	fse = require('fs-extra');

class Csystem
{
	constructor()
	{
		
	}

	async dbSync(force = false)
	{
		let [err, dontcare] = []
		;[err, dontcare] = await to(sequelize.sync({force:force}))
		if(err)
		{
			console.log(err)
			return Promise.reject(new Error(err.name));
		}
		return true;
	}

	async setup(req, res)
	{
		return true;
	}

	isMethodAllowed(req, methods)
	{
		
		if(methods.includes(req.method) === false)throw ({message: "Method not allowed", status: 405})
		return true;
	}

	makeMePrivate(req)
	{
		let self = this;
		self.isMethodAllowed(req, [0])
	}

	trimReq(req)
	{
		return { method:0, params:req.params, body:req.body}
	}

	sentenceCase(params)
	{
		let ret = {}
		for(let i in params)ret[sentenceCase(i.toLowerCase())] = params[i]
		return ret
	}

	async isAuthenticated(req, res) {
		let self = this
		let __promisifiedPassportAuthentication = function () {
		    return new Promise((resolve, reject) => {
		    	passport.authenticate('jwt', {session: false}, (err, user, info) => {
		        	if(err) {
						req.isAuthenticated = false;
						return reject(err)
					}
		        	if(info){
						req.isAuthenticated = false;
						return reject({message:info.message, status:422})
					}
		        	req.isAuthenticated = user;
		        	return resolve(user)
		        })(req, res) 
		    })
		}

		return __promisifiedPassportAuthentication().catch((err)=>{
			throw(err)
		})
	}

	async protected(req, res, next)
	{
		let self = this
		// self.isMethodAllowed(req, ["GET"]);
		let __promisifiedPassportAuthentication = function () {
		    return new Promise((resolve, reject) => {
		        passport.authenticate('jwt', {session: false}, (err, user, info) => {
		        	if(info) {
		        		info.status = 422
		        		return reject(info)
		        	}
		        	if(err)return reject(err)
		        	if(user === false)return reject({"message": "No information given", status:422});
		        	res.json(user)
		        })(req, res, next) 
		    })
		}

		return __promisifiedPassportAuthentication().catch((err)=>{
			// return Promise.reject(err)
			throw(err)
		})
	}


	async getRoutes(path){
		return new Promise((resolve, reject)=>{
			let endpoints = []
			fse
			.readdirSync(path+'/')
			.filter((modelfile) =>
				modelfile.indexOf('.') < 0
			)
			.forEach((file)=>{
				endpoints.push('/'+file)
			})
				let ret = {
					Routes:endpoints
				}
				resolve(ret)
			})
	}

	async main() {
		
	}

}

module.exports = Csystem