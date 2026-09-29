/**
 * UCM Compatibility Assessment - Data Source
 *
 * This dataset drives the interactive compatibility assessment wizard
 * (assets/compatibility_assessment.html). It is maintained by UCM developers
 * and should stay in sync with:
 *
 *   - docs/en/user-guide/support-matrix/index.md  (model x engine status,
 *     compute platforms and devices)
 *   - ucm/integration/vllm/patch/apply_patch.py   (UCM-validated engine
 *     versions, `get_supported_versions()`)
 *   - upstream release tags, fetched from GitHub:
 *       https://github.com/vllm-project/vllm/tags
 *       https://github.com/vllm-project/vllm-ascend/tags
 *       https://github.com/sgl-project/sglang/tags
 *     (last synchronized 2026-09-29)
 *
 * Maintenance rules:
 *   - status is one of "supported" | "unverified" | "unsupported";
 *   - engine versions are real upstream release tags, listed newest first,
 *     one entry per version line (prefer the stable tag; otherwise the newest
 *     rc tag of that line). The wizard only DISPLAYS the latest 10 tags per
 *     engine; keep older validated tags in this list as well, because
 *     manually entered versions are matched against the full list. A version
 *     is "supported" only when UCM's validation has covered it; this is
 *     NARROWER than the integration-patch version list
 *     (apply_patch.get_supported_versions only tells which versions have
 *     patches available - validation may lag behind, e.g. vLLM v0.26.0 /
 *     v0.28.0 and vLLM-Ascend v0.19.1 / v0.24.0 / v0.25.1 / v0.27.1 have
 *     patches but no validation conclusion yet). SGLang: the quickstart
 *     image v0.5.9 and the historical v0.5.5 integration. Real tags without
 *     validation are listed as "unverified" so users on recent releases get
 *     an explicit conclusion;
 *   - release candidates and post releases normalize to their base version
 *     (v0.26.0rc1 -> v0.26.0), the same way
 *     ucm.integration.vllm.patch.apply_patch normalizes versions;
 *   - devices are grouped by platform; an engine only offers devices of its
 *     own platform;
 *   - users may always select "Other / not listed", which yields an
 *     "unverified" conclusion for that factor;
 *   - update `updated` whenever the dataset changes.
 */
(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.UcmCompatibilityData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var SUPPORTED = "supported";
  var UNVERIFIED = "unverified";
  var UNSUPPORTED = "unsupported";

  /**
   * Compute platforms and their devices.
   * Source: user-guide/support-matrix (Compute platforms and devices).
   */
  var platforms = {
    cuda: {
      label: "CUDA / NVIDIA",
      devices: [
        { name: "H100", status: SUPPORTED },
        { name: "H20", status: SUPPORTED },
        { name: "L40", status: SUPPORTED },
        { name: "L20", status: SUPPORTED }
      ]
    },
    cann: {
      label: "CANN / Ascend",
      devices: [
        { name: "910C", status: SUPPORTED },
        { name: "910B", status: SUPPORTED }
      ]
    }
  };

  /**
   * Engines with their upstream release tags and UCM validation status.
   *
   * Version tags are real upstream tags (see the header for sources).
   * "supported" reflects UCM's validation conclusions, which are narrower
   * than the integration-patch version list (apply_patch
   * .get_supported_versions(): 0.11.0, 0.17.0, 0.18.0, 0.19.1, 0.20.2,
   * 0.21.0, 0.22.1, 0.23.0, 0.24.0, 0.25.1, 0.26.0, 0.27.0, 0.27.1, 0.28.0)
   * - patches exist for more versions than have been validated. Validated
   * (2026-09-29): vLLM v0.25.1 / v0.27.1 and older validated lines below;
   * vLLM-Ascend v0.26.0rc2 / v0.23.0 / v0.22.1rc1 / v0.21.0rc1 / v0.20.2rc1 /
   * v0.18.0 / v0.17.0rc1 / v0.11.0. Everything else, including patched-but-
   * unvalidated lines (vLLM v0.26.0 / v0.27.0 / v0.28.0; vLLM-Ascend v0.19.1
   * / v0.24.0 / v0.25.1 / v0.27.1), is "unverified".
   */
  var engines = [
    {
      id: "vllm",
      label: "vLLM",
      platform: "cuda",
      versions: [
        { version: "v0.31.0rc1", status: UNVERIFIED },
        { version: "v0.30.0", status: UNVERIFIED },
        { version: "v0.29.0", status: UNVERIFIED },
        { version: "v0.28.0", status: UNVERIFIED },
        { version: "v0.27.1", status: SUPPORTED },
        { version: "v0.27.0", status: UNVERIFIED },
        { version: "v0.26.0", status: UNVERIFIED },
        { version: "v0.25.1", status: SUPPORTED },
        { version: "v0.25.0", status: UNVERIFIED },
        { version: "v0.24.0", status: UNVERIFIED },
        { version: "v0.23.0", status: SUPPORTED },
        { version: "v0.22.1", status: SUPPORTED },
        { version: "v0.22.0", status: UNVERIFIED },
        { version: "v0.21.0", status: SUPPORTED },
        { version: "v0.20.2", status: SUPPORTED },
        { version: "v0.20.1", status: UNVERIFIED },
        { version: "v0.20.0", status: UNVERIFIED },
        { version: "v0.19.1", status: SUPPORTED },
        { version: "v0.19.0", status: UNVERIFIED },
        { version: "v0.18.1", status: UNVERIFIED },
        { version: "v0.18.0", status: SUPPORTED },
        { version: "v0.17.1", status: UNVERIFIED },
        { version: "v0.17.0", status: SUPPORTED },
        { version: "v0.16.0", status: UNVERIFIED },
        { version: "v0.15.1", status: UNVERIFIED },
        { version: "v0.15.0", status: UNVERIFIED },
        { version: "v0.14.1", status: UNVERIFIED },
        { version: "v0.14.0", status: UNVERIFIED },
        { version: "v0.13.0", status: UNVERIFIED },
        { version: "v0.12.0", status: UNVERIFIED },
        { version: "v0.11.2", status: UNVERIFIED },
        { version: "v0.11.1", status: UNVERIFIED },
        { version: "v0.11.0", status: SUPPORTED }
      ]
    },
    {
      id: "vllm-ascend",
      label: "vLLM-Ascend",
      platform: "cann",
      versions: [
        { version: "v0.27.1rc1", status: UNVERIFIED },
        { version: "v0.26.0rc2", status: SUPPORTED },
        { version: "v0.25.1rc1", status: UNVERIFIED },
        { version: "v0.24.0rc1", status: UNVERIFIED },
        { version: "v0.23.0", status: SUPPORTED },
        { version: "v0.22.1rc1", status: SUPPORTED },
        { version: "v0.21.0rc1", status: SUPPORTED },
        { version: "v0.20.2rc1", status: SUPPORTED },
        { version: "v0.19.1rc1", status: UNVERIFIED },
        { version: "v0.18.0", status: SUPPORTED },
        { version: "v0.17.0rc1", status: SUPPORTED },
        { version: "v0.16.0rc1", status: UNVERIFIED },
        { version: "v0.15.0rc1", status: UNVERIFIED },
        { version: "v0.14.0rc1", status: UNVERIFIED },
        { version: "v0.13.0", status: UNVERIFIED },
        { version: "v0.12.0rc1", status: UNVERIFIED },
        { version: "v0.11.0", status: SUPPORTED }
      ]
    },
    {
      id: "sglang",
      label: "SGLang",
      platform: "cuda",
      versions: [
        { version: "v0.5.20", status: UNVERIFIED },
        { version: "v0.5.19", status: UNVERIFIED },
        { version: "v0.5.18", status: UNVERIFIED },
        { version: "v0.5.17", status: UNVERIFIED },
        { version: "v0.5.16", status: UNVERIFIED },
        { version: "v0.5.15", status: UNVERIFIED },
        { version: "v0.5.14", status: UNVERIFIED },
        { version: "v0.5.13", status: UNVERIFIED },
        { version: "v0.5.12", status: UNVERIFIED },
        { version: "v0.5.11", status: UNVERIFIED },
        { version: "v0.5.10", status: UNVERIFIED },
        { version: "v0.5.9", status: SUPPORTED },
        { version: "v0.5.8", status: UNVERIFIED },
        { version: "v0.5.7", status: UNVERIFIED },
        { version: "v0.5.6", status: UNVERIFIED },
        { version: "v0.5.5", status: SUPPORTED }
      ]
    }
  ];

  /**
   * Models with per-engine compatibility.
   * Source: user-guide/support-matrix (Model compatibility).
   */
  var models = [
    {
      family: "DeepSeek",
      name: "DeepSeek V3/3.1",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: SUPPORTED }
    },
    {
      family: "DeepSeek",
      name: "DeepSeek R1",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: SUPPORTED }
    },
    {
      family: "DeepSeek",
      name: "DeepSeek V3.2",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: SUPPORTED }
    },
    {
      family: "DeepSeek",
      name: "DeepSeek V4 Pro",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: UNSUPPORTED }
    },
    {
      family: "DeepSeek",
      name: "DeepSeek V4 Flash",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: UNSUPPORTED }
    },
    {
      family: "Qwen",
      name: "Qwen2.5",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: SUPPORTED }
    },
    {
      family: "Qwen",
      name: "Qwen3",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: SUPPORTED }
    },
    {
      family: "Qwen",
      name: "Qwen3-MoE",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: SUPPORTED }
    },
    {
      family: "Qwen",
      name: "Qwen3-Next",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: UNSUPPORTED }
    },
    {
      family: "Qwen",
      name: "Qwen3.5",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: UNSUPPORTED }
    },
    {
      family: "Qwen",
      name: "Qwen3.6",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: UNSUPPORTED }
    },
    {
      family: "Qwen",
      name: "Qwen3.8",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: UNSUPPORTED }
    },
    {
      family: "Qwen",
      name: "Qwen3.8-Flash-Next",
      engines: { vllm: UNVERIFIED, "vllm-ascend": UNVERIFIED, sglang: UNSUPPORTED }
    },
    {
      family: "GLM",
      name: "GLM-4.x",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: SUPPORTED }
    },
    {
      family: "GLM",
      name: "GLM-5",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: UNSUPPORTED }
    },
    {
      family: "GLM",
      name: "GLM-5.1",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: UNSUPPORTED }
    },
    {
      family: "GLM",
      name: "GLM-5.2",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: UNSUPPORTED }
    },
    {
      family: "GLM",
      name: "GLM-5.3-Flash",
      engines: { vllm: UNVERIFIED, "vllm-ascend": UNVERIFIED, sglang: UNSUPPORTED }
    },
    {
      family: "MiniMax",
      name: "MiniMax-M2.5",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: SUPPORTED }
    },
    {
      family: "MiniMax",
      name: "MiniMax-M2.7",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: SUPPORTED }
    },
    {
      family: "MiniMax",
      name: "MiniMax-M3",
      engines: { vllm: UNVERIFIED, "vllm-ascend": UNVERIFIED, sglang: UNSUPPORTED }
    },
    {
      family: "Kimi",
      name: "Kimi-K2.5",
      engines: { vllm: SUPPORTED, "vllm-ascend": SUPPORTED, sglang: UNSUPPORTED }
    },
    {
      family: "Kimi",
      name: "Kimi-K3",
      engines: { vllm: UNVERIFIED, "vllm-ascend": UNVERIFIED, sglang: UNSUPPORTED }
    }
  ];

  return {
    STATUS: { SUPPORTED: SUPPORTED, UNVERIFIED: UNVERIFIED, UNSUPPORTED: UNSUPPORTED },
    updated: "2026-09-29",
    platforms: platforms,
    engines: engines,
    models: models,
    findEngine: function (id) {
      for (var i = 0; i < engines.length; i += 1) {
        if (engines[i].id === id) return engines[i];
      }
      return null;
    },
    findModel: function (name) {
      for (var i = 0; i < models.length; i += 1) {
        if (models[i].name === name) return models[i];
      }
      return null;
    }
  };
});
