/**
 * Script para diagnosticar e corrigir problemas com Puppeteer/Chromium
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico do Puppeteer/Chromium');
console.log('='.repeat(70));

async function diagnose() {
    try {
        console.log('\n1. Verificando instalação do Puppeteer...');
        const puppeteerVersion = require('puppeteer/package.json').version;
        console.log(`   ✅ Puppeteer v${puppeteerVersion} instalado`);

        console.log('\n2. Verificando executablePath do Chromium...');
        const browserFetcher = puppeteer.createBrowserFetcher();
        const revisionInfo = browserFetcher.revisionInfo(browserFetcher.currentPlatform());

        console.log(`   Caminho esperado: ${revisionInfo.executablePath}`);

        if (fs.existsSync(revisionInfo.executablePath)) {
            console.log(`   ✅ Chromium encontrado!`);
        } else {
            console.log(`   ❌ Chromium NÃO encontrado!`);
            console.log(`   📥 Baixando Chromium...`);

            const revision = await browserFetcher.download(revisionInfo.revision, (downloadedBytes, totalBytes) => {
                const percent = (downloadedBytes / totalBytes * 100).toFixed(2);
                process.stdout.write(`\r   Progresso: ${percent}%`);
            });

            console.log(`\n   ✅ Chromium baixado com sucesso!`);
            console.log(`   Caminho: ${revision.executablePath}`);
        }

        console.log('\n3. Testando inicialização do navegador...');
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        console.log('   ✅ Navegador iniciado com sucesso!');

        const page = await browser.newPage();
        await page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 30000 });
        console.log('   ✅ Página carregada com sucesso!');

        await browser.close();
        console.log('   ✅ Navegador fechado com sucesso!');

        console.log('\n' + '='.repeat(70));
        console.log('✅ DIAGNÓSTICO COMPLETO - TUDO FUNCIONANDO!');
        console.log('='.repeat(70));
        console.log('\nVocê pode agora tentar conectar o WhatsApp novamente.');

    } catch (error) {
        console.error('\n' + '='.repeat(70));
        console.error('❌ ERRO NO DIAGNÓSTICO');
        console.error('='.repeat(70));
        console.error('\nDetalhes do erro:');
        console.error(error.message);
        console.error('\nStack trace:');
        console.error(error.stack);

        console.log('\n' + '='.repeat(70));
        console.log('💡 POSSÍVEIS SOLUÇÕES:');
        console.log('='.repeat(70));
        console.log('1. Execute: npm install puppeteer --force');
        console.log('2. Execute: npx puppeteer browsers install chrome');
        console.log('3. Reinicie o terminal como Administrador');
        console.log('4. Desative temporariamente o antivírus');
        console.log('5. Verifique se há espaço em disco suficiente');

        process.exit(1);
    }
}

diagnose();
