# Security Specification

## Data Invariants
1. **Scope Isolation**: A user must only read and write their own data. Every document (UserProfile, Vehicle, MaintenanceRecord, Expense, FuelRecord, MaintenanceReminder, Breakdown) must belong to a single authenticated user, identified by `userId`.
2. **Path Security**: All document IDs must be valid alphanumeric strings matching `^[a-zA-Z0-9_\-]+$` and be at most 128 characters in size to prevent path traversal or injection attacks.
3. **Temporal Integrity**: All timestamp fields (`createdAt`, `updatedAt`) must reflect the server timestamp (`request.time`) on create and write respectively. They can never be set to arbitrary client-side values.
4. **Immutability Protection**: `id` and `userId` fields cannot be changed once written. This protects against identity spoofing and logical data orphans.
5. **Verified Auth**: Users must be authenticated before performing any CRUD operation.

---

## The "Dirty Dozen" Payloads (Exploit Scenarios)

1. **User Identity Spoofing (Create Vehicle)**:
   - *Target Collection*: `/vehicles/vehicle_123`
   - *Payload*: `{ "id": "vehicle_123", "userId": "attacker_user_id", "make": "Toyota", "model": "Camry", "year": 2021, "licensePlate": "XYZ-987", "currentOdometer": 50000 }`
   - *Exploit Attempt*: Attacker (UID: `victim_user_id`) tries to create a vehicle with `userId` set to `attacker_user_id` to pollute another user's account or masquerade.
   - *Expected Result*: `PERMISSION_DENIED`

2. **Cross-User Leak (Read Vehicle)**:
   - *Target Document*: `/vehicles/vehicle_secret`
   - *Operation*: Read
   - *Exploit Attempt*: User `attacker` tries to read `/vehicles/vehicle_secret` which has `userId: "victim"`.
   - *Expected Result*: `PERMISSION_DENIED`

3. **Field Injection (Ghost Fields)**:
   - *Target Document*: `/users/user_123`
   - *Payload*: `{ "userId": "user_123", "email": "attacker@example.com", "isAdmin": true, "theme": {} }`
   - *Exploit Attempt*: Normal user logs in and tries to inject an unauthorized `isAdmin` or `isVerified` configuration into their UserProfile.
   - *Expected Result*: `PERMISSION_DENIED`

4. **Timestamp Manipulation (Create Record)**:
   - *Target Document*: `/records/record_123`
   - *Payload*: `{ "id": "record_123", "userId": "victim_user_id", "vehicleId": "v1", "type": "oil", "title": "Change oil", "date": "2026-06-11", "cost": 100, "odometer": 50000, "createdAt": "1999-01-01T00:00:00Z" }`
   - *Exploit Attempt*: Create maintenance with manual/forged `createdAt` timestamp.
   - *Expected Result*: `PERMISSION_DENIED`

5. **Blanket Query Scraping (List All Vehicles)**:
   - *Target Collection*: `/vehicles`
   - *Query*: No filter (Attacker requests all documents)
   - *Exploit Attempt*: Bypasses where filters to list all users' vehicles.
   - *Expected Result*: `PERMISSION_DENIED`

6. **Identity Takeover (Update Vehicle parent)**:
   - *Target Document*: `/vehicles/v1`
   - *Resource State*: `{ "userId": "victim_user_id", ... }`
   - *Payload*: `{ "userId": "attacker_user_id", "make": "Toyota", "model": "Camry", "year": 2021, "licensePlate": "XYZ-987", "currentOdometer": 51000 }`
   - *Exploit Attempt*: Update a vehicle's `userId` field to adopt or swap vehicle ownership.
   - *Expected Result*: `PERMISSION_DENIED`

7. **ID-Poisoning Attack**:
   - *Target Document*: `/vehicles/some-very-long-garbage-string-exceeding-one-hundred-and-twenty-eight-characters-for-resource-exhaustion-exhaustion-exhaustion-attacks`
   - *Payload*: `{ "id": "...", "userId": "user_123", "make": "A", "model": "B", "year": 2020, "licensePlate": "C", "currentOdometer": 10 }`
   - *Exploit Attempt*: Injecting excessively long unique ID to crash the database engine or bloat index size.
   - *Expected Result*: `PERMISSION_DENIED`

8. **Invalid Enum Poisoning (Create Record)**:
   - *Target Document*: `/records/rec_1`
   - *Payload*: `{ "id": "rec_1", "userId": "user_123", "vehicleId": "v1", "type": "rocket_propellant", "title": "Change fuel", "date": "2026-06-11", "cost": 100, "odometer": 10 }`
   - *Exploit Attempt*: Creating a record with an unsupported/invalid maintenance type.
   - *Expected Result*: `PERMISSION_DENIED`

9. **Terminal State Lockdown Bypass (Update Reminder)**:
   - *Target Document*: `/reminders/rem_1`
   - *Resource State*: `{ "id": "rem_1", "userId": "user_123", "vehicleId": "v1", "type": "oil", "title": "Change Oil", "isCompleted": true }`
   - *Payload*: `{ "id": "rem_1", "userId": "user_123", "vehicleId": "v1", "type": "oil", "title": "Forced Modify", "isCompleted": false }`
   - *Exploit Attempt*: Attempting to mutate fields of an already finalized/completed reminder.
   - *Expected Result*: `PERMISSION_DENIED`

10. **Orphaned Sub-Resource (Create Record with Missing Vehicle)**:
    - *Target Document*: `/records/rec_1`
    - *Payload*: `{ "id": "rec_1", "userId": "user_123", "vehicleId": "nonexistent_vehicle_id", "type": "oil", "title": "Oil Change", "date": "2026-06-11", "cost": 50, "odometer": 10000 }`
    - *Exploit Attempt*: Forging a maintenance record mapped to a vehicle that doesn't actually exist in the DB.
    - *Expected Result*: `PERMISSION_DENIED`

11. **Negative Value Poisoning**:
    - *Target Document*: `/expenses/exp_1`
    - *Payload*: `{ "id": "exp_1", "userId": "user_123", "vehicleId": "v1", "category": "insurance", "date": "2026-06-11", "amount": -1000000 }`
    - *Exploit Attempt*: Creating negative expense/cost to overflow account metrics.
    - *Expected Result*: `PERMISSION_DENIED`

12. **Anonymous Read Leak**:
    - *Target Document*: `/users/user_1`
    - *Operation*: Read
    - *Auth Status*: Unauthenticated / Anonymous
    - *Exploit Attempt*: Read user profile details without login.
    - *Expected Result*: `PERMISSION_DENIED`

---

## Test Runner Setup (firestore.rules.test.ts)

A full `firestore.rules.test.ts` file can be executed in the development workspace. Below is a specification of tests to implement inside `firestore.rules.test.ts` if needed. Because we are using the `deploy_firebase` tool, our rules are directly verified and compiled by Firebase security engine.
