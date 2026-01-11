
export interface RapidShypAuth {
    token: string;
}

export interface RapidShypOrderPayload {
    orderId: string;
    orderDate: string; // YYYY-MM-DD
    pickupAddressName: string; // "Seller 201301" or similar
    storeName: string; // "DEFAULT"
    billingIsShipping: boolean;
    shippingAddress: AddressDetails;
    billingAddress?: AddressDetails;
    orderItems: OrderItem[];
    paymentMethod: "COD" | "PREPAID";
    shippingCharges?: number;
    giftWrapCharges?: number;
    transactionCharges?: number;
    totalDiscount?: number;
    totalOrderValue: number;
    codCharges?: number;
    prepaidAmount?: number;
    packageDetails: PackageDetails;
}

export interface AddressDetails {
    firstName: string;
    lastName?: string;
    addressLine1: string;
    addressLine2?: string;
    pinCode: string;
    email?: string;
    phone: string;
}

export interface OrderItem {
    itemName: string;
    sku?: string;
    description?: string;
    units: number;
    unitPrice: number;
    tax: number;
    hsn?: string;
    productLength?: number;
    productBreadth?: number;
    productHeight?: number;
    productWeight?: number; // kg
    brand?: string;
    imageURL?: string;
    isFragile?: boolean;
    isPersonalisable?: boolean;
}

export interface PackageDetails {
    packageLength: number;
    packageBreadth: number;
    packageHeight: number;
    packageWeight: number; // kg
}

export interface WrapperResponse {
    status: string; // "SUCCESS"
    remarks: string;
    orderId: string;
    orderCreated: boolean;
    shipment: ShipmentDetails[];
}

export interface ShipmentDetails {
    shipmentId: string;
    awbGenerated: boolean;
    labelGenerated: boolean;
    pickupScheduled: boolean;
    awb: string;
    courierCode: string;
    courierName: string;
    parentCourierName: string;
    appliedWeight: number;
    labelURL: string;
    manifestURL: string;
    routingCode: string;
    rtoRoutingCode: string;
    pickupName: string;
    paymentMethod: string;
    shippingCharges: number;
    giftWrapCharges: number;
    transactionCharges: number;
    totalDiscount: number;
    totalOrderValue: number;
    collectableAmount: number;
    shipmentLines: any[];
}

export interface TrackingResponse {
    success: boolean;
    msg: string;
    records: TrackingRecord[];
}

export interface TrackingRecord {
    seller_order_id: string;
    order_status: string;
    shipment_details: TrackingShipmentDetail[];
}

export interface TrackingShipmentDetail {
    shipment_id: string;
    shipment_status: string; // READY_TO_SHIP, SHIPPED, etc.
    awb: string;
    courier_name: string;
    current_tracking_status_code: string | null; // SCB, OFP, etc.
    track_scans: TrackScan[] | null;
}

export interface TrackScan {
    scan_date: string;
    scan_time: string;
    scan_type: string;
    scan_detail: string;
    location: string;
}

export const TRACKING_STATUS_MAP: Record<string, string> = {
    SCB: "PROCESSING",
    PSH: "PROCESSING",
    OFP: "PROCESSING",
    PUE: "PROCESSING", // Exception
    SPD: "SHIPPED",
    INT: "SHIPPED",
    RAD: "SHIPPED", // Reached Destination
    OFD: "SHIPPED", // Out for Delivery (could be own status)
    DEL: "DELIVERED",
    UND: "SHIPPED", // Undelivered (Action needed)
    RTO_REQ: "CANCELLED", // or REFUNDED
    RTO: "CANCELLED",
    RTO_DEL: "CANCELLED",
};
