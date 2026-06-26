import { IsUUID, IsArray, ValidateNested, IsBoolean, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class RespuestaDto {
  @IsUUID('all', { message: 'El ID de la pregunta debe ser un UUID válido' })
  @IsNotEmpty()
  preguntaId!: string;

  @IsBoolean()
  @IsNotEmpty()
  respuesta!: boolean;
}

export class CreateEvaluacionDto {
  @IsUUID('all', { message: 'El ID de la empresa debe ser un UUID válido' })
  @IsNotEmpty()
  empresaId!: string;

  @IsUUID('all', { message: 'El ID del usuario debe ser un UUID válido' })
  @IsNotEmpty()
  usuarioId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RespuestaDto)
  @IsNotEmpty()
  respuestas!: RespuestaDto[];
}