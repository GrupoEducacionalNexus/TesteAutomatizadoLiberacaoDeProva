const puppeteer = require('puppeteer');
const dataDeLiberacaoProva = require('./dataLiberacaoProva');
const dataDeBlocqueioProva = require('./dataBloqueioProva');

const CBI_URL = `https://cbi.sistemasiga.net/login`;

(async () => {
    console.log(dataDeLiberacaoProva, dataDeBlocqueioProva);

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(CBI_URL, { waitUntil: ['load', 'networkidle0'] });
    // Set screen size
    await page.setViewport({ width: 0, height: 0 });
    await page.$eval('body > div:nth-child(3) > form.form-vertical.login-form > div:nth-child(2) > div > div > input', el => el.value = '10386283427');
    await page.$eval('body > div:nth-child(3) > form.form-vertical.login-form > div:nth-child(3) > div > div > input', el => el.value = '3598');
    await page.$eval('body > div:nth-child(3) > form.form-vertical.login-form > div:nth-child(4) > div > div > select', el => el.value = 'secretaria');

    await Promise.all([
        page.click('button[type="submit"]'), // Substitua pelo seletor correto para o botão de envio do formulário
        page.waitForNavigation({ waitUntil: 'networkidle2' }), // Aguarda a navegação para a próxima página
    ]);

    // Agora você está na próxima página
    console.log('Página atual:', page.url());

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Aguarda 5 segundos antes de acessar o próximo elemento

    // Localize o elemento #noprint > li:nth-child(12) > a
    await page.waitForSelector('#noprint > li:nth-child(12) > a');
    const opcaoCursos = await page.$('#noprint > li:nth-child(12) > a');
    if (opcaoCursos) {
        await opcaoCursos.click();
        page.waitForSelector('#noprint > li.has-sub.open > ul > li:nth-child(2) > a');

        const opcaoGestaoDeCursos = await page.$('#noprint > li.has-sub.open > ul > li:nth-child(2) > a');
        if (opcaoGestaoDeCursos) {
            await opcaoGestaoDeCursos.click();
            //Vai abrir a gagina inicial dos cursos

            //Pegar a referência 
            page.waitForSelector('body > div.page-container.row-fluid > div.page-content > div > div:nth-child(11) > table > tbody > tr:nth-child(1) > td:nth-child(11) > div > img');
            await new Promise((resolve) => setTimeout(resolve, 3000)); // Aguarda 3 segundos antes de acessar o próximo elemento
            const btnAtualizar = await page.$('body > div.page-container.row-fluid > div.page-content > div > div:nth-child(11) > table > tbody > tr:nth-child(1) > td:nth-child(11) > div > img');
            
            if (btnAtualizar) {
                await btnAtualizar.click();

                await page.goto('https://cbi.sistemasiga.net/curso/atualizar/31#tab_3_6', { waitUntil: ['load', 'networkidle0'] });
                console.log('Página atual:', page.url());
                // Aguarde até que o elemento esteja disponível na página
                await page.waitForSelector('#myTab > ul > li:nth-child(6) > a');

                // Acesse o elemento
                const btnEad = await page.$('#myTab > ul > li:nth-child(6) > a');
                if (btnEad) {
                    btnEad.click();

                    // Acesse o elemento
                    const btnAulas = await page.$('#tab_3_6 > div > ul > li:nth-child(2) > a');
                    if (btnAulas) {
                        btnAulas.click();

                        const btn6AnoFundamental = await page.$('#tab_3_6_2 > div > ul > li:nth-child(3) > a');
                        if (btn6AnoFundamental) {
                            btn6AnoFundamental.click();

                            const arrayDeAulas = await page.$$("#tab_3_6_2_3 > div:nth-child(20) > table > tbody > tr");

                            let arrayValoresAMarcar = [];
                            for (let t of arrayDeAulas) {
                                let elemento = await t.evaluate(x => x.innerText);
                                if (elemento.includes('PROVA FINAL')) {
                                    arrayValoresAMarcar.push(Number(elemento.split('\t')[1]));
                                }
                            }

                            const arrayCheckbox = await page.$$(`.check22`);
                            await Promise.all(arrayCheckbox.map(async (t) => {
                                for (let i of arrayValoresAMarcar) {
                                    if (i === Number(await t.evaluate(x => x.value))) {
                                        console.log(i);
                                        return await t.evaluate(x => x.click());
                                    }
                                }
                            }));

                            //Data de liberação e bloqueio das aulas
                            
                          

                            await page.goto(`https://cbi.sistemasiga.net/curso/editarAulas/${arrayValoresAMarcar.toString()}/31/22`, { waitUntil: ['load', 'networkidle0'] });
                            const arrayInputLiberacaoAulaDataFixa = await page.$$("input[name='input-liberacaoAulaDataFixa[]']");

                            const result = await Promise.all(arrayInputLiberacaoAulaDataFixa.map(async (t) => {
                                return await t.evaluate((x, dataDeLiberacaoProva) => {
                                    x.value = dataDeLiberacaoProva
                                }, dataDeLiberacaoProva);
                            }))

                            const arrayInputBloqueioAulaDataFixa = await page.$$("input[name='input-bloqueioAulaDataFixa[]']");

                            const result2 = await Promise.all(arrayInputBloqueioAulaDataFixa.map(async (t) => {
                                return await t.evaluate((x, dataDeBlocqueioProva) => {
                                    x.value = dataDeBlocqueioProva
                                }, dataDeBlocqueioProva);
                            }))

                            const btnSalvar = await page.$('body > div.page-container.row-fluid > div > div > form > fieldset > div > button');
                            btnSalvar.click();
                            console.log(result);
                            console.log(result2);
                        }
                    }
                }
            }
        } else {
            console.error('O próximo elemento não foi encontrado.');
        }
    }



    // let data = await page.evaluate(() => {
    //     let titulo = document.querySelector(`.form-title`).innerHTML;

    //     const bntEntrar = document.getElementById('login-btn');
    //     bntEntrar.click();

    //     return {
    //         titulo
    //     }
    // });

    // console.log(data);

    //await browser.close();
})()

