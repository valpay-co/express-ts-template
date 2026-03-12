import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Template',
      version: '1.0.0',
      description: 'Production-ready Express + TypeScript API template.',
    },
    servers: [
      {
        url: '/api',
        description: 'API Base',
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
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Items', description: 'Item management (example entity)' },
      { name: 'Health', description: 'System health check' },
    ],
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
