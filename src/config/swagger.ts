import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gest-ON API',
      version: '1.0.0',
      description: 'API para gestão de lava rápidos - Sistema completo de gestão para micro negócios',
      contact: {
        name: 'Albert Dias',
        email: 'support@geston.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3338',
        description: 'Servidor de desenvolvimento',
      },
      {
        url: 'https://api.geston.com',
        description: 'Servidor de produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Mensagem de erro descritiva',
            },
            code: {
              type: 'string',
              example: 'BAD_REQUEST',
            },
            details: {
              type: 'object',
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 150 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            totalPages: { type: 'number', example: 8 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
        Client: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            enterprise_id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'João Silva' },
            document: { type: 'string', nullable: true, example: '12345678901' },
            phone: { type: 'string', example: '11987654321' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Service: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            enterprise_id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Lavagem Completa' },
            value: { type: 'number', example: 5000, description: 'Valor em centavos' },
            stock_quantity: { type: 'number', example: 0 },
            minimum_stock: { type: 'number', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            enterprise_id: { type: 'string', format: 'uuid' },
            client_id: { type: 'string', format: 'uuid', nullable: true },
            car_license_plate: { type: 'string', example: 'ABC1234' },
            payment_type: { type: 'string', enum: ['PIX', 'CREDITCARD', 'MONEY'], nullable: true },
            status: { type: 'string', enum: ['INLINE', 'COMPLETED', 'CANCELED'] },
            total_value: { type: 'number', example: 5000, description: 'Valor em centavos' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        DashboardSummary: {
          type: 'object',
          properties: {
            day_summary: {
              type: 'object',
              properties: {
                total_value: { type: 'number' },
                payment_type_summary: {
                  type: 'object',
                  properties: {
                    PIX: {
                      type: 'object',
                      properties: {
                        total_orders: { type: 'number' },
                        total_value: { type: 'number' },
                      },
                    },
                    CREDITCARD: {
                      type: 'object',
                      properties: {
                        total_orders: { type: 'number' },
                        total_value: { type: 'number' },
                      },
                    },
                    MONEY: {
                      type: 'object',
                      properties: {
                        total_orders: { type: 'number' },
                        total_value: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
            monthly_summary: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  total_value: { type: 'number' },
                  payment_type_summary: { type: 'object' },
                },
              },
            },
          },
        },
        OrdersListResponse: {
          type: 'object',
          properties: {
            orders: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Order',
              },
            },
            total: { type: 'number', example: 50 },
            inline: { type: 'number', example: 10 },
            completed: { type: 'number', example: 35 },
            canceled: { type: 'number', example: 5 },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

