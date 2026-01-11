# RapidShyp Integration Workflow

This document explains the end-to-end flow of how the RapidShyp integration works in your Manthmwear application.

## 1. Fulfillment Flow (Creating Shipments)

This process happens when you are ready to ship an order to a customer.

**Step 1: Admin Trigger**
*   **Actor**: Admin
*   **Action**: In the Admin Dashboard, on an Order Details page, the Admin clicks the **"Ship Order"** button.
*   **System Check**: The system verifies the order is paid (if prepaid) and has a valid address.

**Step 2: API Request**
*   **Backend**: The server calls the `/api/admin/orders/[id]/ship` endpoint.
*   **Data Preparation**:
    *   Mapping: Local Order → RapidShyp Payload.
    *   Address: Customer shipping details.
    *   Items: Product names, SKUs, and quantities.
    *   Payment: COD or PREPAID based on the order method.
*   **External Call**: The system sends a `POST` request to RapidShyp's `/wrapper` API.

**Step 3: RapidShyp Processing**
*   **Validation**: RapidShyp validates pincode serviceability and SKU details.
*   **Creation**: RapidShyp creates the Order *and* Shipment *and* generates the AWB (Air Waybill) and Label immediately.
*   **Response**: Returns success with `shipmentId`, `awb`, `courierName`, and `labelURL`.

**Step 4: Database Update**
*   **Shipment Record**: A new `Shipment` record is created in your database linked to the Order.
*   **Order Status**: The Order status updates from `CONFIRMED` to `PROCESSING` (or `SHIPPED` if you prefer).

## 2. Tracking Flow (Automated Status Updates)

This process keeps your system in sync with the physical package location without manual intervention.

**Step 1: Scheduled Trigger**
*   **Actor**: Cron Job / Scheduler (or external trigger).
*   **Action**: Calls `/api/cron/update-tracking`.
*   **Frequency**: Recommended every 1-4 hours.

**Step 2: Fetch Active Shipments**
*   **Query**: The system looks for all shipments where the status is NOT yet "final" (i.e., not Delivered, Cancelled, or Returned).

**Step 3: RapidShyp Tracking API**
*   **Loop**: For each active shipment, the system uses the `awb` to call RapidShyp's `/track_order` API.
*   **Response**: RapidShyp provides the latest status code (e.g., `OFD` for Out For Delivery) and scan history.

**Step 4: Synchronization**
*   **Comparison**: If the RapidShyp status code differs from the local database record:
    *   Update `Shipment.status` (e.g., `OFP` -> `OFD`).
    *   Update `Shipment.trackingHistory` (JSON log).
*   **Order Status Mapping**:
    *   If Shipment becomes `SPD` (Shipped) -> Update Order to `SHIPPED`.
    *   If Shipment becomes `DEL` (Delivered) -> Update Order to `DELIVERED`.

## 3. Customer Experience

This is what the user sees.

*   **Order History**: The user sees the status change automatically (e.g., "Shipped").
*   **Tracking Link**: You can now display a "Track Order" button that either:
    *   Shows the `trackingHistory` directly on your site.
    *   Links to the courier's tracking page using the AWB.

## 4. Error Handling

*   **Invalid Pincode**: If RapidShyp rejects the order due to a non-serviceable pincode, the "Ship Order" action will fail and show an error message to the Admin.
*   **API Failure**: If the tracking job fails, it logs the error and retries on the next run.
