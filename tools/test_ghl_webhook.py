import os
import json
import requests
from dotenv import load_dotenv

# Load env variables
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def test_ghl_webhook():
    print("🚀 Iniciando Test de Handshake: Webhook GHL...")
    
    # URL local (ajustar si el puerto es diferente)
    url = "http://localhost:3000/api/webhooks/ghl"
    
    # Payload simulado de GHL
    payload = {
        "first_name": "Juan",
        "last_name": "SendaIA Test",
        "email": "juan.test@sendaia.es",
        "phone": "+34600000000",
        "company": "SendaIA Lab",
        "source": "showcase_demo",
        "industry": "IA & Automation"
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Webhook funcionando correctamente.")
            return True
        else:
            print("❌ El webhook devolvió un error.")
            return False
            
    except Exception as e:
        print(f"❌ Error al conectar con el servidor local: {e}")
        print("Asegúrate de que npm run dev esté activo en el puerto 3000.")
        return False

if __name__ == "__main__":
    test_ghl_webhook()
