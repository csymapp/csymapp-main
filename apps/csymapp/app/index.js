'use strict'
const to = require('await-to-js').to
,passport = require('passport')
,csystem = require(__dirname+"/../../csystem").csystem
,{sequelize} = require(__dirname+"/../../csystem").models
,Familyfe = require(__dirname+'/../../../modules/node-familyfe')(sequelize)

class App extends csystem{

	constructor() {
		super()
    }

    async preGetApps(req, res) {
        let whichType = req.body.app || 'all'
        ,self = this
        ,[err, care] = []

        switch(whichType){
            case 'all':
                [err, care] = await to(self.getApps(req, res)) 
                if(err) throw err
                break;
            case 'csystem':
                [err, care] = await to(self.getCsystemApps(req, res)) 
                if(err) throw err
                break;
        }

        return care;

    }

    async patchApps(req, res) {
        let self = this,
        app = req.params.v1
        , [err, care] = []

        ;[err, care] = await to(self.isAuthenticated(res, req))
        if(err) {
            throw err
        }
        
        let person = care.uid
        ;[err, care] = await to(Familyfe.Person.hasRole('root', 'csystem', person, 1))
        //Familyfe.Family.memberHasRoleinFamilyforApp({AppName:"csystem"}, "root", 1, myuid))
        if(err) throw err
        if(Object.keys(care).length === 0){
            throw ('permission denied')
        } 

        let data = JSON.parse(JSON.stringify(req.body))
        ;[err, care] = await to (Familyfe.apps.update(data, {AppName:app}))
        if(err) throw (err)
        return care;
    }
    
    async postApps(req, res) {
        let self = this,
        app = req.params.v1
        , [err, care] = []
        , body = req.body

        ;[err, care] = await to(self.isAuthenticated(res, req))
        if(err) {
            throw err
        }
        
        let person = care.uid
        ;[err, care] = await to(Familyfe.Person.hasRole('root', 'csystem', person, 1))
        if(err) throw err
        if(Object.keys(care).length === 0){
            throw ('permission denied')
        } 
        let action = body.action || "install"

        let data = JSON.parse(JSON.stringify(req.body))
        ;[err, care] = await to (Familyfe.apps.setupSingleapp(app, 1))
        if(err) throw (err)
        return care;
    }
    
    async getCsystemApps(req, res) {
        let appIdorName = req.params.v1
        , [err, care] = []
        , self = this
        , body = req.body

        ;[err, care] = await to(self.isAuthenticated(res, req))
        if(err) {
            throw err
        }
        
        let person = care.uid
        // ;[err, care] = await to(Familyfe.Person.hasRole('root', 'csystem', person, 1))
        // if(err) throw err
        // if(Object.keys(care).length === 0){
        //     throw ('permission denied')
        // } 
        let [_err,csyAdmin] = await to(Familyfe.Family.memberHasRoleinFamilyforApp({AppName:"csystem"}, "root", 1, person))
        if(_err)throw ({ status:422, message:{Permission: "You are not allowed to modify that app"}})

        if(!csyAdmin)
            throw ({ status:422, message:{Permission: "You are not allowed to modify that app"}})
        
        // is csystem Admin
        // now list csystem applications...
        ;[err, care] = await to(Familyfe.apps.listAllApps())
        return care
    }

    
    async deleteApps(req, res) {
        let appIdorName = req.params.v1
        , [err, care] = []
        , self = this
        , body = req.body
        , app = req.params.v1

        if(!app)throw ({ status:422, message:{app: "Please provide the app to modify"}})

        ;[err, care] = await to(self.isAuthenticated(res, req))
        if(err) {
            throw err
        }
        
        let person = care.uid
        // ;[err, care] = await to(Familyfe.Person.hasRole('root', 'csystem', person, 1))
        // if(err) throw err
        // if(Object.keys(care).length === 0){
        //     throw ('permission denied')
        // } 
        let [_err,csyAdmin] = await to(Familyfe.Family.memberHasRoleinFamilyforApp({AppName:"csystem"}, "root", 1, person))
        if(_err)throw ({ status:422, message:{Permission: "You are not allowed to modify that app"}})

        if(!csyAdmin)
            throw ({ status:422, message:{Permission: "You are not allowed to modify that app"}})
        // is csystem Admin
        // now list csystem applications...
        ;[err, care] = await to(Familyfe.apps.delete({AppName:app}))
        return care
    }


    async getApps(req, res) {
        let appIdorName = req.params.v1
        , [err, care] = []
        , self = this
        , body = req.body
        , uid = body.uid

        // console.log(body)
        // list apps
        if(uid) {
            // should be logged in____
            // ;[err, care] = await to(Familyfe.Person.getApps(uid));
            ;[err, care] = await to(Familyfe.apps.getAllApps(true, {Enabled: true}, {Person:{PersonUid:uid}}));
            if(err) throw err
            // console.log(care)
            return care
        }
        else {
            if(!appIdorName) {
                [err, care] = await to(Familyfe.apps.getAllApps(true, {Enabled: true}));
                if(err) throw err
                return care
            }
            // list single app
            ;[err, care] = await to(Familyfe.apps.getAllApps(true, {AppId: appIdorName, Enabled: true}));
            if(err) throw err
            if(!Object.keys(care).length) {
                ;[err, care] = await to(Familyfe.apps.getAllApps(true, {AppName: appIdorName, Enabled: true}));
                if(err) throw err
            }
        }
        // console.log(care)
        return care
    }

    async main(req, res){
		let self = this;
		let method = req.method;
        let [err, care] = [];
        			
		switch(method) {
            case 'GET': 
                // res.send('listing apps.')
                ;[err, care] = await to(self.preGetApps(req, res));
                if (err) throw err
                res.json(care)	
                break;
            case 'PATCH':
				;[err, care] = await to(self.patchApps(req, res));
				if (err) throw err
				res.json(care)	
				break;	
					
			case 'POST':
				;[err, care] = await to(self.postApps(req, res));
				if (err) throw err
				res.json(care)	
				break;	
					
			case 'DELETE':
				;[err, care] = await to(self.deleteApps(req, res));
				if (err) throw err
				res.json(care)	
				break;
			
			default:
				res.send('still building this sections');
		}
    }

}

module.exports = new App();