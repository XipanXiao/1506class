define(function() {

  return angular.module('PermissionModule', []).factory('perm',
      function() {
    return {
      ROLES: {
        PRINCIPAL: {perm: 0xFF, label: '管理员'},
        INSPECTION: {perm: 0x55, label: '学院督察'},
        TEACHER: {perm: 0x3F, label: '辅导员'},
        LEADER: {perm: 0xF, label: '组长'},
        STUDENT: {perm: 0x7, label: '学员'},
        NONE: {perm: 0, label: '客人'}
      },
      getRole: function(user, classInfo) {
        if (!user.permission || user.permission < 0) return ROLES.NONE;
        
        for (var key in this.ROLES) {
          var role = this.ROLES[key];
          if (user.permission >= role.perm) return role;
        }
      },
      isAdmin: function(user) {
        return user.permission > this.ROLES.STUDENT.perm;
      }
    };
  });
});
