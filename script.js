class Pessoa {
  constructor(cpf, arq) {
      this.cpf = cpf;
      this.arq = arq;
      this.valores = [];
      this.total = 0;
  }

  // Método para adicionar um valor à lista de valores
  adicionarValor(valor) {
      this.valores.push(valor);
      this.valores.sort((a, b) => a - b); // Ordena os valores em ordem crescente
      this.atualizarTotal();
  }

  // Método para remover um valor da lista de valores
  removerValor(valor) {
      const index = this.valores.indexOf(valor);
      if (index !== -1) {
          this.valores.splice(index, 1);
          this.atualizarTotal();
      }
  }

  // Método para alterar um valor na lista de valores
  alterarValor(oldValor, novoValor) {
      const index = this.valores.indexOf(oldValor);
      if (index !== -1) {
          this.valores[index] = novoValor;
          this.valores.sort((a, b) => a - b); // Reordena os valores após a alteração
          this.atualizarTotal();
      }
  }

  temValor(valor){

  }

  listarValores(){
    let retorno = "";
    this.valores.forEach(valor => {
      retorno += "[" + (valor+"").replace('.',',') + "],";
    });
    return retorno.substring(0, retorno.length - 1); 
  }
 
  toText(){
    return `CPF: ${this.cpf}, Parcelas: ${this.listarValores()}, Total: ${(this.total.toFixed(2)+"").replace('.',',')} <br>`;
  }

  // Método privado para atualizar o valor total
  atualizarTotal() {
      this.total = this.valores.reduce((sum, valor) => sum + valor, 0);
  }
}

class ColecaoPessoas {
  constructor() {
      this.pessoas = [];
      this.qtdValores = 0;
  }

  incrementeQtdValores(){
    this.qtdValores ++;
  }

  // Método para adicionar uma pessoa à coleção
  adicionarPessoa(pessoa) {
      this.pessoas.push(pessoa);
      this.ordenarPorCPF();
  }

  pegarPessoaPorCPF(cpf) {
    return this.pessoas.find(pessoa => pessoa.cpf === cpf);
}

  // Método privado para ordenar as pessoas pelo CPF
  ordenarPorCPF() {
      this.pessoas.sort((a, b) => a.cpf.localeCompare(b.cpf));
  }
}

const rhColecao = new ColecaoPessoas();
const bancoColecao = new ColecaoPessoas();

function lerArquivos() {
  const rhFileInput = document.getElementById('rhFile');
  const bancoFileInput = document.getElementById('bancoFile');

  const rhFile = rhFileInput.files[0];
  const bancoFile = bancoFileInput.files[0];

  if (rhFile && bancoFile) {
      const rhFileReader = new FileReader();
      const bancoFileReader = new FileReader();

      rhFileReader.onload = function(event) {
          const content = event.target.result;
          const lines = content.split('\n');
          let cpfIndex = -1;
          let valorIndex = -1;
          let msgError = -1;

          for (const line of lines) {
              const columns = line.split(';');
              
              if (cpfIndex !== -1 && valorIndex !== -1 && columns[valorIndex] && columns[cpfIndex]) {
                  const cpf = columns[cpfIndex].trim();
                  const valor = parseFloat(columns[valorIndex].replace(',','.').trim());
                  let pessoa = rhColecao.pegarPessoaPorCPF(cpf);

                  if (!pessoa) {
                      pessoa = new Pessoa(cpf, 'RH');
                      rhColecao.adicionarPessoa(pessoa);
                  }
      
                  pessoa.adicionarValor(valor);
                  rhColecao.incrementeQtdValores();
              }else if (msgError==1){
                alert("Não foi possível encontrar as colunas CPF e VALOR no arquivo do RH!");
                msgError +=1;

              }else{
                cpfIndex = columns.findIndex(col => col.toLowerCase().includes('cpf'));
                valorIndex = columns.findIndex(col => col.toLowerCase().includes('valor'));
                msgError +=1
              }
          }
          btnImportar.disabled = true;
          ckdRH.checked = true;
          btnListarRh.disabled = false;
      };

      bancoFileReader.onload = function(event) {
          const content = event.target.result;
          const lines = content.split('\n');
          let cpfIndex2 = -1;
          let valorIndex2 = -1;
          let msgError2 = -1;

          for (const line of lines) {
              const columns = line.split(';');

              if (cpfIndex2 !== -1 && valorIndex2 !== -1 && columns[valorIndex2] && columns[cpfIndex2]) {
                  const cpf = columns[cpfIndex2].trim();
                  const valor = parseFloat(columns[valorIndex2].replace(',','.').trim());
                  let pessoa = bancoColecao.pegarPessoaPorCPF(cpf);

                  if (!pessoa) {
                      pessoa = new Pessoa(cpf, 'RH');
                      bancoColecao.adicionarPessoa(pessoa);
                  }
      
                  pessoa.adicionarValor(valor);
                  bancoColecao.incrementeQtdValores();
                }else if (msgError2==1){
                  alert("Não foi possível encontrar as colunas CPF e VALOR no arquivo do Banco!");
                  msgError2 +=1;
  
                }else{
                  cpfIndex2 = columns.findIndex(col => col.toLowerCase().includes('cpf'));
                  valorIndex2 = columns.findIndex(col => col.toLowerCase().includes('valor'));
                  msgError2 +=1
                }
            }
          btnImportar.disabled = true;
          ckdBanco.checked = true;
          btnListarBanco.disabled = false;
      };

      rhFileReader.readAsText(rhFile);
      bancoFileReader.readAsText(bancoFile);
  }
}

function comparar() {
  const resultsDiv = document.getElementById('results');
  let msgComparacao = 'Comparando arquivos<br><table border="1"><thead><tr><th>CPF</th><th>Entra</th><th>Sai</th></tr></thead><tbody>';

  for (const pessoaRH of rhColecao.pessoas) {
    let pessoaBanco = bancoColecao.pegarPessoaPorCPF(pessoaRH.cpf);

    if (!pessoaBanco) {
        msgComparacao += `<tr><td>${pessoaRH.cpf}</td><td></td><td>Sai completo: ${pessoaRH.listarValores()}</td></tr>`;
    }else{
      if (pessoaRH.toText()!==pessoaBanco.toText() && pessoaRH.total!==pessoaBanco.total){
        // tem diferença de consignado
        // CHECANDO PRIMEIRO O BANCO
        const dif = pessoaRH.total - pessoaBanco.total;
        let indiceToRemoveBanco = [];
        let compBanco = pessoaBanco.valores.slice();
        
        pessoaRH.valores.forEach(valorRH => {
          compBanco.forEach((valorCompBanco,indexCompBanco) => {
            if (valorRH==valorCompBanco){
              indiceToRemoveBanco.push(indexCompBanco);
            }
          });
        });
        
        indiceToRemoveBanco.reverse().forEach(index => {
          compBanco.splice(index, 1);
        });  
        
        //CHECANDO O RH
        let indiceToRemoveRH = [];
        let compRH = pessoaRH.valores.slice();        

        pessoaBanco.valores.forEach(valorBanco => {
          compRH.forEach((valorCompRH,indexCompRH) => {
            if (valorBanco==valorCompRH){
              indiceToRemoveRH.push(indexCompRH);
            }
          });
        });
        
        indiceToRemoveRH.reverse().forEach(index => {
          compRH.splice(index, 1);
        });  

        if (compBanco.length>0 || compRH.length>0){

          msgComparacao += `<tr><td>${pessoaRH.cpf}</td><td>`;
          if (compBanco.length>0){
            let msgTRH = "Entra: ";
            compBanco.forEach(valor => {
              msgTRH += "[" + (valor+"").replace('.',',') + "],";
            });
            msgComparacao += msgTRH.substring(0, msgTRH.length - 1);
          }

          msgComparacao +=`</td><td>`;
          if (compRH.length>0){
            let msgTRH = "Sai: ";
            compRH.forEach(valor => {
              msgTRH += "[" + (valor+"").replace('.',',') + "],";
            });
            msgComparacao += msgTRH.substring(0, msgTRH.length - 1);
          }
          msgComparacao +=`</td></tr>`;          
        }
      }
    }
  }
  for (const pessoaBanco of bancoColecao.pessoas) {
    let pessoaRH = rhColecao.pegarPessoaPorCPF(pessoaBanco.cpf);

    if (!pessoaRH) {
        msgComparacao += `<tr><td>${pessoaBanco.cpf}</td><td>Entra completo: ${pessoaBanco.listarValores()}</td><td></td></tr>`;
    }
  }
  msgComparacao += '</tbody></table>'
  resultsDiv.innerHTML = msgComparacao;
}

function listarRH() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `Exibindo RH -  Registros lidos: ${rhColecao.qtdValores} -  Pessoas distintas: ${rhColecao.pessoas.length}<br>`;

    for (const pessoa of rhColecao.pessoas) {
        resultsDiv.innerHTML += pessoa.toText();
    }
}

function listarBanco() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `Exibindo B A N C O -  Registros lidos: ${bancoColecao.qtdValores} -  Pessoas distintas: ${bancoColecao.pessoas.length}<br>`;

    for (const pessoa of bancoColecao.pessoas) {
        resultsDiv.innerHTML += pessoa.toText();
    }
}