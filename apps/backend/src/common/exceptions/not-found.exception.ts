import { HttpException } from './http.exception';

export class NotFoundException extends HttpException {
  constructor(message: string = 'Recurso no encontrado') {
    super(404, message);
    this.name = 'NotFoundException';
  }
}
