
const   csymapp         = require(__dirname+'/../csymapp')
,       App  = require(__dirname+'/App')
,       to              = require('await-to-js').to

class ExternalApp extends App {
    constructor(Sequelize) {
        super(Sequelize)
    }

    
}

module.exports = (Sequelize) => {return new ExternalApp(Sequelize)}