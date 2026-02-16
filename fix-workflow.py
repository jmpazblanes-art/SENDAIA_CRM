import requests
import json
import re

API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNGMwNDk0Mi03YzQzLTQzNzMtOGRjOC00OWUyOGIyYTkzYzgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcwNzM1ODc4fQ.3N3fw0E5oZD_1jS3XDYTQbAxFFZowGh35_x50NOjs4s"
BASE_URL = "https://demo-demo-n8n.ixbbes.easypanel.host/api/v1"
WORKFLOW_ID = "Ls5vLlDIdOhLq1oh"

SUPABASE_URL = "https://rudolmemxsugxmcbvrwe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYxNzMzNCwiZXhwIjoyMDg2MTkzMzM0fQ.As1mEEtdHfWobHGFrkNlFURogj6mNU356KMTEKqufvg"
EMPLOYEE_ID = "f4c04942-7c43-4373-8dc8-49e28b2a93c8"

headers = {"X-N8N-API-KEY": API_KEY}

# Get workflow
print("📥 Descargando workflow...")
response = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=headers)
workflow = response.json()

# Replace all env vars in the JSON string
workflow_str = json.dumps(workflow)

# Replace SUPABASE_URL
workflow_str = re.sub(r'=\{\{\s*\$env\.SUPABASE_URL\s*\}\}', f'={SUPABASE_URL}', workflow_str)
workflow_str = re.sub(r'\{\{\s*\$env\.SUPABASE_URL\s*\}\}', SUPABASE_URL, workflow_str)

# Replace SUPABASE_SERVICE_ROLE_KEY
workflow_str = re.sub(r'=\{\{\s*\$env\.SUPABASE_SERVICE_ROLE_KEY\s*\}\}', f'={SUPABASE_KEY}', workflow_str)
workflow_str = re.sub(r'\{\{\s*\$env\.SUPABASE_SERVICE_ROLE_KEY\s*\}\}', SUPABASE_KEY, workflow_str)
workflow_str = re.sub(r'\{\{\s*`Bearer \$\{\\?\$env\.SUPABASE_SERVICE_ROLE_KEY\\?\}`\s*\}\}', f'Bearer {SUPABASE_KEY}', workflow_str)

# Replace DEFAULT_EMPLOYEE_ID
workflow_str = re.sub(r'=\{\{\s*\$env\.DEFAULT_EMPLOYEE_ID\s*\}\}', f'={EMPLOYEE_ID}', workflow_str)
workflow_str = re.sub(r'\{\{\s*\$env\.DEFAULT_EMPLOYEE_ID\s*\}\}', EMPLOYEE_ID, workflow_str)

workflow = json.loads(workflow_str)

# Update workflow
print("📤 Subiendo workflow actualizado...")
response = requests.put(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}",
    headers={**headers, "Content-Type": "application/json"},
    json=workflow
)

if response.status_code == 200:
    print("✅ Workflow actualizado correctamente!")
    print("🎉 Ahora el workflow funciona sin variables de entorno")
else:
    print(f"❌ Error: {response.status_code}")
    print(response.text)
