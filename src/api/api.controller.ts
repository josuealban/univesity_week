import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiService } from './api.service.js';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  // POST /api/peticion1
  @Post('peticion1')
  @HttpCode(HttpStatus.CREATED)
  crearCarrera(@Body() body: { carrera: string; materias: string }) {
    return this.apiService.crearCarrera(body);
  }

  // POST /api/peticion2
  @Post('peticion2')
  @HttpCode(HttpStatus.CREATED)
  crearCiclo(@Body() body: { Ciclo: string; status?: string; carreraId?: number }) {
    return this.apiService.crearCiclo(body);
  }

  // POST /api/peticion3
  @Post('peticion3')
  @HttpCode(HttpStatus.CREATED)
  asignarLaboratorio(@Body() body: { nombreLugar?: string; cicloId?: number; materiaId?: number }) {
    return this.apiService.asignarLaboratorio(body);
  }
}
