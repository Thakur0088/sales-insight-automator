const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sales Insight Automator API',
      version: '1.0.0',
      description: 'Upload CSV/XLSX sales files and receive AI-generated summaries via email',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local' },
      { url: 'https://your-render-url.onrender.com', description: 'Production' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };