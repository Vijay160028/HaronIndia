# Backend Profile Update - Quick Summary

## API Endpoint
**PUT** `/api/auth/profile`

**Auth**: Bearer Token Required

**Request Body**:
```json
{
  "fullName": "John Doe",
  "phoneNumber": "9876543210",
  "email": "john@example.com",
  "pinCode": "482001",
  "village": "Village Name",
  "city": "City Name",
  "state": "State Name",
  "bankAccountNumber": "1234567890",
  "bankAddress": "Bank Branch Address",
  "ifscCode": "BANK0001234",
  "kisanCardNumber": "KCC123456789"
}
```

**Example**:
```bash
curl -X PUT https://us-central1-fir-ac00e.cloudfunctions.net/api/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "fullName": "John Doe",
    "phoneNumber": "9876543210",
    "pinCode": "482001",
    "village": "Village Name",
    "city": "City Name",
    "state": "State Name",
    "bankAccountNumber": "1234567890",
    "bankAddress": "Bank Branch Address",
    "ifscCode": "BANK0001234",
    "kisanCardNumber": "KCC123456789"
  }'
```

## Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "userId": "USER_123",
    "fullName": "John Doe",
    "phoneNumber": "9876543210",
    "email": "john@example.com",
    "pinCode": "482001",
    "village": "Village Name",
    "city": "City Name",
    "state": "State Name",
    "bankAccountNumber": "1234567890",
    "bankAddress": "Bank Branch Address",
    "ifscCode": "BANK0001234",
    "kisanCardNumber": "KCC123456789",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

## Requirements

1. **Validate**: 
   - `fullName` is required and non-empty
   - `phoneNumber` format: 10-digit Indian mobile (starts with 6-9)
   - `pinCode` format: 6-digit PIN code (if provided)
   - `ifscCode` format: 11 characters (if provided)
   - `email` format: valid email (if provided)

2. **Extract**: User ID from authenticated token

3. **Update**: User profile fields in database

4. **Return**: Updated user profile data

## Validation Rules

- **phoneNumber**: Must match pattern `^[6-9][0-9]{9}$` (10-digit Indian mobile)
- **pinCode**: Must be exactly 6 digits (if provided)
- **ifscCode**: Must be exactly 11 characters, uppercase (if provided)
- **email**: Must be valid email format (if provided)
- **fullName**: Required, cannot be empty

## Database Fields

Update the following fields in the `users` or `farmers` table:
- `fullName`
- `phoneNumber`
- `email`
- `pinCode`
- `village`
- `city`
- `state`
- `bankAccountNumber`
- `bankAddress`
- `ifscCode`
- `kisanCardNumber`
- `updatedAt` (timestamp)

## Error Responses

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Validation failed: phoneNumber must be 10 digits",
  "error": "VALIDATION_ERROR"
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "UNAUTHORIZED"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "User not found",
  "error": "NOT_FOUND"
}
```

## Profile Completion Check

For frontend profile completion validation, all these fields must be present:
- `phoneNumber`
- `pinCode`
- `village`
- `city`
- `state`
- `bankAccountNumber`
- `bankAddress`
- `ifscCode`
- `kisanCardNumber`

## Notes

- All fields except `fullName` are optional but recommended
- Partial updates are allowed (only send fields that need updating)
- `phoneNumber` can be updated (unlike signup where it's fixed)
- IFSC code validation can be done via Razorpay API: `https://ifsc.razorpay.com/{IFSC_CODE}`
- Profile completion status affects access to features (orders, finance requests, complaints)

