# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

import os

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = "Unified Cache Manager"
copyright = "2025, Unified Cache Manager Team"
author = "Unified Cache Manager Team"
release = ""

# -- Internationalization ----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/advanced/intl.html

locale_dirs = ["_locale/"]  # path relative to this source directory
gettext_compact = False

# Read the Docs sets READTHEDOCS_LANGUAGE for each version (its locale codes
# use the "zh-cn" style). Normalise it to the Sphinx/Babel "zh_CN" form that
# matches our compiled catalogs under _locale/zh_CN/.
_rtd_language = os.environ.get("READTHEDOCS_LANGUAGE", "").lower()
_lang_map = {"zh-cn": "zh_CN", "zh_cn": "zh_CN", "zh": "zh_CN"}
language = _lang_map.get(_rtd_language) or os.environ.get("DOCS_LANGUAGE", "en")

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

# Copy from https://github.com/vllm-project/vllm/blob/main/docs/source/conf.py
extensions = [
    "sphinx.ext.napoleon",
    "sphinx.ext.intersphinx",
    "sphinx_copybutton",
    "sphinx.ext.autodoc",
    "sphinx.ext.autosummary",
    "myst_parser",
    "sphinxarg.ext",
    "sphinx_design",
    "sphinx_togglebutton",
    "sphinx_substitution_extensions",
    "sphinxcontrib.mermaid",
]

myst_enable_extensions = ["colon_fence", "substitution"]

# templates_path = ['_templates']
exclude_patterns = []

# Read the Docs runs `sphinx-build -j auto` by default. On RTD's CPU-throttled
# free-tier containers the parallel worker pool can be far slower than a single
# process (and occasionally runs into the 15-minute build limit). Force Sphinx
# to run single-process so -j auto is effectively ignored and builds stay fast.
parallel_read_safe = False
parallel_write_safe = False


# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_title = project
html_theme = "sphinx_book_theme"
html_static_path = ["_static"]
html_css_files = ["css/logo.css"]
html_theme_options = {
    "path_to_docs": "docs/source",
    "repository_url": "https://github.com/ModelEngine-Group/unified-cache-management",
    "use_repository_button": True,
    "use_edit_page_button": True,
    "logo": {
        "image_light": "logos/UCM-light.png",
        "image_dark": "logos/UCM-dark.png",
        "alt_text": "UCM",
    },
}

# language = 'zh_CN'
