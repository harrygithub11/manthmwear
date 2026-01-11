# RapidShyp Integration Plan with Auto-Status Updates

This plan outlines the steps to integrate RapidShyp for automated logistics and real-time delivery status updates.

## 1. Database Schema Updates

We need to store RapidShyp-specific details linked to our orders. We will create a new `Shipment` model in Prisma.

**File:** `prisma/schema.prisma`

```prisma
model shipment {
  id                String   @id @default(cuid())
  orderId           String   @unique // 1:1 relationship for simplicity initially
  
  // RapidShyp identifiers
  rapidShypOrderId  String?  // The order ID we sent (can be same as our internal orderNumber)
  shipmentId        String?  // RapidShyp Shipment ID (e.g., S24073186)
  awb               String?  // Air Waybill Number
  
  // Courier Details
  courierCode       String?
  courierName       String?
  
  // Documents
  labelUrl          String?
  manifestUrl       String?
  
  // Status
  status            String   @default("PENDING") // RapidShyp status code (SCB, OFP, etc.)
  trackingHistory   String?  @db.LongText // JSON string of scan history
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  order             order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

// Add relation to Order model
model order {
  // ... existing fields
  shipment          shipment?
}
```

## 2. Environment Configuration

Store the RapidShyp API Token securely.

**File:** `.env`
```env
RAPIDSHYP_API_TOKEN=your_token_here
RAPIDSHYP_BASE_URL=https://api.rapidshyp.com/rapidshyp/apis/v1
```

## 3. RapidShyp API Client Module

Create a type-safe client to interact with RapidShyp.

**File:** `lib/rapidshyp/types.ts`
- Define interfaces for `CreateOrderPayload`, `OrderResponse`, `TrackingResponse`, etc.

**File:** `lib/rapidshyp/client.ts`
- `createShipment(order: OrderWithRelations)`: Calls the `wrapper` or `create_order` API.
- `trackShipment(awb: string)`: Calls `track_order` API.
- `cancelShipment(orderId: string)`: Calls `cancel_order` API.

## 4. Integration Workflow

### A. Order Processing (Admin Action)
We will add a "Ship Order" button in the Admin Order Details page.
1.  Admin clicks "Ship Order".
2.  Backend fetches order details (address, items).
3.  Backend calls `RapidShyp.createShipment()`.
4.  On success, a `Shipment` record is created in our DB with `shipmentId` and `awb`.
5.  Order status updates to `PROCESSING` or `SHIPPED`.

### B. Automated Status Updates (Cron Job)
Since webhooks are not mentioned, we will poll for updates.

**File:** `app/api/cron/update-tracking/route.ts`
1.  Fetch all `Shipment` records where status is **NOT** `DELIVERED`, `CANCELLED`, or `RTO_DELIVERED`.
2.  For each shipment, call RapidShyp `track_order` using the `awb`.
3.  Compare the latest status code (e.g., `OFD`, `DEL`) with our DB.
4.  If different, update the `Shipment` record and the parent `Order` status (e.g., map `RAD` -> `SHIPPED`, `DEL` -> `DELIVERED`).

## 5. UI Updates

### Admin Dashboard
- **Order List**: Show icon/badge for shipment status.
- **Order Detail**: Show Shipment panel with AWB, Courier, and a timeline of tracking events.
- **Actions**: "Generate Label" button (links to `labelUrl`).

### Customer View
- **Order History**: Show "Track Order" button.
- **Order Detail**: Show simplified status (Placed -> Shipped -> Out for Delivery -> Delivered).

## 6. Implementation Steps

1.  **Step 1**: Update `prisma/schema.prisma` and run `npx prisma migrate dev`.
2.  **Step 2**: Create `lib/rapidshyp` folder and implement types and client.
3.  **Step 3**: Create the "Ship Order" API endpoint (`/api/admin/orders/[id]/ship`).
4.  **Step 4**: Update Admin UI to call the ship endpoint.
5.  **Step 5**: Create the Tracking Cron API (`/api/cron/update-tracking`).
6.  **Step 6**: Update Frontend to display tracking info.

## 7. Recommended Mapping

| RapidShyp Code | Description | Local Order Status |
| :--- | :--- | :--- |
| SCB | Shipment Booked | PROCESSING |
| PSH | Pickup Scheduled | PROCESSING |
| OFP | Out for Pickup | PROCESSING |
| SPD | Shipped/Dispatched | SHIPPED |
| INT | In Transit | SHIPPED |
| OFD | Out for Delivery | SHIPPED |
| DEL | Delivered | DELIVERED |
| RTO_* | Return to Origin | REFUNDED/CANCELLED (Manual review recommended) |

