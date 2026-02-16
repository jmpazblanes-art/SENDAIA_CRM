
# SendaIA CRM (MVP)

Sistema operativo para la gestión de clientes, equipo y automatización de SendaIA.

## Inicio Rápido

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Configurar Base de Datos**:
    - Crea un proyecto en Supabase.
    - Corre el script SQL ubicado en `supabase/migrations/01_initial_schema.sql` en el Editor SQL de Supabase.
    - Obtén las credenciales y actualiza `.env.local` (ya pre-configurado, verifica valores).

3.  **Iniciar Desarrollo**:
    ```bash
    npm run dev
    ```
    Abre http://localhost:3000

## Funcionalidades Incluidas
- **Dashboard**: Métricas clave y actividad reciente.
- **Clientes**: Pipeline Kanban y gestión de leads.
- **Citas**: Calendario y agenda.
- **Facturación**: Listado y subida de facturas.
- **Equipo**: Directorio de empleados.
- **Automatización**:
    - Botón "Llamar Agente IA" (conecta con n8n/Retell).
    - Chatbot Asistente Interno (conecta con n8n/OpenRouter).

## Documentación
Ver carpeta `docs/` para manuales detallados.
