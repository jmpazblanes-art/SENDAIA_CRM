import requests
import json

API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNGMwNDk0Mi03YzQzLTQzNzMtOGRjOC00OWUyOGIyYTkzYzgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcwNzM1ODc4fQ.3N3fw0E5oZD_1jS3XDYTQbAxFFZowGh35_x50NOjs4s"
BASE_URL = "https://demo-demo-n8n.ixbbes.easypanel.host/api/v1"
WORKFLOW_ID = "Ls5vLlDIdOhLq1oh"

SUPA_URL = "https://rudolmemxsugxmcbvrwe.supabase.co"
SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYxNzMzNCwiZXhwIjoyMDg2MTkzMzM0fQ.As1mEEtdHfWobHGFrkNlFURogj6mNU356KMTEKqufvg"
EMP_ID = "f4c04942-7c43-4373-8dc8-49e28b2a93c8"

headers = {"X-N8N-API-KEY": API_KEY}

print("📥 Descargando workflow...")
response = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=headers)
workflow = response.json()

print("🔧 Arreglando nodos HTTP Request de Supabase...")
for node in workflow.get('nodes', []):
    if node.get('type') == 'n8n-nodes-base.httpRequest':
        params = node.get('parameters', {})
        
        # Fix URL
        if 'url' in params:
            url = params['url']
            if '$env.SUPABASE_URL' in url:
                params['url'] = url.replace('={{ $env.SUPABASE_URL }}', SUPA_URL)
        
        # Fix headers
        if 'headerParameters' in params and 'parameters' in params['headerParameters']:
            for header in params['headerParameters']['parameters']:
                if '$env.SUPABASE_SERVICE_ROLE_KEY' in str(header.get('value', '')):
                    if header['name'] == 'apikey':
                        header['value'] = SUPA_KEY
                    elif header['name'] == 'Authorization':
                        header['value'] = f'Bearer {SUPA_KEY}'
        
        # Fix body parameters
        if 'bodyParameters' in params and 'parameters' in params['bodyParameters']:
            for param in params['bodyParameters']['parameters']:
                if '$env.DEFAULT_EMPLOYEE_ID' in str(param.get('value', '')):
                    param['value'] = EMP_ID

# Save to file for manual import
with open('workflow-ARREGLADO.json', 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2, ensure_ascii=False)

print("✅ Workflow arreglado guardado en: workflow-ARREGLADO.json")
print("\n📋 IMPORTA ESTE ARCHIVO EN N8N:")
print("   1. Abre n8n")
print("   2. Menú → Import from File")
print("   3. Selecciona: workflow-ARREGLADO.json")
print("   4. Click Import")
print("   5. Activa el workflow")
