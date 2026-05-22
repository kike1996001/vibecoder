# Script to add environment variables to Vercel project
# Usage: .\add-env-vars.ps1

$env_variables = @{
    "STRIPE_PUBLIC_KEY" = "pk_test_51TZ9xM9BXGV6RzqvLJ9IsFDTIioeSVs5WVbnG0MoRbkC13vGFsUBcG1hr4m6tOyOl2kpy5MEDvA53B10MI2l46FI00kw2Sd5xu"
    "STRIPE_SECRET_KEY" = "sk_test_51TZ9xM9BXGV6RzqvVPLdCtPZ5ue0ZEHJFdOby0JIyZJKcV5p6oUTfDf7aBtZ8pOCIKEfI4gT8P4KK6jAk0efXm1C00Fr8Ts13v"
    "STRIPE_WEBHOOK_SECRET" = "whsec_test_4eC39HqLyjWDarH5ynHfEeYb"
    "SUPABASE_URL" = "https://teedklgztytpogkjbtva.supabase.co"
    "SUPABASE_SERVICE_ROLE_KEY" = "sb_secret_TuU52WQwhRrYXYbqwEBIOA_vxLm6s-p"
    "SMTP_HOST" = "smtp.gmail.com"
    "SMTP_PORT" = "587"
    "SMTP_USER" = "delfinachemabiebeda@gmail.com"
    "SMTP_PASSWORD" = "yuzd ockc zojq njsv"
    "SMTP_FROM" = "delfinachemabiebeda@gmail.com"
    "RESEND_API_KEY" = "re_NomDKaAt_5uXBKbbTHwaGKA4fUaezEbTL"
    "API_PORT" = "5178"
    "FRONTEND_URL" = "https://vibecoder-woad.vercel.app"
    "VITE_API_URL" = "https://vibecoder-woad.vercel.app/api"
}

Write-Host "Adding environment variables to promptix project..." -ForegroundColor Cyan
Write-Host "Total variables to add: $($env_variables.Count)" -ForegroundColor Cyan

$added = 0
$failed = 0

foreach ($key in $env_variables.Keys) {
    $value = $env_variables[$key]
    Write-Host "Adding $key..." -NoNewline
    
    # Use echo to pipe the value into vercel env add (simulating user input)
    $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "echo $value | vercel env add $key --yes" -WindowStyle Hidden -PassThru -Wait
    
    if ($process.ExitCode -eq 0) {
        Write-Host " ✓" -ForegroundColor Green
        $added++
    } else {
        Write-Host " ✗" -ForegroundColor Red
        $failed++
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Added: $added" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "All variables added successfully!" -ForegroundColor Green
    Write-Host "Redeploying to production..." -ForegroundColor Cyan
    vercel --prod --yes
} else {
    Write-Host "Some variables failed. Please check and try again." -ForegroundColor Red
}
