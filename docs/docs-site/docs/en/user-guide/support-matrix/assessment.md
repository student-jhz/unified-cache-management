---
template: assessment.html
---

# Compatibility Assessment

The compatibility assessment walks you through the information UCM needs before a deployment: the inference engine and its version, the compute device and the served model. Answer the four steps and the wizard concludes whether the combination is compatible, needs verification, or is not compatible.

Use it when:

- Planning a UCM delivery and checking whether the target engine, device and model combination is covered.
- Evaluating an environment whose engine version or device is not listed in the [support matrix](index.md) and needs an explicit unverified conclusion.
- Producing a pre-delivery checklist entry that records the collected combination and its assessment result.

The wizard is driven by a compatibility dataset maintained by UCM developers. It covers:

- **Engines and versions**: vLLM, vLLM-Ascend and SGLang. The wizard offers the latest 10 real upstream release tags per engine, each carrying its UCM validation status: validated versions are supported, while versions without a validation conclusion (for example vLLM `v0.30.0` or `v0.28.0`) are listed as unverified. Release candidates and post releases map to their base version, so `v0.26.0rc1` counts as `v0.26.0`; older releases can be entered through *Other* and are matched against the maintained tag list.
- **Compute devices**: representative CUDA and CANN devices from the support matrix, such as H100, H20, L40, L20, 910B and 910C.
- **Models**: per-engine integration status for DeepSeek, Qwen, GLM, MiniMax and Kimi families.

Values that are not in the dataset can still be entered through *Other / not listed*; they yield an unverified conclusion instead of a rejection. The conclusion is advisory: it reflects the recorded compatibility status and does not replace validation on the target environment.

## Start the assessment
