'use strict'
const to = require('await-to-js').to,
passport = require('passport'),
csystem = require(__dirname+"/../csystem").csystem,
{sequelize} = require(__dirname+"/../csystem").models
,Familyfe = require(__dirname+'/../../modules/node-familyfe')(sequelize)
,User = require(__dirname+"/user")
,Auth = require(__dirname+"/auth")
,Profile = require(__dirname+"/profile")
,EmailProfile = require(__dirname+"/profiles/email")
,GoogleProfile = require(__dirname+"/profiles/google")
,GithubProfile = require(__dirname+"/profiles/github")
,FacebookProfile = require(__dirname+"/profiles/facebook")
,TwitterProfile = require(__dirname+"/profiles/twitter")
,LinkedinProfile = require(__dirname+"/profiles/linkedin")
,TelephoneProfile = require(__dirname+"/profiles/telephone")
,Apps = require(__dirname+"/app/")
,Family = require(__dirname+"/family/")

class csymapp extends csystem {

	constructor() {
		super()
	}

	async main(req, res, next) {
		let self = this
		let endpoints = await self.getRoutes(__dirname)
		res.json(endpoints)
    }
    
    async user(req, res, nex) {
        let [err, care] = [];
        ;[err, care] = await to(User.main(req, res));
        if(err) throw (err)
    }

    async auth(req, res, next) {
        let [err, care] = [];
        ;[err, care] = await to(Auth.main(req, res, next));
        if(err) throw (err)
    }

    async profile(req, res, next) {
        let [err, care] = [];
        ;[err, care] = await to(Profile.main(req, res, next));
        if(err) throw (err)
    }

    async emailprofile(req, res, next) {
        let [err, care] = [];
        ;[err, care] = await to(EmailProfile.main(req, res, next));
        if(err) throw (err)
    }

    async googleprofile(req, res, next) {
        let [err, care] = [];
        ;[err, care] = await to(GoogleProfile.main(req, res, next));
        if(err) throw (err)
    }
    
    async githubprofile(req, res, next) {
        let [err, care] = [];
        ;[err, care] = await to(GithubProfile.main(req, res, next));
        if(err) throw (err)
    }

    async facebookprofile(req, res, next) {
        let [err, care] = [];
        ;[err, care] = await to(FacebookProfile.main(req, res, next));
        if(err) throw (err)
    }

    
    async twitterprofile(req, res, next) {
        let [err, care] = [];
        ;[err, care] = await to(TwitterProfile.main(req, res, next));
        if(err) throw (err)
    }
    async linkedinprofile(req, res, next) {
        let [err, care] = [];
        ;[err, care] = await to(LinkedinProfile.main(req, res, next));
        if(err) throw (err)
    }
    
    async telephoneprofile(req, res, next) {
        let [err, care] = [];
        ;[err, care] = await to(TelephoneProfile.main(req, res, next));
        if(err) throw (err)
    }

    async app(req, res, next) {
        let self = this
        let [err, care] = [];
        ;[err, care] = await to(Apps.main(req, res, next));
        if(err) throw (err)
    }

    async family(req, res, next) {
        let self = this
        let [err, care] = [];
        ;[err, care] = await to(Family.main(req, res, next));
        if(err) throw (err)
    }
}

module.exports = csymapp
