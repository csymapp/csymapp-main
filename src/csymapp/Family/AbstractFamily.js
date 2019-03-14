
const csymapp   = require(__dirname+'/../csymapp')

class AbstractFamily extends csymapp {
    constructor(Sequelize) {
        super(Sequelize)
        let self = this;

        let opts = {
            nobody: { // Role name
              can: [ // list of allowed operations
                'family:createInWorld',
                { 
                    name: 'family:listAll',
                    when: async (params) => process.env.SETUP
                },
                { 
                    name: 'family:updateSpecific',
                    when: async (params) => process.env.SETUP
                },
                { 
                    name: 'familyMember:create',
                    when: async (params) => process.env.SETUP
                },
                { 
                    name: 'familyApps:listAll',
                    when: async (params) => process.env.SETUP
                }
              ]
            },
            user: {
              can: [
                'family:createInFamily', 
                'family:listSpecific'
              ],
              inherits: ['nobody']
            },
            admin: {
              can: ['family:updateSpecific', 'family:deleteSpecific'],
              inherits: ['user']
            }
          }
        self.rbac = new self.RBAC(opts)
    }
}

module.exports =  AbstractFamily