class CSVData {
    constructor(lines, delimiter) {
      this.data = this.parseData(lines, delimiter);
    }
  
    parseData(lines, delimiter) {
      return lines.map(line => {
        const [cpf, valor] = line.split(delimiter);
        return { cpf, valor };
      });
    }
  
    sortByCPFAndValor() {
      this.data.sort((a, b) => {
        if (a.cpf < b.cpf) return -1;
        if (a.cpf > b.cpf) return 1;
        return parseFloat(a.valor.replace(',', '.')) - parseFloat(b.valor.replace(',', '.'));
      });
    }
  }

  class CSVFile {
    constructor(file) {
      this.file = file;
    }
  
    read(callback) {
      const reader = new FileReader();
      reader.onload = function (e) {
        callback(e.target.result);
      };
      reader.readAsText(this.file);
    }
  }
  
  let resultado = [];
  
  function compareCSV() {
    const rhFile = new CSVFile(document.getElementById('rhFile').files[0]);
    const bancoFile = new CSVFile(document.getElementById('bancoFile').files[0]);
  
    rhFile.read(function (rhData) {
      bancoFile.read(function (bancoData) {
        const rhLines = rhData.split('\n').slice(1);
        const bancoLines = bancoData.split('\n').slice(1);
  
        const rhDataObj = new CSVData(rhLines, ';');
        const bancoDataObj = new CSVData(bancoLines, ';');
  
        rhDataObj.sortByCPFAndValor();
        bancoDataObj.sortByCPFAndValor();
  
        resultado = [];
        let rhIndex = 0;
        let bancoIndex = 0;
  
        function removeCommas(value) {
            return value ? value.replace(/,/g, '') : '';
        }
  
        while (rhIndex < rhDataObj.data.length && bancoIndex < bancoDataObj.data.length) {
          const rhItem = rhDataObj.data[rhIndex];
          const bancoItem = bancoDataObj.data[bancoIndex];
  
//          if (rhItem && rhItem.cpf && rhItem.valor && bancoItem && bancoItem.cpf && bancoItem.valor) {
          if (rhItem && bancoItem) {
            if (rhItem.cpf === bancoItem.cpf) {
              const rhValorSemVirgula = removeCommas(rhItem.valor);
              const bancoValorSemVirgula = removeCommas(bancoItem.valor);
  
              if (!isNaN(parseFloat(rhValorSemVirgula)) && !isNaN(parseFloat(bancoValorSemVirgula))) {
                if (parseFloat(rhValorSemVirgula) !== parseFloat(bancoValorSemVirgula)) {
                  resultado.push({
                    cpf: rhItem.cpf,
                    valorRH: rhItem.valor,
                    valorBanco: bancoItem.valor,
                    alteracao: 'Valor Diferente'
                  });
                }
              } else {
                resultado.push({
                  cpf: rhItem.cpf,
                  valorRH: rhItem.valor,
                  valorBanco: bancoItem.valor,
                  alteracao: 'Valor Inválido'
                });
              }
  
              rhIndex++;
              bancoIndex++;
            } else if (rhItem.cpf < bancoItem.cpf) {
              resultado.push({
                cpf: rhItem.cpf,
                valorRH: rhItem.valor,
                valorBanco: '',
                alteracao: 'Saiu'
              });
              rhIndex++;
            } else {
              resultado.push({
                cpf: bancoItem.cpf,
                valorRH: '',
                valorBanco: bancoItem.valor,
                alteracao: 'Entrou'
              });
              bancoIndex++;
            }
          }
        }
  
        while (rhIndex < rhDataObj.data.length) {
          const rhItem = rhDataObj.data[rhIndex];
          resultado.push({
            cpf: rhItem.cpf,
            valorRH: rhItem.valor,
            valorBanco: '',
            alteracao: 'Saiu'
          });
          rhIndex++;
        }
  
        while (bancoIndex < bancoDataObj.data.length) {
          const bancoItem = bancoDataObj.data[bancoIndex];
          resultado.push({
            cpf: bancoItem.cpf,
            valorRH: '',
            valorBanco: bancoItem.valor,
            alteracao: 'Entrou'
          });
          bancoIndex++;
        }
  
        displayResults();
      });
    });
  }
  
  function displayResults() {
    const results = document.getElementById('results');
    results.innerHTML = '';
  
    if (resultado.length === 0) {
      results.innerHTML = '<div class="alert alert-info">Não há diferenças nos registros.</div>';
      return;
    }
  
    const table = `
      <table class="table mt-3">
        <thead>
          <tr>
            <th>CPF</th>
            <th>Valor RH</th>
            <th>Valor Banco</th>
            <th>Alteração</th>
          </tr>
        </thead>
        <tbody>
          ${resultado.map(item => `
            <tr class="${item.alteracao === 'Valor Diferente' ? 'table-warning' : item.alteracao === 'Saiu' ? 'table-danger' : 'table-success'}">
              <td>${item.cpf}</td>
              <td>${item.valorRH}</td>
              <td>${item.valorBanco}</td>
              <td>${item.alteracao}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  
    results.innerHTML = table;
  }
  
  function showResults() {
    displayResults();
  }
  