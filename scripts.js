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

    //let url = API_URL + "/projetos" 
    
    try {
        const response = await fetch(`${API_URL}/projetos`);
        //const response = await fetch(url);
        const projects = await response.json();
        const tabela = document.getElementById('projetosTabelaBody');
        tabela.innerHTML = ''; // Limpa a tabela antes de adicionar novos projetos

        projects.forEach(project => {
            const row = document.createElement('tr');

            // Formatar custo
            const custoFormatado = formatCurrency(project.custo);

            row.innerHTML = `
                <td data-label="ID">${project.id}</td>
                <td data-label="Nome">${project.nome}</td>
                <td data-label="Sigla">${project.sigla}</td>                
                <td data-label="Tipo">${project.tipo}</td>                
                <td data-label="Custo">${custoFormatado}</td>  
                <td data-label="Descrição">${project.descricao}</td>
                <td class="status" data-label="Status">${project.status}</td>
                <td>
                    <div class="button-container">
                    <!-- Botão de Editar -->
                    <button class="icon-button" onclick="editarProjeto(${project.id})">
                        <img src="icons/editar.png" alt="Editar Projeto" class="icon">
                        <span class="tooltip">Editar Projeto</span>
                    </button>
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
                        <img src="icons/deletar.png" alt="Deletar Projeto" class="icon">
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
            const id = form.dataset.id || null; // Obtém o ID, se existir
            const nome = document.getElementById('nome').value;
            const sigla = document.getElementById('sigla').value;
            const descricao = document.getElementById('descricao').value;
            const tipo = document.getElementById('tipo').value;
            
            // Tratamento do custo para garantir que seja um número válido
            const custoInput = document.getElementById('custo').value;
            const custo = parseFloat(custoInput.replace(/[^\d,]/g, '').replace(',', '.'));

            const status = document.getElementById('status').value;

            // Criando o objeto com os dados do projeto
            const novoProjeto = {
                nome,
                sigla,
                descricao,
                tipo,
                custo,
                status
            };

            try {
                let response;

                if (id) {
                    // Caso esteja editando o projeto
                    console.log('Enviando PUT', novoProjeto);

                    novoProjeto.id = parseInt(id, 10);
                    response = await fetch(`${API_URL}/projeto`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(novoProjeto),
                    });
                } else {
                    // Caso esteja adicionando um novo projeto
                    console.log('Enviando POST', novoProjeto);

                    response = await fetch(`${API_URL}/projeto`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(novoProjeto),
                    });
                }

                if (response.ok) {
                    alert(id ? 'Projeto atualizado com sucesso!' : 'Projeto adicionado com sucesso!');
                    carregarProjetos(); // Carrega os projetos após a ação
                    form.reset(); // Limpa o formulário após o envio
                    delete form.dataset.id; // Remove o id do formulário após a edição
                } else {
                    const errorData = await response.json();
                    console.log('Erro ao cadastrar/atualizar projeto:', JSON.stringify(errorData));
                    alert(`Erro ao cadastrar projeto: ${errorData.mensagem || '. Verifique os dados fornecidos.'}`);
                }
            } catch (error) {
                console.error('Erro ao cadastrar/atualizar projeto:', error);
                alert('Erro ao conectar com o servidor. Verifique sua conexão.');
            }
        });
    }
});


async function buscarProjetoPorId(id) {
    try {
        const response = await fetch(`${API_URL}/projeto/${id}`);
        if (response.ok) {
            const projeto = await response.json();
            console.log("Projeto encontrado:", projeto);
            return projeto;
        } else {
            const erro = await response.json();
            console.error("Erro:", erro.mensagem);
        }
    } catch (error) {
        console.error("Erro ao conectar com a API:", error);
    }
}

async function editarProjeto(id) {
    try {
        // Buscando projeto por ID
        const response = await fetch(`${API_URL}/projeto?id=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            // Tratamento para erros HTTP
            alert("Erro ao buscar o projeto. Código: " + response.status);
            return;
        }

        const data = await response.json();

        if (!data || !data.id) {
            alert("Projeto não encontrado!");
            return;
        }

        // Preencher o formulário com os dados do projeto
        document.getElementById('nome').value = data.nome;
        document.getElementById('sigla').value = data.sigla;
        document.getElementById('descricao').value = data.descricao;
        document.getElementById('tipo').value = data.tipo;
        document.getElementById('custo').value = data.custo.toFixed(2).replace('.', ','); // Formatar valor
        document.getElementById('status').value = data.status;

        // Armazene o ID no formulário usando um campo oculto
        document.getElementById('formProjeto').dataset.id = id;

        // Exibir o formulário, caso esteja oculto
        const formSection = document.getElementById("divFormulario");
        formSection.style.display = "block";

    } catch (error) {
        console.error("Erro ao buscar o projeto:", error);
        alert("Erro ao buscar o projeto. Verifique sua conexão.");
    }
}



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

function formatCurrency(value) {
    // Converte o valor para número com duas casas decimais
    let numberValue = parseFloat(value).toFixed(2);

    // Verifica se o valor é válido
    if (isNaN(numberValue)) {
        return "R$ 0,00";
    }
    // Converte o número para o formato monetário brasileiro
    return "R$ " + numberValue.replace(".", ",");
}

function formatarMoeda(input) {
    let valor = input.value;

    // Remove qualquer caractere que não seja número
    valor = valor.replace(/\D/g, '');

    // Adiciona a formatação de moeda
    if (valor.length > 2) {
        valor = valor.replace(/(\d)(\d{2})$/, '$1,$2'); // Coloca vírgula antes dos dois últimos dígitos
    }

    if (valor.length > 6) {
        valor = valor.replace(/(\d)(\d{3})(\d{1,2}$)/, '$1.$2,$3'); // Coloca o ponto separando milhar
    }

    if (valor.length > 9) {
        valor = valor.replace(/(\d)(\d{3})(\d{3})(\d{1,2}$)/, '$1.$2.$3,$4'); // Coloca o ponto separando milhar
    }

    // Adiciona o "R$" antes do valor
    input.value = 'R$ ' + valor;
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