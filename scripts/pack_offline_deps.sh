#!/usr/bin/env bash
#
# pack_offline_deps.sh
#
# 在【联网环境】执行，用于将本项目编译所需的源码依赖 + Python 构建依赖
# 收集并打包成一个 tar 包，随后拷贝到无联网的编译/部署机上使用。
#
# 说明：
#   - 默认仅打包"核心 store 模块"(sparse 关闭) 的依赖：
#       * C++ 源码依赖: fmt, spdlog, pybind11, zlib（googletest 仅单测需要，可选）
#       * Python 构建依赖: wheel, setuptools, cmake, build, wrapt
#   - 离线机编译时需加 -DDOWNLOAD_DEPENDENCE=OFF，依赖源码置于
#     ${UCM_SRC}/ucm/shared/vendor/{fmt,spdlog,pybind11,zlib}，
#     具体由 install_offline.sh 负责装配。
#
# 用法:
#   bash scripts/pack_offline_deps.sh [--with-gtest] [--output DIR]
#
set -euo pipefail

# ---------------------------------------------------------------------------
# 读取项目相关常量（从 ucm/shared/vendor/*.cmake 提取仓库与 tag）
# ---------------------------------------------------------------------------
UCM_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INCLUDE_GTEST=0
OUTPUT_DIR="${UCM_SRC}"

for arg in "$@"; do
    case "$arg" in
        --with-gtest) INCLUDE_GTEST=1 ;;
        --output) ;;
        --output=*)
            OUTPUT_DIR="${arg#--output=}"
            ;;
        --help|-h)
            echo "Usage: $0 [--with-gtest] [--output DIR]"
            exit 0
            ;;
        *)
            # 支持 --output DIR 两段式
            if [[ "${last_arg:-}" == "--output" ]]; then
                OUTPUT_DIR="$arg"
            else
                echo "Unknown option: $arg" >&2
                exit 1
            fi
            ;;
    esac
    last_arg="$arg"
done

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

log()  { echo -e "[pack] $*"; }
die()  { echo -e "[pack] ERROR: $*" >&2; exit 1; }

# 镜像列表：优先官方 github，失败则回退 gitee 镜像
fetch_tarball() {
    # $1=owner $2=repo $3=tag $4=输出目录
    local owner="$1" repo="$2" tag="$3" out="$4"
    local urls=(
        "https://codeload.github.com/${owner}/${repo}/tar.gz/refs/tags/${tag}"
        "https://ghproxy.com/https://github.com/${owner}/${repo}/archive/refs/tags/${tag}.tar.gz"
    )
    local u ok=0
    for u in "${urls[@]}"; do
        log "下载 ${owner}/${repo}@${tag}  <-  ${u}"
        local tmp="${out}.tar.gz"
        if curl -fsSL --connect-timeout 20 --max-time 300 -o "$tmp" "$u"; then
            tar -xzf "$tmp" -C "$(dirname "$out")"
            # tarball 内目录名为 <repo>-<tag>（tag 中的 'v' 会被去掉）
            local extracted="$(dirname "$out")/${repo}-${tag#v}"
            if [[ -d "$extracted" ]]; then
                mv "$extracted" "$out"
                rm -f "$out.tar.gz"
                ok=1
                break
            fi
        fi
        rm -f "$tmp"
    done
    [[ "$ok" == 1 ]] || die "无法从任何镜像下载 ${owner}/${repo}@${tag}"
    log "  -> ${owner}/${repo} 就绪 (${tag})"
}

clone_dep() {
    # $1=owner/name $2=tag $3=输出目录
    local full="$1" tag="$2" out="$3"
    local owner="${full%/*}" repo="${full#*/}"
    # 先用 git clone（浅克隆，加超时），失败/超时再回退 tarball
    if GIT_TERMINAL_PROMPT=0 timeout 60 \
        git clone --depth 1 --branch "$tag" "https://github.com/${owner}/${repo}.git" "$out" >/dev/null 2>&1; then
        rm -rf "$out/.git"
        log "  -> ${owner}/${repo} 就绪 (${tag})"
    else
        rm -rf "$out"
        fetch_tarball "$owner" "$repo" "$tag" "$out"
    fi
}

# ---------------------------------------------------------------------------
# 1. 校验工具
# ---------------------------------------------------------------------------
command -v git     >/dev/null || die "缺少 git"
command -v curl    >/dev/null || die "缺少 curl"
command -v python3 >/dev/null || die "缺少 python3"
# 优先使用 pip3，其次回退 python3 -m pip
if command -v pip3 >/dev/null 2>&1; then
    PIP="pip3"
else
    python3 -m pip --version >/dev/null 2>&1 || die "缺少 pip (pip3 或 python3 -m pip)"
    PIP="python3 -m pip"
fi

# ---------------------------------------------------------------------------
# 2. 准备输出目录与依赖源码目录
# ---------------------------------------------------------------------------
BUILD_DIR="${WORK}/build"
DEPS_VENDOR="${BUILD_DIR}/ucm/shared/vendor"
PY_WHEELS="${BUILD_DIR}/python_wheels"
mkdir -p "$DEPS_VENDOR" "$PY_WHEELS"

log "收集 C++ 源码依赖到 vendor 目录 ..."
clone_dep "fmtlib/fmt"            "11.2.0"   "${DEPS_VENDOR}/fmt"
clone_dep "gabime/spdlog"         "v1.15.3"  "${DEPS_VENDOR}/spdlog"
clone_dep "pybind/pybind11"       "v3.0.1"   "${DEPS_VENDOR}/pybind11"
clone_dep "madler/zlib"           "v1.3.1"   "${DEPS_VENDOR}/zlib"
if [[ "$INCLUDE_GTEST" == 1 ]]; then
    clone_dep "google/googletest" "v1.15.2"  "${DEPS_VENDOR}/googletest"
fi

# ---------------------------------------------------------------------------
# 3. 收集 Python 构建依赖 wheel（离线安装 cmake/build/setuptools/wheel/wrapt）
#    —— 仅download，不做系统级安装，避免 PEP 668 / 污染系统 Python
# ---------------------------------------------------------------------------
log "下载 Python 构建依赖 wheels ..."
$PIP download --only-binary=:all: \
    cmake \
    setuptools \
    wheel \
    build \
    wrapt==1.17.2 \
    -d "$PY_WHEELS"

# 也把编译期真正需要的 "wrapt" 放进 wheels（项目 install_requires 为 wrapt==1.17.2）
log "wheels 下载完成:"
ls -1 "$PY_WHEELS"

# ---------------------------------------------------------------------------
# 4. 复制项目源码（仅复制与编译/安装相关的部分）
# ---------------------------------------------------------------------------
log "复制本项目源码 ..."
# 排除 .git / 构建产物 / 联网工具脚本本身，避免冗余与网络残留
rsync -a \
    --exclude '.git' \
    --exclude '*.whl' \
    --exclude 'offline_package' \
    --exclude 'build/' \
    --exclude 'dist/' \
    --exclude '*.egg-info' \
    "${UCM_SRC}/" "${BUILD_DIR}/" 2>/dev/null \
  || cp -r "${UCM_SRC}/." "${BUILD_DIR}/" 2>/dev/null \
  || die "复制项目源码失败"

# 若本机存在可编译的 vendor 源码(说明已在开发机 clone 过)，无需重复，但以防重复克隆覆盖
cp -n "${DEPS_VENDOR}/"* "${BUILD_DIR}/ucm/shared/vendor/" >/dev/null 2>&1 || true

# 将离线安装脚本一并放进包里
cp "$(dirname "${BASH_SOURCE[0]}")/install_offline.sh" "${BUILD_DIR}/install_offline.sh" \
  || die "缺少 install_offline.sh"

# ---------------------------------------------------------------------------
# 5. 生成离线环境读取的版本/说明文件
# ---------------------------------------------------------------------------
cat > "${BUILD_DIR}/OFFLINE_DEPS.txt" <<EOF
# UCM 离线依赖包
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')
# 生成环境: $(uname -m) / Python $(python3 -V 2>&1 | awk '{print $2}')
# 构建范围: 核心 store 模块 (sparse 关闭)
#
# C++ 源码依赖已置于 ucm/shared/vendor/{fmt,spdlog,pybind11,zlib}[,googletest]
# Python wheels 位于 python_wheels/
#
# 离线机编译请执行:
#   bash install_offline.sh   (并按要求选择环境类型 ascend / ascend-a3 / cuda)
EOF

# ---------------------------------------------------------------------------
# 6. 打包
# ---------------------------------------------------------------------------
STAMP="$(date '+%Y%m%d_%H%M%S')"
TARBALL="${OUTPUT_DIR}/ucm_offline_deps_$(uname -m)_${STAMP}.tar.gz"
mkdir -p "$OUTPUT_DIR"

log "打包 -> ${TARBALL}"
tar -czf "$TARBALL" -C "$WORK" build

log "完成。请将以下文件拷贝到目标离线机后执行 install_offline.sh："
log "   ${TARBALL}"
