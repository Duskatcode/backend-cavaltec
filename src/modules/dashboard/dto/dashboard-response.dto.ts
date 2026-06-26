export class DashboardResponseDto {
  empresa!: {
    id: string;
    nombre: string;
  };

  metricas!: {
    evaluaciones: number;
    promedioCumplimiento: number;
    ultimaEvaluacion: Date | null;
  };

  niveles!: {
    excelente: number;
    bueno: number;
    regular: number;
    critico: number;
  };
}
