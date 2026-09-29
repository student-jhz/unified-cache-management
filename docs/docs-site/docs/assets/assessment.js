/**
 * UCM Compatibility Assessment - wizard logic.
 *
 * Renders a step-by-step guide (engine -> version -> device -> model) inside
 * assets/compatibility_assessment.html and produces a compatibility verdict
 * from the dataset in compatibility-data.js. The page is embedded through
 * overrides/assessment.html, which appends ?lang=<locale> so both the English
 * and Chinese builds share this single app.
 */
(function () {
  "use strict";

  var data = window.UcmCompatibilityData;
  if (!data) {
    document.getElementById("app-subtitle").textContent =
      "compatibility-data.js failed to load.";
    return;
  }

  /* ------------------------------------------------------------------ *
   * i18n
   * ------------------------------------------------------------------ */

  var lang = "en";
  try {
    var queried = new URLSearchParams(window.location.search).get("lang");
    if (queried === "zh") lang = "zh";
  } catch (err) {
    /* keep default */
  }
  document.documentElement.lang = lang;

  var STRINGS = {
    en: {
      "app.title": "UCM Compatibility Assessment",
      "app.subtitle":
        "Collect your deployment details step by step and get a compatibility conclusion before delivering UCM.",
      "app.updated": "Data updated",
      "step.engine": "Engine",
      "step.version": "Version",
      "step.device": "Device",
      "step.model": "Model",
      "step.result": "Result",
      "engine.question": "Which inference engine do you use?",
      "engine.hint": "The engine determines the UCM integration path and the compute platform.",
      "engine.platform": "Platform",
      "version.question": "Which {engine} version do you use?",
      "version.hint":
        "Shows the latest 10 upstream tags with their UCM status. Release candidates and post releases map to their base version (v0.26.0rc1 -> v0.26.0); older releases can be entered through Other.",
      "device.question": "Which compute device do you use?",
      "device.hint": "{engine} runs on {platform} devices.",
      "model.question": "Which model do you serve?",
      "model.hint": "Statuses below are recorded for {engine}.",
      "other": "Other / not listed",
      "other.input": "Enter the exact value",
      "other.version.placeholder": "e.g. v0.25.1",
      "other.device.placeholder": "e.g. B300",
      "other.model.placeholder": "e.g. DeepSeek V4 Flash",
      "back": "Back",
      "continue": "Continue",
      "view-result": "View result",
      "restart": "Start over",
      "error.required": "Select an option or enter a value to continue.",
      "error.other-empty": "Enter a value or pick a listed option.",
      "status.supported": "Supported",
      "status.unverified": "Unverified",
      "status.unsupported": "Unsupported",
      "verdict.compatible.title": "Compatible - ready to deploy UCM",
      "verdict.compatible.desc":
        "Every collected factor is covered by the maintained compatibility dataset. Follow the quickstart to integrate UCM with your stack.",
      "verdict.unverified.title": "Likely compatible - needs verification",
      "verdict.unverified.desc":
        "Nothing in this combination is known to be incompatible, but at least one factor has no validation conclusion yet. Verify the unverified items on your target environment before delivery.",
      "verdict.incompatible.title": "Not compatible as selected",
      "verdict.incompatible.desc":
        "At least one collected factor is recorded as unsupported. Adjust the combination or contact the UCM team before delivery.",
      "result.summary": "Collected information",
      "result.factors": "Assessment details",
      "result.factor": "Factor",
      "result.selection": "Selection",
      "result.status": "Status",
      "result.next.compatible": "Next steps",
      "result.next.unverified": "Suggested next steps",
      "result.next.incompatible": "Alternatives",
      "factor.engine": "Engine",
      "factor.version": "Engine version",
      "factor.device": "Compute device",
      "factor.model": "Model",
      "note.version.supported": "Listed in the maintained engine version set.",
      "note.version.unverified":
        "{value} is not in the maintained version list; no validation conclusion is available.",
      "note.device.supported": "Representative device recorded in the support matrix.",
      "note.device.unverified":
        "{value} is not a representative device in the support matrix; no validation conclusion is available.",
      "note.model.supported": "Compatible with {engine} in the support matrix.",
      "note.model.unverified": "No validation conclusion for {engine} yet.",
      "note.model.unsupported": "Recorded as unsupported on {engine} in the support matrix.",
      "next.quickstart": "Follow the installation guide",
      "next.matrix": "Review the full support matrix",
      "next.tour": "Open the model tour",
      "next.precheck": "Run the environment precheck toolkit",
      "next.troubleshooting": "Check the troubleshooting page",
      "data.note":
        'This conclusion is generated from the compatibility dataset maintained by UCM developers (last updated {date}). See the <a href="{matrix}" target="_parent">support matrix</a> for the complete tables.',
      "summary.engine": "Engine",
      "summary.version": "Version",
      "summary.device": "Device",
      "summary.model": "Model"
    },
    zh: {
      "app.title": "UCM 兼容性评估",
      "app.subtitle": "一步一步收集部署信息，在交付 UCM 前给出兼容性结论。",
      "app.updated": "数据更新于",
      "step.engine": "引擎",
      "step.version": "版本",
      "step.device": "推理卡",
      "step.model": "模型",
      "step.result": "结论",
      "engine.question": "您使用哪个推理引擎？",
      "engine.hint": "引擎决定了 UCM 的接入方式和计算平台。",
      "engine.platform": "计算平台",
      "version.question": "您使用的 {engine} 版本是？",
      "version.hint":
        "展示最新 10 个上游 tag 及其 UCM 状态。rc / post 版本按基础版本归一（v0.26.0rc1 视为 v0.26.0），更早的版本可通过「其他」输入。",
      "device.question": "您使用哪种推理卡？",
      "device.hint": "{engine} 运行在 {platform} 平台。",
      "model.question": "您 serving 哪个模型？",
      "model.hint": "下方状态为该模型在 {engine} 上的记录。",
      "other": "其他 / 未列出",
      "other.input": "请输入具体内容",
      "other.version.placeholder": "例如 v0.25.1",
      "other.device.placeholder": "例如 B300",
      "other.model.placeholder": "例如 DeepSeek V4 Flash",
      "back": "上一步",
      "continue": "下一步",
      "view-result": "查看结论",
      "restart": "重新评估",
      "error.required": "请选择一项或输入内容后继续。",
      "error.other-empty": "请输入内容，或选择列表中的选项。",
      "status.supported": "支持",
      "status.unverified": "待验证",
      "status.unsupported": "不支持",
      "verdict.compatible.title": "兼容 —— 可以部署 UCM",
      "verdict.compatible.desc":
        "所收集的各要素均在维护中的兼容性数据集覆盖范围内。请按照快速开始指引完成 UCM 接入。",
      "verdict.unverified.title": "初步兼容 —— 需要验证",
      "verdict.unverified.desc":
        "当前组合中没有已知的不兼容项，但至少有一项要素尚无验证结论。交付前请在目标环境上完成验证。",
      "verdict.incompatible.title": "按当前选择不兼容",
      "verdict.incompatible.desc":
        "至少一项收集到的要素被记录为不支持。请调整组合，或在交付前联系 UCM 团队。",
      "result.summary": "已收集信息",
      "result.factors": "评估明细",
      "result.factor": "评估项",
      "result.selection": "选择内容",
      "result.status": "状态",
      "result.next.compatible": "后续步骤",
      "result.next.unverified": "建议的后续步骤",
      "result.next.incompatible": "可选方案",
      "factor.engine": "推理引擎",
      "factor.version": "引擎版本",
      "factor.device": "推理卡",
      "factor.model": "模型",
      "note.version.supported": "在维护的引擎版本清单内。",
      "note.version.unverified": "{value} 不在维护的版本清单内，暂无验证结论。",
      "note.device.supported": "支持矩阵中记录的代表性设备。",
      "note.device.unverified": "{value} 不在支持矩阵的代表性设备之列，暂无验证结论。",
      "note.model.supported": "支持矩阵中记录与 {engine} 兼容。",
      "note.model.unverified": "在 {engine} 上尚无验证结论。",
      "note.model.unsupported": "支持矩阵中记录在 {engine} 上不支持。",
      "next.quickstart": "查看安装指引",
      "next.matrix": "查看完整支持矩阵",
      "next.tour": "查看模型教程",
      "next.precheck": "运行环境预检工具",
      "next.troubleshooting": "查看故障排查",
      "data.note":
        '本结论由 UCM 开发者维护的兼容性数据集生成（最后更新：{date}）。完整表格请查看<a href="{matrix}" target="_parent">支持矩阵</a>。',
      "summary.engine": "引擎",
      "summary.version": "版本",
      "summary.device": "推理卡",
      "summary.model": "模型"
    }
  };

  function t(key, vars) {
    var table = STRINGS[lang] || STRINGS.en;
    var text = table[key] !== undefined ? table[key] : STRINGS.en[key];
    if (typeof text !== "string") return key;
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        text = text.split("{" + name + "}").join(String(vars[name]));
      });
    }
    return text;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */

  var PAGE_MARKER = "user-guide/support-matrix/assessment";

  function siteRoot() {
    try {
      var path = window.parent.location.pathname.replace(/(^|\/)index\.html$/, "");
      var idx = path.lastIndexOf(PAGE_MARKER);
      if (idx !== -1) {
        var root = path.slice(0, idx);
        if (root && root.charAt(root.length - 1) !== "/") root += "/";
        return root || "/";
      }
    } catch (err) {
      /* cross-origin parent: fall through */
    }
    return "../";
  }

  function pageUrl(relative) {
    return siteRoot() + relative;
  }

  /** Normalize a version string the same way the runtime patch loader does. */
  function normalizeVersion(value) {
    var s = String(value || "").trim();
    if (!s) return null;
    s = s.replace(/^v/i, "");
    s = s.split("+", 1)[0];
    s = s.split(".post", 1)[0];
    s = s.split("rc", 1)[0];
    return s ? "v" + s.toLowerCase() : null;
  }

  function badge(status) {
    var label = t("status." + status);
    return '<span class="wiz-badge wiz-badge--' + status + '">' + escapeHtml(label) + "</span>";
  }

  /* ------------------------------------------------------------------ *
   * State
   * ------------------------------------------------------------------ */

  var STEP_ENGINE = 0;
  var STEP_VERSION = 1;
  var STEP_DEVICE = 2;
  var STEP_MODEL = 3;
  var STEP_RESULT = 4;
  var STEP_COUNT = 5;

  // Only the newest tags are offered as chips; the full dataset list is still
  // used to resolve versions typed through "Other / not listed".
  var MAX_VERSION_CHIPS = 10;

  // Each choice is one of:
  //   { kind: "listed", value, status, input: "" }
  //   { kind: "other",  value, status, input, pending: bool }
  // A manually entered value that normalizes to a listed version keeps that
  // entry's status; every other entered value becomes "unverified".
  var state = {
    step: STEP_ENGINE,
    engineId: null,
    versionChoice: null,
    deviceChoice: null,
    modelChoice: null
  };

  function resetFrom(step) {
    if (step <= STEP_ENGINE) state.engineId = null;
    if (step <= STEP_VERSION) state.versionChoice = null;
    if (step <= STEP_DEVICE) state.deviceChoice = null;
    if (step <= STEP_MODEL) state.modelChoice = null;
  }

  function currentEngine() {
    return state.engineId ? data.findEngine(state.engineId) : null;
  }

  function makeListedChoice(value, status) {
    return { kind: "listed", value: value, status: status, input: "", pending: false };
  }

  function makeOtherChoice(input, normalize, listed) {
    var typed = String(input || "").trim();
    if (!typed) return { kind: "other", value: "", status: null, input: "", pending: true };
    if (normalize && listed) {
      var normalized = normalize(typed);
      for (var i = 0; i < listed.length; i += 1) {
        if (normalize(listed[i].version) === normalized) {
          return {
            kind: "listed",
            value: listed[i].version,
            status: listed[i].status,
            input: typed,
            pending: false
          };
        }
      }
    }
    return { kind: "other", value: typed, status: data.STATUS.UNVERIFIED, input: typed, pending: false };
  }

  function choiceValid(choice) {
    return !!choice && (choice.kind === "listed" || (!choice.pending && !!choice.value));
  }

  function stepValid(step) {
    if (step === STEP_ENGINE) return state.engineId !== null;
    if (step === STEP_VERSION) return choiceValid(state.versionChoice);
    if (step === STEP_DEVICE) return choiceValid(state.deviceChoice);
    if (step === STEP_MODEL) return choiceValid(state.modelChoice);
    return true;
  }

  /* ------------------------------------------------------------------ *
   * Evaluation
   * ------------------------------------------------------------------ */

  function evaluate() {
    var engine = currentEngine();
    var factors = [
      { label: t("factor.engine"), value: engine.label, status: data.STATUS.SUPPORTED, note: "" }
    ];

    factors.push({
      label: t("factor.version"),
      value: state.versionChoice.value,
      status: state.versionChoice.status,
      note: t("note.version." + state.versionChoice.status, { value: state.versionChoice.value })
    });
    factors.push({
      label: t("factor.device"),
      value: state.deviceChoice.value,
      status: state.deviceChoice.status,
      note: t("note.device." + state.deviceChoice.status, { value: state.deviceChoice.value })
    });
    factors.push({
      label: t("factor.model"),
      value: state.modelChoice.value,
      status: state.modelChoice.status,
      note: t("note.model." + state.modelChoice.status, { engine: engine.label })
    });

    var verdict = "compatible";
    for (var i = 0; i < factors.length; i += 1) {
      if (factors[i].status === data.STATUS.UNSUPPORTED) {
        verdict = "incompatible";
        break;
      }
      if (factors[i].status === data.STATUS.UNVERIFIED) verdict = "unverified";
    }
    return { verdict: verdict, factors: factors };
  }

  /* ------------------------------------------------------------------ *
   * Rendering
   * ------------------------------------------------------------------ */

  var stepsEl = document.getElementById("wiz-steps");
  var bodyEl = document.getElementById("wiz-body");
  var errorEl = document.getElementById("wiz-error");
  var backBtn = document.getElementById("btn-back");
  var continueBtn = document.getElementById("btn-continue");
  var restartBtn = document.getElementById("btn-restart");

  function optionCard(options) {
    var cls = "wiz-option" + (options.wide ? " wiz-option--wide" : "") +
      (options.other ? " wiz-option--other" : "") +
      (options.selected ? " is-selected" : "");
    var html = '<div class="' + cls + '" data-option="' + escapeHtml(options.value) + '"' +
      (options.other ? ' data-other="1"' : "") + ">";
    html += '<span class="wiz-option-name">' + escapeHtml(options.name) + "</span>";
    if (options.desc) html += '<span class="wiz-option-desc">' + escapeHtml(options.desc) + "</span>";
    if (options.status) html += badge(options.status);
    html += "</div>";
    return html;
  }

  function otherInputHtml(placeholder, value, visible) {
    return (
      '<div class="wiz-other-input' + (visible ? "" : " hidden") + '" data-other-input>' +
      '<label class="form-label">' + escapeHtml(t("other.input")) + "</label>" +
      '<input type="text" class="form-input" data-other-field placeholder="' +
      escapeHtml(placeholder) + '" value="' + escapeHtml(value || "") + '">' +
      "</div>"
    );
  }

  function renderStepper() {
    var labels = ["engine", "version", "device", "model", "result"];
    var html = "";
    for (var i = 0; i < STEP_COUNT; i += 1) {
      var cls = "wiz-step";
      if (i === state.step) cls += " is-current";
      else if (i < state.step) cls += " is-done";
      if (i < state.step) cls += " is-clickable";
      html +=
        '<li class="' + cls + '" data-step="' + i + '">' +
        '<span class="wiz-step-dot">' + (i < state.step ? "✓" : i + 1) + "</span>" +
        '<span class="wiz-step-label">' + escapeHtml(t("step." + labels[i])) + "</span>" +
        "</li>";
    }
    stepsEl.innerHTML = html;
  }

  function renderEngineStep() {
    var html =
      '<h3 class="wiz-step-title">' + escapeHtml(t("engine.question")) + "</h3>" +
      '<p class="wiz-step-hint">' + escapeHtml(t("engine.hint")) + "</p>" +
      '<div class="wiz-options">';
    data.engines.forEach(function (engine) {
      var platform = data.platforms[engine.platform];
      html += optionCard({
        value: engine.id,
        name: engine.label,
        desc: t("engine.platform") + ": " + platform.label,
        selected: state.engineId === engine.id
      });
    });
    html += "</div>";
    bodyEl.innerHTML = html;
  }

  function renderVersionStep() {
    var engine = currentEngine();
    var choice = state.versionChoice;
    var other = choice && choice.kind === "other";
    var html =
      '<h3 class="wiz-step-title">' + escapeHtml(t("version.question", { engine: engine.label })) + "</h3>" +
      '<p class="wiz-step-hint">' + escapeHtml(t("version.hint")) + "</p>" +
      '<div class="wiz-options wiz-options--compact">';
    engine.versions.slice(0, MAX_VERSION_CHIPS).forEach(function (entry) {
      html += optionCard({
        value: entry.version,
        name: entry.version,
        status: entry.status,
        selected: choice && choice.kind === "listed" && choice.value === entry.version
      });
    });
    html += optionCard({
      value: "__other__",
      name: t("other"),
      other: true,
      wide: true,
      selected: other
    });
    html += "</div>";
    html += otherInputHtml(t("other.version.placeholder"), other ? choice.input : "", other);
    bodyEl.innerHTML = html;
  }

  function renderDeviceStep() {
    var engine = currentEngine();
    var platform = data.platforms[engine.platform];
    var choice = state.deviceChoice;
    var other = choice && choice.kind === "other";
    var html =
      '<h3 class="wiz-step-title">' + escapeHtml(t("device.question")) + "</h3>" +
      '<p class="wiz-step-hint">' +
      escapeHtml(t("device.hint", { engine: engine.label, platform: platform.label })) +
      "</p>" +
      '<div class="wiz-options">';
    platform.devices.forEach(function (device) {
      html += optionCard({
        value: device.name,
        name: device.name,
        status: device.status,
        selected: choice && choice.kind === "listed" && choice.value === device.name
      });
    });
    html += optionCard({
      value: "__other__",
      name: t("other"),
      other: true,
      wide: true,
      selected: other
    });
    html += "</div>";
    html += otherInputHtml(t("other.device.placeholder"), other ? choice.input : "", other);
    bodyEl.innerHTML = html;
  }

  function renderModelStep() {
    var engine = currentEngine();
    var choice = state.modelChoice;
    var other = choice && choice.kind === "other";
    var html =
      '<h3 class="wiz-step-title">' + escapeHtml(t("model.question")) + "</h3>" +
      '<p class="wiz-step-hint">' + escapeHtml(t("model.hint", { engine: engine.label })) + "</p>";

    var families = [];
    var index = {};
    data.models.forEach(function (model) {
      if (!index[model.family]) {
        index[model.family] = [];
        families.push(model.family);
      }
      index[model.family].push(model);
    });

    families.forEach(function (family) {
      html +=
        '<div class="wiz-family"><div class="wiz-family-title">' + escapeHtml(family) + "</div>" +
        '<div class="wiz-options">';
      index[family].forEach(function (model) {
        html += optionCard({
          value: model.name,
          name: model.name,
          status: model.engines[engine.id] || data.STATUS.UNVERIFIED,
          selected: choice && choice.kind === "listed" && choice.value === model.name
        });
      });
      html += "</div></div>";
    });

    html += '<div class="wiz-options">';
    html += optionCard({
      value: "__other__",
      name: t("other"),
      other: true,
      wide: true,
      selected: other
    });
    html += "</div>";
    html += otherInputHtml(t("other.model.placeholder"), other ? choice.input : "", other);
    bodyEl.innerHTML = html;
  }

  function summaryChip(labelKey, value) {
    return (
      '<div class="wiz-summary-chip"><strong>' + escapeHtml(t(labelKey)) + "</strong>" +
      escapeHtml(value) + "</div>"
    );
  }

  function nextSteps(verdict) {
    var links;
    if (verdict === "compatible") {
      links = [
        { label: t("next.quickstart"), href: pageUrl("user-guide/quick_start/") },
        { label: t("next.precheck"), href: pageUrl("toolkit/user/precheck/") }
      ];
    } else if (verdict === "unverified") {
      links = [
        { label: t("next.matrix"), href: pageUrl("user-guide/support-matrix/") },
        { label: t("next.precheck"), href: pageUrl("toolkit/user/precheck/") },
        { label: t("next.troubleshooting"), href: pageUrl("reference/troubleshooting/") }
      ];
    } else {
      links = [
        { label: t("next.matrix"), href: pageUrl("user-guide/support-matrix/") },
        { label: t("next.tour"), href: pageUrl("user-guide/model-tour/") }
      ];
    }
    var items = links
      .map(function (link) {
        return (
          '<li><a href="' + escapeHtml(link.href) + '" target="_parent">' +
          escapeHtml(link.label) + "</a></li>"
        );
      })
      .join("");
    return (
      '<div class="wiz-next"><div class="wiz-next-title">' +
      escapeHtml(t("result.next." + verdict)) + "</div><ul>" + items + "</ul></div>"
    );
  }

  function renderResultStep() {
    var engine = currentEngine();
    var result = evaluate();

    var html =
      '<div class="wiz-verdict wiz-verdict--' + result.verdict + '">' +
      '<span class="wiz-verdict-icon">' +
      (result.verdict === "compatible" ? "✅" : result.verdict === "unverified" ? "⚠️" : "❌") +
      '</span><div><div class="wiz-verdict-title">' +
      escapeHtml(t("verdict." + result.verdict + ".title")) + "</div>" +
      '<div class="wiz-verdict-desc">' + escapeHtml(t("verdict." + result.verdict + ".desc")) +
      "</div></div></div>";

    html += '<div class="wiz-family-title">' + escapeHtml(t("result.summary")) + "</div>";
    html += '<div class="wiz-summary">';
    html += summaryChip("summary.engine", engine.label);
    html += summaryChip("summary.version", state.versionChoice.value);
    html += summaryChip("summary.device", state.deviceChoice.value);
    html += summaryChip("summary.model", state.modelChoice.value);
    html += "</div>";

    html += '<div class="wiz-family-title">' + escapeHtml(t("result.factors")) + "</div>";
    html +=
      '<table class="wiz-factors"><thead><tr>' +
      "<th>" + escapeHtml(t("result.factor")) + "</th>" +
      "<th>" + escapeHtml(t("result.selection")) + "</th>" +
      "<th>" + escapeHtml(t("result.status")) + "</th>" +
      "</tr></thead><tbody>";
    result.factors.forEach(function (factor) {
      html +=
        "<tr><td>" + escapeHtml(factor.label) + "</td>" +
        "<td>" + escapeHtml(factor.value) +
        (factor.note ? '<span class="wiz-factor-note">' + escapeHtml(factor.note) + "</span>" : "") +
        "</td>" +
        "<td>" + badge(factor.status) + "</td></tr>";
    });
    html += "</tbody></table>";

    html += nextSteps(result.verdict);
    bodyEl.innerHTML = html;
  }

  function renderBody() {
    if (state.step === STEP_ENGINE) renderEngineStep();
    else if (state.step === STEP_VERSION) renderVersionStep();
    else if (state.step === STEP_DEVICE) renderDeviceStep();
    else if (state.step === STEP_MODEL) renderModelStep();
    else renderResultStep();
  }

  function renderActions() {
    backBtn.textContent = t("back");
    continueBtn.textContent = state.step === STEP_MODEL ? t("view-result") : t("continue");
    restartBtn.textContent = t("restart");
    backBtn.style.visibility = state.step === STEP_ENGINE ? "hidden" : "visible";
    restartBtn.style.display = state.step === STEP_RESULT ? "inline-flex" : "none";
    continueBtn.style.display = state.step === STEP_RESULT ? "none" : "inline-flex";
    continueBtn.disabled = !stepValid(state.step);
    continueBtn.style.opacity = stepValid(state.step) ? "1" : "0.6";
  }

  function render() {
    renderStepper();
    renderBody();
    renderActions();
    errorEl.textContent = "";
    notifyHeight();
  }

  /* ------------------------------------------------------------------ *
   * Events
   * ------------------------------------------------------------------ */

  function findOptionElement(target) {
    var el = target;
    while (el && el !== bodyEl) {
      if (el.getAttribute && el.getAttribute("data-option") !== null) return el;
      el = el.parentNode;
    }
    return null;
  }

  function readOtherInput() {
    var field = bodyEl.querySelector("[data-other-field]");
    return field ? field.value : "";
  }

  function otherChoiceForStep(input) {
    var engine = currentEngine();
    if (state.step === STEP_VERSION) {
      return makeOtherChoice(input, normalizeVersion, engine.versions);
    }
    return makeOtherChoice(input, null, null);
  }

  bodyEl.addEventListener("click", function (event) {
    var option = findOptionElement(event.target);
    if (!option) return;
    var value = option.getAttribute("data-option");
    var isOther = option.getAttribute("data-other") === "1";
    var engine = currentEngine();

    if (state.step === STEP_ENGINE) {
      state.engineId = value;
      resetFrom(STEP_VERSION);
      render();
      return;
    }

    if (state.step === STEP_VERSION) {
      if (isOther) {
        state.versionChoice = otherChoiceForStep(readOtherInput());
        render();
        focusOtherField();
        return;
      }
      var listed = engine.versions.filter(function (v) { return v.version === value; })[0];
      state.versionChoice = makeListedChoice(listed.version, listed.status);
    } else if (state.step === STEP_DEVICE) {
      if (isOther) {
        state.deviceChoice = otherChoiceForStep(readOtherInput());
        render();
        focusOtherField();
        return;
      }
      var platform = data.platforms[engine.platform];
      var listedDevice = platform.devices.filter(function (d) { return d.name === value; })[0];
      state.deviceChoice = makeListedChoice(listedDevice.name, listedDevice.status);
    } else if (state.step === STEP_MODEL) {
      if (isOther) {
        state.modelChoice = otherChoiceForStep(readOtherInput());
        render();
        focusOtherField();
        return;
      }
      var model = data.findModel(value);
      state.modelChoice = makeListedChoice(
        model.name, model.engines[engine.id] || data.STATUS.UNVERIFIED
      );
    }
    render();
  });

  function focusOtherField() {
    var field = bodyEl.querySelector("[data-other-field]");
    if (field) field.focus();
  }

  bodyEl.addEventListener("input", function (event) {
    var field = event.target;
    if (!field.getAttribute || field.getAttribute("data-other-field") === null) return;
    var card = bodyEl.querySelector('[data-option="__other__"]');
    if (card) card.classList.add("is-selected");
    var inputWrap = bodyEl.querySelector("[data-other-input]");
    if (inputWrap) inputWrap.classList.remove("hidden");
    var choice = otherChoiceForStep(field.value);
    if (state.step === STEP_VERSION) state.versionChoice = choice;
    else if (state.step === STEP_DEVICE) state.deviceChoice = choice;
    else if (state.step === STEP_MODEL) state.modelChoice = choice;
    renderActions();
  });

  stepsEl.addEventListener("click", function (event) {
    var stepEl = event.target;
    while (stepEl && stepEl !== stepsEl) {
      if (stepEl.getAttribute && stepEl.getAttribute("data-step") !== null) break;
      stepEl = stepEl.parentNode;
    }
    if (!stepEl || stepEl === stepsEl) return;
    var target = parseInt(stepEl.getAttribute("data-step"), 10);
    if (!isNaN(target) && target < state.step) {
      state.step = target;
      resetFrom(target + 1);
      render();
    }
  });

  backBtn.addEventListener("click", function () {
    if (state.step > STEP_ENGINE) {
      state.step -= 1;
      resetFrom(state.step + 1);
      render();
    }
  });

  continueBtn.addEventListener("click", function () {
    if (state.step === STEP_RESULT) return;
    if (!stepValid(state.step)) {
      var choice =
        state.step === STEP_VERSION ? state.versionChoice :
        state.step === STEP_DEVICE ? state.deviceChoice :
        state.step === STEP_MODEL ? state.modelChoice : null;
      errorEl.textContent = t(choice && choice.pending ? "error.other-empty" : "error.required");
      return;
    }
    state.step += 1;
    render();
    requestParentScroll();
  });

  restartBtn.addEventListener("click", function () {
    state.step = STEP_ENGINE;
    resetFrom(STEP_ENGINE);
    render();
    requestParentScroll();
  });

  /* ------------------------------------------------------------------ *
   * Height / scroll sync with the embedding page (overrides/assessment.html)
   * ------------------------------------------------------------------ */

  function postToParent(message) {
    if (window.parent === window) return;
    window.parent.postMessage(message, "*");
  }

  function notifyHeight() {
    var height = Math.max(
      document.body ? document.body.scrollHeight : 0,
      document.documentElement ? document.documentElement.scrollHeight : 0
    );
    postToParent({ type: "ucm-assessment-height", height: height });
  }

  function requestParentScroll() {
    postToParent({ type: "ucm-assessment-scroll" });
  }

  window.addEventListener("load", notifyHeight);
  window.addEventListener("resize", notifyHeight);

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */

  document.getElementById("app-title").textContent = t("app.title");
  document.getElementById("app-subtitle").textContent = t("app.subtitle");
  document.getElementById("app-updated").textContent = t("app.updated") + ": " + data.updated;
  document.getElementById("wiz-data-note").innerHTML = t("data.note", {
    date: data.updated,
    matrix: pageUrl("user-guide/support-matrix/")
  });
  document.title = t("app.title");
  render();
})();
