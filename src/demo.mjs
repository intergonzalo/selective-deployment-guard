import { resolveDeployment } from './resolver.mjs';

for (const files of [
  ['docs/architecture.md'],
  ['apps/admin/dashboard.js', 'test/dashboard.test.mjs'],
  ['shared/contracts/case.json'],
  ['runtime/unknown-handler.js'],
]) {
  console.log('\nchanges:', files);
  console.log(resolveDeployment(files));
}
