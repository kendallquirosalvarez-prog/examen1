<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // solo los campos del contrato, sin costo_interno ni fechas de registro
        return [
            'id'                => $this->id,
            'codigo'            => $this->codigo,
            'nombre'            => $this->nombre,
            'estado'            => $this->estado,
            'fecha_adquisicion' => $this->fecha_adquisicion?->format('Y-m-d'),
            'categoria'         => new CategoriaResource($this->whenLoaded('categoria')),
        ];
    }
}
