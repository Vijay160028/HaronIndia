# Backend Finance Flow - Quick Summary

## API Endpoint
**POST** `/api/loan-request`

**Auth**: Bearer Token Required

**Request Body**:
```json
{
  "requestType": "loan" | "kcc"
}
```

**Example**:
```bash
curl -X POST https://us-central1-fir-ac00e.cloudfunctions.net/api/api/loan-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FARMER_TOKEN" \
  -d '{"requestType": "loan"}'
```

## Response (200 OK)
```json
{
  "success": true,
  "message": "Finance request submitted successfully",
  "data": {
    "requestId": "REQ_123456789",
    "requestType": "loan",
    "status": "pending",
    "ticketId": "TKT_987654321",
    "farmerId": "FARMER_123",
    "merchantId": "M2_001",
    "submittedAt": "2025-01-15T10:30:00Z"
  }
}
```

## Requirements

1. **Validate**: `requestType` must be `"loan"` or `"kcc"`
2. **Extract**: Farmer details from authenticated token (ID, name, phone, PIN, bank account, IFSC, Kisan card)
3. **Generate**: Unique `requestId` and `ticketId`
4. **Assign**: Ticket to Merchant 2 (M2) based on farmer's PIN code/village mapping
5. **Create**: Database records for finance request and ticket
6. **Notify**: Send notification to assigned M2 merchant
7. **Return**: Success response with request details

## Database Tables Needed

**finance_requests**:
- requestId, ticketId, farmerId, requestType, status, merchantId, farmer details, timestamps

**tickets**:
- ticketId, ticketType, relatedId, status, assignedTo, createdBy, timestamps

## Workflow
```
Farmer submits → Validate → Generate ticket → Assign to M2 → Notify M2 → Return success
```

**Note**: Amount, purpose, and tenure will be discussed between M2 and farmer offline. Only requestType is needed from frontend.

