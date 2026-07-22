import { DATA_ARCHIVE_POLICY_DAYS } from '@/common/constants';

function main(): void {
  console.log('Mongo archive policy');

  for (const [collection, policy] of Object.entries(DATA_ARCHIVE_POLICY_DAYS)) {
    console.log(
      [
        collection,
        `archiveAfter=${policy.archiveAfterDays}d`,
        `deleteAfter=${policy.deleteAfterDays}d`,
        `dateField=${policy.dateField}`,
        `archiveCollection=${policy.archiveCollection}`,
      ].join(' '),
    );
  }
}

main();
