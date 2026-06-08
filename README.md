# changelog-sandbox

Тестовий проєкт для перевірки сетапу з **двома розділеними changelog**:

| | Локальний work-log | Офіційний release changelog |
|---|---|---|
| Файл | `.claude/docs/CHANGELOG.md` | `CHANGELOG.md` (корінь, генерується) |
| Групування | по датах | по версіях |
| Хто веде | Claude локально під час роботи | release-please в CI на merge у `main` |
| Формат | `[Feat]/[Fix]` + `(@автор)` | Added/Fixed + лінк на PR |

## Як тестувати

### 1. Локальний work-log (Claude, без GitHub)
Відкрий Claude Code у цій теці, попроси зробити будь-яку дрібну зміну. Завдяки
правилу в `CLAUDE.md` Claude має дописати рядок у `.claude/docs/CHANGELOG.md` під
сьогоднішньою датою з `(@<твій git user.name>)`, і **не чіпати** кореневий `CHANGELOG.md`.

### 2. release-please (потрібен GitHub-репозиторій)
release-please працює через GitHub API, тож для повного тесту:

1. Створи порожній репозиторій на GitHub і запуш цей проєкт у `main`.
2. У **Settings → Actions → General → Workflow permissions**: «Read and write» +
   галка «Allow GitHub Actions to create and approve pull requests».
3. У **Settings → General → Pull Requests**: увімкни squash-merge, default commit
   message → «Pull request title and description».
4. Створи PR з назвою `feat: ...` / `fix: ...`, змерджи у `main`.
5. release-please відкриє release-PR `chore(main): release 1.0.0` з кореневим
   `CHANGELOG.md` по версіях. Змерджиш його → тег `v1.0.0` + GitHub Release.

Локально без GitHub можна перевірити лише валідність конфігів (див. нижче) і те,
які записи зібралися б — через сухий прогін з токеном і `--repo-url`.

> Після першого релізу прибери `release-as: "1.0.0"` з `release-please-config.json`.
