#!/usr/bin/env bash
set -e

echo "===================================================="
echo "SISTEMA"
echo "===================================================="
pwd
echo
uname -a
echo
node -v
npm -v

echo
echo "===================================================="
echo "VARIABLES OPENAI / GROQ EN EL SHELL"
echo "===================================================="
env | grep -Ei 'OPENAI|GROQ|ANTHROPIC|DEEPSEEK' || true

echo
echo "===================================================="
echo "BUSCANDO EXPORTS EN CONFIGURACION DEL SHELL"
echo "===================================================="
grep -RInE 'OPENAI|GROQ|ANTHROPIC|DEEPSEEK' \
 ~/.zshrc \
 ~/.zprofile \
 ~/.zlogin \
 ~/.zshenv \
 ~/.profile \
 ~/.bash_profile \
 ~/.bashrc 2>/dev/null || true

echo
echo "===================================================="
echo "BUSCANDO VARIABLES EN TODO EL PROYECTO"
echo "===================================================="
find . \
-not -path "*/node_modules/*" \
-not -path "*/dist/*" \
-type f \
-print0 |
xargs -0 grep -HnE \
'OPENAI_|GROQ|deepseek|llama-3|model:|baseURL|apiKey|process\.env|dotenv' \
2>/dev/null || true

echo
echo "===================================================="
echo "ARCHIVOS .env"
echo "===================================================="
find . -name ".env*" -maxdepth 4 -print

echo
echo "===================================================="
echo "CONTENIDO DE LOS .env (API KEYS OCULTAS)"
echo "===================================================="

find . -name ".env*" -maxdepth 4 | while read f
do
echo
echo "----- $f -----"
sed \
-e 's/\(OPENAI_API_KEY=\).*/\1********/' \
-e 's/\(GROQ_API_KEY=\).*/\1********/' \
-e 's/\(ANTHROPIC_API_KEY=\).*/\1********/' \
"$f"
done

echo
echo "===================================================="
echo "MODELOS HARDCODEADOS"
echo "===================================================="
grep -RIn \
'deepseek-r1-distill-llama-70b\|llama-3.3-70b-versatile\|OPENAI_MODEL' \
. \
--exclude-dir=node_modules \
--exclude-dir=dist || true

echo
echo "===================================================="
echo "PROCESOS NODE ACTIVOS"
echo "===================================================="
ps aux | grep node | grep -v grep || true

echo
echo "===================================================="
echo "PUERTO 4000"
echo "===================================================="
lsof -i :4000 || true

echo
echo "===================================================="
echo "ARCHIVO QUE ESTA EJECUTANDO NODE"
echo "===================================================="
ps aux | grep node | grep -v grep | awk '{print $NF}' || true

echo
echo "===================================================="
echo "TSCONFIG"
echo "===================================================="
find . -name tsconfig.json -maxdepth 3 -exec echo "---- {} ----" \; -exec cat {} \;

echo
echo "===================================================="
echo "PACKAGE.JSON"
echo "===================================================="
find . -name package.json -maxdepth 3 -exec echo "---- {} ----" \; -exec jq '.scripts' {} \; 2>/dev/null || true

echo
echo "===================================================="
echo "DIST"
echo "===================================================="
find . -type d -name dist -maxdepth 3

echo
echo "===================================================="
echo "NODE EJECUTANDO DOTENV"
echo "===================================================="
cd ia-service

node - <<'NODE'
require("dotenv").config({override:true});

console.log({
apiKey:process.env.OPENAI_API_KEY?"OK":"NO",
baseURL:process.env.OPENAI_BASE_URL,
model:process.env.OPENAI_MODEL
});
NODE

echo
echo "===================================================="
echo "FIN"
echo "===================================================="
