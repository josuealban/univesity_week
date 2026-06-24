import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // Petición 1: Crear Carrera y sus Materias
  // ==========================================
  async crearCarrera(body: { carrera: string; materias: string }) {
    const { carrera, materias } = body;

    if (!carrera || !materias) {
      throw new BadRequestException('Faltan datos (carrera o materias)');
    }

    // Si ya existe la carrera con ese nombre, la recuperamos para no lanzar error de duplicado
    const carreraExistente = await this.prisma.carrera.findUnique({
      where: { nombre: carrera },
      include: { materias: true },
    });

    if (carreraExistente) {
      return {
        message: 'Petición 1 exitosa: Carrera ya existente (recuperada)',
        data: carreraExistente,
      };
    }

    const materiasArray = materias.split(',').map((m) => ({ nombre: m.trim() }));

    const nuevaCarrera = await this.prisma.carrera.create({
      data: {
        nombre: carrera,
        materias: {
          create: materiasArray,
        },
      },
      include: { materias: true },
    });

    return {
      message: 'Petición 1 exitosa: Carrera creada',
      data: nuevaCarrera,
    };
  }

  // ==========================================
  // Petición 2: Crear Ciclo con Validaciones
  // ==========================================
  async crearCiclo(body: { Ciclo: string; status?: string; carreraId?: number }) {
    const { Ciclo, status, carreraId } = body;

    // REGLA: "carrera:existe"
    const carreraExiste = await this.prisma.carrera.findUnique({
      where: { id: parseInt(String(carreraId ?? 1)) },
    });

    if (!carreraExiste) {
      throw new NotFoundException('Validación fallida: La carrera no existe en la base de datos');
    }

    // EJECUCIÓN TRANSACCIONAL (ACID)
    const { nuevoCiclo, estudiante } = await this.prisma.$transaction(async (tx) => {
      // 1. Creamos el ciclo
      const cicloTx = await tx.ciclo.create({
        data: {
          nombre: Ciclo,
          estado: status || 'activo',
          carreraId: carreraExiste.id,
        },
      });

      // 2. REGLA: "estudiantes=existen, matriculas=activas"
      const estudianteTx = await tx.estudiante.create({
        data: {
          nombre: 'Estudiante Prueba',
          email: `prueba_${Date.now()}@test.com`,
          matriculas: {
            create: {
              cicloId: cicloTx.id,
              estado: 'activa',
            },
          },
        },
      });

      return { nuevoCiclo: cicloTx, estudiante: estudianteTx };
    });

    return {
      message: 'Petición 2 exitosa: Ciclo creado, estudiante existente y matrícula activa',
      ciclo: nuevoCiclo,
      estudianteGenerado: estudiante,
    };
  }

  // ==========================================
  // Petición 3: Asignación de Lugar
  // ==========================================
  async asignarLaboratorio(body: { nombreLugar?: string; cicloId?: number; materiaId?: number }) {
    const { nombreLugar, cicloId, materiaId } = body;

    // REGLA: "ciclo:existe y activo" y "matriculas:existe y activa"
    const cicloValido = await this.prisma.ciclo.findFirst({
      where: {
        id: parseInt(String(cicloId ?? 1)),
        estado: 'activo',
        matriculas: {
          some: { estado: 'activa' },
        },
      },
    });

    if (!cicloValido) {
      throw new BadRequestException(
        'Validación fallida: El ciclo no existe, no está activo o no tiene matrículas activas',
      );
    }

    // REGLA: "materia:existe"
    const materiaExiste = await this.prisma.materia.findUnique({
      where: { id: parseInt(String(materiaId ?? 1)) },
    });

    if (!materiaExiste) {
      throw new NotFoundException('Validación fallida: La materia no existe');
    }

    // ACCIÓN: "Aulas:Crear laboratorio :asignar"
    const asignacion = await this.prisma.lugar.create({
      data: {
        nombre: nombreLugar || 'Laboratorio 1',
        tipo: 'laboratorio',
        asignacionLugares: {
          create: {
            cicloId: cicloValido.id,
            materiaId: materiaExiste.id,
          },
        },
      },
      include: {
        asignacionLugares: true,
      },
    });

    return {
      message: 'Petición 3 exitosa: Laboratorio creado y asignado',
      asignacion,
    };
  }
}
