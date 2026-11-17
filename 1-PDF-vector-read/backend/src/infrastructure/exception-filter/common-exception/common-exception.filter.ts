import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class CommonExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = (exception.getResponse() as any).message || exception.message;
    } else if (
      exception instanceof Error &&
      'statusCode' in exception &&
      typeof (exception as any).statusCode === 'number'
    ) {
      status = (exception as any).statusCode;
      message = exception.message;
    } else if (
      exception &&
      typeof exception === 'object' &&
      'status' in exception &&
      typeof (exception as any).status === 'number'
    ) {
      // Handles ApiError (e.g. Gemini 429 Too Many Requests, 404, etc.)
      status = (exception as any).status;
      const rawMessage = (exception as any).message || '';

      // Check if message is JSON string with error details
      try {
        const parsed = JSON.parse(rawMessage);
        if (parsed.error && parsed.error.message) {
          message = parsed.error.message;
        } else {
          message = rawMessage;
        }
      } catch {
        message = rawMessage || (status === 429 ? 'Rate limit exceeded. Please wait a moment and retry.' : 'Upstream service error');
      }

      // Friendly format for Gemini 429 rate limit
      if (status === 429) {
        if (typeof message === 'string' && message.includes('retry in')) {
          const match = message.match(/retry in ([0-9.]+s)/);
          const retryTime = match ? match[1] : 'a moment';
          message = `Gemini API rate limit exceeded. Please retry in ${retryTime}.`;
        } else {
          message = 'Gemini API rate limit exceeded. Please retry shortly.';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const formattedResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    if (exception) {
      console.log('\nException -> ', exception, '\nFormatted Exception -> ', formattedResponse);
    }

    return response.status(status).json(formattedResponse);
  }
}
