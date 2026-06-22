async function testAPI() {
  const apiUrl = 'http://localhost:3000/api';
  const timestamp = Date.now();

  try {
    console.log("=== INICIANDO PRUEBA DE LA API ===");

    // Petición 1
    console.log("\n-> Probando Petición 1 (Crear Carrera):");
    const res1 = await fetch(`${apiUrl}/peticion1`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        carrera: "Carrera de Prueba API " + timestamp, 
        materias: "Materia 1, Materia 2" 
      })
    });
    const data1 = await res1.json();
    console.log("Respuesta 1:", data1);

    if (!res1.ok) throw new Error("Fallo en Petición 1");

    // Petición 2
    console.log("\n-> Probando Petición 2 (Crear Ciclo validando Carrera):");
    const res2 = await fetch(`${apiUrl}/peticion2`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        Ciclo: "Ciclo Prueba " + timestamp, 
        status: "activo", 
        carreraId: data1.data.id 
      })
    });
    const data2 = await res2.json();
    console.log("Respuesta 2:", data2);

    if (!res2.ok) throw new Error("Fallo en Petición 2");

    // Petición 3
    console.log("\n-> Probando Petición 3 (Asignar Laboratorio validando todo):");
    const res3 = await fetch(`${apiUrl}/peticion3`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        nombreLugar: "Lab Virtual " + timestamp, 
        cicloId: data2.ciclo.id, 
        materiaId: data1.data.materias[0].id 
      })
    });
    const data3 = await res3.json();
    console.log("Respuesta 3:", data3);

    console.log("\n=== PRUEBA COMPLETADA CON ÉXITO ===");
  } catch (error) {
    console.error("Error durante la prueba:", error);
  }
}

testAPI();
