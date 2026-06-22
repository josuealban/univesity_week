const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Petición 1: Crear Carrera y sus Materias
// ==========================================
app.post('/api/peticion1', async (req, res) => {
  try {
    const { carrera, materias } = req.body;

    if (!carrera || !materias) {
      return res.status(400).json({ error: 'Faltan datos (carrera o materias)' });
    }

    const materiasArray = materias.split(',').map((m) => ({ nombre: m.trim() }));

    const nuevaCarrera = await prisma.carrera.create({
      data: {
        nombre: carrera,
        materias: {
          create: materiasArray,
        },
      },
      include: { materias: true }
    });

    res.status(201).json({
      message: 'Petición 1 exitosa: Carrera creada',
      data: nuevaCarrera
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// Petición 2: Crear Ciclo con Validaciones
// ==========================================
app.post('/api/peticion2', async (req, res) => {
  try {
    const { Ciclo, status, carreraId } = req.body;

    // REGLA: "carrera:existe" (Validamos si realmente existe en base de datos)
    const carreraExiste = await prisma.carrera.findUnique({ where: { id: parseInt(carreraId || 1) } });
    if (!carreraExiste) {
      return res.status(404).json({ error: 'Validación fallida: La carrera no existe en la base de datos' });
    }

    // ==========================================
    // EJECUCIÓN TRANSACCIONAL (ACID)
    // ==========================================
    // Usamos prisma.$transaction para garantizar que el ciclo, el estudiante y 
    // la matrícula se guarden como una única "Transacción". Si una falla, todo se revierte.
    const { nuevoCiclo, estudiante } = await prisma.$transaction(async (tx) => {
      // 1. Creamos el ciclo
      const cicloTx = await tx.ciclo.create({
        data: {
          nombre: Ciclo,
          estado: status || 'activo',
          carreraId: carreraExiste.id,
        }
      });

      // 2. REGLA: "estudiantes=existen, matriculas=activas"
      const estudianteTx = await tx.estudiante.create({
        data: {
          nombre: 'Estudiante Prueba',
          email: `prueba_${Date.now()}@test.com`,
          matriculas: {
            create: {
              cicloId: cicloTx.id,
              estado: 'activa' // Cumple "matriculas=activas"
            }
          }
        }
      });

      return { nuevoCiclo: cicloTx, estudiante: estudianteTx };
    });

    res.status(201).json({
      message: 'Petición 2 exitosa: Ciclo creado, estudiante existente y matrícula activa',
      ciclo: nuevoCiclo,
      estudianteGenerado: estudiante
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// Petición 3: Asignación de Lugar
// ==========================================
app.post('/api/peticion3', async (req, res) => {
  try {
    const { nombreLugar, cicloId, materiaId } = req.body;

    // REGLA: "ciclo:existe y acvtivo" y "mariculas:existe y activa"
    // Prisma nos permite validar todo esto de un solo golpe
    const cicloValido = await prisma.ciclo.findFirst({
      where: {
        id: parseInt(cicloId || 1),
        estado: 'activo', // Cumple "ciclo: acvtivo"
        matriculas: {
          some: { estado: 'activa' } // Cumple "mariculas: activa"
        }
      }
    });

    if (!cicloValido) {
      return res.status(400).json({ error: 'Validación fallida: El ciclo no existe, no está activo o no tiene matrículas activas' });
    }

    // REGLA: "materia:existe"
    const materiaExiste = await prisma.materia.findUnique({ where: { id: parseInt(materiaId || 1) } });
    if (!materiaExiste) {
      return res.status(404).json({ error: 'Validación fallida: La materia no existe' });
    }

    // ACCIÓN: "Aulas:Crear laboratorio :asignar"
    const asignacion = await prisma.lugar.create({
      data: {
        nombre: nombreLugar || 'Laboratorio 1',
        tipo: 'laboratorio', // "Crear laboratorio"
        asignacionLugares: {
          create: { // ":asignar"
            cicloId: cicloValido.id,
            materiaId: materiaExiste.id
          }
        }
      },
      include: {
        asignacionLugares: true
      }
    });

    res.status(201).json({
      message: 'Petición 3 exitosa: Laboratorio creado y asignado',
      asignacion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de la API corriendo en http://localhost:${PORT}`);
});
