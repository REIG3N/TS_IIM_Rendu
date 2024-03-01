"use strict";
/**
 * -------------------------------------------------------------  Création et utilisation de la classe Task + filtrage  -------------------------------------------------------------
 */
class TaskManager {
    constructor(categoryManager) {
        this.categoryManager = categoryManager;
        this.tasks = []; // On créer un tableau des tâches vide pour le moment
        // on récupère les tâches depuis le stockage local lors de l'initialisation
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            // Si des tâches sont déjà stockées, on les charge dans la liste des tâches
            // puis on utilise la fonction addTask pour les afficher un par un
            this.tasks = JSON.parse(storedTasks);
            this.tasks.forEach(task => this.addTask(task, true));
        }
    }
    // Méthode pour ajouter une tâche à la liste des tâches et à l'interface utilisateur
    // La création des méthodes de filtrages se fait aussi dans la classe TaskManager
    /* Faire une classe ou fonction pour filtrer les tâches n'était pas possible
    puisque je n'avais pas créer de fonction displayTasks indépendamment de la classe TaskManager.

    Cela vient du fait que j'ai démarré le projet avec votre aide et j'ai continué sur cette base, alors
    tout recommencé depuis le début, non merci.

    Donc filtrage et affichage des tâches se font dans la classe TaskManager.

    */
    addTask(task, loading) {
        // D'abord on récupère les tâches stockées ainsi que les taches filtrees si il y en a
        const tasksContainer = document.getElementById('tasks'); // D'abord on récupère les tâches stockées
        const filteredTasks = localStorage.getItem('filteredTasks'); // ainsi que les taches filtrees si il y en a
        if (!loading) { // Si la tâche est ajoutée directement (pas en cours de chargement)
            this.tasks.push(task); // Alors on ajoute la tâche à la liste des tâches
            localStorage.setItem('tasks', JSON.stringify(this.tasks)); //  on la stocke dans le stockage local en transformant la liste des tâches en chaine de caractères
            // Création de la tâche dans le front avec toute les donneés
            const taskElement = document.createElement('div');
            taskElement.classList.add('task');
            taskElement.classList.add(task.priority.toLowerCase());
            taskElement.innerHTML = `
            <h3>${task.title} <span>– Priorité ${task.priority}</span></h3>
            <p>Date d'échéance: ${task.deadline} </p>
            <p>${task.description}</p>
            <button type="button" id='delete-${task.id}' onclick="deleteTask(${task.id})" data-action="delete">Supprimer</button>
            <button type="button" class="edit-btn" data-action="edit" onclick="editTask(${task.id})">Modifier</button>
          `;
            tasksContainer.appendChild(taskElement); // Ajout de la div que l'on a crée dans le front
            location.reload(); // Rechargement de la page pour afficher toute la liste
        }
        else {
            if (tasksContainer) { // Si des tâches sont déjà présentes dans le tasksContainer
                /**
                 * C'est ici que les taches filtrees sont gérées et affichées
                 * Malheureusement, cette liste filtree reste stocké et afficher sur la page même après un reload de la page
                 * j'ai fait un bouton pour la supprimer manuellement plus loin dans le code
                 */
                if (filteredTasks) {
                    tasksContainer.innerHTML = ''; // On vide le tasksContainer
                    const parsedFilteredTasks = JSON.parse(filteredTasks); // On transforme en tableau les taches filtrees provenant du localStorage
                    // Création de la tâche dans le front avec toute les donneés
                    parsedFilteredTasks.forEach(task => {
                        const taskElement = document.createElement('div');
                        taskElement.classList.add('task');
                        taskElement.classList.add(task.priority.toLowerCase());
                        if (task.category) { // Vérifier si la catégorie de la tâche existe et on l'ajoute au gestionnaire de catégories si nécessaire
                            if (!this.categoryManager.getAllCategories().some(cat => cat.name === task.category)) {
                                this.categoryManager.addCategory(task.category);
                            }
                        }
                        taskElement.innerHTML = `
                <h3>${task.title} <span>– Priorité ${task.priority}</span></h3>
                <p> Categorie : ${task.category}</p>
                <p>Date d'échéance: ${task.deadline} </p>
                <p>${task.description}</p>
                <button type="button" id='delete-${task.id}' onclick="deleteTask(${task.id})" data-action="delete">Supprimer</button>
                <button type="button" class="edit-btn" data-action="edit" onclick="editTask(${task.id})">Modifier</button>
              `;
                        tasksContainer.appendChild(taskElement);
                    });
                }
                else { // Si aucune tâche filtrée n'est présente
                    console.log(this.tasks); // On a juste a afficher la nouvelle tâche
                    const taskElement = document.createElement('div');
                    taskElement.classList.add('task');
                    taskElement.classList.add(task.priority.toLowerCase());
                    if (task.category) {
                        if (!this.categoryManager.getAllCategories().some(cat => cat.name === task.category)) {
                            this.categoryManager.addCategory(task.category);
                        }
                    }
                    taskElement.innerHTML = `
            <h3>${task.title} <span>– Priorité ${task.priority}</span></h3>
            <p> Categorie : ${task.category}</p>
            <p>Date d'échéance: ${task.deadline} </p>
            <p>${task.description}</p>
            <button type="button" id='delete-${task.id}' onclick="deleteTask(${task.id})" data-action="delete">Supprimer</button>
            <button type="button" class="edit-btn" data-action="edit" onclick="editTask(${task.id})">Modifier</button>
          `;
                    tasksContainer.appendChild(taskElement);
                }
            }
        }
    }
    // Méthode pour supprimer une tâche de la liste des tâches et de l'interface utilisateur
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId); // Filtrage pour exclure la tâche à supprimer
        localStorage.setItem('tasks', JSON.stringify(this.tasks)); // Mise à jour du stockage local avec la nouvelle liste de tâches
        const taskElement = document.getElementById(`task-${taskId}`); // Récupération de l'élément de tâche dans le DOM
        if (taskElement) {
            taskElement.remove(); // Suppression de l'élément de tâche du DOM
        }
    }
    // Méthode pour éditer une tâche existante
    /**
     * Le fonctionnement de cette méthode est un peu feignante et peu intuitive je l'avoue
     * Cette méthode ajoute dans le formulaire d'ajout la tache à éditer
     * _______________________UPDATE JUSTE AVANT LA DATE DE RENDU: Ca ne marche plus... Je pense que ca a cassé après avoir ajouter les catégories et filtres__________________
     */
    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId); // Recherche de la tâche à éditer dans la liste des tâches
        if (task) {
            this.deleteTask(taskId); // Suppression de l'ancienne version de la tâche
            // Récupération des éléments du formulaire pour mettre à jour les valeurs de la tâche
            const titleInput = document.getElementById('taskTitle');
            const descriptionInput = document.getElementById('taskDescription');
            const dueDateInput = document.getElementById('taskDueDate');
            const priorityInput = document.getElementById('taskPriority');
            // Mise à jour des valeurs des champs avec celles de la tâche à éditer
            titleInput.value = task.title;
            descriptionInput.value = task.description;
            dueDateInput.value = task.deadline.toString();
            priorityInput.value = task.priority.toLowerCase();
        }
    }
    // Méthode pour filtrer les tâches par priorité
    filterTasksByPriority(priority) {
        const filteredTasks = this.tasks.filter(task => task.priority === priority); // filtrage des tâches par priorité
        localStorage.setItem('filteredTasks', JSON.stringify(filteredTasks)); // Stockage des tâches filtrées dans le stockage local
        location.reload(); // rechargement de la page pour afficher les tâches filtrées
    }
    // Méthode pour filtrer les tâches par date d'échéance
    filterTasksByDate(date) {
        const selectedDate = new Date(date);
        const filteredTasks = this.tasks.filter(task => {
            const taskDeadline = new Date(task.deadline); // Conversion de la date d'échéance de chaque tâche en objet Date
            return taskDeadline.toDateString() === selectedDate.toDateString(); // Comparaison des dates d'échéance
        });
        localStorage.setItem('filteredTasks', JSON.stringify(filteredTasks));
        location.reload();
    }
    // Méthode pour filtrer les tâches par catégorie
    filterTasksByCategory(category) {
        const filteredTasks = this.tasks.filter(task => task.category === category); // Filtrage des tâches par catégorie
        localStorage.setItem('filteredTasks', JSON.stringify(filteredTasks));
        location.reload();
    }
}
// Fonction pour créer une nouvelle tâche
function CreateNewTask(event) {
    event.preventDefault(); // Empêche le comportement par défaut du formulaire
    // Récupération des valeurs des champs du formulaire
    const titleInput = document.getElementById('taskTitle');
    const descriptionInput = document.getElementById('taskDescription');
    const dueDateInput = document.getElementById('taskDueDate');
    const priorityInput = document.getElementById('taskPriority');
    const categoryInput = document.getElementById('taskCategory');
    const newCategoryInput = document.getElementById('newCategory');
    let category = categoryInput.value;
    if (category === "" && newCategoryInput.value !== "") {
        category = newCategoryInput.value; // Si aucune catégorie n'est sélectionnée mais une nouvelle est entrée, utilisez la nouvelle catégorie
    }
    // Création de la nouvelle tâche
    const newTask = {
        id: new Date().getTime(),
        title: titleInput.value,
        description: descriptionInput.value,
        deadline: new Date(dueDateInput.value),
        priority: priorityInput.value,
        category: category
    };
    taskManager.addTask(newTask, false); // Ajout de la nouvelle tâche à la liste des tâches
    // Réinitialisation des champs du formulaire
    titleInput.value = '';
    descriptionInput.value = '';
    dueDateInput.value = '';
    priorityInput.value = 'medium';
}
/**
 * -------------------------------------------------------------  Trigger pour les boutons  -------------------------------------------------------------
 */
// Déclencheur pour le formulaire de création de tâches
document.getElementById('taskForm').addEventListener('submit', CreateNewTask);
// Écouteur d'événements pour les boutons de suppression et de modification de tâches
/**
 * Je n'ai pas réussi à intégrer CreateNewTask() dans le déclencheur ci-dessous
 * car le nombre d'arguments est différent pour le bouton de suppression / modification / retour
 */
document.addEventListener('click', (event) => {
    const target = event.target;
    if (target && target.getAttribute('data-action') === 'delete') {
        const taskId = parseInt(target.id.split('-')[1]);
        taskManager.deleteTask(taskId); // Suppression de la tâche associée
        location.reload(); // Rechargement de la page pour afficher les tâches mises à jour
    }
    if (target && target.getAttribute('data-action') === 'edit') {
        const taskId = parseInt(target.id.split('-')[1]);
        taskManager.editTask(taskId); // Modification de la tâche associée
    }
    if (target === document.getElementById('backButton') && localStorage.getItem('filteredTasks')) {
        localStorage.removeItem('filteredTasks'); // Suppression des tâches filtrées du stockage local
        location.reload(); // Rechargement de la page pour afficher toutes les tâches
    }
});
// Implémentation de la classe CategoryManager
class CategoryManager {
    constructor() {
        this.categories = [];
        const storedCategories = localStorage.getItem('categories'); // Récupération des catégories depuis le stockage local
        if (storedCategories) {
            this.categories = JSON.parse(storedCategories); // Si des catégories sont stockées, les charger dans la liste pour l'user
        }
    }
    // Méthode pour ajouter une nouvelle catégorie
    addCategory(categoryName) {
        const newCategory = { name: categoryName };
        this.categories.push(newCategory); // Ajout de la nouvelle catégorie à la liste
        localStorage.setItem('categories', JSON.stringify(this.categories)); // Stockage des catégories dans le stockage local
    }
    // Méthode pour récupérer toutes les catégories
    getAllCategories() {
        return this.categories;
    }
}
// Initialisation des catégories au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('taskCategory');
    const categoryManager = new CategoryManager();
    const categories = categoryManager.getAllCategories();
    // Parcours de toutes les catégories et ajout au sélecteur de catégories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
});
// Affichage et déclenchement des filtres
document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('filterByCategory');
    const categoryManager = new CategoryManager();
    const categories = categoryManager.getAllCategories();
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
});
/**
 * -------------------------------------------------------------  déclenchement des filtres  -------------------------------------------------------------
 */
// Écouteur d'événements pour le filtre par priorité
document.getElementById('filterByPriority').addEventListener('change', (event) => {
    const priority = event.target.value;
    taskManager.filterTasksByPriority(priority);
});
// Écouteur d'événements pour le filtre par date d'échéance
document.getElementById('filterDate').addEventListener('change', (event) => {
    const date = event.target.value;
    taskManager.filterTasksByDate(date);
});
// Écouteur d'événements pour le filtre par catégorie
document.getElementById('filterByCategory').addEventListener('change', (event) => {
    const category = event.target.value;
    taskManager.filterTasksByCategory(category);
});
/**
 * -------------------------------------------------------------  initialisation des classes  -------------------------------------------------------------
 */
const categoryManager = new CategoryManager();
const taskManager = new TaskManager(categoryManager);
