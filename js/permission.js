define('permission', ['utils'], function() {

  return angular.module('PermissionModule', ['UtilsModule']).factory('perm',
      function(utils) {
    return {
      user: null,
      ROLES: {
        STUDENT: 0x3,
        CLASS_READER: 0x7,
        LEADER: 0xF,
        YEAR_LEADER: 0x3F,
        DISTRICT_INSPECTOR: 0x47,
        DISTRICT_ADMIN: 0xCF,
        FINANCE: 0x103,
        ORDER_MANAGER: 0x303,
        COUNTRY_INSPECTOR: 0x457,
        COUNTRY_ADMIN: 0xFFF,
        ADMIN: 0xFFFF
      },
      permissions: {
        // 0xFFFF: /*11 11 11 11 11 11*/'系统管理员', // rw all data
        0xFFF:  /*11 11 11 11 11 11*/'管理员',    // rw country data
        0x457:  /*01 00 01 01 01 11*/'理事会',    // r  country data
        0x303:  /*00 11 00 00 00 11*/'订单管理',  // rw orders.
        0x103:  /*00 01 00 00 00 11*/'财务',     // rw orders, but no address.
        0xCF:   /*00 00 11 00 11 11*/'地区管理员',    // rw district data
        0x47:   /*00 00 01 00 01 11*/'常务理事',    // r district data
        0x3F:   /*00 00 00 11 11 11*/'年级组长',  // rw classes of the year
        0xF:    /*00 00 00 00 11 11*/'组长',     // rw class data
        0x3:    /*00 00 00 00 00 11*/'学员'     // rw own data
      },
      isAdmin: function() {
        return this.user &&
            (this.user.permission & this.ROLES.CLASS_READER) ==
                this.ROLES.CLASS_READER;
      },
      isTeacher: function() {
        return this.user && this.user.is_teacher;
      },
      /// Class leaders (and below) should see only classes of the same year.
      checkClass: function(classInfo) {
        return (this.user.permission & this.ROLES.LEADER) == this.ROLES.LEADER &&
            this.user.classInfo.id == classInfo.id;
      },
      checkYear: function(user, classInfo) {
        return (user.permission & this.ROLES.YEAR_LEADER) == 
          this.ROLES.YEAR_LEADER &&
          user.classInfo.start_year == classInfo.start_year;
      },
      canWrite: function(classInfo) {
        if (!this.user || !classInfo) return false;
        if (this.isSysAdmin()) return true;

        if (!classInfo.perm_level) {
          return true;
        }

        var perm = this.user.permission >> ((classInfo.perm_level - 1) * 2);
        if (!(perm & 2)) return false;
        
        return this.checkClass(classInfo) ||
            this.checkYear(this.user, classInfo) ||
            this.canWriteDistrict(classInfo.district);
      },
      level: function(permission) {
        var result = 0;
        for (;permission > 0; result++) {
          permission = (permission >> 2);
        }
        
        return result;
      },
      lowerPermissions: function() {
        var that = this;
        return utils.where(utils.keys(this.permissions), function(perm) {
          return that.canGrant(perm);
        });
      },
      canGrant: function(perm) {
        if (!this.user) return false;
        return (this.user.permission & perm) == perm;
      },
      isYearLeader: function() {
        return this.user && 
            (this.user.permission & this.ROLES.YEAR_LEADER) == 
                this.ROLES.YEAR_LEADER;
      },
      isSysAdmin: function() {
        return this.user && 
            (this.user.permission & this.ROLES.COUNTRY_ADMIN) ==
                this.ROLES.COUNTRY_ADMIN;
      },
      isOrderAdmin: function() {
        return this.user && 
            (this.user.permission & this.ROLES.FINANCE) == this.ROLES.FINANCE;
      },
      isCountryInspector: function() {
        return this.user && 
            (this.user.permission & this.ROLES.COUNTRY_INSPECTOR) ==
                this.ROLES.COUNTRY_INSPECTOR;
      },
      isDistrictInspector: function() {
        return this.user && 
            (this.user.permission & this.ROLES.DISTRICT_INSPECTOR) ==
                this.ROLES.DISTRICT_INSPECTOR;
      },
      isDistrictAdmin: function() {
        return this.user && 
            (this.user.permission & this.ROLES.DISTRICT_ADMIN) ==
                this.ROLES.DISTRICT_ADMIN;
      },
      canReadDistrict: function(district) {
        return this.isSysAdmin() || this.isCountryInspector() ||
            this.isDistrictInspector() && this.user.district == district;
      },
      canWriteDistrict: function(district) {
        return this.isSysAdmin() ||
            this.isDistrictAdmin() && this.user.district == district;
      },
      canReadOrders: function() {
        return this.isOrderAdmin() ||
            this.isAdmin() ||
            this.isDistrictInspector();
      },
      isElectionOwner: function(election) {
        return this.isSysAdmin() ||
            election && election.organizer == this.user.id;
      },
      isMasterTeacherOf: function(classInfo) {
        return this.user.id == classInfo.teacher_id;
      },
      isPreClass: function() {
        return this.user.classInfo.department_id < 5;
      }
    };
  });
});
