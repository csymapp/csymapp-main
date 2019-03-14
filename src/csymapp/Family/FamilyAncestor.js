
const   csymapp         = require(__dirname+'/../csymapp')
,       AbstractFamily  = require(__dirname+'/AbstractFamily')

class FamilyAncestor extends AbstractFamily {
    constructor(Sequelize) {
        super(Sequelize)
    }
}

module.exports = (Sequelize) => {return new FamilyAncestor(Sequelize)}