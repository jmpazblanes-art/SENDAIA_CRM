# Manual de Operaciones SendaIA CRM 🚀

¡Bienvenido al centro de mando de tu Agencia de IA! Este CRM no es solo una base de datos, es el **núcleo operativo** donde convergen tus automatizaciones, tus agentes de voz y tu lógica de negocio.

---

## 1. Dashboard (Vista General)
El corazón del CRM. Aquí verás:
*   **Métricas de Impacto:** Clientes activos, facturación proyectada y citas agendadas.
*   **Línea de Tiempo:** Actividad reciente tanto humana como de los agentes de IA.
*   **Últimas Oportunidades:** Los leads más frescos que han entrado por tu web o funnels de GHL.

## 2. Clientes (Gestión Comercial)
Aquí gestionas a los humanos detrás de los datos.
*   **Pipeline:** Verás a tus clientes organizados por estado (Lead, Contactado, Cualificado, etc.).
*   **Ficha de Cliente:** Al hacer clic en un cliente, verás su historial completo: notas, citas pasadas y el **Diagnóstico de Ventas** generado por IA.
*   **Prioridades:** El sistema marca automáticamente si un cliente necesita atención urgente.

## 3. SendaIA Brain (Automatizaciones)
Esta es la parte "técnica" de tu negocio. 
*   **Workflows:** Aquí ves qué procesos están corriendo (Ej: "Cerebro de Ingesta de Leads"). Es un espejo de lo que tienes en n8n.
*   **Monitor en Tiempo Real:** Verás los "pulsos" del sistema. Cada vez que una IA procesa algo, aparecerá aquí como un "Run" (éxito o fallo).
*   **Endpoints:** Aquí tienes las URLs (Webhooks) para conectar otras herramientas. Si quieres que GHL envíe datos aquí, usa la URL de **"GHL Directo"**.

## 4. Agentes de Voz (Voice Control)
Aquí monitorizas a tus empleados que nunca duermen: los agentes de voz de Retell AI.
*   **Logs de Llamadas:** Verás quién llamó, cuánto duró la llamada y, lo más importante, el **Análisis de Sentimiento** (si el cliente estaba enfadado, interesado o neutral).
*   **Ahorro Humano:** El sistema calcula cuántas horas de trabajo manual te están ahorrando estos agentes.

## 5. Prompt Lab (Librería de Inteligencia)
Esta es la "caja fuerte" de tu conocimiento.
*   **Activos de IA:** Aquí guardas los *System Prompts* que usan tus agentes de WhatsApp, voz o n8n.
*   **Versiones:** Puedes llevar el control de qué versión del prompt es la más efectiva.
*   **Función:** Sirve para que todo tu equipo sepa qué instrucciones le estamos dando a la IA en cada parte del negocio y para poder editarlas rápidamente.

## 6. Equipo y Citas
*   **Equipo:** Gestión de tus colaboradores internos (técnicos, closers).
*   **Citas:** Vista de calendario para ver la saturación de la agenda y las próximas sesiones de diagnóstico.

---

### Pro-Tip: Conexión GHL
Para conectar tu funnel (demo.sendaia.es), ve a **Automatizaciones**, copia la URL de **"Webhook GHL Directo"** y pégala en un workflow de GoHighLevel que se active "When a form is submitted". ¡Magia instantánea!
