#!/usr/bin/bash

rm -r build
mkdir build && cd build && cmake .. -DCMAKE_TOOLCHAIN_FILE=../toolchains/wasm-clang.cmake
