import { create } from 'zustand';

export const en = {
  // Navigation & General
  nav_dashboard: "Dashboard",
  nav_login: "Log in",
  nav_register: "Register",
  nav_logout: "Log out",
  app_name: "HackSync",
  btn_cancel: "Cancel",
  btn_submit: "Submit",
  btn_save: "Save",
  status_draft: "Draft",
  status_registration: "Registration",
  status_running: "Running",
  status_finished: "Finished",

  // Dashboard
  dash_welcome: "Welcome back",
  dash_admin_title: "Dashboard",
  dash_btn_create: "Create Tournament",
  dash_manage_tournaments: "Manage Tournaments",
  dash_no_tournaments: "No tournaments created yet.",
  dash_btn_manage: "Manage",
  dash_jury_assignments: "No assignments for you right now.",
  dash_btn_evaluate: "Evaluate",
  dash_btn_edit_score: "Edit Score",
  dash_jury_evaluated: "Evaluated",
  dash_team_discover: "Discover Tournaments",
  dash_team_active_tasks: "Active Tasks",
  dash_btn_go_tournament: "Go to Tournament →",
  dash_btn_view_task: "View Task",
  
  // Jury modal
  jury_eval_title: "Evaluate Submission",
  jury_eval_team: "Team",
  jury_tech_qual: "Technical Quality (0-100)",
  jury_tech_backend: "Backend Code",
  jury_tech_db: "Database Arch.",
  jury_tech_front: "Frontend / Structure",
  jury_func_del: "Functional Delivery (0-100)",
  jury_func_must: "Must-Have",
  jury_func_bugs: "Stability / Bugs",
  jury_func_ux: "UX / Usability",
  jury_comments: "Jury Comments",
  jury_btn_submitting: "Submitting...",
  jury_btn_submit_eval: "Submit Evaluation",

  // Misc
  round: "Round",
  github_repo: "GitHub Repo",
  video_demo: "Video Demo",
  live_demo: "Live Demo",
  
  // Public Tournament Details
  tourney_register_now: "Register Team Now",
  tourney_setup_acc: "Setup Account to Register",
  tourney_rounds_tasks: "Rounds & Tasks",
  tourney_tech_stack: "Tech Stack",
  tourney_must_haves: "Must Haves",
  tourney_submit_work: "Submit Work",
  tourney_rules_details: "Rules & Details",
  tourney_participating_teams: "Participating Teams",
  tourney_no_teams: "No teams registered yet.",
  tourney_timeline: "Timeline",
  tourney_reg_opens: "Registration Opens",
  tourney_reg_closes: "Registration Closes",
  tourney_event_starts: "Event Starts",
  tourney_modal_submit: "Submit Your Work",
  tourney_modal_select_team: "Select Team",
  tourney_modal_git_url: "GitHub URL",
  tourney_modal_vid_url: "Video Demo URL",
  tourney_modal_demo_url: "Live Demo URL (Optional)",
  tourney_modal_summary: "Summary / Setup Instructions",
  tourney_modal_btn_submit: "Submit Final",
  tourney_modal_reg_team: "Register Team",
  tourney_modal_team_name: "Team Name",
  tourney_modal_city: "City / School / Hub",
  tourney_modal_discord: "Telegram / Discord (Contact link)",
  tourney_modal_members: "Team Members",
  tourney_modal_add_member: "Add Member",

  // Admin
  admin_overview: "Overview",
  admin_teams: "Teams",
  admin_rounds: "Rounds / Tasks",
  admin_leaderboard: "Leaderboard",
  admin_settings: "Settings"
};

export const uk = {
  // Navigation & General
  nav_dashboard: "Панель управління",
  nav_login: "Увійти",
  nav_register: "Реєстрація",
  nav_logout: "Вийти",
  app_name: "HackSync",
  btn_cancel: "Скасувати",
  btn_submit: "Надіслати",
  btn_save: "Зберегти",
  status_draft: "Чернетка",
  status_registration: "Реєстрація",
  status_running: "В процесі",
  status_finished: "Завершено",

  // Dashboard
  dash_welcome: "З поверненням",
  dash_admin_title: "Панель управління",
  dash_btn_create: "Створити Турнір",
  dash_manage_tournaments: "Управління Турнірами",
  dash_no_tournaments: "Турніри ще не створені.",
  dash_btn_manage: "Керувати",
  dash_jury_assignments: "Для вас зараз немає завдань.",
  dash_btn_evaluate: "Оцінити",
  dash_btn_edit_score: "Редагувати оцінку",
  dash_jury_evaluated: "Оцінено",
  dash_team_discover: "Відкрийте для себе турніри",
  dash_team_active_tasks: "Активні Завдання",
  dash_btn_go_tournament: "Перейти до Турніру →",
  dash_btn_view_task: "Переглянути Завдання",

  // Jury modal
  jury_eval_title: "Оцінити подання",
  jury_eval_team: "Команда",
  jury_tech_qual: "Технічна якість (0-100)",
  jury_tech_backend: "Бекенд код",
  jury_tech_db: "Бази даних та Арх.",
  jury_tech_front: "Фронтенд / Структура",
  jury_func_del: "Функціональна реалізація (0-100)",
  jury_func_must: "Критичний функціонал",
  jury_func_bugs: "Стабільність / Баги",
  jury_func_ux: "UX / Зручність",
  jury_comments: "Коментарі Журі",
  jury_btn_submitting: "Надсилання...",
  jury_btn_submit_eval: "Надіслати Оцінку",

  // Misc
  round: "Раунд",
  github_repo: "GitHub Репо.",
  video_demo: "Відео Демо",
  live_demo: "Live Демо",
  
  // Public Tournament Details
  tourney_register_now: "Реєстрація Команди",
  tourney_setup_acc: "Створіть Акаунт для Реєстрації",
  tourney_rounds_tasks: "Раунди та Завдання",
  tourney_tech_stack: "Технології",
  tourney_must_haves: "Обов'язкові вимоги",
  tourney_submit_work: "Надіслати Роботу",
  tourney_rules_details: "Правила Деталі",
  tourney_participating_teams: "Зареєстровані Команди",
  tourney_no_teams: "Ще немає зареєстрованих команд.",
  tourney_timeline: "Розклад",
  tourney_reg_opens: "Відкриття реєстрації",
  tourney_reg_closes: "Закриття реєстрації",
  tourney_event_starts: "Початок події",
  tourney_modal_submit: "Надіслати свою роботу",
  tourney_modal_select_team: "Оберіть Команду",
  tourney_modal_git_url: "GitHub Посилання",
  tourney_modal_vid_url: "Посилання на Відео Демо",
  tourney_modal_demo_url: "Посилання на Live Демо (Опціонально)",
  tourney_modal_summary: "Резюме / Інструкції з налаштування",
  tourney_modal_btn_submit: "Надіслати",
  tourney_modal_reg_team: "Реєстрація Команди",
  tourney_modal_team_name: "Назва Команди",
  tourney_modal_city: "Місто / Школа / Хаб",
  tourney_modal_discord: "Telegram / Discord",
  tourney_modal_members: "Учасники Команди",
  tourney_modal_add_member: "Додати Учасника",

  // Admin
  admin_overview: "Огляд",
  admin_teams: "Команди",
  admin_rounds: "Раунди / Завдання",
  admin_leaderboard: "Таблиця Лідерів",
  admin_settings: "Налаштування"
};

export const dict = { en, uk };

export type I18nKey = keyof typeof en;

interface I18nState {
  lang: 'en' | 'uk';
  setLang: (lang: 'en' | 'uk') => void;
  t: (key: I18nKey) => string;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  lang: (localStorage.getItem('lang') as 'en' | 'uk') || 'en',
  setLang: (lang) => {
    localStorage.setItem('lang', lang);
    set({ lang });
  },
  t: (key) => dict[get().lang][key] || key
}));
