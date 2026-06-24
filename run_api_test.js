async function testAPI() {
  const apiUrl = 'http://localhost:3000/api';

  try {
    console.log("=== INICIANDO PRUEBA DE LA API ===");

    // ==========================================
    // Petición 1: Crear Carrera "Desarrollo de Software"
    // ==========================================
    console.log("\n-> Probando Petición 1 (Crear Carrera - Desarrollo de Software):");
    const res1 = await fetch(`${apiUrl}/peticion1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        carrera: "Desarrollo de Software",
        materias: "Programacion 1, Programacion 2, Base de datos"
      })
    });
    const data1 = await res1.json();
    console.log("Respuesta 1:", JSON.stringify(data1, null, 2));

    if (!res1.ok) throw new Error("Fallo en Petición 1: " + JSON.stringify(data1));

    const carreraId  = data1.data.id;
    const materiaId  = data1.data.materias[0].id; // Programacion 1

    // ==========================================
    // Petición 2: Crear Ciclo "2026-2027" activo, con validaciones
    // ==========================================
    console.log("\n-> Probando Petición 2 (Crear Ciclo 2026-2027, validando Carrera y Estudiante):");
    const res2 = await fetch(`${apiUrl}/peticion2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Ciclo: "2026-2027",
        status: "activo",
        carreraId: carreraId
      })
    });
    const data2 = await res2.json();
    console.log("Respuesta 2:", JSON.stringify(data2, null, 2));

    if (!res2.ok) throw new Error("Fallo en Petición 2: " + JSON.stringify(data2));

    const cicloId = data2.ciclo.id;

    // ==========================================
    // Petición 3: Asignar Laboratorio al ciclo activo con matrícula activa
    // ==========================================
    console.log("\n-> Probando Petición 3 (Asignar Laboratorio al Ciclo 2026-2027):");
    const res3 = await fetch(`${apiUrl}/peticion3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombreLugar: "Laboratorio de Computación",
        cicloId: cicloId,
        materiaId: materiaId
      })
    });
    const data3 = await res3.json();
    console.log("Respuesta 3:", JSON.stringify(data3, null, 2));

    if (!res3.ok) throw new Error("Fallo en Petición 3: " + JSON.stringify(data3));

    console.log("\n=== PRUEBA COMPLETADA CON ÉXITO ===");
    console.log(`\nResumen:`);
    console.log(`  - Carrera creada: ${data1.data.nombre} (ID: ${carreraId})`);
    console.log(`  - Ciclo creado:   ${data2.ciclo.nombre} (ID: ${cicloId})`);
    console.log(`  - Laboratorio:    ${data3.asignacion.nombre} asignado a ${data2.ciclo.nombre}`);

  } catch (error) {
    console.error("\nError durante la prueba:", error.message);
  }
}

testAPI();
