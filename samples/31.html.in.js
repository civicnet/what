module.exports = () => ({
  '$': {
    first  : 'John',
    last   : 'Doe',
    age    : 35,
    gender : 'male'
  },

  '#': {
    'suspend' : '/account/suspend',
    'delete'  : '/account/delete'
  },

  '~': {
    'leave': '/group/leave'
  },
  
  '&': {
    'groups': [
      { id: 'publishers', name: 'Publishers' },
      { id: 'moderators', name: 'Moderators' },
      { id: 'curators',   name: 'Curators'   }
    ],

    'logins': [
      { date: new Date('2018-03-24T09:45:00Z').toUTCString(), ip: '192.168.1.102' },
      { date: new Date('2018-03-23T09:45:00Z').toUTCString(), ip: '192.168.1.102' },
      { date: new Date('2018-03-22T09:45:00Z').toUTCString(), ip: '192.168.1.102' },
      { date: new Date('2018-03-21T09:45:00Z').toUTCString(), ip: '192.168.1.102' }
    ]
  }, 
  
  '@': {
    'errors' : [
      new Error('File not found')
    ]
  }  
});
