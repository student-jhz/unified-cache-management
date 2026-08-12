# Unified Cache Manager documents

Live doc: Coming soon

## Build the docs

```bash
# Install dependencies.
pip install -r requirements-docs.txt

# Build the docs.
make clean
make html


# Open the docs with your browser
python3 -m http.server -d build/html/
```

Launch your browser and open:
- English version: http://localhost:8000

## Build the Chinese (zh_CN) docs

A Chinese translation pipeline is configured via Sphinx i18n. The English
`docs/source/*.md` files remain the master source; Chinese strings live in
`.po` catalogs under `docs/source/_locale/zh_CN/`.

```bash
# 1. Update the .po catalogs against the latest source (regenerate .mo).
sphinx-intl update -l zh_CN -d source/_locale -p build/gettext
sphinx-intl build -l zh_CN -d source/_locale

# 2. Build the Chinese site.
# Windows (PowerShell):
.\docs\build_zh.ps1 -Serve     # build and serve at http://localhost:8000/html_zh/

# Or directly:
DOCS_LANGUAGE=zh_CN sphinx-build -b html source build/html_zh
python3 -m http.server -d build/html_zh/
```

Only the strings that have a non-empty translation in the `.po` files will be
localized; the remaining pages fall back to the English source. Add or edit
entries in `docs/source/_locale/zh_CN/LC_MESSAGES/*.po` to translate more pages.

## Read the Docs (dual-language) build

The `.readthedocs.yaml` at the repo root drives a custom build that produces
**both** languages from one build. Each language is a self-contained site
under its own subdirectory so relative links resolve correctly:

- `/`      - landing page (choose your language)
- `/en/`   - English site
- `/zh/`   - Chinese (zh_CN) site

Local sanity check (reproduces what Read the Docs will run):

```bash
sphinx-intl build -l zh_CN -d docs/source/_locale
DOCS_LANGUAGE=en   sphinx-build -b html -c docs/source docs/source build/en
DOCS_LANGUAGE=zh_CN sphinx-build -b html -c docs/source docs/source build/zh
cp docs/source/_static/landing.html build/index.html
```