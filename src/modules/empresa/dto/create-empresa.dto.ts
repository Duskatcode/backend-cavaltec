import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum TamanoEmpresa {
  MICRO = 'MICRO',
  PYME = 'PYME',
  GRANDE = 'GRANDE',
}

export enum EstadoEmpresa {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
}

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  nit!: string;

  @IsString()
  @IsNotEmpty()
  sector!: string;

  @IsEnum(TamanoEmpresa)
  tamano!: TamanoEmpresa;

  @IsEnum(EstadoEmpresa)
  @IsOptional()
  estado?: EstadoEmpresa;
}
