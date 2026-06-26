import { IsString, IsNotEmpty, IsInt, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreatePreguntaDto {
  @IsString()
  @IsNotEmpty()
  categoria!: string;

  @IsString()
  @IsNotEmpty()
  texto!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  peso!: number;

  @IsInt()
  @IsOptional()
  orden?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
