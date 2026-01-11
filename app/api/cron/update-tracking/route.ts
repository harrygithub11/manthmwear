import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rapidShyp } from '@/lib/rapidshyp/client';
import { TRACKING_STATUS_MAP } from '@/lib/rapidshyp/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // 1. Fetch active shipments
        // We want shipments that are not yet Delivered, Cancelled or RTO Delivered
        const activeShipments = await prisma.shipment.findMany({
            where: {
                AND: [
                    { status: { not: 'DELIVERED' } },
                    { status: { not: 'CANCELLED' } },
                    { status: { not: 'RTO_DELIVERED' } },
                    { awb: { not: null } } // Must have an AWB to track
                ]
            },
            include: {
                order: true
            }
        });

        if (activeShipments.length === 0) {
            return NextResponse.json({ message: 'No active shipments to track.' });
        }

        const updates = [];

        // 2. Iterate and track
        for (const shipment of activeShipments) {
            if (!shipment.awb) continue;

            try {
                const trackingData = await rapidShyp.trackOrder(shipment.awb);

                if (trackingData.success && trackingData.records.length > 0) {
                    const record = trackingData.records[0];
                    // Assuming the first shipment detail is the relevant one or matching by ID
                    const shipDetail = record.shipment_details.find(s => s.awb === shipment.awb) || record.shipment_details[0];

                    if (shipDetail) {
                        const currentStatusCode = shipDetail.current_tracking_status_code; // e.g. "OFD"

                        // Check if status changed
                        if (currentStatusCode && currentStatusCode !== shipment.status) {

                            // Determine Local Order Status
                            let newOrderStatus = undefined;
                            // Map RapidShyp code to our internal enum if needed
                            // PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED

                            const mappedStatus = TRACKING_STATUS_MAP[currentStatusCode];
                            if (mappedStatus) {
                                // Only update order status if it progresses (simple logic)
                                // Or just strict mapping
                                if (mappedStatus === 'SHIPPED') newOrderStatus = 'SHIPPED';
                                if (mappedStatus === 'DELIVERED') newOrderStatus = 'DELIVERED';
                                if (mappedStatus === 'CANCELLED') newOrderStatus = 'CANCELLED';
                            }

                            // Update Shipment Record
                            const updatePromise = prisma.shipment.update({
                                where: { id: shipment.id },
                                data: {
                                    status: currentStatusCode,
                                    trackingHistory: JSON.stringify(shipDetail.track_scans || []),
                                    // If we mapped a status for the parent order, update it
                                    order: newOrderStatus ? {
                                        update: {
                                            status: newOrderStatus as any // Cast to enum if needed
                                        }
                                    } : undefined
                                }
                            });
                            updates.push(updatePromise);
                        }
                    }
                }
            } catch (err) {
                console.error(`Failed to track shipment ${shipment.id}:`, err);
            }
        }

        await Promise.all(updates);

        return NextResponse.json({
            success: true,
            processed: activeShipments.length,
            updated: updates.length
        });

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
