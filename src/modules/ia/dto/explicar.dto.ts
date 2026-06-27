import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExplicarDto {
  @ApiProperty({ example: '¿Qué es la Ley 1581?' })
  @IsString()
  @IsNotEmpty()
  pregunta!: string;
}

export class MensajeHistorialDto {
  @IsString()
  role!: 'user' | 'assistant';

  @IsString()
  content!: string;
}

export class PreguntaDto {
  @IsString()
  id!: string;

  @IsString()
  categoria!: string;

  @IsString()
  texto!: string;

  @IsOptional()
  peso?: number;
}

export class ChatIaDto {
  @ApiPropertyOptional({ example: 'uuid-empresa' })
  @IsOptional()
  @IsString()
  empresa_id?: string;

  @ApiPropertyOptional({ example: 'CAVALTEC SAS' })
  @IsOptional()
  @IsString()
  empresa_nombre?: string;

  @ApiPropertyOptional({ example: 'uuid-usuario' })
  @IsOptional()
  @IsString()
  usuario_id?: string;

  @ApiProperty({ example: '__inicio__' })
  @IsString()
  @IsNotEmpty()
  mensaje!: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  historial?: MensajeHistorialDto[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  preguntas?: PreguntaDto[];
}
