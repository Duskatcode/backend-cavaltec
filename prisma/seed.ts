import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const preguntas = [
  { categoria: "Política de tratamiento", texto: "¿La empresa cuenta con una Política de Tratamiento de Datos Personales documentada?", peso: 10, orden: 1 },
  { categoria: "Política de tratamiento", texto: "¿La política está publicada y accesible para los titulares?", peso: 8, orden: 2 },
  { categoria: "Política de tratamiento", texto: "¿La política incluye los fines del tratamiento de datos personales?", peso: 8, orden: 3 },
  { categoria: "Aviso de privacidad", texto: "¿Se entrega aviso de privacidad al momento de recolectar datos personales?", peso: 9, orden: 4 },
  { categoria: "Aviso de privacidad", texto: "¿El aviso de privacidad indica la identidad y datos de contacto del responsable?", peso: 7, orden: 5 },
  { categoria: "Aviso de privacidad", texto: "¿El aviso señala los fines del tratamiento para los cuales se solicitan los datos?", peso: 8, orden: 6 },
  { categoria: "Autorización del titular", texto: "¿La empresa obtiene autorización previa, expresa e informada del titular?", peso: 10, orden: 7 },
  { categoria: "Autorización del titular", texto: "¿Las autorizaciones se conservan como evidencia?", peso: 9, orden: 8 },
  { categoria: "Autorización del titular", texto: "¿Existe un mecanismo para que el titular revoque su autorización?", peso: 8, orden: 9 },
  { categoria: "Derechos del titular", texto: "¿La empresa tiene un canal habilitado para que los titulares ejerzan sus derechos?", peso: 9, orden: 10 },
  { categoria: "Derechos del titular", texto: "¿Existe un procedimiento para atender solicitudes de rectificación, actualización o supresión?", peso: 9, orden: 11 },
  { categoria: "Derechos del titular", texto: "¿Se respetan los tiempos de respuesta (10 días hábiles para consultas, 15 para reclamos)?", peso: 8, orden: 12 },
  { categoria: "Medidas de seguridad", texto: "¿La empresa ha implementado medidas técnicas para proteger las bases de datos personales?", peso: 10, orden: 13 },
  { categoria: "Medidas de seguridad", texto: "¿Existen controles de acceso diferenciado a las bases de datos con información personal?", peso: 9, orden: 14 },
  { categoria: "Medidas de seguridad", texto: "¿Se cuenta con un plan de respuesta ante incidentes de seguridad de datos personales?", peso: 8, orden: 15 },
  { categoria: "Registro Nacional de Bases de Datos", texto: "¿Las bases de datos están registradas ante la SIC?", peso: 9, orden: 16 },
  { categoria: "Registro Nacional de Bases de Datos", texto: "¿El registro en el RNBD está actualizado con los datos vigentes de cada base?", peso: 7, orden: 17 },
  { categoria: "Transferencia internacional", texto: "¿Cuando se transfieren datos al exterior, se verifica que el país receptor tenga niveles adecuados de protección?", peso: 8, orden: 18 },
  { categoria: "Transferencia internacional", texto: "¿Se cuenta con cláusulas contractuales o garantías para transferencias internacionales?", peso: 8, orden: 19 },
  { categoria: "Transferencia internacional", texto: "¿Se obtiene autorización expresa del titular para transferencias internacionales de sus datos?", peso: 9, orden: 20 },
];

async function main() {
  console.log('Eliminando respuestas existentes...');
  await prisma.respuesta.deleteMany();
  console.log('Eliminando preguntas existentes...');
  await prisma.pregunta.deleteMany();
  console.log('Insertando 20 preguntas...');
  for (const p of preguntas) {
    await prisma.pregunta.create({ data: p });
  }
  console.log('✅ Seed completado: 20 preguntas insertadas con UUIDs generados automáticamente.');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
