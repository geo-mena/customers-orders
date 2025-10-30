import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CustomersApiClient } from './services/customersApiClient.js';
import { OrdersApiClient } from './services/ordersApiClient.js';
import { OrchestratorService } from './services/orchestratorService.js';
import { CreateAndConfirmOrderRequest } from './types/index.js';

const customersApiBase = process.env.CUSTOMERS_API_BASE || 'http://localhost:3001';
const ordersApiBase = process.env.ORDERS_API_BASE || 'http://localhost:3002';
const serviceToken = process.env.SERVICE_TOKEN || 'your-service-token-change-in-production';

const customersClient = new CustomersApiClient(customersApiBase, serviceToken);
const ordersClient = new OrdersApiClient(ordersApiBase, serviceToken);
const orchestratorService = new OrchestratorService(customersClient, ordersClient);

export const createAndConfirmOrder = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log('Lambda invoked', {
        path: event.path,
        method: event.httpMethod
    });

    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Request body is required'
                })
            };
        }

        const request: CreateAndConfirmOrderRequest = JSON.parse(event.body);

        if (
            !request.customer_id ||
            !request.items ||
            !Array.isArray(request.items) ||
            request.items.length === 0
        ) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid request: customer_id and items are required'
                })
            };
        }

        if (!request.idempotency_key) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'idempotency_key is required'
                })
            };
        }

        const result = await orchestratorService.createAndConfirmOrder(request);

        return {
            statusCode: result.success ? 201 : 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(result)
        };
    } catch (error: any) {
        console.error('Lambda error', { error: error.message, stack: error.stack });

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        };
    }
};
