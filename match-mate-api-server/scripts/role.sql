const permissions = {};
db.permissions.find().forEach((p) => {
  permissions[p.name] = p._id;
});

// ==========================================
// ADMIN
// ==========================================

const adminPermissions = Object.values(permissions);

// ==========================================
// MODERATOR
// ==========================================

const moderatorPermissions = [
  permissions['dashboard:view'],

  permissions['user:view'],
  permissions['user:block'],
  permissions['user:unblock'],

  permissions['profile:view'],
  permissions['profile:verify'],

  permissions['media:view'],
  permissions['media:approve'],
  permissions['media:reject'],

  permissions['chat:view'],
  permissions['chat:moderate'],

  permissions['report:view'],
  permissions['report:resolve'],

  permissions['analytics:view'],
];

// ==========================================
// USER
// ==========================================

const userPermissions = [
  permissions['profile:view'],
  permissions['profile:update'],

  permissions['chat:view'],

  permissions['interest:view'],

  permissions['match:view'],

  permissions['shortlist:view'],
];

// ==========================================
// INSERT ROLES
// ==========================================

db.roles.insertMany([
  {
    name: 'Admin',
    slug: 'admin',
    description: 'System administrator with full access',
    permissions: adminPermissions,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  {
    name: 'Moderator',
    slug: 'moderator',
    description: 'Moderator with limited management access',
    permissions: moderatorPermissions,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  {
    name: 'User',
    slug: 'user',
    description: 'Regular application user',
    permissions: userPermissions,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);