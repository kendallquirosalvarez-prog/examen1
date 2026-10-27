<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuardarEquipoRequest;
use App\Http\Resources\EquipoResource;
use App\Models\Equipo;
use App\Services\EquipoService;
use Illuminate\Http\Request;

class EquipoController extends Controller
{
    public function __construct(private EquipoService $service)
    {
    }

    public function index(Request $request)
    {
        // maximo 50 por pagina
        $porPagina = min(max((int) $request->query('per_page', 10), 1), 50);

        $equipos = $this->service->listar(
            $request->query('q'),
            $request->query('estado'),
            $porPagina,
        );

        return EquipoResource::collection($equipos);
    }

    // si el id no existe laravel responde 404 solo
    public function show(Equipo $equipo)
    {
        return new EquipoResource($equipo->load('categoria'));
    }

    // responde 201 con el encabezado Location del equipo nuevo
    public function store(GuardarEquipoRequest $request)
    {
        $equipo = $this->service->crear($request->validated());

        return (new EquipoResource($equipo))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('equipos.show', $equipo));
    }

    public function update(GuardarEquipoRequest $request, Equipo $equipo)
    {
        return new EquipoResource($this->service->actualizar($equipo, $request->validated()));
    }

    // 204 si se elimina, 409 si esta prestado (lo maneja bootstrap/app.php)
    public function destroy(Equipo $equipo)
    {
        $this->service->eliminar($equipo);

        return response()->noContent();
    }

    public function prestar(Equipo $equipo)
    {
        return new EquipoResource($this->service->prestar($equipo));
    }
}
