Project Concept:
This project is a simple To-Do List app for managing daily tasks in a clean and beginner-friendly way.

Why this theme was chosen:
The theme was chosen because a to-do list is practical, familiar, and easy to understand during a class presentation. It shows how JavaScript can make an everyday tool interactive.

Features included:
- DOM manipulation to add, remove, and update tasks
- Event handling for form submission, complete buttons, and delete buttons
- Fetch API with async/await
- JSON data handling from a local tasks.json file
- User input through a task form
- Interactive UI behavior with hover effects, fade-in animation, and a strike-through completion effect

Async operation used:
The app fetches starting tasks from the local tasks.json file by using fetch() with async/await.

Notes for grader:
This project demonstrates all required JavaScript features in a simple and organized way.
If the project is opened through a local server such as VS Code Live Server, it loads tasks from tasks.json.
If the HTML file is opened directly from the folder, the app still works by showing built-in fallback tasks because some browsers block local fetch requests on file:// pages.
