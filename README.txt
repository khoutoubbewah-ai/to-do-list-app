Daily Quest Board

Project concept:
Daily Quest Board is a small interactive planner that treats everyday responsibilities like a calm story map. Instead of showing a plain to-do list, the project presents tasks as "quests" with time, category, priority, and progress feedback that changes throughout the day.
The updated version also includes persistent saved tasks, a smart next-task recommendation, and a reward streak system.

Why this theme was chosen:
I chose this theme because I wanted to combine a practical planner with a more creative and media-oriented presentation. The design turns routine task management into a more expressive experience by using visual storytelling language such as daily scenes, focus prompts, progress messages, and category color coding.

Interactive features included:
- Dynamic DOM rendering of all task cards from JavaScript
- Add task form with task text, time, priority, and category
- Complete, undo, and delete controls for each task
- Filter buttons for all, active, and completed tasks
- Clear completed button
- Live stat counters for total, completed, pending, and progress percent
- Day-phase scene banner that changes based on the current time
- Focus panel that highlights the next active task
- Smart next-quest recommendation based on priority and time
- localStorage persistence so tasks stay saved after refreshing the page
- Reward points, badges, and a daily streak system for completed tasks
- Animated transitions, hover effects, strike-through completion, and a live progress bar
- Keyboard interaction: pressing Escape in the task input clears the current draft

Async operation used:
The project uses the Fetch API with async and await to load starting task data from the local file tasks.json. The JSON is parsed and normalized before being rendered into the interface.

JSON data used:
The local tasks.json file stores an array of task objects. Each task can include:
- text
- completed
- time
- priority
- category
- day

JavaScript features demonstrated:
1. DOM selection and manipulation
2. Element creation and removal
3. Event handling for submit, click, and keyboard events
4. Form handling and user input processing
5. Fetch API with async and await
6. JSON parsing and object/array handling
7. Conditional rendering
8. Dynamic styling and animation updates
9. localStorage for persistent browser data
10. Smart recommendation logic using sorting and priority scores

Brief notes for the grader:
- Open the project through a local server for the fetch request to load tasks.json correctly.
- If the page is opened directly from the folder with file://, the app still works by falling back to built-in sample task data.
- After the first load, user-created tasks are saved in localStorage so the app remembers changes after refresh.
- The project is designed as a calm interactive productivity/storytelling hybrid rather than a plain utility app.
