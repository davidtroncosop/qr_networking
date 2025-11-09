#!/bin/bash

# Script de verificación pre-deploy
# Ejecuta este script antes de desplegar para asegurar que todo funciona

echo "🔍 Verificando proyecto antes del deploy..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Verificar Backend
echo "📦 Verificando Backend (Worker)..."
cd congress-networking-worker

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependencias del backend...${NC}"
    npm install
fi

echo "🔨 Compilando backend..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend compilado exitosamente${NC}"
    
    # Verificar que el archivo dist existe
    if [ -f "dist/index.js" ]; then
        SIZE=$(wc -c < dist/index.js)
        echo -e "${GREEN}✅ dist/index.js generado (${SIZE} bytes)${NC}"
    else
        echo -e "${RED}❌ dist/index.js no fue generado${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Error compilando backend${NC}"
    ERRORS=$((ERRORS + 1))
fi

cd ..
echo ""

# Verificar Frontend
echo "🎨 Verificando Frontend (Pages)..."
cd congress-networking-app

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependencias del frontend...${NC}"
    npm install
fi

echo "🔨 Compilando frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend compilado exitosamente${NC}"
    
    # Verificar que el directorio dist existe
    if [ -d "dist" ]; then
        FILES=$(find dist -type f | wc -l)
        echo -e "${GREEN}✅ dist/ generado (${FILES} archivos)${NC}"
    else
        echo -e "${RED}❌ dist/ no fue generado${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Error compilando frontend${NC}"
    ERRORS=$((ERRORS + 1))
fi

cd ..
echo ""

# Verificar archivos críticos
echo "📋 Verificando archivos críticos..."

CRITICAL_FILES=(
    "congress-networking-worker/src/index.ts"
    "congress-networking-worker/src/routes/auth.ts"
    "congress-networking-worker/src/routes/users.ts"
    "congress-networking-worker/src/routes/events.ts"
    "congress-networking-worker/src/routes/connections.ts"
    "congress-networking-worker/migrations/001_initial_schema.sql"
    "congress-networking-app/src/App.tsx"
    "congress-networking-app/src/pages/AuthPage.tsx"
    "congress-networking-app/src/pages/DashboardPage.tsx"
    "congress-networking-app/src/services/api.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file ${RED}(FALTA)${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""

# Verificar Git
echo "🔄 Verificando Git..."
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Repositorio Git inicializado${NC}"
    
    # Verificar si hay cambios sin commit
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  Hay cambios sin commit${NC}"
        echo "   Ejecuta: git add . && git commit -m 'Ready for deploy'"
    else
        echo -e "${GREEN}✅ No hay cambios pendientes${NC}"
    fi
    
    # Verificar si hay remote
    if git remote -v | grep -q "origin"; then
        echo -e "${GREEN}✅ Remote 'origin' configurado${NC}"
    else
        echo -e "${YELLOW}⚠️  No hay remote configurado${NC}"
        echo "   Ejecuta: git remote add origin <tu-repo-url>"
    fi
else
    echo -e "${YELLOW}⚠️  Git no inicializado${NC}"
    echo "   Ejecuta: git init"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Resultado final
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Todo listo para desplegar!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Revisa PRE-DEPLOY-CHECKLIST.md"
    echo "2. Sigue las instrucciones en DEPLOY-GUIDE.md"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Se encontraron $ERRORS errores${NC}"
    echo ""
    echo "Por favor, corrige los errores antes de desplegar."
    echo ""
    exit 1
fi
