const API_URL = "http://127.0.0.1:5000";

/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/
carregarProjetos();


/*
  --------------------------------------------------------------------------------------
  Função para carregar dinamicamente a tabela da página com a lista de projetos existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
async function carregarProjetos() {

    let url = API_URL + "/projetos" 
    
    try {
        const response = await fetch(`${API_URL}/projetos`);
        //const response = await fetch(url);
        const projects = await response.json();
        const tabela = document.getElementById('projetosTabelaBody');
        tabela.innerHTML = ''; // Limpa a tabela antes de adicionar novos projetos

        projects.forEach(project => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="ID">${project.id}</td>
                <td data-label="Nome">${project.nome}</td>
                <td data-label="Sigla">${project.sigla}</td>                
                <td data-label="Tipo">${project.tipo}</td>                
                <td data-label="Custo">${project.custo}</td>  
                <td data-label="Descrição">${project.descricao}</td>
                <td class="status" data-label="Status">${project.status}</td>
                <td>
                    <div class="button-container">
                    <!-- Botão de Adicionar Histórico -->
                    <button class="icon-button" onclick="adicionarHistorico(${project.id})">
                        <img src="icons/adicionar.png" alt="Adicionar Histórico" class="icon">
                        <span class="tooltip">Adicionar Histórico</span>
                    </button>

                    <!-- Botão de Ver Histórico -->
                    <button class="icon-button" onclick="listarHistorico(${project.id})">
                        <img src="icons/historico.png" alt="Ver Histórico" class="icon">
                        <span class="tooltip">Ver Histórico</span>
                    </button>
                    <!-- Botão de Deletar -->
                    <button class="icon-button" onclick="deletarProjeto(${project.id})">
                        <img src="icons/deletar.png" alt="Deletar" class="icon">
                        <span class="tooltip">Deletar Projeto</span>
                    </button>
                    </div>
                </td>
            `;
            tabela.appendChild(row);
            estiloTabelaStatus();
        });
    } catch (error) {
        console.error("Erro ao carregar lista de projetos:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formProjeto');
    
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Capturando os valores dos campos do formulário
            const nome = document.getElementById('nome').value;
            const sigla = document.getElementById('sigla').value;
            const descricao = document.getElementById('descricao').value;
            const tipo = document.getElementById('tipo').value;
            // const dataInicio = document.getElementById('dataInicio').value;
            // const dataFim = document.getElementById('dataFim').value;
            const custo = parseFloat(document.getElementById('custo').value);
            const status = document.getElementById('status').value;

            // Criando o objeto com os dados do projeto
            const novoProjeto = {
                nome,
                sigla,
                descricao,
                tipo,
                // data_inicio: dataInicio,
                // data_fim: dataFim,
                custo,
                status
            };

            try {
                // Enviando a requisição POST para o servidor
                let url = API_URL + "/projeto" 
                console.log(fetch(url, {method: 'POST',}))
                
                const response = await fetch(`${API_URL}/projeto`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(novoProjeto)
                });

                if (response.ok) {
                    const data = await response.json();
                    alert('Projeto cadastrado com sucesso!');
                    carregarProjetos();
                    form.reset(); // Limpa o formulário após o envio
                } else {
                    const errorData = await response.json();
                    console.log('Erro ao cadastrar novo Projeto: ', JSON.stringify(errorData));
                    alert(`Erro ao cadastrar projeto: ${errorData.mensagem || '. Verifique os dados fornecidos.'}`);
                }
            } catch (error) {
                console.error('Erro ao cadastrar projeto:', error);
                alert('Erro ao conectar com o servidor. Verifique sua conexão.');
            }
        });
    }
});

function estiloTabelaStatus() {
    // Seleciona todas as células da tabela com a classe 'status'
    document.querySelectorAll('.status').forEach(cell => {
        // Obtém o texto da célula e remove espaços extras
        const status = cell.textContent.trim(); 
           
        // Verifica o valor do status e adiciona uma classe correspondente
        if (status === "A iniciar") {
          cell.classList.add('status-a-iniciar');
        } else if (status === "Em andamento") {
          cell.classList.add('status-em-andamento');
        } else if (status === "Suspenso") {
          cell.classList.add('status-suspenso');
        } else if (status === "Cancelado") {
          cell.classList.add('status-cancelado');
        } else if (status === "Concluído") {
          cell.classList.add('status-concluido');
        }

    })
}

function deletarProjeto(projeto_id) {
    // Montando a URL para a requisição DELETE
    let url = `${API_URL}/projeto?id=${projeto_id}`;
    fetch(url, { 
        method: 'delete'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao deletar projeto: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            alert(`Projeto ${data.mensagem}`);
            carregarProjetos();  // Função para recarregar a lista de projetos
        })
        .catch(error => {
            console.error('Erro ao deletar projeto:', error);
            alert('Erro ao deletar projeto');
        });
}

async function adicionarHistorico(projetoId) {
    const descricao = prompt("Digite a descrição do histórico:");
    if (!descricao) return;

    const historico = {
        descricao: descricao
    };

    try {
        const response = await fetch(`${API_URL}/historico`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'projeto_id': projetoId // Enviando o projeto_id no header
            },
            body: JSON.stringify(historico)
        });

        if (response.ok) {
            alert('Histórico cadastrado com sucesso!');
            // Atualize a lista de projetos ou históricos, se necessário
            carregarProjetos();
        } else {
            const errorData = await response.json();
            alert(`Erro ao cadastrar histórico: ${errorData.mensagem}`);
        }
    } catch (error) {
        console.error('Erro ao cadastrar histórico:', error);
        alert('Erro ao realizar a requisição.');
    }
}


  

async function listarHistorico(projetoId) {
    try {
        const response = await fetch(`${API_URL}/historico`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'projeto_id': projetoId // Enviando o projeto_id no header
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Histórico do Projeto:", data.historico);
            
            // Verificando se há histórico
            if (data.historico.length === 0) {
                document.getElementById("historico-container").innerHTML = "<p>Não há histórico disponível para este projeto.</p>";
            } else {
                // Preenchendo o modal com os itens de histórico
                const historicoContainer = document.getElementById("historico-container");
                historicoContainer.innerHTML = ''; // Limpar o conteúdo do modal antes de adicionar os itens
                
                const options = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    timeZone: 'America/Sao_Paulo'
                };

                data.historico.forEach(historico => {
                    const historicoItem = document.createElement("div");
                    historicoItem.classList.add("historico-item");
                    let teste = historico.data_insercao;
                    let dataFormatadaCompleta = teste.toLocaleString("pt-BR");

                    historicoItem.innerHTML = `                        
                        <p><strong>${dataFormatadaCompleta}</strong>  - ${historico.descricao}</p>
                                               
                    `;
                    historicoContainer.appendChild(historicoItem);
                });
            }
            // Exibindo o modal
            abrirModal();

        } else {
            const errorData = await response.json();
            alert(`Erro: ${errorData.mensagem}`);
        }
    } catch (error) {
        console.error("Erro ao listar histórico:", error);
        alert("Erro ao realizar a requisição.");
    }
}

function abrirModal() {
    const modal = document.getElementById("historicoModal");
    modal.style.display = "block"; // Exibe o modal
}

function fecharModal() {
    const modal = document.getElementById("historicoModal");
    modal.style.display = "none"; // Fecha o modal
}


// async function viewHistory(projectId) {
//     try {
//         const response = await fetch(`${API_URL}/projetos/${projectId}/historico`);
        
//         // Verificando se a resposta é bem-sucedida
//         if (!response.ok) {
//             // Se a resposta não for 2xx, lança um erro com o código do status
//             throw new Error(`Erro ao carregar histórico. Status: ${response.status}`);
//         }

//         // Verificando se a resposta é do tipo JSON
//         const contentType = response.headers.get("Content-Type");
//         if (!contentType || !contentType.includes("application/json")) {
//             throw new Error("A resposta não é um JSON válido.");
//         }

//         // Caso contrário, converte a resposta para JSON
//         const historico = await response.json();
        
//         // Exibindo o modal
//         const modal = document.getElementById("historicoModal");
//         const tabelaHistorico = document.getElementById("historicoTabela").getElementsByTagName('tbody')[0];
//         tabelaHistorico.innerHTML = '';  // Limpa a tabela antes de adicionar novas entradas

//         // Preenchendo a tabela com as entradas de histórico
//         historico.forEach(entry => {
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${entry.data_registro}</td>
//                 <td>${entry.mensagem}</td>
//             `;
//             tabelaHistorico.appendChild(row);
//         });

//         // Exibindo o modal
//         modal.style.display = "block";

//     } catch (error) {
//         console.error("Erro ao carregar histórico:", error);
//         alert(`Erro ao carregar histórico: ${error.message}`);
//     }
// }



// // Deleta um projeto pelo nome
// function deletarProjetoNome(nome) {
//     let url = API_URL + "/projeto/" + nome 
//     console.log(fetch(url, {method: 'DELETE',}))

//     fetch(`${API_URL}/projeto/${nome}`, { method: 'DELETE' })
//         .then(() => {
//             alert("Projeto deletado com sucesso!");
//             carregarProjetos();
//         })
//         .catch(error => console.error("Erro ao deletar projeto:", error));
// }


// /*
//   --------------------------------------------------------------------------------------
//   Função para remover um item da lista de acordo com o click no botão close
//   --------------------------------------------------------------------------------------
// */
// const removeElement = () => {
//     let close = document.getElementsByClassName("close");
//     // var table = document.getElementById('myTable');
//     let i;
//     for (i = 0; i < close.length; i++) {
//       close[i].onclick = function () {
//         let div = this.parentElement.parentElement;
//         const nomeItem = div.getElementsByTagName('td')[0].innerHTML
//         if (confirm("Você tem certeza?")) {
//           div.remove()
//           deleteItem(nomeItem)
//           alert("Removido!")
//         }
//       }
//     }
//   }



// // Adiciona histórico a um projeto
// async function adicionarHistorico(projetoId) {
//     const descricao = prompt("Digite a descrição do histórico:");
//     if (!descricao) return; // Verifica se o usuário forneceu a descrição

//     const historico = {
//         descricao,
//         data: new Date().toISOString().split("T")[0], // Gera a data no formato ISO (YYYY-MM-DD)
//         projeto_id: projetoId
//     };

//     try {
//         const response = await fetch(`${API_URL}/historico`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(historico) // Envia o objeto historico como JSON
//         });

//         if (response.ok) {
//             alert('Histórico cadastrado com sucesso!');
//             carregarProjetos(); // Atualiza a lista de projetos
//         } else {
//             alert('Erro ao cadastrar histórico.');
//         }
//     } catch (error) {
//         console.error('Erro:', error);
//         alert('Erro ao se comunicar com o servidor.');
//     }
// }





// async function listarHistorico(projetoId) {
//     try {
//         const response = await fetch(`${API_URL}/historico`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'projeto_id': projetoId // Enviando o projeto_id no header
//             }
//         });

//         if (response.ok) {
//             const data = await response.json();
//             console.log("Histórico do Projeto:", data.historico);
//             alert(`Histórico do projeto ${projetoId} listado com sucesso!`);

//             // Exibindo o modal
//             const modal = document.getElementById("historicoModal");
//             modal.style.display = "block";

//             return data.historico;
//         } else {
//             const errorData = await response.json();
//             alert(`Erro: ${errorData.mensagem}`);
//         }
//     } catch (error) {
//         console.error("Erro ao listar histórico:", error);
//         alert("Erro ao realizar a requisição.");
//     }
// }

// // Função para adicionar projeto
// async function addProject() {
//     const form = document.getElementById('projectForm');
//     const data = {
//         nome: form.nome.value,
//         sigla: form.sigla.value,
//         descricao: form.descricao.value,
//         tipo: form.tipo.value,
//         // data_inicio: form.data_inicio.value,
//         // data_fim: form.data_fim.value,
//         custo: parseFloat(form.custo.value),
//         status: form.status.value
//     };

//     try {
//         const response = await fetch(`${apiUrl}/projetos`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(data)
//         });
//         if (response.ok) {
//             alert('Projeto cadastrado com sucesso!');
//             loadProjects();
//         } else {
//             alert('Erro ao cadastrar projeto.');
//         }
//     } catch (error) {
//         console.error('Erro:', error);
//     }
// }

// // Função para carregar projetos
// async function loadProjects() {
//     try {
//         const response = await fetch(`${apiUrl}/projetos`);
//         const projects = await response.json();
//         const tableBody = document.getElementById('projectsTableBody');
//         tableBody.innerHTML = '';

//         projects.forEach(project => {
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${project.id}</td>
//                 <td>${project.nome}</td>
//                 <td>${project.sigla}</td>
//                 <td>${project.tipo}</td>
//                 <td>${project.status}</td>
//                 <td>
//                     <button onclick="viewHistory(${project.id})">Ver Histórico</button>
//                 </td>
//             `;
//             tableBody.appendChild(row);
//         });
//     } catch (error) {
//         console.error('Erro ao carregar projetos:', error);
//     }
// }


// // Função para visualizar o histórico de um projeto
// async function viewHistory1(projectId) {
//     try {
//         const response = await fetch(`${API_URL}/projetos/${projectId}/historico`);
//         const history = await response.json();
//         let historyText = `Histórico do Projeto ${projectId}:\n`;
//         history.forEach(item => {
//             historyText += `- ${item.data}: ${item.descricao}\n`;
//         });
//         alert(historyText);
//         prompt("Digite a descrição do histórico:")
//     } catch (error) {
//         console.error('Erro ao carregar histórico:', error);
//     }
// }

// async function viewHistory2(projectId) {
//     try {
//         // Certifique-se de que API_URL está definida corretamente no início do seu código.
//         const response = await fetch(`${API_URL}/projetos/${projectId}/historico`);
//         const historico = await response.json();
        
//         // Agora, você pode exibir o histórico na interface do usuário (por exemplo, em uma modal ou tabela)
//         console.log(historico); // Apenas para teste, você pode substituir por lógica de exibição na UI.

//         // Exemplo simples de como você pode exibir o histórico
//         const tabelaHistorico = document.getElementById('historicoTabela');
//         tabelaHistorico.innerHTML = '';  // Limpa a tabela antes de adicionar novas entradas

//         historico.forEach(entry => {
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${entry.data_registro}</td>
//                 <td>${entry.mensagem}</td>
//             `;
//             tabelaHistorico.appendChild(row);
//         });

//     } catch (error) {
//         console.error("Erro ao carregar histórico:", error);
//     }
// }


// // Deleta um projeto pelo nome
// function deletarProjetoNome(nome) {
//     let url = API_URL + "/projeto/" + nome 
//     console.log(fetch(url, {method: 'DELETE',}))

//     fetch(`${API_URL}/projeto/${nome}`, { method: 'DELETE' })
//         .then(() => {
//             alert("Projeto deletado com sucesso!");
//             carregarProjetos();
//         })
//         .catch(error => console.error("Erro ao deletar projeto:", error));
// }


// /*
//   --------------------------------------------------------------------------------------
//   Função para remover um item da lista de acordo com o click no botão close
//   --------------------------------------------------------------------------------------
// */
// const removeElement = () => {
//     let close = document.getElementsByClassName("close");
//     // var table = document.getElementById('myTable');
//     let i;
//     for (i = 0; i < close.length; i++) {
//       close[i].onclick = function () {
//         let div = this.parentElement.parentElement;
//         const nomeItem = div.getElementsByTagName('td')[0].innerHTML
//         if (confirm("Você tem certeza?")) {
//           div.remove()
//           deleteItem(nomeItem)
//           alert("Removido!")
//         }
//       }
//     }
//   }






