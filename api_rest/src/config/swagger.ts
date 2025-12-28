/**
 * ════════════════════════════════════════════════════════════════
 * SWAGGER/OPENAPI CONFIGURATION
 * ════════════════════════════════════════════════════════════════
 */

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'VendeAI API',
    version: process.env.API_VERSION || 'v1',
    description: 'API REST para gerenciamento do sistema de bot vendedor VendeAI',
    contact: {
      name: 'HelixAI',
      email: 'contato@helixai.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Servidor de Desenvolvimento'
    },
    {
      url: 'https://api.vendeai.com',
      description: 'Servidor de Produção'
    }
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Autenticação e autorização'
    },
    {
      name: 'Bot Config',
      description: 'Configurações do bot'
    },
    {
      name: 'Conversations',
      description: 'Gerenciamento de conversas'
    },
    {
      name: 'Messages',
      description: 'Mensagens e histórico'
    },
    {
      name: 'Vehicles',
      description: 'Catálogo de veículos'
    },
    {
      name: 'Analytics',
      description: 'Métricas e análises'
    },
    {
      name: 'Users',
      description: 'Gerenciamento de usuários'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido através do endpoint de login'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: 'Mensagem de erro'
          },
          details: {
            type: 'object'
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string'
          },
          data: {
            type: 'object'
          }
        }
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'array',
            items: {
              type: 'object'
            }
          },
          meta: {
            type: 'object',
            properties: {
              page: {
                type: 'integer',
                example: 1
              },
              limit: {
                type: 'integer',
                example: 10
              },
              total: {
                type: 'integer',
                example: 100
              },
              totalPages: {
                type: 'integer',
                example: 10
              }
            }
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Token de autenticação ausente ou inválido',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              error: 'Token não fornecido ou inválido'
            }
          }
        }
      },
      ForbiddenError: {
        description: 'Acesso negado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              error: 'Você não tem permissão para acessar este recurso'
            }
          }
        }
      },
      NotFoundError: {
        description: 'Recurso não encontrado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              error: 'Recurso não encontrado'
            }
          }
        }
      },
      ValidationError: {
        description: 'Erro de validação dos dados',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              error: 'Dados de entrada inválidos',
              details: {
                field: 'email',
                message: 'Email inválido'
              }
            }
          }
        }
      }
    }
  },
  paths: {},
  security: [
    {
      bearerAuth: []
    }
  ]
};

export default swaggerDocument;
