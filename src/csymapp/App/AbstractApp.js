
const csymapp   = require(__dirname+'/../csymapp')

class AbstractApp extends csymapp {
    constructor(Sequelize) {
        super(Sequelize)
        let self = this;

        let opts = {
            nobody: { // Role name
              can: [ // list of allowed operations
                { 
                    name: 'CsystemApp:create',
                    when: async (params) => process.env.SETUP
                },
                { 
                    name: 'App:installForFamily',
                    when: async (params) => process.env.SETUP
                },
                { 
                    name: 'role:create',
                    when: async (params) => process.env.SETUP
                },
                { 
                    name: 'memberRole:createAllforAppforFamily',
                    when: async (params) => process.env.SETUP
                },
                { 
                    name: 'roleId:get',
                    when: async (params) => process.env.SETUP
                },
                { 
                    name: 'memberRole:create',
                    when: async (params) => process.env.SETUP
                },
                { 
                    name: 'App:getAll',
                    when: async (params) => process.env.SETUP
                }
              ]
            },
            user: {
              can: [
                
              ],
              inherits: ['nobody']
            },
            admin: {
              can: [],
              inherits: ['user']
            }
          }
        self.rbac = new self.RBAC(opts)
    }
}

module.exports =  AbstractApp