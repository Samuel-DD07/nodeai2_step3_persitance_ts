export const chatBodySchema = {
  type: 'object',
  required: ['message'],
  properties: {
    message: { type: 'string', minLength: 1, maxLength: 4096 }
  },
  additionalProperties: false
};
