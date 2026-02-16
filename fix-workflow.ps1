$apiKey = "n8n_api_Q.3N3fw0E5oZD_1jS3XDYTQbAxFFZowGh35_x50NOjs4"
$baseUrl = "https://demo-demo-n8n.ixbbes.easypanel.host/api/v1"
$workflowId = "Ls5vLlDIdOhLq1oh"

# Get workflow
$workflow = Invoke-RestMethod -Uri "$baseUrl/workflows/$workflowId" -Headers @{"X-N8N-API-KEY"=$apiKey} -Method Get

# Replace env vars in all HTTP Request nodes
foreach ($node in $workflow.nodes) {
    if ($node.type -eq "n8n-nodes-base.httpRequest") {
        # Replace SUPABASE_URL
        if ($node.parameters.url) {
            $node.parameters.url = $node.parameters.url -replace '\{\{.*?\$env\.SUPABASE_URL.*?\}\}', 'https://rudolmemxsugxmcbvrwe.supabase.co'
            $node.parameters.url = $node.parameters.url -replace '=\{\{.*?\$env\.SUPABASE_URL.*?\}\}', '=https://rudolmemxsugxmcbvrwe.supabase.co'
        }
        
        # Replace SUPABASE_SERVICE_ROLE_KEY in headers
        if ($node.parameters.headerParameters.parameters) {
            foreach ($header in $node.parameters.headerParameters.parameters) {
                if ($header.value -match '\$env\.SUPABASE_SERVICE_ROLE_KEY') {
                    $header.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYxNzMzNCwiZXhwIjoyMDg2MTkzMzM0fQ.As1mEEtdHfWobHGFrkNlFURogj6mNU356KMTEKqufvg'
                }
            }
        }
        
        # Replace DEFAULT_EMPLOYEE_ID in body
        if ($node.parameters.bodyParameters.parameters) {
            foreach ($param in $node.parameters.bodyParameters.parameters) {
                if ($param.value -match '\$env\.DEFAULT_EMPLOYEE_ID') {
                    $param.value = 'f4c04942-7c43-4373-8dc8-49e28b2a93c8'
                }
            }
        }
    }
}

# Update workflow
$body = $workflow | ConvertTo-Json -Depth 20
Invoke-RestMethod -Uri "$baseUrl/workflows/$workflowId" -Headers @{"X-N8N-API-KEY"=$apiKey; "Content-Type"="application/json"} -Method Put -Body $body

Write-Host "✅ Workflow actualizado con credenciales hardcodeadas"
