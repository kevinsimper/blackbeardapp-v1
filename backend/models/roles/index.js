var roles = {
  ADMIN: 'ADMIN',
  USER: 'USER'
}

var hierarchy = {}
hierarchy[roles.USER] = [roles.USER]
hierarchy[roles.ADMIN] = [roles.USER, roles.ADMIN]

module.exports = roles

module.exports.isAllowed = function(roleType, role) {
  if(hierarchy[role].indexOf(roleType) === -1) {
    return false
  } else {
    return true
  }
}
