const RBAC  = require('easy-rbac')

class csymapp {
    constructor(Sequelize) {
        let self = this;
        self.Sequelize = self.sequelize = Sequelize
        self.RBAC = RBAC

    }

    async confirmMemberHasRoleInFamily(uid, family, application, role) {
        if(process.env.SETUP) {
            if(role === 'nobody' && process.env.SETUP) 
            return true;
        }
        

        // let self = this
        // ,[err, care] = await to(self.sequelize.models.Family.findAll(
        //     {
        //         where: { FamilyId: family },
        //         include: {
        //             model: self.sequelize.models.Family,
        //             as: 'ancestors',
        //         },
        //         order: [ [ { model: self.sequelize.models.Family, as: 'ancestors' }, 'hierarchyLevel' ] ]
        //     }
        // ))
        // if(err) throw err
        // return care
        return false;
    }
}

module.exports = csymapp;