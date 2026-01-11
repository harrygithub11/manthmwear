import {
    RapidShypOrderPayload,
    WrapperResponse,
    TrackingResponse,
    TRACKING_STATUS_MAP
} from './types';

const BASE_URL = process.env.RAPIDSHYP_BASE_URL || 'https://api.rapidshyp.com/rapidshyp/apis/v1';
const API_TOKEN = process.env.RAPIDSHYP_API_TOKEN;

if (!API_TOKEN) {
    console.warn('RAPIDSHYP_API_TOKEN is not defined in environment variables.');
}

export class RapidShypClient {
    private token: string;

    constructor() {
        this.token = process.env.RAPIDSHYP_API_TOKEN || '';
    }

    private async request<T>(endpoint: string, method: string, body?: any): Promise<T> {
        const headers = {
            'Content-Type': 'application/json',
            'rapidshyp-token': this.token,
        };

        const config: RequestInit = {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        };

        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`RapidShyp API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json() as Promise<T>;
    }

    /**
     * Create an order and shipment in one go using the Wrapper API.
     */
    async createOrderWrapper(payload: RapidShypOrderPayload): Promise<WrapperResponse> {
        return this.request<WrapperResponse>('/wrapper', 'POST', payload);
    }

    /**
     * Track an order by AWB (preferred) or Order ID.
     */
    async trackOrder(awb: string): Promise<TrackingResponse> {
        // API docs say "status: true" in response, so generic T might need adjustment if structure varies
        // But based on sample, it returns { success: true, records: [...] }
        return this.request<TrackingResponse>('/track_order', 'POST', { awb });
    }

    /**
     * Check Serviceability
     */
    async checkServiceability(pickupPincode: string, deliveryPincode: string, cod: boolean, value: number, weight: number) {
        return this.request('/serviceabilty_check', 'POST', {
            Pickup_pincode: pickupPincode,
            Delivery_pincode: deliveryPincode,
            cod,
            total_order_value: value,
            weight
        });
    }
}

export const rapidShyp = new RapidShypClient();
