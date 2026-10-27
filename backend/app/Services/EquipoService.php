<?php

namespace App\Services;

use App\Exceptions\ReglaNegocioException;
use App\Models\Equipo;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * [B2] Capa de negocio de equipos.
 *
 * Esta clase NO conoce HTTP: no usa request(), response(), abort() ni códigos
 * de estado. Cuando una regla del dominio lo impide, lanza ReglaNegocioException
 * y bootstrap/app.php la traduce a 409.
 *
 * Reglas de negocio:
 *  R1. No se puede eliminar un equipo que está prestado.
 *  R2. Solo se puede prestar un equipo disponible.
 */
class EquipoService
{
    /**
     * Listado paginado con la categoría cargada de forma anticipada (sin N+1),
     * ordenado por código. Filtros opcionales:
     *  - $q:      busca en código o nombre (coincidencia parcial)
     *  - $estado: filtra por estado exacto
     */
    public function listar(?string $q, ?string $estado, int $porPagina): LengthAwarePaginator
    {
        return Equipo::query()
            ->with('categoria')
            ->when($q, function ($query, $q) {
                // Agrupado para que el OR no se mezcle con el filtro de estado
                $query->where(function ($sub) use ($q) {
                    $sub->where('codigo', 'like', "%{$q}%")
                        ->orWhere('nombre', 'like', "%{$q}%");
                });
            })
            ->when($estado, fn ($query, $estado) => $query->where('estado', $estado))
            ->orderBy('codigo')
            ->paginate($porPagina);
    }

    public function crear(array $datos): Equipo
    {
        return Equipo::create($datos)->load('categoria');
    }

    public function actualizar(Equipo $equipo, array $datos): Equipo
    {
        $equipo->update($datos);

        return $equipo->load('categoria');
    }

    public function eliminar(Equipo $equipo): void
    {
        // R1
        if ($equipo->estado === 'prestado') {
            throw new ReglaNegocioException('No se puede eliminar un equipo prestado.');
        }

        $equipo->delete();
    }

    public function prestar(Equipo $equipo): Equipo
    {
        // R2
        if ($equipo->estado === 'mantenimiento') {
            throw new ReglaNegocioException('No se puede prestar un equipo en mantenimiento.');
        }

        if ($equipo->estado === 'prestado') {
            throw new ReglaNegocioException('El equipo ya se encuentra prestado.');
        }

        $equipo->update(['estado' => 'prestado']);

        return $equipo->load('categoria');
    }
}
