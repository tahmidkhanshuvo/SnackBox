// ResponseHelper.jsx - Frontend-friendly response utilities

class ResponseHelper {
  // Success response
  createResponse(data, status = 200) {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      status
    };
  }

  // Error response
  errorResponse(errors, status = 400) {
    return {
      success: false,
      errors,
      timestamp: new Date().toISOString(),
      status
    };
  }

  // Validation error response
  validationErrorResponse(errors) {
    return {
      success: false,
      message: 'The given data was invalid.',
      errors,
      timestamp: new Date().toISOString(),
      status: 422
    };
  }

  // Not found response
  notFoundResponse(message = 'Resource not found') {
    return {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      status: 404
    };
  }

  // Unauthorized response
  unauthorizedResponse(message = 'Unauthorized') {
    return {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      status: 401
    };
  }

  // Forbidden response
  forbiddenResponse(message = 'Forbidden') {
    return {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      status: 403
    };
  }

  // Server error response
  serverErrorResponse(message = 'Internal Server Error', details = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      status: 500
    };
    if (process.env.NODE_ENV === 'development' && details) {
      response.details = details;
    }
    return response;
  }

  // Paginated response
  paginatedResponse(data, pagination) {
    return {
      success: true,
      data,
      pagination: {
        current_page: pagination.page,
        per_page: pagination.limit,
        total: pagination.total,
        last_page: Math.ceil(pagination.total / pagination.limit),
        from: (pagination.page - 1) * pagination.limit + 1,
        to: Math.min(pagination.page * pagination.limit, pagination.total)
      },
      timestamp: new Date().toISOString(),
      status: 200
    };
  }

  // Collection response
  collectionResponse(data, meta = {}) {
    return {
      success: true,
      data,
      meta,
      timestamp: new Date().toISOString(),
      status: 200
    };
  }
}

const responseHelper = new ResponseHelper();

export const createResponse = responseHelper.createResponse.bind(responseHelper);
export const errorResponse = responseHelper.errorResponse.bind(responseHelper);
export const validationErrorResponse = responseHelper.validationErrorResponse.bind(responseHelper);
export const notFoundResponse = responseHelper.notFoundResponse.bind(responseHelper);
export const unauthorizedResponse = responseHelper.unauthorizedResponse.bind(responseHelper);
export const forbiddenResponse = responseHelper.forbiddenResponse.bind(responseHelper);
export const serverErrorResponse = responseHelper.serverErrorResponse.bind(responseHelper);
export const paginatedResponse = responseHelper.paginatedResponse.bind(responseHelper);
export const collectionResponse = responseHelper.collectionResponse.bind(responseHelper);

export default responseHelper;
