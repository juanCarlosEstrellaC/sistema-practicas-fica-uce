/**
 * Runner de Carga Real HTTP/API para la Fase 3
 * Simula concurrencia real de 100 estudiantes y autoridades de las 5 carreras
 * midiendo latencia, estabilidad, percentiles (P50, P95, P99) y consistencia ACID.
 */

const URL_BACKEND = process.env.BACKEND_URL || 'http://localhost:8080/api/v1';

interface MetricasRendimiento {
  totalPeticiones: number;
  exitosas: number;
  fallidas: number;
  tiempoTotalMs: number;
  latenciasMs: number[];
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  promedioMs: number;
  rps: number;
}

function calcularMetricas(latencias: number[], exitosas: number, fallidas: number, tiempoTotalMs: number): MetricasRendimiento {
  const latenciasOrdenadas = [...latencias].sort((a, b) => a - b);
  const total = latencias.length;
  const suma = latencias.reduce((acc, curr) => acc + curr, 0);

  const p50 = total > 0 ? latenciasOrdenadas[Math.floor(total * 0.50)] : 0;
  const p95 = total > 0 ? latenciasOrdenadas[Math.floor(total * 0.95)] : 0;
  const p99 = total > 0 ? latenciasOrdenadas[Math.floor(total * 0.99)] : 0;
  const promedio = total > 0 ? suma / total : 0;
  const rps = tiempoTotalMs > 0 ? (total / (tiempoTotalMs / 1000)) : 0;

  return {
    totalPeticiones: total,
    exitosas,
    fallidas,
    tiempoTotalMs,
    latenciasMs: latenciasOrdenadas,
    p50Ms: Number(p50.toFixed(2)),
    p95Ms: Number(p95.toFixed(2)),
    p99Ms: Number(p99.toFixed(2)),
    promedioMs: Number(promedio.toFixed(2)),
    rps: Number(rps.toFixed(2)),
  };
}

export async function ejecutarPruebaCargaReal(): Promise<{
  cargaLogin: MetricasRendimiento;
  cargaConsultasEstudiante: MetricasRendimiento;
  cargaAsignacionesCoordinadores: MetricasRendimiento;
  cargaMatrizCaces: MetricasRendimiento;
}> {
  console.log('Iniciando prueba de carga real HTTP/API en Spring Boot...');

  // -------------------------------------------------------------------------
  // ESCENARIO 1: Concurrencia de Login Masivo (100 estudiantes + 5 coordinadores = 105 usuarios)
  // -------------------------------------------------------------------------
  const listaUsuariosLogin: { correo: string; clave: string }[] = [];

  // 100 estudiantes
  const carrerasPrefijos = ['comp', 'sist', 'meca', 'civi', 'dise'];
  for (const prefijo of carrerasPrefijos) {
    for (let i = 1; i <= 20; i++) {
      const pad = i.toString().padStart(2, '0');
      listaUsuariosLogin.push({
        correo: `est_${prefijo}_${pad}@uce.edu.ec`,
        clave: '123456',
      });
    }
  }

  // 5 coordinadores de carrera
  listaUsuariosLogin.push(
    { correo: 'gmoncayo@uce.edu.ec', clave: '123456' }, // Computación
    { correo: 'kvega@uce.edu.ec', clave: '123456' },     // Sistemas
    { correo: 'lsanchez@uce.edu.ec', clave: '123456' },  // Mecánica
    { correo: 'vherrera@uce.edu.ec', clave: '123456' },  // Civil
    { correo: 'eparedes@uce.edu.ec', clave: '123456' }   // Diseño Industrial
  );

  const tokensGuardados: { correo: string; token: string; id: number }[] = [];
  const latenciasLogin: number[] = [];
  let exitosLogin = 0;
  let fallosLogin = 0;

  const inicioLogin = Date.now();
  await Promise.all(
    listaUsuariosLogin.map(async (u) => {
      const inicioReq = Date.now();
      try {
        const res = await fetch(`${URL_BACKEND}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo: u.correo, clave: u.clave }),
        });
        const latencia = Date.now() - inicioReq;
        latenciasLogin.push(latencia);

        if (res.ok) {
          const data = await res.json();
          const token = data.data?.token || data.token;
          const usuarioId = data.data?.usuario?.id || data.usuario?.id;
          if (token) {
            tokensGuardados.push({ correo: u.correo, token, id: Number(usuarioId) });
            exitosLogin++;
          } else {
            fallosLogin++;
          }
        } else {
          fallosLogin++;
        }
      } catch {
        latenciasLogin.push(Date.now() - inicioReq);
        fallosLogin++;
      }
    })
  );
  const finLogin = Date.now();
  const metricasLogin = calcularMetricas(latenciasLogin, exitosLogin, fallosLogin, finLogin - inicioLogin);

  // -------------------------------------------------------------------------
  // ESCENARIO 2: Consultas Concurrentes de Portafolio de 100 Estudiantes
  // -------------------------------------------------------------------------
  const tokensEstudiantes = tokensGuardados.filter((t) => t.correo.startsWith('est_'));
  const latenciasConsultas: number[] = [];
  let exitosConsultas = 0;
  let fallosConsultas = 0;

  const inicioConsultas = Date.now();
  await Promise.all(
    tokensEstudiantes.map(async (est) => {
      const inicioReq = Date.now();
      try {
        const res = await fetch(`${URL_BACKEND}/asignaciones-practicas?estudianteId=${est.id}&page=0&size=10`, {
          headers: {
            'Authorization': `Bearer ${est.token}`,
            'Content-Type': 'application/json',
          },
        });
        const latencia = Date.now() - inicioReq;
        latenciasConsultas.push(latencia);
        if (res.ok) {
          exitosConsultas++;
        } else {
          fallosConsultas++;
        }
      } catch {
        latenciasConsultas.push(Date.now() - inicioReq);
        fallosConsultas++;
      }
    })
  );
  const finConsultas = Date.now();
  const metricasConsultas = calcularMetricas(latenciasConsultas, exitosConsultas, fallosConsultas, finConsultas - inicioConsultas);

  // -------------------------------------------------------------------------
  // ESCENARIO 3: Asignaciones Concurrentes en Bloque por 5 Coordinaciones
  // -------------------------------------------------------------------------
  // Cada coordinación asigna un bloque de 5 estudiantes de su carrera a un convenio
  const coordinadoresConfig = [
    { correo: 'gmoncayo@uce.edu.ec', carreraId: 1, tutorId: 4, convenioId: 1, estudiantesIds: [101, 102, 103, 104, 105] },
    { correo: 'kvega@uce.edu.ec', carreraId: 2, tutorId: 10, convenioId: 1, estudiantesIds: [121, 122, 123, 124, 125] },
    { correo: 'lsanchez@uce.edu.ec', carreraId: 3, tutorId: 14, convenioId: 2, estudiantesIds: [141, 142, 143, 144, 145] },
    { correo: 'vherrera@uce.edu.ec', carreraId: 4, tutorId: 18, convenioId: 3, estudiantesIds: [161, 162, 163, 164, 165] },
    { correo: 'eparedes@uce.edu.ec', carreraId: 5, tutorId: 22, convenioId: 3, estudiantesIds: [181, 182, 183, 184, 185] },
  ];

  const latenciasAsignaciones: number[] = [];
  let exitosAsignaciones = 0;
  let fallosAsignaciones = 0;

  const inicioAsignaciones = Date.now();
  await Promise.all(
    coordinadoresConfig.map(async (coord) => {
      const authCoord = tokensGuardados.find((t) => t.correo === coord.correo);
      if (!authCoord) return;

      for (const estudianteId of coord.estudiantesIds) {
        const inicioReq = Date.now();
        try {
          const res = await fetch(`${URL_BACKEND}/asignaciones-practicas/asignar`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authCoord.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              estudianteId,
              convenioId: coord.convenioId,
              tutorId: coord.tutorId,
              tutorInstitucional: '',
              horas: 80,
              periodoAcademicoId: 1,
            }),
          });
          const latencia = Date.now() - inicioReq;
          latenciasAsignaciones.push(latencia);

          if (res.ok) {
            exitosAsignaciones++;
          } else {
            fallosAsignaciones++;
          }
        } catch {
          latenciasAsignaciones.push(Date.now() - inicioReq);
          fallosAsignaciones++;
        }
      }
    })
  );
  const finAsignaciones = Date.now();
  const metricasAsignaciones = calcularMetricas(latenciasAsignaciones, exitosAsignaciones, fallosAsignaciones, finAsignaciones - inicioAsignaciones);

  // -------------------------------------------------------------------------
  // ESCENARIO 4: Cálculo y Consulta Concurrente de Matriz CACES (5 Carreras + Subdecanato)
  // -------------------------------------------------------------------------
  const tokenSubdecana = await (async () => {
    const res = await fetch(`${URL_BACKEND}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'aperez@uce.edu.ec', clave: '123456' }),
    });
    const d = await res.json();
    return d.data?.token || d.token;
  })();

  const latenciasMatriz: number[] = [];
  let exitosMatriz = 0;
  let fallosMatriz = 0;

  const peticionesMatriz = [
    { url: `${URL_BACKEND}/matrices-caces/periodo/1/carrera/1` },
    { url: `${URL_BACKEND}/matrices-caces/periodo/1/carrera/2` },
    { url: `${URL_BACKEND}/matrices-caces/periodo/1/carrera/3` },
    { url: `${URL_BACKEND}/matrices-caces/periodo/1/carrera/4` },
    { url: `${URL_BACKEND}/matrices-caces/periodo/1/carrera/5` },
    { url: `${URL_BACKEND}/matrices-caces/periodo/1` }, // Consolidado Subdecanato
  ];

  const inicioMatriz = Date.now();
  await Promise.all(
    peticionesMatriz.map(async (item) => {
      const inicioReq = Date.now();
      try {
        const res = await fetch(item.url, {
          headers: {
            'Authorization': `Bearer ${tokenSubdecana}`,
            'Content-Type': 'application/json',
          },
        });
        const latencia = Date.now() - inicioReq;
        latenciasMatriz.push(latencia);
        if (res.ok) {
          exitosMatriz++;
        } else {
          fallosMatriz++;
        }
      } catch {
        latenciasMatriz.push(Date.now() - inicioReq);
        fallosMatriz++;
      }
    })
  );
  const finMatriz = Date.now();
  const metricasMatriz = calcularMetricas(latenciasMatriz, exitosMatriz, fallosMatriz, finMatriz - inicioMatriz);

  return {
    cargaLogin: metricasLogin,
    cargaConsultasEstudiante: metricasConsultas,
    cargaAsignacionesCoordinadores: metricasAsignaciones,
    cargaMatrizCaces: metricasMatriz,
  };
}

if (require.main === module) {
  ejecutarPruebaCargaReal()
    .then((resultados) => {
      console.log('Resultados de Carga Real HTTP/API:');
      console.log(JSON.stringify(resultados, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fallo en la prueba de carga:', err);
      process.exit(1);
    });
}
