#!/usr/bin/env bash
#
# install_offline.sh
#
# 在【离线编译环境】执行。用于离线编译并安装本项目(UCM 核心 store 模块)。
#
# 前置要求：
#   - 本机已具备：g++、make，以及 python3>=3.10、pip
#   - 已通过联网机的 pack_offline_deps.sh 生成离线包并解压到当前目录，
#     且本文件位于解压根目录下，目录应包含：
#         ucm/shared/vendor/{fmt,spdlog,pybind11,zlib}
#         python_wheels/*.whl
#         （完整项目源码）
#
# 用法:
#   bash install_offline.sh [--env cuda|ascend|ascend-a3]
#   （不带参数时脚本会交互式提示你输入环境类型）
#
# 说明:
#   - 本脚本会临时把 CMakeLists.txt 中的 DOWNLOAD_DEPENDENCE 改为 OFF，
#     使 cmake 使用 vendor 目录里的源码依赖而非联网下载；构建完成后恢复原文件。
#
set -euo pipefail

UCM_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY_WHEELS="${UCM_SRC}/python_wheels"
ENV_TYPE=""

# ---------------------------------------------------------------------------
# 交互式选择编译环境类型
# ---------------------------------------------------------------------------
choose_env() {
    echo "============================================================="
    echo " 请选择编译环境类型："
    echo "   1) cuda"
    echo "   2) ascend"
    echo "   3) ascend-a3"
    echo "============================================================="
    while true; do
        read -rp " 请输入 [1/2/3]: " choice
        case "$choice" in
            1) ENV_TYPE="cuda";      break ;;
            2) ENV_TYPE="ascend";    break ;;
            3) ENV_TYPE="ascend-a3"; break ;;
            *) echo " 无效输入，请输入 1 或 2 或 3" ;;
        esac
    done
    echo "已选择环境类型: $ENV_TYPE"
    echo ""
}

# ---------------------------------------------------------------------------
# 0. 参数
# ---------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
    case "$1" in
        --env)
            ENV_TYPE="$2"; shift 2 ;;
        --env=*)
            ENV_TYPE="${1#--env=}"; shift ;;
        --help|-h)
            echo "Usage: $0 [--env cuda|ascend|ascend-a3]"
            exit 0 ;;
        *)
            echo "Unknown option: $1" >&2; exit 1 ;;
    esac
done

[[ -n "$ENV_TYPE" ]] || choose_env
case "$ENV_TYPE" in
    cuda|ascend|ascend-a3) ;;
    *) echo "ERROR: 不支持的编译环境类型: $ENV_TYPE (应为 cuda/ascend/ascend-a3)" >&2; exit 1 ;;
esac

log(){ echo -e "[offline] $*"; }
die(){ echo -e "[offline] ERROR: $*" >&2; exit 1; }

command -v python3 >/dev/null   || die "缺少 python3"
command -v g++     >/dev/null   || die "缺少 g++"
command -v make    >/dev/null   || die "缺少 make"

# ---------------------------------------------------------------------------
# 1. 校验离线依赖已就绪
# ---------------------------------------------------------------------------
log "校验离线依赖 ..."
[[ -d "$PY_WHEELS" ]] && [[ "$(ls "$PY_WHEELS"/*.whl 2>/dev/null | wc -l)" -gt 0 ]] \
    || die "缺少 python_wheels/ 目录或其为空（请先运行 pack_offline_deps.sh）"

VENDOR="${UCM_SRC}/ucm/shared/vendor"
for dep in fmt spdlog pybind11 zlib; do
    [[ -d "${VENDOR}/${dep}" ]] || \
        die "缺少 C++ 源码依赖 ucm/shared/vendor/${dep}（请先运行 pack_offline_deps.sh）"
done

# ---------------------------------------------------------------------------
# 2. 安装构建工具链 (cmake/setuptools/wheel/build) + 运行时依赖 wrapt
# ---------------------------------------------------------------------------
log "从本地 wheels 安装构建依赖 (cmake, setuptools, wheel, build, wrapt) ..."
pip3 install --no-index --find-links "$PY_WHEELS" --upgrade \
    cmake setuptools wheel build wrapt || die "离线安装构建依赖失败"

# ---------------------------------------------------------------------------
# 3. 临时将 DOWNLOAD_DEPENDENCE 改为 OFF（使用 vendor 源码，禁联网），构建后再恢复
# ---------------------------------------------------------------------------
CMAKELISTS="${UCM_SRC}/CMakeLists.txt"
WORK_CMAKELISTS="$(mktemp)"
cp "$CMAKELISTS" "$WORK_CMAKELISTS"
restore_cmakelists() {
    if [[ -f "$WORK_CMAKELISTS" ]]; then
        cp "$WORK_CMAKELISTS" "$CMAKELISTS"
        rm -f "$WORK_CMAKELISTS"
    fi
}
trap restore_cmakelists EXIT

log "临时设置 DOWNLOAD_DEPENDENCE=OFF（构建完成后自动恢复）..."
sed -i 's/\(option(DOWNLOAD_DEPENDENCE[[:space:]]*\)ON)/\1OFF)/' \
    "$CMAKELISTS" || die "修改 CMakeLists 的 DOWNLOAD_DEPENDENCE 失败"
grep -q 'option(DOWNLOAD_DEPENDENCE.*OFF' "$CMAKELISTS" \
    || die "未能将 DOWNLOAD_DEPENDENCE 修改为 OFF"

# ---------------------------------------------------------------------------
# 4. 离线构建 wheel（与项目 build_cuda/build_ascend 一致：python -m build --no-isolation）
# ---------------------------------------------------------------------------
export PLATFORM="$ENV_TYPE"
export ENABLE_SPARSE="FALSE"
cd "$UCM_SRC"

log "开始离线构建 wheel (PLATFORM=$ENV_TYPE) ..."
# --no-isolation: 使用已安装(setuptools/cmake/wheel)，不依赖网络环境重建
python3 -m build --no-isolation --wheel || die "wheel 构建失败"

WHEEL="$(ls -1t dist/*.whl | head -n1)"
[[ -n "$WHEEL" ]] && [[ -f "$WHEEL" ]] || die "未找到构建产物 dist/*.whl"
log "构建产物: $WHEEL"

# ---------------------------------------------------------------------------
# 5. 离线安装 wheel
# ---------------------------------------------------------------------------
log "离线安装 $WHEEL ..."
pip3 install --no-index --find-links "$PY_WHEELS" "$WHEEL" || die "wheel 安装失败"

log "校验安装 ..."
python3 -c "import sys; sys.path.insert(0,''); import ucm.store" 2>/dev/null && \
    log "ucm.store 导入成功" || log "提示: ucm 扩展导入请在已设置 PLATFORM=$ENV_TYPE 的 Python 环境中运行时验证"

# CMakeLists.txt 由 trap 自动恢复。

log "============================================================="
log "  离线编译安装完成!"
log "  环境类型 : $ENV_TYPE"
log "  源码目录 : $UCM_SRC"
log "  wheel    : $WHEEL"
log "  Python   : $(python3 -V 2>&1)"
log "  使用说明 : 运行/联调前请确保环境变量 PLATFORM=$ENV_TYPE"
log "============================================================="
