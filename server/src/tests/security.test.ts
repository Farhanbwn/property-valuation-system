import assert from 'assert';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { updateInspectionSchema } from '../validators/inspection.validator';
import { createUserSchema, resetPasswordSchema } from '../validators/user.validator';
import { escapeRegex } from '../controllers/valuation.controller';
import { config } from '../config/env';

async function runSecurityTests() {
  console.log('🔒 Starting Security & Hardening Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // --- 1. Authentication & Password Hardening Tests ---
  console.log('[Phase 3] Identity & Access Control Validations:');
  
  test('Rejects passwords under 8 characters in registration', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'short'
    });
    assert.strictEqual(result.success, false, 'Should reject short passwords');
  });

  test('Accepts strong passwords in registration', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'StrongPassword123!'
    });
    assert.strictEqual(result.success, true, 'Should accept strong passwords');
  });

  test('Rejects invalid email formats', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'SomePassword123!'
    });
    assert.strictEqual(result.success, false, 'Should reject invalid email');
  });

  test('Enforces min 8 characters on password reset', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'short'
    });
    assert.strictEqual(result.success, false, 'Should reject short reset password');
  });

  // --- 2. Input Validation & Mass-Assignment Defense ---
  console.log('\n[Phase 4] Input & Mass-Assignment Protections:');

  test('Inspection update schema strips or ignores unauthorized status/ownership tampering', () => {
    const maliciousPayload = {
      status: 'reviewed', // Trying to forge status transition
      inspectorId: '65f123456789012345678901', // Trying to reassign inspector
      parentUserId: '65f123456789012345678902', // Trying to change parent
      ownerName: 'Updated Name',
      coverAreaSqFt: 500
    };
    
    const parsed = updateInspectionSchema.parse(maliciousPayload);
    assert.strictEqual((parsed as any).status, undefined, 'Status must not be updatable via general update schema');
    assert.strictEqual((parsed as any).inspectorId, undefined, 'Inspector ID must not be updatable');
    assert.strictEqual((parsed as any).parentUserId, undefined, 'Parent User ID must not be updatable');
    assert.strictEqual(parsed.ownerName, 'Updated Name', 'Permitted fields must be parsed correctly');
    assert.strictEqual(parsed.coverAreaSqFt, 500, 'Permitted fields must be parsed correctly');
  });

  test('User creation schema rejects non-permitted roles', () => {
    const result = createUserSchema.safeParse({
      name: 'Attacker',
      email: 'attacker@example.com',
      password: 'Password123!',
      role: 'super_root_admin' // Invalid role
    });
    assert.strictEqual(result.success, false, 'Should reject unauthorized role value');
  });

  // --- 3. ReDoS & Injection Defense ---
  console.log('\n[Phase 4 & 7] ReDoS & Injection Mitigations:');

  test('escapeRegex neutralizes regex meta-characters', () => {
    const maliciousPattern = '.*+?^${}()|[]\\';
    const escaped = escapeRegex(maliciousPattern);
    assert.strictEqual(escaped, '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    // Ensure safe RegExp compilation
    const regex = new RegExp(escaped, 'i');
    assert.strictEqual(regex.test('.*+?^${}()|[]\\'), true);
    assert.strictEqual(regex.test('regular text'), false);
  });

  test('escapeRegex prevents ReDoS catastrophic backtracking injection', () => {
    const redosPayload = '(a+)+$';
    const escaped = escapeRegex(redosPayload);
    const regex = new RegExp(escaped);
    // Should match literal '(a+)+$', not evaluate catastrophic regex
    assert.strictEqual(regex.test('aaaaaaaaaaaaaaaaaaaaaaaaaX'), false);
    assert.strictEqual(regex.test('(a+)+$'), true);
  });

  // --- 4. Secrets & Configuration Hygiene ---
  console.log('\n[Phase 2] Configuration & Secrets Hardening:');

  test('JWT secret is resolved and is not hardcoded default string', () => {
    assert.ok(config.jwtSecret, 'JWT Secret must be non-empty');
    assert.notStrictEqual(config.jwtSecret, 'fallback_secret_key', 'Must not be insecure static fallback key');
    assert.ok(config.jwtSecret.length >= 32, 'Secret must be at least 32 characters long');
  });

  test('Client CORS URL is configured', () => {
    assert.ok(config.clientUrl, 'Client URL must be defined for CORS origin matching');
  });

  console.log(`\n========================================`);
  console.log(`Security Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
