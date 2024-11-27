// Variáveis globais
let recipes = []; // Agora é um array global com as receitas da API
let editingIndex = null; // Variável para rastrear qual receita está sendo editada
const API_BASE_URL = "https://lsd-ricx.azurewebsites.net";
let loggedUser  = null;

// Função para mostrar ou esconder o formulário
function toggleForm() {
    const formContainer = document.getElementById('form-container');
    formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
}

// Função para login
async function login(userName) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: userName }),
        });

        if (!response.ok) {
            throw new Error('Erro ao realizar login.');
        }

        loggedUser  = await response.json(); // Salva o usuário logado
        console.log('Usuário logado:', loggedUser );
        return loggedUser ;
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        throw error;
    }
}

// Função para buscar todas as receitas
async function getAllRecipes() {
    try {
        console.log('Buscando receitas...');
        const response = await fetch(`${API_BASE_URL}/recipes`, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao buscar receitas: ${response.status} ${errorText}`);
        }

        recipes = await response.json(); // Agora as receitas são armazenadas aqui
        console.log('Lista de receitas:', recipes);
        return recipes;
    } catch (error) {
        console.error('Erro ao buscar receitas:', error);
        throw error;
    }
}

// Função para adicionar uma nova receita
async function addRecipe(recipeTitle, ingredients, steps) {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: recipeTitle,
                ingredients: ingredients.split(',').map(ing => ing.trim()),
                steps: steps,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao adicionar receita: ${response.status} ${errorText}`);
        }

        const newRecipe = await response.json();
        console.log('Receita adicionada:', newRecipe);
        recipes.push(newRecipe); // Adiciona a nova receita no array local
        return newRecipe;
    } catch (error) {
        console.error('Erro ao adicionar receita:', error);
        throw error;
    }
}

// Função para excluir uma receita
async function deleteRecipe(recipeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao excluir receita: ${response.status} ${errorText}`);
        }

        console.log(`Receita com ID ${recipeId} excluída.`);
        recipes = recipes.filter(recipe => recipe.id !== recipeId); // Atualiza o array local
    } catch (error) {
        console.error('Erro ao excluir receita:', error);
        throw error;
    }
}

// Função para editar uma receita
async function updateRecipe(recipeId, recipeTitle, ingredients, steps) {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: recipeTitle,
                ingredients: ingredients.split(',').map(ing => ing.trim()),
                steps: steps,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao editar receita: ${response.status} ${errorText}`);
        }

        const updatedRecipe = await response.json();
        console.log('Receita atualizada:', updatedRecipe);
        // Atualiza a receita no array local
        const index = recipes.findIndex(recipe => recipe.id === recipeId);
        if (index !== -1) {
            recipes[index] = updatedRecipe;
        }
        return updatedRecipe;
    } catch (error) {
        console.error('Erro ao editar receita:', error);
        throw error;
    }
}

// Função para mostrar todas as receitas
async function displayRecipes() {
    try {
        // Garantir que as receitas estejam atualizadas
        if (recipes.length === 0) {
            await getAllRecipes(); // Se não houver receitas carregadas, buscar da API
        }

        const recipeList = document.getElementById('recipe-list');
        recipeList.innerHTML = ''; // Limpar a lista antes de exibir

        recipes.forEach((recipe, index) => {
            const recipeItem = document.createElement('div');
            recipeItem.className = 'recipe-item'; // Adiciona a classe para estilização
            recipeItem.innerHTML = `
                <h3>${recipe.title}</h3>
                <p><strong>Ingredientes:</strong> ${recipe.ingredients.join(', ')}</p>
                <p><strong>Passos:</strong> ${recipe.steps}</p>
                <button onclick="editRecipe(${index})">Editar Receita</button>
                <button class="btn-excluir" onclick="removeRecipe(${index})">Excluir Receita</button>
                <hr>
            `;
            recipeList.appendChild(recipeItem);
        });
    } catch (error) {
        console.error('Erro ao exibir as receitas:', error);
    }
}

// Função chamada ao enviar o formulário de receita
document.getElementById('recipe-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio do formulário

    const recipeName = document.getElementById('recipe-name').value;
    const ingredients = document.getElementById('ingredients').value;
    const steps = document.getElementById('steps').value;

    if (editingIndex !== null) {
        // Atualizar a receita existente na API
        const recipe = recipes[editingIndex];
        await updateRecipe(recipe.id, recipeName, ingredients, steps); // Chama a API para atualizar
        editingIndex = null; // Resetar o índice de edição
    } else {
        // Adicionar nova receita
        await addRecipe(recipeName, ingredients, steps); // Chama a API para adicionar a receita
    }

    // Limpar o formulário após a submissão
    document.getElementById('recipe-form').reset();
    toggleForm(); // Ocultar o formulário após adicionar ou editar a receita

    // Exibir as receitas atualizadas
    displayRecipes();
});

// Função para remover uma receita
async function removeRecipe(index) {
    const recipeId = recipes[index].id; // Supondo que o ID da receita seja retornado pela API
    await deleteRecipe(recipeId);  // Chama a API para excluir
    displayRecipes();  // Atualiza a lista de receitas na tela
}

// Função para editar uma receita
function editRecipe(index) {
    const recipe = recipes[index];
    document.getElementById('recipe-name').value = recipe.title;
    document.getElementById('ingredients').value = recipe.ingredients.join(', ');
    document.getElementById('steps').value = recipe.steps;
    editingIndex = index; // Definir o índice de edição
    toggleForm(); // Mostrar o formulário
}

// Função para inicializar o carregamento das
// Função para inicializar o carregamento das receitas e do login
window.onload = async function() {
    try {
        // Login do usuário
        const userName = "João da Silva"; // Você pode modificar isso para um nome de usuário dinâmico
        await login(userName);

        // Carregar e exibir as receitas
        await getAllRecipes(); // Agora as receitas são carregadas corretamente
        displayRecipes();
    } catch (error) {
        console.error('Erro no fluxo inicial:', error);
    }
};