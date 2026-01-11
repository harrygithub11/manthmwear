import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rapidShyp } from '@/lib/rapidshyp/client';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '') || '';
        if (!token.startsWith('YWRtaW4')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: { orderitem: { include: { productvariant: { include: { product: true } } } }, address: true, user: true, shipment: true }
        });

        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        if (order.shipment) return NextResponse.json({ error: 'Already shipped' }, { status: 400 });

        let shipName = '', shipLine1 = '', shipLine2 = '', shipPin = '', shipPhone = '';
        if (order.address) {
            shipName = order.address.name; shipLine1 = order.address.line1; shipLine2 = order.address.line2 || ''; shipPin = order.address.postalCode; shipPhone = order.address.phone;
        } else if (order.shippingAddress) {
            try {
                const addr = JSON.parse(order.shippingAddress as string);
                shipName = addr.name || 'Guest'; shipLine1 = addr.line1 || addr.address || ''; shipLine2 = addr.line2 || ''; shipPin = addr.postalCode || addr.pinCode || ''; shipPhone = addr.phone || order.user.phone;
            } catch (e) { }
        }
        if (!shipName) return NextResponse.json({ error: 'Invalid address' }, { status: 400 });

        // --- STRICT MATH RECONCILIATION ---
        // 1. Convert DB Integers (Paise) to Float (Rupees)
        const targetTotal = Number((order.total / 100).toFixed(2));
        const shippingCharges = Number((order.shipping / 100).toFixed(2));

        // 2. Calculate Sum of standard item prices
        let itemsSum = 0;
        const rawItems = order.orderitem.map(item => {
            const price = Number((item.price / 100).toFixed(2));
            itemsSum += (price * item.quantity);
            return { ...item, price };
        });

        // 3. Calculate "Gap" (Hidden Tax/Fees)
        // Gap = Total - (Items + Shipping)
        const gap = Number((targetTotal - (itemsSum + shippingCharges)).toFixed(2));

        // 4. Calculate total quantity to determine package size
        const totalQuantity = order.orderitem.reduce((sum, item) => sum + item.quantity, 0);
        
        // 5. Determine package dimensions based on quantity
        let packageDimensions;
        if (totalQuantity === 1) {
            packageDimensions = { packageLength: 5, packageBreadth: 5, packageHeight: 5, packageWeight: 0.1 };
        } else if (totalQuantity === 2) {
            packageDimensions = { packageLength: 5, packageBreadth: 5, packageHeight: 5, packageWeight: 0.2 };
        } else if (totalQuantity === 3) {
            packageDimensions = { packageLength: 6.5, packageBreadth: 5, packageHeight: 6, packageWeight: 0.3 };
        } else if (totalQuantity <= 5) {
            packageDimensions = { packageLength: 7, packageBreadth: 6, packageHeight: 7, packageWeight: totalQuantity * 0.1 };
        } else {
            // For larger orders, use bigger box
            packageDimensions = { packageLength: 10, packageBreadth: 8, packageHeight: 8, packageWeight: totalQuantity * 0.1 };
        }

        // 6. Construct Items with color information
        const orderItems = rawItems.map(item => {
            const packSize = item.productvariant.pack
            let itemDescription = item.productvariant.product.name
            let enhancedSku = item.productvariant.sku
            
            console.log(`[SHIP] Processing item: ${item.productvariant.sku}, pack: ${packSize}`)
            
            // For pack 2/3, try to get the selected colors from shipping address
            if (packSize > 1) {
                let packColors: string[] = []
                
                // Try to extract pack colors from shippingAddress JSON
                if (order.shippingAddress) {
                    try {
                        const shippingData = JSON.parse(order.shippingAddress as string)
                        console.log(`[SHIP] Shipping data:`, shippingData)
                        
                        if (shippingData.packColors && Array.isArray(shippingData.packColors)) {
                            // Find pack colors for this specific variant
                            const variantPackColors = shippingData.packColors.find((pc: any) => pc.variantId === item.variantId)
                            console.log(`[SHIP] Found variant pack colors for ${item.variantId}:`, variantPackColors)
                            
                            if (variantPackColors && variantPackColors.packColors) {
                                packColors = variantPackColors.packColors
                            }
                        }
                    } catch (e) {
                        console.log('[SHIP] Could not parse shippingAddress for pack colors:', e)
                    }
                }
                
                console.log(`[SHIP] Pack colors for ${item.productvariant.sku}:`, packColors)
                
                // If we found pack colors, enhance the description and SKU
                if (packColors.length > 0) {
                    const colorList = packColors.slice(0, packSize).join(', ')
                    itemDescription = `${item.productvariant.product.name} (${colorList})`
                    
                    // Enhance SKU with color codes for pack 2/3
                    const colorCodes = packColors.slice(0, packSize).map(color => {
                        // Convert color names to short codes
                        const colorCodeMap: Record<string, string> = {
                            'black': 'BLK',
                            'blue': 'BLU', 
                            'royal blue': 'BLU',
                            'green': 'GRN',
                            'dark green': 'GRN', 
                            'maroon': 'MAR',
                            'grey': 'GRY',
                            'gray': 'GRY',
                            'coffee': 'COF'
                        }
                        return colorCodeMap[color.toLowerCase()] || color.substring(0, 3).toUpperCase()
                    }).join('-')
                    
                    // Replace or append color codes to SKU
                    // If SKU ends with size (M, L, etc.), insert colors before size
                    const sizeMatch = enhancedSku.match(/-([SMLX]+)$/)
                    if (sizeMatch) {
                        enhancedSku = enhancedSku.replace(/-([SMLX]+)$/, `-${colorCodes}-$1`)
                    } else {
                        enhancedSku = `${enhancedSku}-${colorCodes}`
                    }
                    
                    console.log(`[SHIP] Enhanced SKU: ${item.productvariant.sku} -> ${enhancedSku}`)
                }
            }
            
            return {
                itemName: itemDescription,
                sku: enhancedSku,
                units: item.quantity,
                unitPrice: item.price,
                tax: 0,
                productWeight: 0.1 // Individual item weight
            }
        });

        // Determine payment status and method
        const isPaymentComplete = order.paymentStatus === 'PAID';
        const paymentMethod = order.paymentMethod === 'COD' ? 'COD' : 'PREPAID';
        
        // For COD orders, payment is always pending until delivery
        // For PREPAID orders, check actual payment status
        const effectivePaymentStatus = paymentMethod === 'COD' ? 'PENDING' : (isPaymentComplete ? 'PAID' : 'PENDING');

        const payload: any = {
            orderId: order.orderNumber,
            orderDate: order.createdAt.toISOString().split('T')[0],
            // UPDATE: Use ENV variable or fallback
            pickupAddressName: process.env.RAPIDSHYP_PICKUP_NAME || "office",
            storeName: "DEFAULT",
            billingIsShipping: true,
            shippingAddress: {
                firstName: shipName.split(' ')[0],
                lastName: shipName.split(' ').slice(1).join(' ') || '.',
                addressLine1: shipLine1,
                addressLine2: shipLine2 || undefined,
                pinCode: shipPin,
                phone: shipPhone,
                email: order.user.email
            },
            orderItems: orderItems,
            paymentMethod: paymentMethod,
            paymentStatus: effectivePaymentStatus, // Add payment status
            isPaid: isPaymentComplete, // Boolean flag for payment completion
            shippingCharges: shippingCharges,
            transactionCharges: gap > 0 ? gap : 0,
            packageDetails: packageDimensions,
            // Additional metadata for RapidShyp
            orderValue: targetTotal,
            codAmount: paymentMethod === 'COD' ? targetTotal : 0,
            prepaidAmount: paymentMethod === 'PREPAID' && isPaymentComplete ? targetTotal : 0
        };

        console.log('[RAPIDSHYP] Payload with Payment Status:', JSON.stringify({
            ...payload,
            paymentInfo: {
                method: paymentMethod,
                status: effectivePaymentStatus,
                isPaid: isPaymentComplete,
                codAmount: payload.codAmount,
                prepaidAmount: payload.prepaidAmount
            }
        }));

        const response = await rapidShyp.createOrderWrapper(payload);

        if (response.status === 'SUCCESS' && response.shipment.length > 0) {
            const shipData = response.shipment[0];
            const shipment = await prisma.shipment.create({
                data: {
                    orderId: order.id,
                    rapidShypOrderId: response.orderId,
                    shipmentId: shipData.shipmentId,
                    awb: shipData.awb,
                    courierCode: shipData.courierCode,
                    courierName: shipData.courierName,
                    labelUrl: shipData.labelURL,
                    manifestUrl: shipData.manifestURL,
                    status: 'CREATED'
                }
            });
            await prisma.order.update({ where: { id: order.id }, data: { status: 'PROCESSING' } });
            return NextResponse.json({ success: true, shipment });
        }

        return NextResponse.json({ error: 'RapidShyp failed', details: response }, { status: 400 });

    } catch (error: any) {
        console.error('Ship Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
