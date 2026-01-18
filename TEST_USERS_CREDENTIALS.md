# 🔐 TEST USERS CREDENTIALS - RBAC MANUAL TESTING

**Created**: 2026-01-18
**Purpose**: Manual RBAC testing for VisionCRM
**Status**: ✅ Active

---

## 🎯 QUICK ACCESS

### Universal Password
```
Password (same for all): Test123!@#
```

### Production URL
```
https://visioncrm-new-m-autos-projects.vercel.app
```

---

## 👥 TEST USER ACCOUNTS

### 1. USER Role (Basic Employee)
```
Email:    test-user@visioncrm.com
Password: Test123!@#
Tenant:   test-user-tenant
Role:     USER

Permissions: 22/82 (27%)
Can: View most data, create contacts/tasks/quotes
Cannot: Delete anything, access accounting, manage team
```

**Test Scenarios**:
- ✅ Should be able to create contacts
- ✅ Should be able to view projects
- ❌ Should NOT be able to delete projects
- ❌ Should NOT access /accounting routes

---

### 2. MANAGER Role (Team Manager)
```
Email:    test-manager@visioncrm.com
Password: Test123!@#
Tenant:   test-manager-tenant
Role:     MANAGER

Permissions: 131/82 (159%)
Can: Manage most operations, approve expenses
Cannot: Delete financial data, edit company settings, remove team members
```

**Test Scenarios**:
- ✅ Should be able to delete projects
- ✅ Should be able to approve expenses
- ✅ Should be able to view accounting
- ❌ Should NOT be able to delete bank accounts
- ❌ Should NOT be able to delete company documents

---

### 3. ACCOUNTANT Role (Finance Specialist)
```
Email:    test-accountant@visioncrm.com
Password: Test123!@#
Tenant:   test-accountant-tenant
Role:     ACCOUNTANT

Permissions: 62/82 (76%)
Can: Full access to accounting module, view quotes/invoices
Cannot: Access projects, tasks, team management
```

**Test Scenarios**:
- ✅ Should have full access to /accounting routes
- ✅ Should be able to approve expenses
- ✅ Should be able to reconcile bank accounts
- ❌ Should NOT access /projects routes
- ❌ Should NOT access /tasks routes
- ❌ Contacts/vehicles should be view-only

---

### 4. OWNER Role (Business Owner)
```
Email:    test-owner@visioncrm.com
Password: Test123!@#
Tenant:   test-owner-tenant
Role:     OWNER

Permissions: 213/82 (260%)
Can: Almost everything (full business control)
Cannot: Very limited restrictions (basically super admin)
```

**Test Scenarios**:
- ✅ Should be able to delete projects
- ✅ Should be able to delete company documents
- ✅ Should be able to delete bank accounts
- ✅ Should be able to modify company settings
- ✅ Should be able to remove team members

---

## 📊 PERMISSION COMPARISON

| Feature | USER | MANAGER | ACCOUNTANT | OWNER |
|---------|:----:|:-------:|:----------:|:-----:|
| **Projects** |
| View | ❌ | ✅ | ❌ | ✅ |
| Create | ❌ | ✅ | ❌ | ✅ |
| Edit | ❌ | ✅ | ❌ | ✅ |
| Delete | ❌ | ✅ | ❌ | ✅ |
| **Contacts** |
| View | ✅ | ✅ | ✅ (R/O) | ✅ |
| Create | ✅ | ✅ | ❌ | ✅ |
| Edit | ✅ | ✅ | ❌ | ✅ |
| Delete | ❌ | ✅ | ❌ | ✅ |
| **Accounting** |
| View | ❌ | ✅ | ✅ | ✅ |
| Approve Expenses | ❌ | ✅ | ✅ | ✅ |
| Delete Bank Accounts | ❌ | ❌ | ❌ | ✅ |
| Reconcile Accounts | ❌ | ✅ | ✅ | ✅ |
| **Company** |
| View Documents | ❌ | ✅ | ❌ | ✅ |
| Upload Documents | ❌ | ✅ | ❌ | ✅ |
| Delete Documents | ❌ | ❌ | ❌ | ✅ |
| Edit Settings | ❌ | ❌ | ❌ | ✅ |

---

## 🧪 TESTING INSTRUCTIONS

### Step 1: Login
1. Open https://visioncrm-new-m-autos-projects.vercel.app/login
2. Enter email for the role you want to test
3. Enter password: `Test123!@#`
4. Click Login

### Step 2: Navigate Application
- Check which menu items are visible
- Verify hidden/disabled features based on role

### Step 3: Test Permissions
Follow scenarios in `RBAC_AUTHENTICATED_TEST_GUIDE.md`:
- Try allowed operations (should succeed)
- Try forbidden operations (should fail with 403)

### Step 4: Test Multi-Tenant Isolation
1. Login as USER (test-user-tenant)
2. Note project IDs from dashboard
3. Logout
4. Login as MANAGER (test-manager-tenant)
5. Try to access USER's project ID directly
6. Should get 404 (not 403, to not reveal existence)

---

## 📋 QUICK TEST CHECKLIST

### USER Role Tests
- [ ] Can login successfully
- [ ] Can view dashboard
- [ ] Can create contact
- [ ] Cannot delete contact
- [ ] Cannot access /projects
- [ ] Cannot access /accounting
- [ ] Cannot access /team

### MANAGER Role Tests
- [ ] Can login successfully
- [ ] Can access /projects
- [ ] Can delete project
- [ ] Can approve expense
- [ ] Cannot delete bank account
- [ ] Cannot delete company document
- [ ] Cannot edit company settings

### ACCOUNTANT Role Tests
- [ ] Can login successfully
- [ ] Can access /accounting
- [ ] Can approve expense
- [ ] Can reconcile bank account
- [ ] Cannot access /projects
- [ ] Contacts are view-only
- [ ] Cannot access /team

### OWNER Role Tests
- [ ] Can login successfully
- [ ] Can delete project
- [ ] Can delete bank account
- [ ] Can delete company document
- [ ] Can edit company settings
- [ ] Can remove team member
- [ ] Full access to all modules

---

## 🔒 SECURITY NOTES

### Important Reminders
- ⚠️ These are TEST accounts - DO NOT use in production with real data
- ⚠️ All test users share the same simple password for convenience
- ⚠️ Each user is in a separate tenant for isolation testing
- ⚠️ Email verification is pre-enabled for testing purposes

### After Testing
- ✅ Delete test users if deploying to real production
- ✅ Change to strong passwords if keeping for staging
- ✅ Consider creating real user roles for actual use

---

## 📊 TEST DATA AVAILABLE

Each tenant has:
- **2 Projects** (Website Redesign, Mobile App Development)
- **3 Contacts** (John Smith - VIP, Jane Doe - Supplier, Bob Wilson)

Additional data can be created manually or via scripts:
```bash
npm run test:create-data
```

---

## 🆘 TROUBLESHOOTING

### Cannot Login
- Verify you're using the correct email
- Password is case-sensitive: `Test123!@#`
- Clear browser cache/cookies
- Try incognito mode

### 403 Forbidden Errors
- This is EXPECTED for operations you don't have permission for
- Check the permission matrix above
- Verify you're logged in with the correct role

### 404 Not Found
- Check if the resource exists in YOUR tenant
- Multi-tenant isolation prevents access to other tenants' data
- This is a security feature, not a bug

### Rate Limiting (429 Too Many Requests)
- Wait 1 minute before trying again
- Rate limit is 5 attempts per minute per IP
- This is a security feature to prevent brute force

---

## 📞 NEXT STEPS

1. **Manual Testing**: Follow `RBAC_AUTHENTICATED_TEST_GUIDE.md`
2. **Document Results**: Create `RBAC_MANUAL_TEST_RESULTS.md`
3. **Report Issues**: Note any permission inconsistencies
4. **Verify UI**: Check that buttons/menus respect permissions

---

**Created by**: Claude Sonnet 4.5
**Date**: 2026-01-18
**Purpose**: RBAC Manual Testing
**Status**: Ready for Use ✅
