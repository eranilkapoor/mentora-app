db.permissions.insertMany([
  // =========================
  // 🔐 ADMIN / SYSTEM
  // =========================
  {
    name: 'admin:manage',
    description: 'Full admin access',
    module: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'system:config',
    description: 'Manage system configuration',
    module: 'system',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'dashboard:view',
    description: 'View admin dashboard',
    module: 'dashboard',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // =========================
  // 👤 USER MANAGEMENT
  // =========================
  {
    name: 'user:view',
    description: 'View users',
    module: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'user:create',
    description: 'Create users',
    module: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'user:update',
    description: 'Update users',
    module: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'user:delete',
    description: 'Delete users',
    module: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'user:block',
    description: 'Block users',
    module: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'user:unblock',
    description: 'Unblock users',
    module: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // =========================
  // 🧾 PROFILE
  // =========================
  {
    name: 'profile:view',
    description: 'View profiles',
    module: 'profile',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'profile:update',
    description: 'Update profiles',
    module: 'profile',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'profile:delete',
    description: 'Delete profiles',
    module: 'profile',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'profile:verify',
    description: 'Verify profiles',
    module: 'profile',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // =========================
  // 📸 MEDIA
  // =========================
  {
    name: 'media:view',
    description: 'View media',
    module: 'media',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'media:approve',
    description: 'Approve media',
    module: 'media',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'media:reject',
    description: 'Reject media',
    module: 'media',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // =========================
  // 💬 CHAT
  // =========================
  {
    name: 'chat:view',
    description: 'View chats',
    module: 'chat',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'chat:moderate',
    description: 'Moderate chats',
    module: 'chat',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // =========================
  // 🚨 REPORTS
  // =========================
  {
    name: 'report:view',
    description: 'View reports',
    module: 'report',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'report:resolve',
    description: 'Resolve reports',
    module: 'report',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // =========================
  // 💰 PLANS
  // =========================
  {
    name: 'plan:create',
    description: 'Create plans',
    module: 'plan',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'plan:update',
    description: 'Update plans',
    module: 'plan',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'plan:view',
    description: 'View plans',
    module: 'plan',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // =========================
  // 📊 ANALYTICS
  // =========================
  {
    name: 'analytics:view',
    description: 'View analytics',
    module: 'analytics',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // =========================
  // 📢 NOTIFICATIONS
  // =========================
  {
    name: 'notification:send',
    description: 'Send notifications',
    module: 'notification',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // =========================
  // 📝 ACTIVITY
  // =========================
  {
    name: 'activity:view',
    description: 'View activity logs',
    module: 'activity',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);