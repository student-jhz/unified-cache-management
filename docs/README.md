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

## Read the Docs (multi-language) build

The `.readthedocs.yaml` at the repo root uses the standard Sphinx build model.
Multi-language (English + Chinese) is provided by Read the Docs' native
"translations" model: each language is its own **version** of the project,
and the same conf builds every one of them.

`docs/source/conf.py` reads the `READTHEDOCS_LANGUAGE` variable that Read the
Docs sets for each version and maps it to the matching Sphinx locale
(`zh-cn` -> `zh_CN`). Sphinx auto-compiles the `.po` catalogs
(`docs/source/_locale/zh_CN/`) at build time, so no manual `sphinx-intl` step
is required on Read the Docs.

Local sanity checks (reproduce what Read the Docs will run per version):

```bash
# English
DOCS_LANGUAGE=en sphinx-build -b html docs/source build/en

# Chinese
DOCS_LANGUAGE=zh_CN sphinx-build -b html docs/source build/zh
```