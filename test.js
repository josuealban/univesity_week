const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Creando datos iniciales ---');
  // Petición 1
  const carrera = await prisma.carrera.create({
    data: {
      nombre: 'Desarrollo de Software',
      materias: {
        create: [
          { nombre: 'Programación 1' },
          { nombre: 'Programación 2' },
          { nombre: 'Base de Datos' },
        ],
      },
    },
    include: { materias: true }
  });
  console.log('✅ Carrera creada con materias:', carrera);

  // Petición 2
  const estudiante = await prisma.estudiante.create({
    data: {
      nombre: 'Juan Pérez',
      email: 'juan@example.com'
    }
  });

  const ciclo = await prisma.ciclo.create({
    data: {
      nombre: '2026-2027',
      estado: 'activo',
      carreraId: carrera.id,
      matriculas: {
        create: {
          estudianteId: estudiante.id,
          estado: 'activa'
        }
      }
    },
    include: { matriculas: true }
  });
  console.log('✅ Ciclo creado con matrícula activa:', ciclo);

  // Petición 3
  const lugar = await prisma.lugar.create({
    data: {
      nombre: 'Laboratorio de Cómputo A',
      tipo: 'laboratorio',
      asignacionLugares: {
        create: {
          cicloId: ciclo.id,
          materiaId: carrera.materias[0].id // Asignando a Programación 1
        }
      }
    },
    include: { asignacionLugares: true }
  });
  console.log('✅ Laboratorio creado y asignado:', lugar);

  console.log('--- Base de datos funcionando correctamente ---');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
