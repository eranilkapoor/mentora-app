import type { Connection } from 'mongoose';
import type { MongoMigration } from './migration.interface';

type MongoDatabase = NonNullable<Connection['db']>;
type MongoCollection = ReturnType<MongoDatabase['collection']>;

const collectionRenames = [
  ['tenants', 'organizations'],
  ['tenant_branding', 'organization_branding'],
  ['tenant_security_policies', 'organization_security_policies'],
] as const;

const scopedCollections = [
  'branches',
  'departments',
  'teams',
  'channel_settings',
  'lead_sources',
  'lead_stages',
  'leads',
  'lead_activities',
  'lead_assignments',
  'applications',
  'admissions',
  'tasks',
  'campaigns',
  'communications',
  'module_records',
  'workflow_rules',
  'workflow_executions',
  'report_definitions',
  'report_export_jobs',
  'crm_documents',
  'call_center_calls',
  'whatsapp_conversations',
  'scholarship_applications',
  'interviews',
  'crm_events',
  'field_visits',
  'finance_ledger_entries',
  'integration_provider_configs',
  'organization_branding',
  'organization_security_policies',
  'user_memberships',
] as const;

const migration: MongoMigration = {
  id: '202608010001',
  name: 'rename-organization-domain-fields',
  checksum: 'sha256:rename-organization-domain-fields-v1',
  async up(connection: Connection): Promise<void> {
    const db = getDb(connection);
    await renameCollections(db, collectionRenames);
    await Promise.all(
      scopedCollections.map((collectionName) =>
        renameScopedFields(db.collection(collectionName), {
          from: 'tenantId',
          to: 'organizationId',
        }),
      ),
    );
  },
  async down(connection: Connection): Promise<void> {
    const db = getDb(connection);
    await Promise.all(
      scopedCollections.map((collectionName) =>
        renameScopedFields(db.collection(collectionName), {
          from: 'organizationId',
          to: 'tenantId',
        }),
      ),
    );
    await renameCollections(
      db,
      collectionRenames.map(([from, to]) => [to, from] as const),
    );
  },
};

function getDb(connection: Connection): MongoDatabase {
  if (!connection.db) {
    throw new Error('Mongo connection database is not available');
  }
  return connection.db;
}

async function renameCollections(
  db: MongoDatabase,
  renames: readonly (readonly [string, string])[],
): Promise<void> {
  const existing = new Set(
    (await db.listCollections({}, { nameOnly: true }).toArray()).map(
      (collection) => collection.name,
    ),
  );

  for (const [from, to] of renames) {
    if (existing.has(from) && !existing.has(to)) {
      await db.collection(from).rename(to);
      existing.delete(from);
      existing.add(to);
    }
  }
}

async function renameScopedFields(
  collection: MongoCollection,
  field: { from: string; to: string },
): Promise<void> {
  await collection.updateMany(
    { [field.from]: { $exists: true } },
    {
      $rename: {
        [field.from]: field.to,
        [`metadata.${field.from}`]: `metadata.${field.to}`,
      },
    },
  );
}

export default migration;
