'use strict'
const to = require('await-to-js').to
,passport = require('passport')
,csystem = require(__dirname+"/../../csystem").csystem
,{sequelize} = require(__dirname+"/../../csystem").models
,Familyfe = require(__dirname+'/../../../modules/node-familyfe')(sequelize)

class Family extends csystem{

	constructor() {
		super()
    }

    async main(req, res){
		let self = this;
		let method = req.method;
        let [err, care] = [];
        			
		switch(method) {
            case 'GET': 
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
				;[err, care] = await to(self.postFamily(req, res));
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

    async postFamily(req, res) {
        return true
    }

}

module.exports = new Family();